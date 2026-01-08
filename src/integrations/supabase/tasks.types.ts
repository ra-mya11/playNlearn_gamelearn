/**
 * TASK SYSTEM TYPES
 * Complete type definitions for the gamified, proof-driven task system
 * Designed for Supabase integration (backend can be wired later)
 */

// ============================================================================
// CORE ENUMS & CONSTANTS
// ============================================================================

export type TaskStatus = 
  | "locked" 
  | "available" 
  | "in_progress" 
  | "awaiting_proof" 
  | "under_review" 
  | "completed" 
  | "rejected";

export type TaskCategory = "family" | "village" | "subject" | "personal";

export type TaskDifficulty = "easy" | "medium" | "hard";

export type TaskTimeFrame = "today" | "this_week" | "anytime";

export type ProofType = "none" | "photo" | "text" | "quiz" | "auto";

export type ReviewerRole = "parent" | "teacher" | "system" | "community";

export type ReviewDecision = "approved" | "rejected" | "pending";

// ============================================================================
// TASK DEFINITION SYSTEM
// ============================================================================

export interface ProofPolicy {
  type: ProofType;
  required: boolean;
  minTextLength?: number;
  maxTextLength?: number;
  maxUploads?: number;
  allowMultiple?: boolean;
  reviewType: ReviewerRole | "auto";
  acceptedFileTypes?: string[];
  maxFileSize?: number; // bytes
}

export interface Reward {
  eduCoins: number;
  xp: number;
  badgeId?: string;
  streakContribution?: boolean;
  bonusMultiplier?: number;
}

export interface VisibilityRules {
  minLevelRequired?: number;
  prerequisiteTaskIds?: string[];
  dailyLimit?: number;
  minAge?: number;
  maxAge?: number;
}

export interface StateRules {
  autoCompleteOnProofApproval?: boolean;
  allowSkip?: boolean;
  allowRejectionRetry?: boolean;
  maxRetries?: number;
  expiresAfter?: number; // milliseconds
}

export interface TaskDefinition {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  category: TaskCategory;
  difficulty: TaskDifficulty;
  estimatedTime: number; // minutes
  timeFrame: TaskTimeFrame;
  proofPolicy: ProofPolicy;
  reward: Reward;
  visibilityRules: VisibilityRules;
  stateRules: StateRules;
  icon?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// USER TASK PROGRESS (STATE MACHINE)
// ============================================================================

export interface UserTask {
  id: string;
  userId: string;
  taskId: string;
  taskDefinition?: TaskDefinition; // populated from join
  status: TaskStatus;
  startedAt?: Date;
  completedAt?: Date;
  proofSubmittedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  rejectionCount: number;
  currentProofId?: string;
  rewardGrantedAt?: Date;
  rewardGranted: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// PROOF SYSTEM (CORE OF TRUST)
// ============================================================================

export interface ProofBase {
  id: string;
  userTaskId: string;
  userId: string;
  taskId: string;
  proofType: ProofType;
  submittedAt: Date;
  status: "pending" | "approved" | "rejected";
  reviewedAt?: Date;
  reviewerRole?: ReviewerRole;
  reviewFeedback?: string;
}

export interface PhotoProof extends ProofBase {
  proofType: "photo";
  fileUrl: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  caption?: string;
  width?: number;
  height?: number;
  // EXIF data stripped on upload
  exifStripped: boolean;
  uploadedViaUrl?: boolean; // true if uploaded from CDN
}

export interface TextProof extends ProofBase {
  proofType: "text";
  content: string;
  wordCount: number;
  characterCount: number;
  language?: string;
  plagarismScore?: number; // 0-100, populated by system later
}

export interface QuizProof extends ProofBase {
  proofType: "quiz";
  quizId: string;
  score: number;
  maxScore: number;
  passThreshold: number;
  answers: Record<string, string | string[]>;
  timeTakenSeconds: number;
  autoApproved: boolean;
}

export interface AutoProof extends ProofBase {
  proofType: "auto";
  systemEvent: string;
  systemData: Record<string, any>;
  verificationDetails?: string;
}

export type Proof = PhotoProof | TextProof | QuizProof | AutoProof;

// ============================================================================
// MODERATION & VALIDATION
// ============================================================================

export interface ProofReview {
  id: string;
  proofId: string;
  userTaskId: string;
  reviewerRole: ReviewerRole;
  reviewerUserId?: string;
  decision: ReviewDecision;
  feedback?: string;
  approvalReason?: string;
  rejectionReason?: string;
  reviewedAt: Date;
  createdAt: Date;
}

export interface TaskReview {
  id: string;
  userTaskId: string;
  reviewerRole: ReviewerRole;
  decision: ReviewDecision;
  feedback?: string;
  reviewedAt: Date;
  createdAt: Date;
}

// ============================================================================
// REWARD GRANT HISTORY (AUDIT TRAIL)
// ============================================================================

export interface RewardGrant {
  id: string;
  userId: string;
  userTaskId: string;
  taskId: string;
  eduCoinsAwarded: number;
  xpAwarded: number;
  badgeId?: string;
  streakBonus?: number;
  reasonCode: string; // "task_completion", "bonus_streak", etc.
  grantedAt: Date;
  claimedAt?: Date;
  createdAt: Date;
}

// ============================================================================
// USER TASK CONTEXT (FOR UI RENDERING)
// ============================================================================

export interface UserTaskContext {
  userTask: UserTask;
  taskDefinition: TaskDefinition;
  currentProof?: Proof;
  proofReview?: ProofReview;
  reward?: RewardGrant;
  canStartTask: boolean;
  canSubmitProof: boolean;
  canRetry: boolean;
  nextUnlockCondition?: string;
}

// ============================================================================
// API RESPONSE TYPES (FOR FUTURE BACKEND)
// ============================================================================

export interface TaskSubmissionRequest {
  userTaskId: string;
  proofType: ProofType;
  proofData: {
    photo?: {
      fileUrl: string;
      fileName: string;
      fileSizeBytes: number;
      mimeType: string;
      caption?: string;
    };
    text?: {
      content: string;
    };
    quiz?: {
      answers: Record<string, any>;
      timeTakenSeconds: number;
    };
  };
}

export interface TaskSubmissionResponse {
  success: boolean;
  userTask: UserTask;
  proof: Proof;
  message: string;
}

export interface TaskProgressResponse {
  completedTasks: number;
  totalAvailableTasks: number;
  totalEduCoinsEarned: number;
  totalXpEarned: number;
  streakDays: number;
  userTasks: UserTask[];
}

// ============================================================================
// GAMIFICATION & MOTIVATION
// ============================================================================

export interface TaskAchievement {
  id: string;
  userId: string;
  title: string;
  description: string;
  unlockedAt: Date;
  rarity: "common" | "rare" | "epic" | "legendary";
  icon?: string;
  bonus?: number; // extra XP/coins
}

export interface TaskStreak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastTaskCompletedAt: Date;
  multiplier: number; // 1.0x to 2.0x based on streak
}

// ============================================================================
// UI STATE (FOR COMPONENT MANAGEMENT)
// ============================================================================

export interface TaskUIState {
  selectedTaskId?: string;
  showProofModal: boolean;
  showTaskDetail: boolean;
  activeFilter: TaskCategory | "all";
  sortBy: "dueDate" | "reward" | "difficulty" | "category";
  searchQuery: string;
  loadingTaskIds: string[];
  errorMessage?: string;
}

export interface ProofSubmissionUIState {
  currentStep: "select_type" | "upload" | "review" | "confirm";
  selectedProofType: ProofType;
  uploadProgress: number;
  isValidating: boolean;
  validationErrors: string[];
  submissionLoading: boolean;
}
