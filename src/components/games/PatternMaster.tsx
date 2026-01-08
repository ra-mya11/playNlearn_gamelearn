import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lightbulb, RotateCcw } from "lucide-react";

interface Pattern {
  sequence: number[];
  missing: number;
  options: number[];
  rule: string;
  difficulty: "easy" | "medium" | "hard";
}

export function PatternMaster({ onClose }: { onClose: () => void }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"none" | "correct" | "wrong">("none");
  const [attempts, setAttempts] = useState(2);
  const [showHint, setShowHint] = useState(false);
  const [animatingTiles, setAnimatingTiles] = useState<boolean>(false);
  const [won, setWon] = useState(false);

  const patterns: Pattern[] = [
    {
      sequence: [2, 4, 6, 8, 10],
      missing: 10,
      options: [8, 10, 12, 14],
      rule: "Add 2 each time",
      difficulty: "easy",
    },
    {
      sequence: [1, 1, 2, 3, 5, 8],
      missing: 8,
      options: [8, 11, 13, 10],
      rule: "Each is the sum of previous two",
      difficulty: "easy",
    },
    {
      sequence: [1, 4, 9, 16, 25],
      missing: 25,
      options: [36, 25, 30, 20],
      rule: "Perfect squares: 1², 2², 3²...",
      difficulty: "medium",
    },
    {
      sequence: [100, 50, 25, 12, 6],
      missing: 6,
      options: [3, 6, 5, 4],
      rule: "Divide by 2 (rounded)",
      difficulty: "medium",
    },
    {
      sequence: [5, 10, 20, 40, 80],
      missing: 80,
      options: [120, 160, 80, 100],
      rule: "Double each time",
      difficulty: "medium",
    },
    {
      sequence: [1, 1, 4, 9, 25, 64],
      missing: 64,
      options: [36, 49, 64, 100],
      rule: "Each is product of previous two",
      difficulty: "hard",
    },
    {
      sequence: [2, 3, 5, 7, 11, 13],
      missing: 13,
      options: [13, 15, 17, 19],
      rule: "Prime numbers in sequence",
      difficulty: "hard",
    },
    {
      sequence: [1, 4, 10, 20, 35, 56],
      missing: 56,
      options: [56, 72, 84, 100],
      rule: "Triangular numbers doubled",
      difficulty: "hard",
    },
  ];

  const pattern = patterns[currentLevel];

  useEffect(() => {
    if (gameStarted && currentLevel < patterns.length) {
      setAnswered(false);
      setSelectedAnswer(null);
      setFeedback("none");
      setAttempts(2);
      setShowHint(false);
      setWon(false);
      triggerAnimation();
    }
  }, [currentLevel, gameStarted]);

  const triggerAnimation = () => {
    setAnimatingTiles(true);
    setTimeout(() => setAnimatingTiles(false), 1500);
  };

  const handleAnswer = (answer: number) => {
    if (answered) return;

    setSelectedAnswer(answer);
    setAnswered(true);

    if (answer === pattern.missing) {
      setFeedback("correct");
      setWon(true);
      setStreak(streak + 1);
      const baseScore = pattern.difficulty === "easy" ? 15 : pattern.difficulty === "medium" ? 25 : 40;
      const streakBonus = streak > 0 ? streak * 5 : 0;
      setScore(score + baseScore + streakBonus);
    } else {
      setFeedback("wrong");
      setAttempts(attempts - 1);
      if (attempts - 1 === 0) {
        setWon(false);
      }
    }
  };

  const nextLevel = () => {
    if (currentLevel < patterns.length - 1) {
      setCurrentLevel(currentLevel + 1);
    } else {
      setGameStarted(false);
    }
  };

  const skipLevel = () => {
    setSelectedAnswer(pattern.missing);
    setAnswered(true);
    setFeedback("correct");
    setWon(true);
  };

  if (!gameStarted) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pattern Master 🧩 (Enhanced)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-semibold">📘 What You Will Discover</h3>
              <p className="text-sm text-muted-foreground">
                Every pattern follows a hidden rule waiting to be unlocked.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🎯 What You Need To Do</h3>
              <p className="text-sm text-muted-foreground">
                Watch the tiles flow, identify the rule, predict the next number.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🏆 What Success Looks Like</h3>
              <p className="text-sm text-muted-foreground">
                Build streaks and unlock harder patterns with brilliant predictions.
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pattern Master 🧩 - Level {currentLevel + 1}/{patterns.length}</DialogTitle>
          <div className="flex gap-6 mt-4">
            <div>Score: <span className="font-bold text-primary">{score}</span></div>
            <div>Streak: <span className={`font-bold ${streak > 0 ? 'text-accent' : ''}`}>{streak}🔥</span></div>
            <div>
              <span className={`text-xs px-2 py-1 rounded ${
                pattern.difficulty === "easy" ? "bg-green-100 text-green-800" :
                pattern.difficulty === "medium" ? "bg-amber-100 text-amber-800" :
                "bg-red-100 text-red-800"
              }`}>
                {pattern.difficulty.toUpperCase()}
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pattern Display with Animation */}
          <div className="bg-gradient-to-b from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950 rounded-lg p-8">
            <p className="text-center text-sm font-semibold mb-6">🎬 Watch the pattern flow →</p>
            
            <div className="flex justify-center items-center gap-2 mb-8 flex-wrap">
              {pattern.sequence.map((num, idx) => (
                <div key={idx} className="relative">
                  <div
                    className={`w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl transition-all ${
                      animatingTiles ? "animate-bounce" : ""
                    }`}
                    style={{ animationDelay: `${idx * 150}ms` }}
                  >
                    {num}
                  </div>
                  {idx < pattern.sequence.length - 1 && (
                    <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 text-indigo-600 text-lg">→</div>
                  )}
                </div>
              ))}
              
              {/* Mystery Tile */}
              <div className="relative">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-2xl border-4 border-dashed border-orange-300 animate-pulse">
                  ?
                </div>
              </div>
            </div>

            {/* Rule Display */}
            <div className="text-center bg-white dark:bg-slate-800 rounded-lg p-4 mb-4">
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-1">Pattern Rule:</p>
              <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{pattern.rule}</p>
            </div>

            {/* Attempts Display */}
            <div className="flex justify-center gap-2">
              {Array.from({ length: attempts }).map((_, i) => (
                <div key={i} className="w-3 h-3 rounded-full bg-amber-400" />
              ))}
              {Array.from({ length: 2 - attempts }).map((_, i) => (
                <div key={i} className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600" />
              ))}
            </div>
          </div>

          {/* Hint Button */}
          {!answered && attempts > 0 && !showHint && (
            <Button
              onClick={() => setShowHint(true)}
              variant="outline"
              className="w-full"
            >
              <Lightbulb className="mr-2 h-4 w-4" />
              Need a Hint?
            </Button>
          )}

          {showHint && (
            <div className="bg-amber-50 dark:bg-amber-950 border-2 border-amber-300 rounded-lg p-4">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">💡 Hint:</p>
              <p className="text-sm text-amber-800 dark:text-amber-200 mt-2">
                {pattern.difficulty === "easy" && "Look at how much increases between each number."}
                {pattern.difficulty === "medium" && "Try comparing pairs of consecutive numbers."}
                {pattern.difficulty === "hard" && "The rule might involve multiplication or special sequences like primes."}
              </p>
            </div>
          )}

          {/* Answer Options */}
          {!answered && attempts > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold">Predict the next number:</p>
              <div className="grid grid-cols-2 gap-3">
                {pattern.options.map((option, idx) => (
                  <Button
                    key={idx}
                    onClick={() => handleAnswer(option)}
                    variant="outline"
                    className="text-2xl font-bold h-20"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Feedback */}
          {feedback !== "none" && !won && attempts > 0 && (
            <div className="bg-red-100 dark:bg-red-900 rounded-lg p-4 text-center">
              <p className="font-bold text-red-800 dark:text-red-200">✗ Not quite right!</p>
              {attempts > 0 && <p className="text-sm text-red-700 dark:text-red-300 mt-1">Try again! You have {attempts} attempts left.</p>}
            </div>
          )}

          {/* Out of Attempts */}
          {attempts === 0 && !won && (
            <div className="bg-orange-100 dark:bg-orange-900 rounded-lg p-4 text-center">
              <p className="font-bold text-orange-800 dark:text-orange-200">Out of Attempts!</p>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                The answer was <span className="font-bold">{pattern.missing}</span>
              </p>
            </div>
          )}

          {/* Success State */}
          {won && (
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-lg p-6 text-center">
              <p className="text-5xl mb-2">🎉</p>
              <p className="font-bold text-xl text-green-800 dark:text-green-200">Pattern Unlocked!</p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                You predicted correctly: <span className="font-bold text-2xl">{pattern.missing}</span>
              </p>
              {streak > 1 && (
                <p className="text-lg font-bold text-accent mt-2">
                  🔥 STREAK: {streak}!
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!answered && attempts === 0 && (
              <Button onClick={nextLevel} className="w-full" size="lg">
                Next Pattern
              </Button>
            )}
            {answered && won && (
              <Button onClick={nextLevel} className="w-full" size="lg">
                {currentLevel < patterns.length - 1 ? "Next Pattern" : "🏆 Complete Game"}
              </Button>
            )}
            {answered && !won && attempts > 0 && (
              <Button onClick={() => setAnswered(false)} variant="outline" className="flex-1">
                <RotateCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
            {!answered && attempts > 0 && (
              <Button onClick={skipLevel} variant="outline" className="flex-1">
                Skip
              </Button>
            )}
          </div>

          {/* Concept Strip */}
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">
            💡 "Every pattern follows a rule."
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
