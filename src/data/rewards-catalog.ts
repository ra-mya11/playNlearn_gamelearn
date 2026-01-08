/**
 * REWARDS CATALOG
 * Comprehensive reward dataset organized by 6 categories
 * Each category is designed to be motivating and meaningful for students
 */

export interface RewardProduct {
  id: string;
  name: string;
  description: string;
  category: "study" | "fun" | "skill" | "family" | "community" | "premium";
  educoinsCost: number;
  image: string;
  longDescription: string;
  impact: string; // Why this reward matters
  stock?: number;
}

export const rewardsCatalog: RewardProduct[] = [
  // ========== STUDY & ACADEMIC ESSENTIALS ==========
  {
    id: "study_001",
    name: "Premium Notebook Set",
    description: "3 quality ruled notebooks for organized note-taking",
    category: "study",
    educoinsCost: 80,
    image: "https://images.pexels.com/photos/26834974/pexels-photo-26834974.jpeg",
    longDescription: "Beautiful, durable notebooks with soft covers. Perfect for organizing notes across different subjects. Improves writing clarity and retention.",
    impact: "Organized notes boost academic performance",
    stock: 50,
  },
  {
    id: "study_002",
    name: "Pen & Pencil Kit",
    description: "24-piece premium writing and sketching set",
    category: "study",
    educoinsCost: 75,
    image: "https://images.pexels.com/photos/29765799/pexels-photo-29765799.jpeg",
    longDescription: "Complete writing kit with smooth-writing ballpoint pens, HB & 2B pencils, and colored pencils. Precision engineering for comfortable writing.",
    impact: "Quality tools make studying more enjoyable",
    stock: 60,
  },
  {
    id: "study_003",
    name: "Geometry Box",
    description: "Complete compass, ruler, and protractor set",
    category: "study",
    educoinsCost: 90,
    image: "https://images.pexels.com/photos/18889469/pexels-photo-18889469.jpeg",
    longDescription: "Precision geometry tools for math and technical drawing. Includes compass, ruler, protractor, and set square. Essential for accurate diagrams.",
    impact: "Master geometry and technical subjects",
    stock: 40,
  },
  {
    id: "study_004",
    name: "Study Desk Lamp",
    description: "LED reading light with adjustable brightness",
    category: "study",
    educoinsCost: 120,
    image: "https://images.pexels.com/photos/20943579/pexels-photo-20943579.jpeg",
    longDescription: "Energy-efficient LED lamp that reduces eye strain. Three brightness levels, flexible gooseneck design. Perfect for evening study sessions.",
    impact: "Better lighting improves focus and concentration",
    stock: 35,
  },
  {
    id: "study_005",
    name: "Scientific Calculator",
    description: "Advanced functions for math and science",
    category: "study",
    educoinsCost: 150,
    image: "https://images.pexels.com/photos/18069211/pexels-photo-18069211.png",
    longDescription: "Full-feature calculator with 240+ functions. Matrix operations, statistics, calculus. Battery + solar powered. Durable design.",
    impact: "Advanced tools unlock complex problem-solving",
    stock: 25,
  },
  {
    id: "study_006",
    name: "Flash Card Set",
    description: "300 blank cards + storage box for memorization",
    category: "study",
    educoinsCost: 65,
    image: "https://images.pexels.com/photos/30983411/pexels-photo-30983411.jpeg",
    longDescription: "Quality cardstock for creating custom study cards. Ringbound box for organization. Ideal for vocabulary, formulas, and memorization.",
    impact: "Active recall improves long-term memory retention",
    stock: 55,
  },
  {
    id: "study_007",
    name: "Whiteboard Set",
    description: "3 mini whiteboards with markers and erasers",
    category: "study",
    educoinsCost: 85,
    image: "https://images.pexels.com/photos/26834974/pexels-photo-26834974.jpeg",
    longDescription: "Reusable dry-erase whiteboards perfect for working through problems at home. Markers are odor-free and easily erasable.",
    impact: "Practice problems improve problem-solving skills",
    stock: 45,
  },

  // ========== SKILL-BUILDING & FUTURE SKILLS ==========
  {
    id: "skill_001",
    name: "Science Experiment Kit",
    description: "20+ hands-on experiments for chemistry and physics",
    category: "skill",
    educoinsCost: 180,
    image: "https://images.pexels.com/photos/34776659/pexels-photo-34776659.jpeg",
    longDescription: "Safe, age-appropriate experiments exploring color reactions, crystal growth, and physics principles. Includes all materials and instruction manual.",
    impact: "Build real scientific thinking and curiosity",
    stock: 20,
  },
  {
    id: "skill_002",
    name: "Robotics Starter Kit",
    description: "Build and program your first robot",
    category: "skill",
    educoinsCost: 250,
    image: "https://images.pexels.com/photos/8617845/pexels-photo-8617845.jpeg",
    longDescription: "Perfect beginner robotics kit. Build basic robots, learn programming through block-based coding. Develops logic and engineering skills.",
    impact: "Master technology and prepare for future careers",
    stock: 15,
  },
  {
    id: "skill_003",
    name: "Electronics Learning Kit",
    description: "Circuits, LEDs, and breadboard experiments",
    category: "skill",
    educoinsCost: 140,
    image: "https://images.pexels.com/photos/3394662/pexels-photo-3394662.jpeg",
    longDescription: "Hands-on electronics kit with resistors, capacitors, LEDs, and breadboard. Learn circuit design and electrical principles safely.",
    impact: "Understand how the electronic devices you use work",
    stock: 22,
  },
  {
    id: "skill_004",
    name: "Coding Practice Kit",
    description: "Beginner-friendly coding challenges and projects",
    category: "skill",
    educoinsCost: 160,
    image: "https://images.pexels.com/photos/3394662/pexels-photo-3394662.jpeg",
    longDescription: "Interactive coding challenges for beginners. Learn Python or JavaScript through game-like projects. Includes detailed tutorials and examples.",
    impact: "Build in-demand programming skills early",
    stock: 28,
  },
  {
    id: "skill_005",
    name: "Math Puzzle Set",
    description: "Logic puzzles and mathematical challenges",
    category: "skill",
    educoinsCost: 95,
    image: "https://images.pexels.com/photos/792051/pexels-photo-792051.jpeg",
    longDescription: "50+ engaging math puzzles from easy to challenging. Includes Sudoku, logic grids, and mathematical brain-teasers. Printed workbook.",
    impact: "Strengthen mathematical thinking and reasoning",
    stock: 40,
  },

  // ========== FUN & CREATIVE LEARNING ==========
  {
    id: "fun_001",
    name: "Art & Craft Kit",
    description: "200+ pieces for creative projects",
    category: "fun",
    educoinsCost: 110,
    image: "https://images.pexels.com/photos/10328458/pexels-photo-10328458.jpeg",
    longDescription: "Comprehensive art set with acrylic paints, brushes, sketching pencils, colored pencils, and canvas. Perfect for creative expression.",
    impact: "Creative play reduces stress and boosts confidence",
    stock: 35,
  },
  {
    id: "fun_002",
    name: "Coloring & Drawing Set",
    description: "Premium colored pencils and sketch pads",
    category: "fun",
    educoinsCost: 85,
    image: "https://images.pexels.com/photos/10328458/pexels-photo-10328458.jpeg",
    longDescription: "100 colored pencils with rich pigments, blending pencils, and 3 high-quality sketch pads. Ideal for detailed artwork and relaxation.",
    impact: "Artistic expression improves emotional well-being",
    stock: 50,
  },
  {
    id: "fun_003",
    name: "Educational Board Game",
    description: "Strategy game that builds critical thinking",
    category: "fun",
    educoinsCost: 130,
    image: "https://images.pexels.com/photos/792051/pexels-photo-792051.jpeg",
    longDescription: "Award-winning board game for 2-4 players. Combines fun gameplay with mathematical strategy and logic challenges. Family-friendly.",
    impact: "Bonding through fun while learning strategy",
    stock: 25,
  },
  {
    id: "fun_004",
    name: "3D Puzzle Toys",
    description: "10 complex 3D brain puzzles",
    category: "fun",
    educoinsCost: 70,
    image: "https://images.pexels.com/photos/792051/pexels-photo-792051.jpeg",
    longDescription: "Challenging 3D puzzles that develop spatial reasoning and problem-solving. Addictive, screen-free entertainment.",
    impact: "Develop spatial intelligence through play",
    stock: 55,
  },
  {
    id: "fun_005",
    name: "DIY & Origami Kit",
    description: "Complete origami and DIY craft paper set",
    category: "fun",
    educoinsCost: 60,
    image: "https://images.pexels.com/photos/10328458/pexels-photo-10328458.jpeg",
    longDescription: "500 sheets of colorful origami paper, step-by-step guides for 50+ designs, and craft tools. From beginner to advanced projects.",
    impact: "Patience and precision skills through creative hands-on work",
    stock: 60,
  },

  // ========== FAMILY & HOUSEHOLD USE ==========
  {
    id: "family_001",
    name: "Water Bottle & Lunch Box",
    description: "Insulated bottle + leak-proof lunch container",
    category: "family",
    educoinsCost: 125,
    image: "https://images.pexels.com/photos/8696758/pexels-photo-8696758.jpeg",
    longDescription: "Premium water bottle keeps drinks cold for 12 hours. Matching lunch box keeps food fresh. Both durable and eco-friendly materials.",
    impact: "Healthy hydration and nutrition support better learning",
    stock: 70,
  },
  {
    id: "family_002",
    name: "LED Emergency Lamp",
    description: "Rechargeable multi-function emergency light",
    category: "family",
    educoinsCost: 100,
    image: "https://images.pexels.com/photos/20943579/pexels-photo-20943579.jpeg",
    longDescription: "Solar + USB rechargeable LED lamp. Perfect for power outages, outdoor activities, or camping. Built-in SOS signal function.",
    impact: "Family safety and convenience during emergencies",
    stock: 45,
  },
  {
    id: "family_003",
    name: "Storage Container Set",
    description: "6 durable containers for home organization",
    category: "family",
    educoinsCost: 95,
    image: "https://images.pexels.com/photos/8696758/pexels-photo-8696758.jpeg",
    longDescription: "Airtight containers in various sizes. Perfect for food storage, organizing supplies, and keeping pantry neat. Dishwasher safe.",
    impact: "Organization improves household efficiency and cleanliness",
    stock: 60,
  },
  {
    id: "family_004",
    name: "Kitchen Utensils Set",
    description: "15-piece cooking and serving utensils",
    category: "family",
    educoinsCost: 110,
    image: "https://images.pexels.com/photos/8696758/pexels-photo-8696758.jpeg",
    longDescription: "Stainless steel utensils including spoons, tongs, spatulas, and serving tools. Non-stick, heat-resistant, and long-lasting.",
    impact: "Better cooking equipment makes meal preparation easier",
    stock: 50,
  },
  {
    id: "family_005",
    name: "First Aid Kit",
    description: "Complete home medical emergency kit",
    category: "family",
    educoinsCost: 85,
    image: "https://images.pexels.com/photos/6608038/pexels-photo-6608038.jpeg",
    longDescription: "Comprehensive first aid kit with bandages, antiseptics, pain relievers, thermometer, and emergency instructions. Wall-mountable.",
    impact: "Family health and safety preparedness",
    stock: 55,
  },
  {
    id: "family_006",
    name: "Cloth Shopping Bags",
    description: "5 eco-friendly reusable shopping bags",
    category: "family",
    educoinsCost: 45,
    image: "https://images.pexels.com/photos/8696758/pexels-photo-8696758.jpeg",
    longDescription: "Durable cotton shopping bags. Eco-friendly alternative to plastic. Large capacity, reinforced handles, and washable.",
    impact: "Support environmental sustainability with your family",
    stock: 80,
  },

  // ========== COMMUNITY & VILLAGE DEVELOPMENT ==========
  {
    id: "community_001",
    name: "Tree Saplings",
    description: "2 native fruit or shade tree saplings",
    category: "community",
    educoinsCost: 100,
    image: "https://images.pexels.com/photos/771319/pexels-photo-771319.jpeg",
    longDescription: "Indigenous saplings suited for your region. Includes planting guide and care instructions. Direct environmental impact on village.",
    impact: "Plant trees, clean air, and village beautification",
    stock: 100,
  },
  {
    id: "community_002",
    name: "Cleaning Tools Set",
    description: "Broom, duster, and cleaning gloves",
    category: "community",
    educoinsCost: 65,
    image: "https://images.pexels.com/photos/9230386/pexels-photo-9230386.jpeg",
    longDescription: "High-quality cleaning tools for community service. Broom with long handle, feather duster, and rubber gloves. Durable construction.",
    impact: "Keep your village clean and hygienic",
    stock: 75,
  },
  {
    id: "community_003",
    name: "Solar Lantern",
    description: "Renewable energy light for homes or public spaces",
    category: "community",
    educoinsCost: 140,
    image: "https://images.pexels.com/photos/29294301/pexels-photo-29294301.jpeg",
    longDescription: "Solar-powered LED lantern. Charges during day, provides light at night. Waterproof, perfect for homes or public areas without electricity.",
    impact: "Bring clean energy to your village",
    stock: 30,
  },
  {
    id: "community_004",
    name: "Water Filter Kit",
    description: "Purification system for clean drinking water",
    category: "community",
    educoinsCost: 180,
    image: "https://images.pexels.com/photos/29294301/pexels-photo-29294301.jpeg",
    longDescription: "Multi-stage water filtration system. Removes bacteria, sediment, and impurities. Supports health for your family and community.",
    impact: "Ensure safe, clean drinking water for families",
    stock: 20,
  },
  {
    id: "community_005",
    name: "Recycling Bins",
    description: "Color-coded set for waste segregation",
    category: "community",
    educoinsCost: 90,
    image: "https://images.pexels.com/photos/9230386/pexels-photo-9230386.jpeg",
    longDescription: "3 color-coded bins for plastic, paper, and organic waste. Promotes environmental awareness and proper waste management.",
    impact: "Drive sustainable practices in your village",
    stock: 40,
  },
  {
    id: "community_006",
    name: "Compost Kit",
    description: "Home composting system for organic waste",
    category: "community",
    educoinsCost: 120,
    image: "https://images.pexels.com/photos/771319/pexels-photo-771319.jpeg",
    longDescription: "Compact composting bin with starter materials. Turn kitchen waste into nutrient-rich soil. Easy to maintain, odor-free design.",
    impact: "Create nutrient-rich soil while reducing waste",
    stock: 35,
  },

  // ========== PREMIUM / LONG-TERM GOALS ==========
  {
    id: "premium_001",
    name: "School Backpack",
    description: "Premium ergonomic backpack with laptop compartment",
    category: "premium",
    educoinsCost: 220,
    image: "https://images.pexels.com/photos/8617636/pexels-photo-8617636.jpeg",
    longDescription: "Professional-grade backpack with padded straps, multiple compartments, laptop sleeve, and water-resistant fabric. Built to last years.",
    impact: "Invest in quality gear that supports your studies",
    stock: 25,
  },
  {
    id: "premium_002",
    name: "Educational Tablet",
    description: "10-inch tablet for learning apps and eBooks",
    category: "premium",
    educoinsCost: 400,
    image: "https://images.pexels.com/photos/7573994/pexels-photo-7573994.jpeg",
    longDescription: "High-performance tablet pre-loaded with educational apps. Perfect for digital learning, eBooks, and interactive courses.",
    impact: "Access infinite knowledge and learning resources",
    stock: 8,
  },
  {
    id: "premium_003",
    name: "Wireless Headphones",
    description: "Premium audio for learning and music",
    category: "premium",
    educoinsCost: 180,
    image: "https://images.pexels.com/photos/3394662/pexels-photo-3394662.jpeg",
    longDescription: "Noise-canceling wireless headphones. 30-hour battery life. Perfect for online courses, audiobooks, or focused study sessions.",
    impact: "Immerse yourself in distraction-free learning",
    stock: 18,
  },
  {
    id: "premium_004",
    name: "Smart Watch",
    description: "Basic smartwatch for productivity and health",
    category: "premium",
    educoinsCost: 240,
    image: "https://images.pexels.com/photos/8617636/pexels-photo-8617636.jpeg",
    longDescription: "Track learning time, set reminders for tasks, monitor health metrics. Lightweight and water-resistant. Great productivity tool.",
    impact: "Stay organized and track your learning progress",
    stock: 12,
  },
  {
    id: "premium_005",
    name: "Paid Learning Course Bundle",
    description: "3-month access to premium online learning platform",
    category: "premium",
    educoinsCost: 280,
    image: "https://images.pexels.com/photos/7573994/pexels-photo-7573994.jpeg",
    longDescription: "Access to 1000+ courses in science, math, coding, languages, and arts. Expert instructors, certificates, and lifetime access.",
    impact: "Unlock expert knowledge from world-class educators",
    stock: 50,
  },
  {
    id: "premium_006",
    name: "Math & Science Textbook Series",
    description: "Complete reference books for advanced learning",
    category: "premium",
    educoinsCost: 160,
    image: "https://images.pexels.com/photos/8617636/pexels-photo-8617636.jpeg",
    longDescription: "4-book series covering advanced math, physics, chemistry, and biology. Comprehensive reference materials for deeper understanding.",
    impact: "Deepen your knowledge with expert-written resources",
    stock: 15,
  },
];

// Helper function to get rewards by category
export function getRewardsByCategory(category: string): RewardProduct[] {
  return rewardsCatalog.filter(reward => reward.category === category);
}

// Helper function to get all categories
export function getAllCategories() {
  return ["study", "fun", "skill", "family", "community", "premium"];
}

// Helper function to check if user can afford reward
export function canAffordReward(balance: number, cost: number): boolean {
  return balance >= cost;
}

// Helper function to calculate coins needed to unlock
export function coinsToUnlock(balance: number, cost: number): number {
  return Math.max(0, cost - balance);
}

// Helper function to check if close to unlocking (within 20% of cost)
export function isAlmostThere(balance: number, cost: number): boolean {
  const threshold = cost * 0.2; // 20% of cost
  const coinsNeeded = cost - balance;
  return coinsNeeded > 0 && coinsNeeded <= threshold;
}
