/**
 * TASK SEED DATA
 * Realistic, curriculum-aligned tasks for MVP
 * Designed for all 4 categories: family, village, subject, personal
 */

import type { TaskDefinition, UserTask } from "@/integrations/supabase/tasks.types";

// ============================================================================
// SEED TASK DEFINITIONS
// ============================================================================

export const seedTasks: TaskDefinition[] = [
  // ===== FAMILY CATEGORY (Personal growth + family bonding) =====
  {
    id: "task_family_cooking",
    title: "Help with family cooking",
    description: "Assist in preparing a meal and document what you learned about nutrition",
    longDescription: "Work alongside a family member to prepare a healthy meal. Take a photo of the finished dish and write about 2 nutritional facts you learned during the process.",
    category: "family",
    difficulty: "easy",
    estimatedTime: 45,
    timeFrame: "this_week",
    proofPolicy: {
      type: "photo",
      required: true,
      maxUploads: 2,
      reviewType: "parent",
      acceptedFileTypes: ["image/jpeg", "image/png", "image/webp"],
      maxFileSize: 5242880, // 5MB
    },
    reward: {
      eduCoins: 25,
      xp: 50,
      streakContribution: true,
    },
    visibilityRules: {
      dailyLimit: 1,
    },
    stateRules: {
      autoCompleteOnProofApproval: true,
      allowRejectionRetry: true,
      maxRetries: 3,
    },
    icon: "👨‍🍳",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },

  {
    id: "task_family_budget",
    title: "Help with family budget planning",
    description: "Assist parents in tracking expenses for one week and identify savings opportunities",
    longDescription: "Help your family create a weekly budget. Organize receipts, calculate totals, and suggest 2-3 ways to save money. Submit a written summary of your findings.",
    category: "family",
    difficulty: "medium",
    estimatedTime: 60,
    timeFrame: "this_week",
    proofPolicy: {
      type: "text",
      required: true,
      minTextLength: 150,
      maxTextLength: 500,
      reviewType: "parent",
    },
    reward: {
      eduCoins: 35,
      xp: 70,
      streakContribution: true,
    },
    visibilityRules: {
      dailyLimit: 1,
    },
    stateRules: {
      autoCompleteOnProofApproval: true,
      allowRejectionRetry: true,
      maxRetries: 2,
    },
    icon: "💰",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },

  {
    id: "task_family_storytelling",
    title: "Record family stories",
    description: "Interview an elder family member and record their story (text summary)",
    longDescription: "Spend time with an older family member and learn about their life. Write down or summarize a meaningful story they share. Include at least 3 interesting details.",
    category: "family",
    difficulty: "easy",
    estimatedTime: 30,
    timeFrame: "anytime",
    proofPolicy: {
      type: "text",
      required: true,
      minTextLength: 100,
      maxTextLength: 400,
      reviewType: "parent",
    },
    reward: {
      eduCoins: 20,
      xp: 40,
      streakContribution: true,
      badgeId: "storyteller",
    },
    visibilityRules: {
      dailyLimit: 2,
    },
    stateRules: {
      autoCompleteOnProofApproval: true,
      allowRejectionRetry: true,
    },
    icon: "📖",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },

  // ===== VILLAGE CATEGORY (Community service + leadership) =====
  {
    id: "task_village_clean_water",
    title: "Clean water awareness drive",
    description: "Educate 3 neighbors about clean water practices",
    longDescription: "Visit 3 neighbors and teach them about safe water practices (boiling, storage, hygiene). Take a photo with them (if permitted) and write a summary of what you taught.",
    category: "village",
    difficulty: "medium",
    estimatedTime: 90,
    timeFrame: "this_week",
    proofPolicy: {
      type: "text",
      required: true,
      minTextLength: 150,
      maxTextLength: 500,
      reviewType: "community",
    },
    reward: {
      eduCoins: 50,
      xp: 100,
      streakContribution: true,
      badgeId: "health_champion",
    },
    visibilityRules: {
      dailyLimit: 1,
    },
    stateRules: {
      autoCompleteOnProofApproval: true,
      allowRejectionRetry: true,
      maxRetries: 2,
    },
    icon: "💧",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },

  {
    id: "task_village_tree_planting",
    title: "Plant a tree in your community",
    description: "Plant a sapling in your village and document its location and care plan",
    longDescription: "Work with your community to plant a sapling. Take a photo of it in the ground. Write down the species, exact location, and a 30-day watering plan.",
    category: "village",
    difficulty: "medium",
    estimatedTime: 45,
    timeFrame: "this_week",
    proofPolicy: {
      type: "photo",
      required: true,
      maxUploads: 3,
      reviewType: "community",
      acceptedFileTypes: ["image/jpeg", "image/png", "image/webp"],
      maxFileSize: 5242880,
    },
    reward: {
      eduCoins: 40,
      xp: 80,
      streakContribution: true,
      badgeId: "eco_warrior",
    },
    visibilityRules: {
      dailyLimit: 2,
    },
    stateRules: {
      autoCompleteOnProofApproval: true,
      allowRejectionRetry: true,
      maxRetries: 3,
    },
    icon: "🌱",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },

  {
    id: "task_village_sanitation",
    title: "Organize community sanitation drive",
    description: "Lead a cleanup activity in your village and document the before/after",
    longDescription: "Gather friends or family to clean a public space (park, waterway, street). Take before and after photos. Write about the impact of your work.",
    category: "village",
    difficulty: "hard",
    estimatedTime: 120,
    timeFrame: "this_week",
    proofPolicy: {
      type: "photo",
      required: true,
      maxUploads: 5,
      reviewType: "community",
      acceptedFileTypes: ["image/jpeg", "image/png", "image/webp"],
      maxFileSize: 5242880,
    },
    reward: {
      eduCoins: 60,
      xp: 120,
      streakContribution: true,
      badgeId: "community_leader",
    },
    visibilityRules: {
      dailyLimit: 1,
    },
    stateRules: {
      autoCompleteOnProofApproval: true,
      allowRejectionRetry: true,
      maxRetries: 2,
    },
    icon: "🧹",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },

  // ===== SUBJECT CATEGORY (Hands-on learning) =====
  {
    id: "task_physics_lever",
    title: "Build a lever system",
    description: "Demonstrate a simple lever using household items (Physics)",
    longDescription: "Create a working lever using common materials (spoon, rock, board). Take a photo of your setup. Write an explanation of how the mechanical advantage works.",
    category: "subject",
    difficulty: "medium",
    estimatedTime: 45,
    timeFrame: "this_week",
    proofPolicy: {
      type: "photo",
      required: true,
      maxUploads: 3,
      reviewType: "teacher",
      acceptedFileTypes: ["image/jpeg", "image/png", "image/webp"],
      maxFileSize: 5242880,
    },
    reward: {
      eduCoins: 30,
      xp: 75,
      streakContribution: true,
    },
    visibilityRules: {
      dailyLimit: 1,
    },
    stateRules: {
      autoCompleteOnProofApproval: true,
      allowRejectionRetry: true,
      maxRetries: 2,
    },
    icon: "⚙️",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },

  {
    id: "task_chemistry_extraction",
    title: "Extract natural dye",
    description: "Extract color from natural sources (Chemistry)",
    longDescription: "Use leaves, flowers, or roots to extract natural dyes. Document the process with photos at each step. Explain the chemistry behind color extraction.",
    category: "subject",
    difficulty: "hard",
    estimatedTime: 90,
    timeFrame: "this_week",
    proofPolicy: {
      type: "photo",
      required: true,
      maxUploads: 6,
      reviewType: "teacher",
      acceptedFileTypes: ["image/jpeg", "image/png", "image/webp"],
      maxFileSize: 5242880,
    },
    reward: {
      eduCoins: 45,
      xp: 100,
      streakContribution: true,
    },
    visibilityRules: {
      dailyLimit: 1,
      minLevelRequired: 3,
    },
    stateRules: {
      autoCompleteOnProofApproval: true,
      allowRejectionRetry: true,
      maxRetries: 2,
    },
    icon: "🧪",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },

  {
    id: "task_biology_observation",
    title: "Observe and document biodiversity",
    description: "Find 5 different plants/insects in nature and document them",
    longDescription: "Go to a natural area and observe 5 different species. Take photos and record the common name, scientific name (if known), and one interesting fact about each.",
    category: "subject",
    difficulty: "easy",
    estimatedTime: 60,
    timeFrame: "this_week",
    proofPolicy: {
      type: "photo",
      required: true,
      maxUploads: 8,
      reviewType: "teacher",
      acceptedFileTypes: ["image/jpeg", "image/png", "image/webp"],
      maxFileSize: 5242880,
    },
    reward: {
      eduCoins: 35,
      xp: 70,
      streakContribution: true,
    },
    visibilityRules: {
      dailyLimit: 1,
    },
    stateRules: {
      autoCompleteOnProofApproval: true,
      allowRejectionRetry: true,
      maxRetries: 3,
    },
    icon: "🦋",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },

  {
    id: "task_math_measurement",
    title: "Measure and calculate room area",
    description: "Measure a room and calculate its area using geometry",
    longDescription: "Use a measuring tape to measure a room. Calculate the area. Create a scale drawing. Explain your method and calculations in a written summary.",
    category: "subject",
    difficulty: "medium",
    estimatedTime: 45,
    timeFrame: "anytime",
    proofPolicy: {
      type: "text",
      required: true,
      minTextLength: 150,
      maxTextLength: 500,
      reviewType: "teacher",
    },
    reward: {
      eduCoins: 25,
      xp: 60,
      streakContribution: true,
    },
    visibilityRules: {
      dailyLimit: 1,
    },
    stateRules: {
      autoCompleteOnProofApproval: true,
      allowRejectionRetry: true,
      maxRetries: 2,
    },
    icon: "📏",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },

  // ===== PERSONAL CATEGORY (Self-improvement) =====
  {
    id: "task_personal_meditation",
    title: "Practice mindfulness meditation",
    description: "Complete a 10-minute guided meditation",
    longDescription: "Use a meditation app or guide (like Insight Timer) to complete a 10-minute session. Reflect on how you felt before and after.",
    category: "personal",
    difficulty: "easy",
    estimatedTime: 15,
    timeFrame: "today",
    proofPolicy: {
      type: "auto",
      required: false,
      reviewType: "system",
    },
    reward: {
      eduCoins: 10,
      xp: 20,
      streakContribution: true,
    },
    visibilityRules: {
      dailyLimit: 1,
    },
    stateRules: {
      autoCompleteOnProofApproval: true,
    },
    icon: "🧘",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },

  {
    id: "task_personal_exercise",
    title: "Complete 30-minute exercise routine",
    description: "Do any form of physical activity for 30 minutes",
    longDescription: "Walk, run, dance, play a sport, or do home exercises for 30 minutes. Log what you did.",
    category: "personal",
    difficulty: "easy",
    estimatedTime: 35,
    timeFrame: "today",
    proofPolicy: {
      type: "auto",
      required: false,
      reviewType: "system",
    },
    reward: {
      eduCoins: 15,
      xp: 30,
      streakContribution: true,
    },
    visibilityRules: {
      dailyLimit: 1,
    },
    stateRules: {
      autoCompleteOnProofApproval: true,
    },
    icon: "🏃",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },

  {
    id: "task_personal_reading",
    title: "Read for 20 minutes",
    description: "Read any educational content for 20 minutes",
    longDescription: "Read a book, article, or educational blog post. Write a brief summary of what you learned.",
    category: "personal",
    difficulty: "easy",
    estimatedTime: 25,
    timeFrame: "today",
    proofPolicy: {
      type: "text",
      required: true,
      minTextLength: 50,
      maxTextLength: 200,
      reviewType: "system",
    },
    reward: {
      eduCoins: 12,
      xp: 25,
      streakContribution: true,
    },
    visibilityRules: {
      dailyLimit: 2,
    },
    stateRules: {
      autoCompleteOnProofApproval: true,
      allowRejectionRetry: true,
    },
    icon: "📚",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

// ============================================================================
// MOCK USER TASK PROGRESS (FOR DEMO)
// ============================================================================

export const mockUserTasks: UserTask[] = [
  {
    id: "user_task_1",
    userId: "demo_user",
    taskId: "task_family_cooking",
    status: "available",
    rejectionCount: 0,
    rewardGranted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "user_task_2",
    userId: "demo_user",
    taskId: "task_village_tree_planting",
    status: "available",
    rejectionCount: 0,
    rewardGranted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "user_task_3",
    userId: "demo_user",
    taskId: "task_physics_lever",
    status: "available",
    rejectionCount: 0,
    rewardGranted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "user_task_4",
    userId: "demo_user",
    taskId: "task_family_budget",
    status: "available",
    rejectionCount: 0,
    rewardGranted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "user_task_5",
    userId: "demo_user",
    taskId: "task_personal_meditation",
    status: "available",
    rejectionCount: 0,
    rewardGranted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "user_task_6",
    userId: "demo_user",
    taskId: "task_chemistry_extraction",
    status: "available",
    rejectionCount: 0,
    rewardGranted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "user_task_7",
    userId: "demo_user",
    taskId: "task_village_sanitation",
    status: "available",
    rejectionCount: 0,
    rewardGranted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
