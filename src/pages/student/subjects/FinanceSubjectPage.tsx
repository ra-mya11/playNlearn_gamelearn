import { AppLayout } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import { GameBadge } from "@/components/ui/game-badge";
import { GameIntroModal, GameContainer } from "@/components/games";
import {
  Wallet,
  Play,
  Star,
  Trophy,
  Zap,
  ChevronRight,
  Target,
  BookOpen,
  Gamepad2,
  Home,
  Lock,
  CheckCircle2
} from "lucide-react";
import { useState, useEffect } from "react";

import {
  RealLifeBudgetSurvival,
  MarketPriceNegotiator,
  SavingsTree,
  BankInterestSimulator,
  MicroBusinessBuilder,
  DigitalMoneyChoices,
  MoneyFlowVisualizer,
  GuidedSorter,
  TimelineComparison,
  InterestStory,
} from "@/components/games";

interface GameCard {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  xp: number;
  coins: number;
  difficulty: "easy" | "medium" | "hard";
  status: "available" | "locked" | "completed";
  route: string;
  introConfig: {
    conceptName: string;
    concept: string;
    whatYouLearn: string[];
    howToPlay: string[];
    outcome: string;
  };
  component: React.ComponentType<{ onComplete: (score: number) => void }>;
  instructions: string;
  conceptLearned: string;
  stars?: number;
}

const financeGames: GameCard[] = [
  {
    id: "budget-survival",
    name: "Real Life Budget Survival",
    description: "Manage ₹3000 monthly salary with smart decisions",
    icon: Home,
    xp: 200,
    coins: 60,
    difficulty: "hard",
    status: "available",
    route: "/student/finance/game/budget-survival",
    component: RealLifeBudgetSurvival,
    instructions:
      "You get ₹3,000 salary monthly. Fixed expenses auto-deduct (rent, food, school). Random events appear (phone repair, gifts, medical). Choose to pay, delay, or skip. Win by ending with ₹500+ savings!",
    conceptLearned:
      "Budgeting means prioritizing needs over wants. Every expense decision has consequences. Build stress by delaying payments, save money by skipping optional items.",
    introConfig: {
      conceptName: "Real Life Budget Survival",
      concept: "Monthly Budgeting & Trade-offs",
      whatYouLearn: [
        "Manage a real monthly budget",
        "Understand fixed vs random expenses",
        "Make smart trade-off decisions",
      ],
      howToPlay: [
        "Receive ₹3,000 at month start",
        "Pay rent (₹1500), food (₹800), school (₹500)",
        "Random events appear during the month",
        "Choose: Pay now, delay payment, or skip",
        "End month with ₹500+ to win!",
      ],
      outcome:
        "You'll master real-world budgeting and understand that smart choices = financial stability!",
    },
  },
  {
    id: "price-negotiator",
    name: "Market Price Negotiator",
    description: "Compare 3 sellers and pick the best value",
    icon: Target,
    xp: 150,
    coins: 50,
    difficulty: "medium",
    status: "available",
    route: "/student/finance/game/price-negotiator",
    component: MarketPriceNegotiator,
    instructions:
      "Compare prices from 3 different sellers. Calculate price per unit, not just total price. Watch out for hidden costs! Pick the smartest deal.",
    conceptLearned:
      "Cheapest ≠ Best value. Always calculate price per unit. Sometimes premium quality is worth the extra cost. Smart shopping saves real money!",
    introConfig: {
      conceptName: "Market Price Negotiator",
      concept: "Value vs Price",
      whatYouLearn: [
        "Calculate price per unit",
        "Identify hidden costs",
        "Choose best value deals",
      ],
      howToPlay: [
        "See 3 shopping scenarios",
        "Each has 3 sellers with different prices/quantities",
        "Calculate ₹/unit for each option",
        "Pick the best value!",
      ],
      outcome:
        "You'll become a smart shopper who finds real value, not just low prices!",
    },
  },
  {
    id: "savings-tree",
    name: "Savings Tree",
    description: "Grow a tree through 30 days of consistent saving",
    icon: Zap,
    xp: 150,
    coins: 50,
    difficulty: "medium",
    status: "available",
    route: "/student/finance/game/savings-tree",
    component: SavingsTree,
    instructions:
      "Save ₹100 every day for 30 consecutive days. Miss even one day and your tree wilts! Watch how consistency beats big one-time savings.",
    conceptLearned:
      "Discipline beats intensity. ₹100 daily for 30 days = ₹3,000. One ₹3,000 deposit without follow-up = nothing gained. Small daily habits create real wealth!",
    introConfig: {
      conceptName: "Savings Tree",
      concept: "Consistency Over Amount",
      whatYouLearn: [
        "Save ₹100 daily for 30 days",
        "Build a healthy savings tree",
        "Learn discipline pays off",
      ],
      howToPlay: [
        "Each day, choose: Save ₹100 or Skip",
        "Save daily = tree grows, leaves appear",
        "Skip a day = tree wilts, leaves fall",
        "Get 30 consecutive saves to win!",
      ],
      outcome:
        "You'll understand that small daily actions compound into real wealth!",
    },
  },
  {
    id: "interest-simulator",
    name: "Bank Interest Simulator",
    description: "Deposit money and watch interest grow it over time",
    icon: Wallet,
    xp: 200,
    coins: 60,
    difficulty: "medium",
    status: "available",
    route: "/student/finance/game/interest-simulator",
    component: BankInterestSimulator,
    instructions:
      "Deposit money into your bank account. Use the time slider to see your money grow through 5% annual interest. Withdraw at any time!",
    conceptLearned:
      "Banks pay you for saving (interest). More time + more money = exponential growth. This is how wealth compounds. Start early to maximize growth!",
    introConfig: {
      conceptName: "Bank Interest Simulator",
      concept: "Time Value of Money",
      whatYouLearn: [
        "Deposit multiple amounts",
        "Watch interest multiply your money",
        "Understand compound growth",
      ],
      howToPlay: [
        "Make deposits into your bank account",
        "Slide time from month 0 to 24",
        "Watch interest grow your balance",
        "Withdraw anytime to see your returns!",
      ],
      outcome:
        "You'll see how patience + banks = wealth creation! Start saving today!",
    },
  },
  {
    id: "business-builder",
    name: "Micro Business Builder",
    description: "Run a juice stall: buy inventory, set prices, maximize profit",
    icon: Trophy,
    xp: 200,
    coins: 60,
    difficulty: "hard",
    status: "available",
    route: "/student/finance/game/business-builder",
    component: MicroBusinessBuilder,
    instructions:
      "You have ₹1,000. Buy juice bottles (₹30 each). Set your selling price. Customers buy more at low prices but with low profit. Find the perfect price for 7 days!",
    conceptLearned:
      "Profit = Revenue - Cost. Low price = high volume, low profit per item. High price = fewer sales, high profit per item. Smart businesses find the sweet spot!",
    introConfig: {
      conceptName: "Micro Business Builder",
      concept: "Profit & Loss Logic",
      whatYouLearn: [
        "Buy inventory with budget",
        "Set competitive prices",
        "Manage profit margins",
      ],
      howToPlay: [
        "Start with ₹1,000 cash",
        "Buy juice bottles at ₹30 each",
        "Set your selling price",
        "Run for 7 days, see profits grow!",
      ],
      outcome:
        "You'll learn that profit comes from smart pricing strategy, not just volume!",
    },
  },
  {
    id: "money-choices",
    name: "Digital Money Choices",
    description: "Choose the right payment method for each situation",
    icon: Wallet,
    xp: 150,
    coins: 50,
    difficulty: "easy",
    status: "available",
    route: "/student/finance/game/money-choices",
    component: DigitalMoneyChoices,
    instructions:
      "Face 5 real-world scenarios. Choose: Cash, UPI, or Card? Each has pros and cons. Pick the right method for each situation!",
    conceptLearned:
      "Cash = instant, fee-free, risky. UPI = fast, secure, online-only. Card = traceable, safe, possible fees. Different situations need different tools!",
    introConfig: {
      conceptName: "Digital Money Choices",
      concept: "Payment Methods Wisdom",
      whatYouLearn: [
        "When to use cash vs digital",
        "Pros and cons of each method",
        "Safety in transactions",
      ],
      howToPlay: [
        "Read 5 shopping scenarios",
        "Choose: Cash (💵), UPI (📱), or Card (💳)",
        "Get feedback on your choice",
        "Learn the right times for each!",
      ],
      outcome:
        "You'll be a payment expert who chooses the smart option every time!",
    },
  },
];

interface ActiveLearningModule {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  component: React.ComponentType;
  xp: number;
  coins: number;
}

const activeLearningModules: ActiveLearningModule[] = [
  {
    id: "money-flow",
    name: "Money Flow Explorer",
    description: "Understand where your money goes",
    icon: Wallet,
    component: MoneyFlowVisualizer,
    xp: 100,
    coins: 30
  },
  {
    id: "need-vs-want",
    name: "Need vs Want Sorter",
    description: "Learn to distinguish needs from wants",
    icon: Target,
    component: GuidedSorter,
    xp: 150,
    coins: 40
  },
  {
    id: "timeline",
    name: "Saving vs Spending",
    description: "See 30 days of compound decisions",
    icon: Zap,
    component: TimelineComparison,
    xp: 150,
    coins: 40
  },
  {
    id: "interest-story",
    name: "How Banks Work",
    description: "Explore the power of interest",
    icon: Wallet,
    component: InterestStory,
    xp: 200,
    coins: 60
  }
];

interface PassiveLearningChapter {
  chapter: number;
  title: string;
  duration: string;
}

const passiveLearningChapters: PassiveLearningChapter[] = [
  { chapter: 1, title: "Introduction to Money", duration: "5 min" },
  { chapter: 2, title: "Understanding Savings", duration: "7 min" },
  { chapter: 3, title: "Banking Basics", duration: "6 min" }
];

type LearningMode = "active" | "passive" | "gamified";

export default function FinanceSubjectPage() {
  const [learningMode, setLearningMode] = useState<LearningMode>("active");
  const [selectedGame, setSelectedGame] = useState<GameCard | null>(null);
  const [showIntro, setShowIntro] = useState(false);
  const [playingGame, setPlayingGame] = useState<GameCard | null>(null);
  const [activeModule, setActiveModule] = useState<ActiveLearningModule | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<PassiveLearningChapter | null>(null);
  const [completedChapters, setCompletedChapters] = useState<Set<number>>(new Set());
  const totalProgress = 65;

  // Scroll to top when chapter is selected, learning mode changes, game starts, or page mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [learningMode, selectedChapter, playingGame]);

  const handlePlayGame = (game: GameCard) => {
    setSelectedGame(game);
    setShowIntro(true);
  };

  const handleStartGame = () => {
    if (selectedGame) {
      setShowIntro(false);
      setPlayingGame(selectedGame);
    }
  };

  const handleGoBack = () => {
    setShowIntro(false);
    setSelectedGame(null);
  };

  const handleGameComplete = () => {
    setPlayingGame(null);
    setSelectedGame(null);
  };

  const handleExitGame = () => {
    setPlayingGame(null);
    setSelectedGame(null);
  };

  const handleMarkAsComplete = () => {
    if (selectedChapter) {
      setCompletedChapters((prev) => {
        const updated = new Set(prev);
        updated.add(selectedChapter.chapter);
        return updated;
      });
    }
  };

  // Show chapter view
  if (selectedChapter) {
    return (
      <AppLayout role="student" playCoins={1250} title={`Chapter ${selectedChapter.chapter}: ${selectedChapter.title}`}>
        <div className="px-4 py-6 pb-24">
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedChapter(null)}
              className="flex items-center gap-2 mb-4"
            >
              <ChevronRight className="h-4 w-4 transform rotate-180" />
              Back to Passive Learning
            </Button>
          </div>

          {/* Chapter Content */}
          <div className="glass-card rounded-2xl p-6 border border-secondary/30 bg-gradient-to-br from-secondary/10 to-secondary/5">
            <div className="flex items-start gap-4 mb-6">
              <div className="h-16 w-16 rounded-xl bg-secondary/20 flex items-center justify-center shrink-0">
                <BookOpen className="h-8 w-8 text-secondary" />
              </div>
              <div className="flex-1">
                <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
                  Chapter {selectedChapter.chapter}: {selectedChapter.title}
                </h1>
                <p className="text-sm text-muted-foreground">📖 {selectedChapter.duration} read time</p>
              </div>
            </div>

            {/* Chapter Body */}
            <div className="prose prose-invert max-w-none mb-8">
              <div className="space-y-4 text-foreground/90">
                {selectedChapter.chapter === 1 && (
                  <>
                    <h2 className="font-heading text-2xl font-bold text-foreground mt-6 mb-3">What is Money?</h2>

                    {/* Visual: Evolution of Money */}
                    <div className="bg-secondary/10 rounded-xl p-6 my-6 border border-secondary/20">
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-4xl mb-2">🪙</div>
                          <p className="text-sm font-semibold text-foreground">Commodity<br/>Money</p>
                        </div>
                        <div className="text-2xl text-secondary">→</div>
                        <div className="text-center">
                          <div className="text-4xl mb-2">💵</div>
                          <p className="text-sm font-semibold text-foreground">Physical<br/>Currency</p>
                        </div>
                        <div className="text-2xl text-secondary">→</div>
                        <div className="text-center">
                          <div className="text-4xl mb-2">💳</div>
                          <p className="text-sm font-semibold text-foreground">Digital<br/>Money</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground text-center">The Evolution of Money Over Time</p>
                    </div>

                    <p>Money is a medium of exchange that allows us to trade goods and services without barter. Throughout history, money has evolved from commodity-based systems to modern digital forms.</p>

                    <h3 className="font-heading text-lg font-semibold text-foreground mt-5 mb-2">Key Concepts:</h3>
                    <ul className="space-y-2 ml-4">
                      <li>• <strong>Currency:</strong> The form of money used in a specific country</li>
                      <li>• <strong>Value:</strong> The worth of money in relation to goods and services</li>
                      <li>• <strong>Purchasing Power:</strong> How much you can buy with your money</li>
                    </ul>

                    <h3 className="font-heading text-lg font-semibold text-foreground mt-5 mb-2">Types of Money:</h3>
                    <div className="grid grid-cols-3 gap-3 my-4">
                      <div className="bg-primary/10 rounded-lg p-4 border border-primary/20 text-center">
                        <div className="text-3xl mb-2">💰</div>
                        <p className="text-sm font-semibold">Cash</p>
                        <p className="text-xs text-muted-foreground mt-1">Physical coins and notes</p>
                      </div>
                      <div className="bg-secondary/10 rounded-lg p-4 border border-secondary/20 text-center">
                        <div className="text-3xl mb-2">💳</div>
                        <p className="text-sm font-semibold">Digital</p>
                        <p className="text-xs text-muted-foreground mt-1">Cards & mobile payments</p>
                      </div>
                      <div className="bg-accent/10 rounded-lg p-4 border border-accent/20 text-center">
                        <div className="text-3xl mb-2">₿</div>
                        <p className="text-sm font-semibold">Crypto</p>
                        <p className="text-xs text-muted-foreground mt-1">Digital currencies</p>
                      </div>
                    </div>
                  </>
                )}

                {selectedChapter.chapter === 2 && (
                  <>
                    <h2 className="font-heading text-2xl font-bold text-foreground mt-6 mb-3">Understanding Savings</h2>

                    {/* Visual: Savings Journey */}
                    <div className="bg-secondary/10 rounded-xl p-6 my-6 border border-secondary/20">
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="text-center flex-1">
                          <div className="text-4xl mb-2">📉</div>
                          <p className="text-xs font-semibold text-foreground">No Savings<br/>= Stress</p>
                        </div>
                        <div className="text-2xl text-secondary">→</div>
                        <div className="text-center flex-1">
                          <div className="text-4xl mb-2">🏦</div>
                          <p className="text-xs font-semibold text-foreground">Start<br/>Saving</p>
                        </div>
                        <div className="text-2xl text-secondary">→</div>
                        <div className="text-center flex-1">
                          <div className="text-4xl mb-2">📈</div>
                          <p className="text-xs font-semibold text-foreground">Watch It<br/>Grow!</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground text-center">Small savings today = Big dreams tomorrow</p>
                    </div>

                    <p>Savings is the practice of setting aside money for future use instead of spending it immediately. It's one of the most important financial habits you can develop.</p>

                    <h3 className="font-heading text-lg font-semibold text-foreground mt-5 mb-2">Why Save?</h3>
                    <div className="grid grid-cols-2 gap-3 my-4">
                      <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                        <div className="text-2xl mb-2">🆘</div>
                        <p className="text-sm font-semibold">Emergency Fund</p>
                        <p className="text-xs text-muted-foreground mt-1">Handle unexpected costs</p>
                      </div>
                      <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                        <div className="text-2xl mb-2">🎯</div>
                        <p className="text-sm font-semibold">Future Goals</p>
                        <p className="text-xs text-muted-foreground mt-1">Education, travel, housing</p>
                      </div>
                      <div className="bg-secondary/10 rounded-lg p-4 border border-secondary/20">
                        <div className="text-2xl mb-2">😌</div>
                        <p className="text-sm font-semibold">Peace of Mind</p>
                        <p className="text-xs text-muted-foreground mt-1">Financial security & stress relief</p>
                      </div>
                      <div className="bg-secondary/10 rounded-lg p-4 border border-secondary/20">
                        <div className="text-2xl mb-2">💸</div>
                        <p className="text-sm font-semibold">Earn Interest</p>
                        <p className="text-xs text-muted-foreground mt-1">Money that grows itself</p>
                      </div>
                    </div>

                    <h3 className="font-heading text-lg font-semibold text-foreground mt-5 mb-2">Saving Strategies:</h3>
                    <ul className="space-y-2 ml-4">
                      <li>• <strong>Pay Yourself First:</strong> Save before spending</li>
                      <li>• <strong>Set Goals:</strong> Know what you're saving for</li>
                      <li>• <strong>Automate:</strong> Set up automatic transfers to savings</li>
                      <li>• <strong>Track Progress:</strong> Monitor your savings growth</li>
                    </ul>

                    <h3 className="font-heading text-lg font-semibold text-foreground mt-5 mb-2">Interest & Compound Growth:</h3>
                    <div className="bg-accent/10 rounded-lg p-4 my-4 border border-accent/20">
                      <p className="text-sm mb-3">💡 <strong>The Magic of Compound Interest:</strong></p>
                      <p className="text-sm text-foreground/80">When you keep ₹1000 in a bank at 5% interest per year:</p>
                      <ul className="space-y-2 ml-4 mt-3 text-sm text-foreground/80">
                        <li>Year 1: ₹1,050 (+₹50)</li>
                        <li>Year 2: ₹1,102.50 (+₹52.50)</li>
                        <li>Year 5: ₹1,276.28</li>
                        <li>Year 10: ₹1,628.89</li>
                      </ul>
                    </div>
                    <p>You earn interest on your interest, which grows your savings exponentially over time!</p>
                  </>
                )}

                {selectedChapter.chapter === 3 && (
                  <>
                    <h2 className="font-heading text-2xl font-bold text-foreground mt-6 mb-3">Banking Basics</h2>

                    {/* Visual: Bank Functions */}
                    <div className="bg-secondary/10 rounded-xl p-6 my-6 border border-secondary/20">
                      <div className="text-center mb-4">
                        <div className="text-5xl mb-3">🏦</div>
                        <p className="text-sm text-muted-foreground">Your Money's Safe Home</p>
                      </div>
                    </div>

                    <p>Banks are institutions that safely store your money and provide financial services to help you manage your wealth.</p>

                    <h3 className="font-heading text-lg font-semibold text-foreground mt-5 mb-2">What Banks Do:</h3>
                    <div className="space-y-3 my-4">
                      <div className="bg-primary/10 rounded-lg p-4 border border-primary/20 flex gap-3">
                        <span className="text-2xl">🛡️</span>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">Safe Storage</p>
                          <p className="text-xs text-muted-foreground mt-1">Keep your money secure and protected</p>
                        </div>
                      </div>
                      <div className="bg-secondary/10 rounded-lg p-4 border border-secondary/20 flex gap-3">
                        <span className="text-2xl">💼</span>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">Multiple Accounts</p>
                          <p className="text-xs text-muted-foreground mt-1">Savings, checking, and special accounts</p>
                        </div>
                      </div>
                      <div className="bg-accent/10 rounded-lg p-4 border border-accent/20 flex gap-3">
                        <span className="text-2xl">💰</span>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">Loans & Credit</p>
                          <p className="text-xs text-muted-foreground mt-1">Borrow money when you need it</p>
                        </div>
                      </div>
                      <div className="bg-secondary/10 rounded-lg p-4 border border-secondary/20 flex gap-3">
                        <span className="text-2xl">🔄</span>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">Transfers & Payments</p>
                          <p className="text-xs text-muted-foreground mt-1">Send and receive money easily</p>
                        </div>
                      </div>
                      <div className="bg-primary/10 rounded-lg p-4 border border-primary/20 flex gap-3">
                        <span className="text-2xl">📈</span>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">Interest Earnings</p>
                          <p className="text-xs text-muted-foreground mt-1">Your money grows over time</p>
                        </div>
                      </div>
                    </div>

                    <h3 className="font-heading text-lg font-semibold text-foreground mt-5 mb-2">Types of Bank Accounts:</h3>
                    <div className="grid grid-cols-1 gap-3 my-4">
                      <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                        <div className="text-2xl mb-2">🏦</div>
                        <p className="font-semibold text-sm">Savings Account</p>
                        <p className="text-xs text-muted-foreground mt-2">✓ Earn interest<br/>✓ Perfect for building wealth<br/>✓ Some withdrawal limits</p>
                      </div>
                      <div className="bg-secondary/10 rounded-lg p-4 border border-secondary/20">
                        <div className="text-2xl mb-2">💳</div>
                        <p className="font-semibold text-sm">Checking Account</p>
                        <p className="text-xs text-muted-foreground mt-2">✓ Unlimited transactions<br/>✓ Easy bill payments<br/>✓ No interest typically</p>
                      </div>
                      <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                        <div className="text-2xl mb-2">🎓</div>
                        <p className="font-semibold text-sm">Student Account</p>
                        <p className="text-xs text-muted-foreground mt-2">✓ Lower minimum balance<br/>✓ Special student benefits<br/>✓ Educational features</p>
                      </div>
                    </div>

                    <h3 className="font-heading text-lg font-semibold text-foreground mt-5 mb-2">Digital Banking:</h3>
                    <div className="bg-secondary/10 rounded-lg p-4 my-4 border border-secondary/20">
                      <div className="flex gap-4 flex-wrap justify-center">
                        <div className="text-center">
                          <div className="text-3xl mb-2">📱</div>
                          <p className="text-xs font-semibold">Mobile Apps</p>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl mb-2">💻</div>
                          <p className="text-xs font-semibold">Online Banking</p>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl mb-2">📤</div>
                          <p className="text-xs font-semibold">UPI Transfers</p>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl mb-2">⚡</div>
                          <p className="text-xs font-semibold">Instant Payments</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground text-center mt-4">Modern banking at your fingertips - convenient & secure!</p>
                    </div>

                    <h3 className="font-heading text-lg font-semibold text-foreground mt-5 mb-2">Bank Safety:</h3>
                    <div className="bg-accent/10 rounded-lg p-4 my-4 border border-accent/20 flex gap-3">
                      <span className="text-2xl">🔒</span>
                      <div className="flex-1">
                        <p className="font-semibold text-sm mb-2">Your Money is Protected</p>
                        <p className="text-sm text-foreground/80">The government guarantees your deposits through deposit insurance. Even if the bank has problems, your money stays safe.</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-secondary/30">
              <Button
                onClick={() => setSelectedChapter(null)}
                variant="outline"
                className="flex-1"
              >
                Back to Chapters
              </Button>
              <Button
                onClick={handleMarkAsComplete}
                className={`flex-1 flex items-center justify-center gap-2 ${
                  completedChapters.has(selectedChapter.chapter)
                    ? "bg-secondary/80 hover:bg-secondary/80"
                    : "bg-secondary hover:bg-secondary/90"
                }`}
              >
                {completedChapters.has(selectedChapter.chapter) && (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {completedChapters.has(selectedChapter.chapter) ? "Completed" : "Mark as Complete"}
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Show active module view
  if (activeModule) {
    const ModuleComponent = activeModule.component;
    return (
      <AppLayout role="student" playCoins={1250} title={activeModule.name}>
        <div className="px-4 py-6 pb-24">
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveModule(null)}
              className="flex items-center gap-2 mb-4"
            >
              <ChevronRight className="h-4 w-4 transform rotate-180" />
              Back to Active Learning
            </Button>
          </div>
          <div className="w-full h-full rounded-lg border border-border bg-card overflow-hidden">
            <ModuleComponent />
          </div>
        </div>
      </AppLayout>
    );
  }

  // Show active game view
  if (playingGame) {
    const GameComponent = playingGame.component;
    return (
      <AppLayout role="student" playCoins={1250} title={playingGame.name}>
        <div className="px-4 py-8 pb-24 w-full max-w-6xl mx-auto">
          <GameContainer
            gameComponent={
              <GameComponent onComplete={handleGameComplete} />
            }
            instructions={playingGame.instructions}
            conceptLearned={playingGame.conceptLearned}
            onRetry={() => setPlayingGame(playingGame)}
            onExit={handleExitGame}
            gameName={playingGame.name}
          />
        </div>
      </AppLayout>
    );
  }


  // ACTIVE LEARNING PAGE
  if (learningMode === "active") {
    return (
      <AppLayout role="student" playCoins={1250} title="Finance">
        <div className="px-4 py-6 pb-24">
          {/* Subject Header */}
          <div className="mb-6 slide-up">
            <div className="glass-card rounded-2xl p-5 border border-border bg-gradient-to-br from-accent/20 to-accent/5">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 rounded-2xl bg-accent/30 flex items-center justify-center">
                  <Wallet className="h-8 w-8 text-accent" />
                </div>
                <div className="flex-1">
                  <h2 className="font-heading text-2xl font-bold text-foreground">Finance</h2>
                  <p className="text-sm text-muted-foreground">Master your money skills</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold text-accent">{totalProgress}%</span>
                </div>
                <AnimatedProgress value={totalProgress} variant="default" />
              </div>
            </div>
          </div>

          {/* Learning Mode Navigation */}
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            <Button
              onClick={() => setLearningMode("active")}
              className={`flex items-center gap-2 whitespace-nowrap ${
                learningMode === "active"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              size="sm"
            >
              <Target className="h-4 w-4" />
              Active
            </Button>
            <Button
              onClick={() => setLearningMode("passive")}
              className={`flex items-center gap-2 whitespace-nowrap ${
                learningMode === "passive"
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              size="sm"
            >
              <BookOpen className="h-4 w-4" />
              Passive
            </Button>
            <Button
              onClick={() => setLearningMode("gamified")}
              className={`flex items-center gap-2 whitespace-nowrap ${
                learningMode === "gamified"
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              size="sm"
            >
              <Gamepad2 className="h-4 w-4" />
              Gamified
            </Button>
          </div>

          {/* Section Header */}
          <div className="mb-6 slide-up">
            <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-3 mb-2">
              <Target className="h-7 w-7 text-primary" />
              Active Learning
            </h2>
            <p className="text-muted-foreground">Build mental models through guided exploration</p>
          </div>

          {/* Active Learning Modules - Vertical List */}
          <div className="space-y-4">
            {activeLearningModules.map((module, index) => {
              const Icon = module.icon;
              return (
                <Card
                  key={module.id}
                  className="glass-card border border-primary/30 p-4 hover:border-primary/60 transition-colors cursor-pointer slide-up"
                  style={{ animationDelay: `${100 + index * 75}ms` }}
                  onClick={() => setActiveModule(module)}
                >
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>

                    <div className="flex-1">
                      <h4 className="font-heading font-semibold text-foreground mb-1">
                        {module.name}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">{module.description}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-accent">+{module.coins} 🪙</span>
                        <span className="text-xs text-primary">+{module.xp} XP</span>
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </AppLayout>
    );
  }

  // PASSIVE LEARNING PAGE
  if (learningMode === "passive") {
    return (
      <AppLayout role="student" playCoins={1250} title="Finance">
        <div className="px-4 py-6 pb-24">
          {/* Subject Header */}
          <div className="mb-6 slide-up">
            <div className="glass-card rounded-2xl p-5 border border-border bg-gradient-to-br from-accent/20 to-accent/5">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 rounded-2xl bg-accent/30 flex items-center justify-center">
                  <Wallet className="h-8 w-8 text-accent" />
                </div>
                <div className="flex-1">
                  <h2 className="font-heading text-2xl font-bold text-foreground">Finance</h2>
                  <p className="text-sm text-muted-foreground">Master your money skills</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold text-accent">{totalProgress}%</span>
                </div>
                <AnimatedProgress value={totalProgress} variant="default" />
              </div>
            </div>
          </div>

          {/* Learning Mode Navigation */}
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            <Button
              onClick={() => setLearningMode("active")}
              className={`flex items-center gap-2 whitespace-nowrap ${
                learningMode === "active"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              size="sm"
            >
              <Target className="h-4 w-4" />
              Active
            </Button>
            <Button
              onClick={() => setLearningMode("passive")}
              className={`flex items-center gap-2 whitespace-nowrap ${
                learningMode === "passive"
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              size="sm"
            >
              <BookOpen className="h-4 w-4" />
              Passive
            </Button>
            <Button
              onClick={() => setLearningMode("gamified")}
              className={`flex items-center gap-2 whitespace-nowrap ${
                learningMode === "gamified"
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              size="sm"
            >
              <Gamepad2 className="h-4 w-4" />
              Gamified
            </Button>
          </div>

          {/* Section Header */}
          <div className="mb-6 slide-up">
            <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-3 mb-2">
              <BookOpen className="h-7 w-7 text-secondary" />
              Passive Learning
            </h2>
            <p className="text-muted-foreground">Explore concepts at your own pace</p>
          </div>

          {/* Chapters - Vertical List */}
          <div className="space-y-4">
            {passiveLearningChapters.map((item, index) => (
              <Card
                key={item.chapter}
                className="glass-card border border-secondary/30 p-4 hover:border-secondary/60 transition-colors cursor-pointer slide-up"
                style={{ animationDelay: `${100 + index * 75}ms` }}
                onClick={() => setSelectedChapter(item)}
              >
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-xl bg-secondary/20 flex items-center justify-center shrink-0">
                    <BookOpen className="h-6 w-6 text-secondary" />
                  </div>

                  <div className="flex-1">
                    <h4 className="font-heading font-semibold text-foreground">
                      Chapter {item.chapter}: {item.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-2">📖 {item.duration} read</p>
                  </div>

                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  // GAMIFIED LEARNING PAGE - Vertical full-width game cards matching Biology
  if (learningMode === "gamified") {
    return (
      <AppLayout role="student" playCoins={1250} title="Finance">
        <div className="px-4 py-6 pb-24">
          {/* Subject Header */}
          <div className="mb-6 slide-up">
            <div className="glass-card rounded-2xl p-5 border border-border bg-gradient-to-br from-accent/20 to-accent/5">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 rounded-2xl bg-accent/30 flex items-center justify-center">
                  <Wallet className="h-8 w-8 text-accent" />
                </div>
                <div className="flex-1">
                  <h2 className="font-heading text-2xl font-bold text-foreground">Finance</h2>
                  <p className="text-sm text-muted-foreground">Master your money skills</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold text-accent">{totalProgress}%</span>
                </div>
                <AnimatedProgress value={totalProgress} variant="default" />
              </div>
            </div>
          </div>

          {/* Learning Mode Navigation */}
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            <Button
              onClick={() => setLearningMode("active")}
              className={`flex items-center gap-2 whitespace-nowrap ${
                learningMode === "active"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              size="sm"
            >
              <Target className="h-4 w-4" />
              Active
            </Button>
            <Button
              onClick={() => setLearningMode("passive")}
              className={`flex items-center gap-2 whitespace-nowrap ${
                learningMode === "passive"
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              size="sm"
            >
              <BookOpen className="h-4 w-4" />
              Passive
            </Button>
            <Button
              onClick={() => setLearningMode("gamified")}
              className={`flex items-center gap-2 whitespace-nowrap ${
                learningMode === "gamified"
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              size="sm"
            >
              <Gamepad2 className="h-4 w-4" />
              Gamified
            </Button>
          </div>

          {/* Section Header */}
          <div className="mb-6 slide-up">
            <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-3 mb-2">
              <Gamepad2 className="h-7 w-7 text-accent" />
              Finance Games
            </h2>
            <p className="text-muted-foreground">Learn money skills by playing</p>
          </div>

          {/* Game Cards - Vertical List */}
          <div className="space-y-4">
            {financeGames.map((game, index) => {
              const Icon = game.icon;
              const difficultyColor = {
                easy: "bg-green-500/20 text-green-600",
                medium: "bg-yellow-500/20 text-yellow-600",
                hard: "bg-red-500/20 text-red-600"
              };

              return (
                <Card 
                  key={game.id}
                  className={`glass-card border p-4 slide-up ${
                    game.status === "locked" ? "border-border opacity-60" : "border-accent/30"
                  }`}
                  style={{ animationDelay: `${100 + index * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`h-14 w-14 rounded-xl flex items-center justify-center shrink-0 ${
                      game.status === "completed" 
                        ? "bg-secondary" 
                        : game.status === "available"
                        ? "bg-accent/20"
                        : "bg-muted"
                    }`}>
                      {game.status === "locked" ? (
                        <Lock className="h-6 w-6 text-muted-foreground" />
                      ) : game.status === "completed" ? (
                        <CheckCircle2 className="h-6 w-6 text-secondary-foreground" />
                      ) : (
                        <Icon className="h-6 w-6 text-accent" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-heading font-semibold text-foreground">
                            {game.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">{game.description}</p>
                        </div>
                        <Badge className={`text-xs capitalize shrink-0 ml-2 ${difficultyColor[game.difficulty]}`}>
                          {game.difficulty}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <span className="text-xs text-accent">+{game.coins} 🪙</span>
                        <span className="text-xs text-primary">+{game.xp} XP</span>
                      </div>

                      {game.status === "completed" && game.stars && (
                        <div className="flex items-center gap-1 mt-2">
                          {[1, 2, 3].map((star) => (
                            <Star 
                              key={star}
                              className={`h-4 w-4 ${
                                star <= game.stars! ? "text-accent fill-accent" : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      )}

                      {game.status !== "locked" && (
                        <Button
                          onClick={() => handlePlayGame(game)}
                          className="mt-3 w-full bg-accent hover:bg-accent/90"
                          size="sm"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Play Game
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Game Intro Modal */}
        {selectedGame && (
          <GameIntroModal
            isOpen={showIntro}
            config={{
              ...selectedGame.introConfig,
              gameIcon: selectedGame.icon,
            }}
            onStartGame={handleStartGame}
            onGoBack={handleGoBack}
          />
        )}
      </AppLayout>
    );
  }
}
