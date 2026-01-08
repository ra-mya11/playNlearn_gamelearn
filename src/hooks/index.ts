// Authentication & User Management
export { useAuth } from "@/contexts/AuthContext";

// Economy & Gamification
export { usePlayCoins } from "./use-playcoins";
export { useUserLevel } from "./use-user-level";
export { useStreak } from "./use-streak";
export { useAchievements } from "./use-achievements";
export { useRewards } from "./use-rewards";
export { useLeaderboard } from "./use-leaderboard";
export { useGameProgress } from "./use-game-progress";

// AI Features
export { useAITutor } from "./use-ai-tutor";
export { useAIAssessment } from "./use-ai-assessment";

// Realtime Features
export { useRealtimeLeaderboard } from "./use-realtime-leaderboard";
export { useRealtimeProgress } from "./use-realtime-progress";

// Task System
export { useTasks } from "./use-tasks";

// Utility Hooks
export { useIsMobile } from "./use-mobile";
export { usePWA } from "./use-pwa";
export { useToast, toast } from "./use-toast";
export { useNotificationBadges } from "./use-notification-badges";
