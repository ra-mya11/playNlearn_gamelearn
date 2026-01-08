/**
 * USE-TASKS HOOK
 * Manages task lifecycle, proof submissions, state transitions
 * Integrates with reward system and game progression
 */

import { useState, useCallback, useEffect } from "react";
import type {
  TaskDefinition,
  UserTask,
  Proof,
  ProofPolicy,
  TaskStatus,
  ReviewDecision,
  TaskCategory,
  UserTaskContext,
} from "@/integrations/supabase/tasks.types";
import { seedTasks, mockUserTasks } from "@/data/task-seed-data";
import { usePlayCoins } from "./use-playcoins";

interface UseTasksReturn {
  // Data
  allTasks: TaskDefinition[];
  userTasks: UserTask[];
  filteredTasks: UserTask[];
  availableTasks: UserTask[];
  inProgressTasks: UserTask[];
  completedTasks: UserTask[];
  lockedTasks: UserTask[];
  selectedTask: UserTaskContext | null;
  taskStats: {
    completed: number;
    inProgress: number;
    available: number;
    locked: number;
    totalEduCoins: number;
    totalXp: number;
  };

  // Actions
  startTask: (taskId: string) => Promise<void>;
  submitProof: (userTaskId: string, proof: Proof) => Promise<void>;
  approveProof: (userTaskId: string, feedback?: string) => Promise<void>;
  rejectProof: (userTaskId: string, reason: string) => Promise<void>;
  completeTask: (userTaskId: string) => Promise<void>;
  selectTask: (userTaskId: string | null) => void;
  filterByCategory: (category: TaskCategory | "all") => void;

  // State
  selectedCategory: TaskCategory | "all";
  isLoading: boolean;
  error: string | null;
}

export function useTasks(): UseTasksReturn {
  // ===========================================================================
  // STATE MANAGEMENT
  // ===========================================================================

  const [allTasks] = useState<TaskDefinition[]>(seedTasks);
  const [userTasks, setUserTasks] = useState<UserTask[]>(mockUserTasks);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | "all">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addCoins, addXp } = usePlayCoins();

  // =========================================================================
  // COMPUTED DATA - UNIFIED FILTERING
  // =========================================================================

  // Apply category filter first
  const categoryFilteredTasks = userTasks.filter((ut) => {
    if (selectedCategory === "all") return true;
    const taskDef = allTasks.find((t) => t.id === ut.taskId);
    return taskDef?.category === selectedCategory;
  });

  // Create unified task arrays by status from filtered tasks
  const availableTasks = categoryFilteredTasks.filter((ut) => ut.status === "available");
  const inProgressTasks = categoryFilteredTasks.filter((ut) => ut.status === "in_progress");
  const completedTasks = categoryFilteredTasks.filter((ut) => ut.status === "completed");
  const lockedTasks = categoryFilteredTasks.filter((ut) => ut.status === "locked");

  // Task stats based on currently filtered tasks (not all tasks)
  const taskStats = {
    completed: completedTasks.length,
    inProgress: inProgressTasks.length,
    available: availableTasks.length,
    locked: lockedTasks.length,
    totalEduCoins: allTasks.reduce((sum, t) => sum + t.reward.eduCoins, 0),
    totalXp: allTasks.reduce((sum, t) => sum + t.reward.xp, 0),
  };

  // Sort filtered tasks by priority
  const filteredTasks = categoryFilteredTasks
    .sort((a, b) => {
      // Show available/in-progress first, then completed
      const statusOrder: Record<TaskStatus, number> = {
        locked: 5,
        available: 1,
        in_progress: 0,
        awaiting_proof: 2,
        under_review: 2,
        completed: 3,
        rejected: 4,
      };
      return statusOrder[a.status] - statusOrder[b.status];
    });

  const selectedTask: UserTaskContext | null = selectedTaskId
    ? (() => {
        const userTask = userTasks.find((ut) => ut.id === selectedTaskId);
        const taskDef = userTask ? allTasks.find((t) => t.id === userTask.taskId) : null;

        if (!userTask || !taskDef) return null;

        return {
          userTask,
          taskDefinition: taskDef,
          currentProof: undefined, // TODO: fetch from proof table
          canStartTask: taskDef.stateRules.allowSkip || userTask.status === "available",
          canSubmitProof: userTask.status === "in_progress",
          canRetry: userTask.status === "rejected" && (userTask.rejectionCount < (taskDef.stateRules.maxRetries || 3)),
        };
      })()
    : null;

  // ===========================================================================
  // STATE TRANSITIONS & BUSINESS LOGIC
  // ===========================================================================

  /**
   * START TASK
   * Transition: available → in_progress
   * - Validate task is available
   * - Record start time
   * - Update UI
   */
  const startTask = useCallback(
    async (taskId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const userTask = userTasks.find((ut) => ut.taskId === taskId);
        if (!userTask) throw new Error("Task not found");
        if (userTask.status !== "available") {
          throw new Error(`Cannot start task in ${userTask.status} state`);
        }

        const updated: UserTask = {
          ...userTask,
          status: "in_progress",
          startedAt: new Date(),
          updatedAt: new Date(),
        };

        setUserTasks((prev) => prev.map((ut) => (ut.id === userTask.id ? updated : ut)));
        setSelectedTaskId(userTask.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to start task");
      } finally {
        setIsLoading(false);
      }
    },
    [userTasks]
  );

  /**
   * SUBMIT PROOF
   * Transition: in_progress → awaiting_proof OR under_review
   * - Validate proof format
   * - Store proof securely
   * - Determine review path
   * - Update task status
   */
  const submitProof = useCallback(
    async (userTaskId: string, proof: Proof) => {
      setIsLoading(true);
      setError(null);

      try {
        const userTask = userTasks.find((ut) => ut.id === userTaskId);
        if (!userTask) throw new Error("User task not found");
        if (userTask.status !== "in_progress") {
          throw new Error(`Cannot submit proof for task in ${userTask.status} state`);
        }

        const taskDef = allTasks.find((t) => t.id === userTask.taskId);
        if (!taskDef) throw new Error("Task definition not found");

        // Validate proof against policy
        validateProof(proof, taskDef.proofPolicy);

        // Determine next status based on review type
        const nextStatus: TaskStatus =
          taskDef.proofPolicy.reviewType === "auto" ? "completed" : "under_review";

        const updated: UserTask = {
          ...userTask,
          status: nextStatus,
          currentProofId: proof.id,
          proofSubmittedAt: new Date(),
          updatedAt: new Date(),
        };

        setUserTasks((prev) => prev.map((ut) => (ut.id === userTaskId ? updated : ut)));

        // Auto-grant rewards if auto-approved
        if (nextStatus === "completed" && !userTask.rewardGranted) {
          grantReward(userTaskId, taskDef);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to submit proof");
      } finally {
        setIsLoading(false);
      }
    },
    [userTasks, allTasks]
  );

  /**
   * APPROVE PROOF (Moderation)
   * Transition: under_review → completed
   * - Grant rewards
   * - Update task status
   * - Record review decision
   */
  const approveProof = useCallback(
    async (userTaskId: string, feedback?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const userTask = userTasks.find((ut) => ut.id === userTaskId);
        if (!userTask) throw new Error("User task not found");
        if (userTask.status !== "under_review" && userTask.status !== "awaiting_proof") {
          throw new Error(`Cannot approve proof for task in ${userTask.status} state`);
        }

        const taskDef = allTasks.find((t) => t.id === userTask.taskId);
        if (!taskDef) throw new Error("Task definition not found");

        const updated: UserTask = {
          ...userTask,
          status: "completed",
          completedAt: new Date(),
          updatedAt: new Date(),
        };

        setUserTasks((prev) => prev.map((ut) => (ut.id === userTaskId ? updated : ut)));

        // Grant rewards
        if (!userTask.rewardGranted) {
          grantReward(userTaskId, taskDef);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to approve proof");
      } finally {
        setIsLoading(false);
      }
    },
    [userTasks, allTasks]
  );

  /**
   * REJECT PROOF (Moderation)
   * Transition: under_review → rejected → available (for retry)
   * - Record rejection reason
   * - Increment rejection counter
   * - Allow retry if within limits
   */
  const rejectProof = useCallback(
    async (userTaskId: string, reason: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const userTask = userTasks.find((ut) => ut.id === userTaskId);
        if (!userTask) throw new Error("User task not found");

        const taskDef = allTasks.find((t) => t.id === userTask.taskId);
        if (!taskDef) throw new Error("Task definition not found");

        const maxRetries = taskDef.stateRules.maxRetries || 3;
        const newRejectionCount = userTask.rejectionCount + 1;

        // Determine next status
        const canRetry = newRejectionCount < maxRetries;
        const nextStatus: TaskStatus = canRetry ? "in_progress" : "rejected";

        const updated: UserTask = {
          ...userTask,
          status: nextStatus,
          rejectionReason: reason,
          rejectionCount: newRejectionCount,
          rejectedAt: new Date(),
          updatedAt: new Date(),
        };

        setUserTasks((prev) => prev.map((ut) => (ut.id === userTaskId ? updated : ut)));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to reject proof");
      } finally {
        setIsLoading(false);
      }
    },
    [userTasks, allTasks]
  );

  /**
   * COMPLETE TASK (Manual completion for auto-proof tasks)
   * Transition: in_progress → completed
   * - Validate auto-proof eligibility
   * - Grant rewards
   */
  const completeTask = useCallback(
    async (userTaskId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const userTask = userTasks.find((ut) => ut.id === userTaskId);
        if (!userTask) throw new Error("User task not found");

        const taskDef = allTasks.find((t) => t.id === userTask.taskId);
        if (!taskDef) throw new Error("Task definition not found");

        if (taskDef.proofPolicy.type !== "auto") {
          throw new Error("Only auto-proof tasks can be completed manually");
        }

        const updated: UserTask = {
          ...userTask,
          status: "completed",
          completedAt: new Date(),
          updatedAt: new Date(),
        };

        setUserTasks((prev) => prev.map((ut) => (ut.id === userTaskId ? updated : ut)));

        // Grant rewards
        if (!userTask.rewardGranted) {
          grantReward(userTaskId, taskDef);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to complete task");
      } finally {
        setIsLoading(false);
      }
    },
    [userTasks, allTasks]
  );

  /**
   * SELECT TASK
   * UI action to show task detail
   */
  const selectTask = useCallback((userTaskId: string | null) => {
    setSelectedTaskId(userTaskId);
  }, []);

  /**
   * FILTER BY CATEGORY
   * UI action to filter task list
   */
  const filterByCategory = useCallback((category: TaskCategory | "all") => {
    setSelectedCategory(category);
  }, []);

  // ===========================================================================
  // HELPER FUNCTIONS
  // ===========================================================================

  /**
   * Validate proof against policy
   */
  function validateProof(proof: Proof, policy: ProofPolicy) {
    if (proof.proofType === "photo") {
      const photoProof = proof as any;
      if (!photoProof.fileUrl) throw new Error("Photo URL is required");
      if (photoProof.fileSizeBytes && policy.maxFileSize && photoProof.fileSizeBytes > policy.maxFileSize) {
        throw new Error(`File size exceeds ${policy.maxFileSize} bytes`);
      }
    }

    if (proof.proofType === "text") {
      const textProof = proof as any;
      const wordCount = textProof.content?.split(/\s+/).length || 0;
      if (policy.minTextLength && wordCount < policy.minTextLength) {
        throw new Error(`Text must be at least ${policy.minTextLength} words`);
      }
      if (policy.maxTextLength && wordCount > policy.maxTextLength) {
        throw new Error(`Text must be at most ${policy.maxTextLength} words`);
      }
    }
  }

  /**
   * Grant rewards to user
   */
  function grantReward(userTaskId: string, taskDef: TaskDefinition) {
    const userTask = userTasks.find((ut) => ut.id === userTaskId);
    if (!userTask || userTask.rewardGranted) return;

    try {
      // Award coins and XP (integrated with existing system)
      addCoins(taskDef.reward.eduCoins);
      addXp(taskDef.reward.xp);

      // Mark reward as granted
      setUserTasks((prev) =>
        prev.map((ut) =>
          ut.id === userTaskId
            ? {
                ...ut,
                rewardGranted: true,
                rewardGrantedAt: new Date(),
              }
            : ut
        )
      );
    } catch (err) {
      console.error("Failed to grant reward:", err);
    }
  }

  // ===========================================================================
  // EFFECTS
  // ===========================================================================

  // Initialize user tasks for demo (in production, fetch from Supabase)
  useEffect(() => {
    // Tasks are already mocked from seed data
  }, []);

  return {
    allTasks,
    userTasks,
    filteredTasks,
    availableTasks,
    inProgressTasks,
    completedTasks,
    lockedTasks,
    selectedTask,
    taskStats,
    startTask,
    submitProof,
    approveProof,
    rejectProof,
    completeTask,
    selectTask,
    filterByCategory,
    selectedCategory,
    isLoading,
    error,
  };
}
