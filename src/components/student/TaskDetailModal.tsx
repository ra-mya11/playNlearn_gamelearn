/**
 * TASK DETAIL MODAL
 * Shows full task details, proof requirements, and enables task actions
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Clock,
  Award,
  Camera,
  FileText,
  CheckCircle2,
  AlertCircle,
  Zap,
  Coins,
  Lock,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import type { UserTaskContext } from "@/integrations/supabase/tasks.types";

interface TaskDetailModalProps {
  open: boolean;
  onClose: () => void;
  taskContext: UserTaskContext | null;
  onStartTask?: () => Promise<void>;
  onSubmitProof?: () => void;
  isLoading?: boolean;
}

const statusConfig = {
  locked: {
    icon: Lock,
    color: "text-muted-foreground",
    bgColor: "bg-muted/20",
    label: "Locked",
    description: "Complete prerequisites to unlock",
  },
  available: {
    icon: ChevronRight,
    color: "text-primary",
    bgColor: "bg-primary/10",
    label: "Ready to Start",
    description: "Click to begin this task",
  },
  in_progress: {
    icon: Zap,
    color: "text-accent",
    bgColor: "bg-accent/10",
    label: "In Progress",
    description: "Continue working on this task",
  },
  awaiting_proof: {
    icon: AlertCircle,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    label: "Awaiting Proof",
    description: "Submit your proof",
  },
  under_review: {
    icon: AlertCircle,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    label: "Under Review",
    description: "Your proof is being reviewed",
  },
  completed: {
    icon: CheckCircle2,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    label: "Completed",
    description: "Great job!",
  },
  rejected: {
    icon: AlertTriangle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    label: "Rejected",
    description: "Try again",
  },
};

export function TaskDetailModal({
  open,
  onClose,
  taskContext,
  onStartTask,
  onSubmitProof,
  isLoading = false,
}: TaskDetailModalProps) {
  const [showProofTip, setShowProofTip] = useState(false);

  if (!taskContext) return null;

  const { userTask, taskDefinition } = taskContext;
  const taskStatus = statusConfig[userTask.status];
  const StatusIcon = taskStatus.icon;

  // Calculate proof requirement visually
  const proofRequirements = [];
  if (taskDefinition.proofPolicy.type === "photo") {
    proofRequirements.push({ icon: Camera, label: "Photo required", type: "photo" });
  }
  if (taskDefinition.proofPolicy.type === "text") {
    proofRequirements.push({ icon: FileText, label: "Written reflection", type: "text" });
  }
  if (taskDefinition.proofPolicy.type === "auto") {
    proofRequirements.push({ icon: CheckCircle2, label: "Auto-verified", type: "auto" });
  }
  if (taskDefinition.proofPolicy.type === "none") {
    proofRequirements.push({ icon: CheckCircle2, label: "No proof needed", type: "none" });
  }

  // Calculate difficulty color
  const difficultyConfig = {
    easy: { label: "Easy", color: "bg-secondary/20 text-secondary" },
    medium: { label: "Medium", color: "bg-accent/20 text-accent" },
    hard: { label: "Hard", color: "bg-destructive/20 text-destructive" },
  };
  const difficulty = difficultyConfig[taskDefinition.difficulty];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1">
              <DialogTitle className="font-heading text-2xl">
                {taskDefinition.title}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {taskDefinition.description}
              </DialogDescription>
            </div>
            <Badge className={difficulty.color}>{difficulty.label}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* STATUS SECTION */}
          <div className={`rounded-lg p-4 ${taskStatus.bgColor}`}>
            <div className="flex items-center gap-3">
              <StatusIcon className={`h-6 w-6 ${taskStatus.color}`} />
              <div className="flex-1">
                <p className={`font-semibold ${taskStatus.color}`}>{taskStatus.label}</p>
                <p className="text-sm text-muted-foreground">{taskStatus.description}</p>
              </div>
            </div>
          </div>

          {/* TASK DETAILS GRID */}
          <div className="grid grid-cols-2 gap-3">
            {/* Estimated Time */}
            <Card className="glass-card border border-border p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground">Time</p>
              </div>
              <p className="font-semibold text-foreground">{taskDefinition.estimatedTime} min</p>
            </Card>

            {/* Category */}
            <Card className="glass-card border border-border p-3">
              <div className="text-xs font-medium text-muted-foreground mb-1">Category</div>
              <Badge
                variant="outline"
                className="text-xs capitalize"
              >
                {taskDefinition.category}
              </Badge>
            </Card>

            {/* EduCoins Reward */}
            <Card className="glass-card border border-border p-3">
              <div className="flex items-center gap-2 mb-1">
                <Coins className="h-4 w-4 text-accent" />
                <p className="text-xs font-medium text-muted-foreground">EduCoins</p>
              </div>
              <p className="font-semibold text-foreground">+{taskDefinition.reward.eduCoins}</p>
            </Card>

            {/* XP Reward */}
            <Card className="glass-card border border-border p-3">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-primary" />
                <p className="text-xs font-medium text-muted-foreground">XP</p>
              </div>
              <p className="font-semibold text-foreground">+{taskDefinition.reward.xp}</p>
            </Card>
          </div>

          {/* LONG DESCRIPTION */}
          {taskDefinition.longDescription && (
            <div className="glass-card border border-border p-4 rounded-lg">
              <p className="text-sm text-foreground leading-relaxed">
                {taskDefinition.longDescription}
              </p>
            </div>
          )}

          {/* PROOF REQUIREMENTS */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Award className="h-4 w-4" />
              How to Submit Proof
            </h4>
            <div className="space-y-2">
              {proofRequirements.map((req, idx) => {
                const ReqIcon = req.icon;
                return (
                  <div key={idx} className="glass-card border border-border p-3 rounded-lg flex items-center gap-3">
                    <ReqIcon className="h-5 w-5 text-primary shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{req.label}</p>
                      {req.type === "photo" && (
                        <p className="text-xs text-muted-foreground">
                          Max {taskDefinition.proofPolicy.maxFileSize ? `${taskDefinition.proofPolicy.maxFileSize / 1024 / 1024}MB` : "5MB"}
                        </p>
                      )}
                      {req.type === "text" && (
                        <p className="text-xs text-muted-foreground">
                          {taskDefinition.proofPolicy.minTextLength} -{" "}
                          {taskDefinition.proofPolicy.maxTextLength || "unlimited"} words
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* REJECTION RETRY INFO */}
          {userTask.status === "rejected" && (
            <div className="glass-card border border-destructive/30 bg-destructive/5 p-4 rounded-lg">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground mb-1">
                    Proof was not approved
                  </p>
                  {userTask.rejectionReason && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {userTask.rejectionReason}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Attempts: {userTask.rejectionCount} / {taskDefinition.stateRules.maxRetries || 3}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* UNLOCK CONDITIONS */}
          {userTask.status === "locked" && taskDefinition.visibilityRules.prerequisiteTaskIds && (
            <div className="glass-card border border-border p-4 rounded-lg">
              <p className="text-sm font-medium text-foreground mb-2">Prerequisites:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {taskDefinition.visibilityRules.prerequisiteTaskIds.map((id) => (
                  <li key={id} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                    Complete related task
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* TIME FRAME INFO */}
          {taskDefinition.timeFrame !== "anytime" && (
            <div className="glass-card border border-border p-3 rounded-lg flex items-start gap-2">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">
                {taskDefinition.timeFrame === "today"
                  ? "This task is available only today"
                  : "This task is available this week"}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>

          {userTask.status === "available" && (
            <Button onClick={onStartTask} disabled={isLoading} className="flex-1">
              {isLoading ? "Starting..." : "Start Task"}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}

          {userTask.status === "in_progress" && (
            <Button onClick={onSubmitProof} disabled={isLoading} className="flex-1">
              {isLoading ? "Loading..." : "Submit Proof"}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}

          {userTask.status === "rejected" && userTask.rejectionCount < (taskDefinition.stateRules.maxRetries || 3) && (
            <Button onClick={onSubmitProof} disabled={isLoading} className="flex-1">
              Retry
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}

          {(userTask.status === "completed" || userTask.status === "under_review") && (
            <div className="flex-1 text-center py-2">
              <p className="text-sm text-muted-foreground">
                {userTask.status === "completed"
                  ? "✨ Task complete! Rewards earned."
                  : "⏳ Waiting for review..."}
              </p>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
