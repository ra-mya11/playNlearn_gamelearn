import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TrendingDown, TrendingUp, AlertCircle } from "lucide-react";

interface Expense {
  id: number;
  name: string;
  cost: number;
  icon: string;
  category: "food" | "shelter" | "education" | "health" | "utilities";
}

interface LevelConfig {
  income: number;
  minBalance: number;
  maxBalance: number;
  happiness: number;
  surprises: Array<{ name: string; cost: number; icon: string; chance: number }>;
  objective: string;
}

export function VillageBudgetPlanner({ onClose }: { onClose: () => void }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedExpenses, setSelectedExpenses] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<"none" | "excellent" | "good" | "poor" | "failed">("none");
  const [happiness, setHappiness] = useState(100);
  const [sustainability, setSustainability] = useState(100);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(true);
  const [surprise, setSurprise] = useState<{ name: string; cost: number; icon: string } | null>(null);

  const availableExpenses: Expense[] = [
    { id: 1, name: "Rice & Grain", cost: 800, icon: "🍚", category: "food" },
    { id: 2, name: "Vegetables", cost: 400, icon: "🥬", category: "food" },
    { id: 3, name: "Milk & Dairy", cost: 300, icon: "🥛", category: "food" },
    { id: 4, name: "House Rent", cost: 1200, icon: "🏠", category: "shelter" },
    { id: 5, name: "School Fees", cost: 500, icon: "🎓", category: "education" },
    { id: 6, name: "Books & Supplies", cost: 200, icon: "📚", category: "education" },
    { id: 7, name: "Medicine", cost: 300, icon: "💊", category: "health" },
    { id: 8, name: "Doctor Visit", cost: 200, icon: "⚕️", category: "health" },
    { id: 9, name: "Electricity", cost: 250, icon: "⚡", category: "utilities" },
    { id: 10, name: "Water", cost: 100, icon: "💧", category: "utilities" },
    { id: 11, name: "Internet", cost: 150, icon: "📱", category: "utilities" },
    { id: 12, name: "Savings Buffer", cost: 300, icon: "🏦", category: "utilities" },
  ];

  const levels: LevelConfig[] = [
    {
      income: 3000,
      minBalance: 200,
      maxBalance: 600,
      happiness: 90,
      surprises: [],
      objective: "Spend wisely and save some money",
    },
    {
      income: 4000,
      minBalance: 300,
      maxBalance: 800,
      happiness: 80,
      surprises: [
        { name: "Unexpected Medical Bill", cost: 400, icon: "🏥", chance: 0.4 },
      ],
      objective: "Handle a surprise expense without going broke",
    },
    {
      income: 5000,
      minBalance: 400,
      maxBalance: 1000,
      happiness: 75,
      surprises: [
        { name: "Roof Repair", cost: 600, icon: "🔨", chance: 0.3 },
        { name: "Family Gift", cost: 500, icon: "🎁", chance: 0.3 },
      ],
      objective: "Manage multiple surprises and maintain sustainability",
    },
  ];

  const level = levels[currentLevel];

  useEffect(() => {
    if (gameStarted && !submitted) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameStarted, submitted]);

  useEffect(() => {
    if (gameStarted && currentLevel < levels.length && !submitted) {
      setSelectedExpenses([]);
      setSubmitted(false);
      setFeedback("none");
      setHappiness(level.happiness);
      setSustainability(100);
      setTimeLeft(30);
      setGameActive(true);
      setSurprise(null);

      // Trigger surprise
      const surpriseEvent = level.surprises.find((s) => Math.random() < s.chance);
      if (surpriseEvent) {
        setTimeout(() => {
          setSurprise(surpriseEvent);
        }, 5000);
      }
    }
  }, [currentLevel, gameStarted]);

  const totalExpenses = selectedExpenses.reduce((sum, id) => {
    const expense = availableExpenses.find((e) => e.id === id);
    return sum + (expense?.cost || 0);
  }, 0);

  const surpriseCost = surprise ? surprise.cost : 0;
  const totalWithSurprise = totalExpenses + surpriseCost;
  const balance = level.income - totalWithSurprise;

  const isBalanced =
    balance >= level.minBalance && balance <= level.maxBalance;
  const isExcellent = balance >= level.maxBalance * 0.8 && balance <= level.maxBalance;
  const isFailed = balance < 0;

  const handleToggleExpense = (id: number) => {
    if (submitted || !gameActive) return;

    if (selectedExpenses.includes(id)) {
      setSelectedExpenses(selectedExpenses.filter((e) => e !== id));
    } else {
      setSelectedExpenses([...selectedExpenses, id]);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);

    let newHappiness = happiness;
    let newSustainability = sustainability;

    if (isFailed) {
      setFeedback("failed");
      newHappiness -= 30;
      newSustainability -= 50;
    } else if (isExcellent) {
      setFeedback("excellent");
      newHappiness = Math.min(100, newHappiness + 20);
      newSustainability = Math.min(100, newSustainability + 30);
      setScore(score + 30);
    } else if (isBalanced) {
      setFeedback("good");
      newHappiness = Math.min(100, newHappiness + 10);
      newSustainability = Math.min(100, newSustainability + 15);
      setScore(score + 20);
    } else {
      setFeedback("poor");
      newSustainability = Math.max(0, newSustainability - 20);
      setScore(score + 5);
    }

    setHappiness(Math.max(0, newHappiness));
    setSustainability(Math.max(0, newSustainability));
  };

  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(currentLevel + 1);
    } else {
      setGameStarted(false);
    }
  };

  if (!gameStarted) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Village Budget Planner 🏠 (Enhanced)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-semibold">📘 What You Will Discover</h3>
              <p className="text-sm text-muted-foreground">
                How smart planning helps families handle money and surprises.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🎯 What You Need To Do</h3>
              <p className="text-sm text-muted-foreground">
                Balance income and expenses while preparing for unexpected events.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🏆 What Success Looks Like</h3>
              <p className="text-sm text-muted-foreground">
                Keep your family happy and village sustainable through smart budgeting.
              </p>
            </div>
            <Button onClick={() => setGameStarted(true)} className="w-full">
              Start Game
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Village Budget Planner 🏠 - Level {currentLevel + 1}/{levels.length}</DialogTitle>
          <div className="flex gap-6 mt-4 flex-wrap">
            <div>Score: <span className="font-bold text-primary">{score}</span></div>
            <div>Time: <span className={`font-bold ${timeLeft < 10 ? 'text-red-600' : ''}`}>{timeLeft}s</span></div>
            <div>Happiness: <span className="font-bold text-accent">{Math.round(happiness)}%</span></div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Objective */}
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
            <p className="text-sm font-semibold mb-1">📊 This Month's Objective</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{level.objective}</p>
          </div>

          {/* Surprise Alert */}
          {surprise && (
            <div className="bg-red-100 dark:bg-red-900 border-2 border-red-500 rounded-lg p-4 flex gap-3 animate-pulse">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-800 dark:text-red-200">⚠️ Surprise Expense!</p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {surprise.icon} {surprise.name} - ₹{surprise.cost}
                </p>
              </div>
            </div>
          )}

          {/* Income & Balance Cards */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-green-50 dark:bg-green-950 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Income</p>
              <p className="text-2xl font-bold text-green-600">₹{level.income}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Expenses</p>
              <p className="text-2xl font-bold text-blue-600">₹{totalExpenses}</p>
            </div>
            {surprise && (
              <div className="bg-orange-50 dark:bg-orange-950 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Surprise</p>
                <p className="text-2xl font-bold text-orange-600">₹{surpriseCost}</p>
              </div>
            )}
            <div className={`rounded-lg p-3 text-center ${
              balance >= 0 ? "bg-emerald-50 dark:bg-emerald-950" : "bg-red-50 dark:bg-red-950"
            }`}>
              <p className="text-xs text-muted-foreground mb-1">Balance</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                ₹{balance}
              </p>
            </div>
          </div>

          {/* Sustainability Meter */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
            <p className="text-sm font-semibold mb-2">🌱 Sustainability Index</p>
            <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-emerald-600 transition-all"
                style={{ width: `${sustainability}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{Math.round(sustainability)}% - {
              sustainability > 70 ? "Excellent" : sustainability > 40 ? "Good" : "At Risk"
            }</p>
          </div>

          {/* Expense Selection */}
          {!submitted && gameActive && (
            <div className="space-y-3">
              <p className="text-sm font-semibold">Select necessary expenses:</p>
              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-2">
                {availableExpenses.map((expense) => (
                  <button
                    key={expense.id}
                    onClick={() => handleToggleExpense(expense.id)}
                    className={`p-3 rounded-lg border transition text-left ${
                      selectedExpenses.includes(expense.id)
                        ? "border-primary bg-primary/10"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    }`}
                  >
                    <div className="text-2xl">{expense.icon}</div>
                    <div className="text-xs font-semibold mt-1 line-clamp-2">{expense.name}</div>
                    <div className="text-xs text-muted-foreground">₹{expense.cost}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Time Warning */}
          {!submitted && timeLeft < 10 && gameActive && (
            <div className="bg-amber-100 dark:bg-amber-900 rounded-lg p-3 text-center">
              <p className="font-bold text-amber-800 dark:text-amber-200">⏱️ Time running out! {timeLeft}s</p>
            </div>
          )}

          {/* Submit Button */}
          {!submitted && gameActive && (
            <Button onClick={handleSubmit} className="w-full" size="lg">
              📊 Submit Budget
            </Button>
          )}

          {/* Time's Up */}
          {!submitted && !gameActive && (
            <div className="bg-red-100 dark:bg-red-900 rounded-lg p-4 text-center">
              <p className="font-bold text-red-800 dark:text-red-200">⏰ Time's up!</p>
              <Button onClick={handleSubmit} className="mt-3 w-full">
                See Results
              </Button>
            </div>
          )}

          {/* Results */}
          {submitted && (
            <div className={`p-6 rounded-lg text-center ${
              feedback === "excellent" ? "bg-green-100 dark:bg-green-900" :
              feedback === "good" ? "bg-blue-100 dark:bg-blue-900" :
              feedback === "poor" ? "bg-amber-100 dark:bg-amber-900" :
              "bg-red-100 dark:bg-red-900"
            }`}>
              {feedback === "excellent" && (
                <div className="text-green-800 dark:text-green-200">
                  <p className="text-4xl mb-2">🎉</p>
                  <p className="font-bold text-lg">Excellent Budget!</p>
                  <p className="text-sm mt-2">Your family is thriving with smart planning.</p>
                </div>
              )}
              {feedback === "good" && (
                <div className="text-blue-800 dark:text-blue-200">
                  <p className="text-4xl mb-2">👍</p>
                  <p className="font-bold text-lg">Good Balance</p>
                  <p className="text-sm mt-2">You've managed expenses responsibly.</p>
                </div>
              )}
              {feedback === "poor" && (
                <div className="text-amber-800 dark:text-amber-200">
                  <p className="text-4xl mb-2">⚠️</p>
                  <p className="font-bold text-lg">Tight Budget</p>
                  <p className="text-sm mt-2">Consider prioritizing essential expenses more.</p>
                </div>
              )}
              {feedback === "failed" && (
                <div className="text-red-800 dark:text-red-200">
                  <p className="text-4xl mb-2">💔</p>
                  <p className="font-bold text-lg">Budget Failed</p>
                  <p className="text-sm mt-2">Spent more than income. Learn to prioritize!</p>
                </div>
              )}
            </div>
          )}

          {/* Continue Button */}
          {submitted && (
            <Button
              onClick={nextLevel}
              className="w-full"
              size="lg"
            >
              {currentLevel < levels.length - 1 ? "Next Month" : "🏆 Complete Game"}
            </Button>
          )}

          {/* Concept Strip */}
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">
            💡 "Smart planning saves money."
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
