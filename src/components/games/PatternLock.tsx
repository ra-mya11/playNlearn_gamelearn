import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Unlock } from "lucide-react";

interface SequenceLevel {
  sequence: number[];
  nextValue: number;
  options: number[];
  rule: string;
}

export function PatternLock({ onClose }: { onClose: () => void }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [animatingTiles, setAnimatingTiles] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"none" | "correct" | "wrong">("none");
  const [revealed, setRevealed] = useState<boolean>(false);
  const [attempts, setAttempts] = useState(3);
  const [won, setWon] = useState(false);

  const levels: SequenceLevel[] = [
    { sequence: [2, 4, 6, 8], nextValue: 10, options: [8, 10, 12, 16], rule: "Add 2 each time" },
    { sequence: [1, 2, 4, 8], nextValue: 16, options: [12, 14, 16, 32], rule: "Double each time" },
    { sequence: [1, 1, 2, 3, 5], nextValue: 8, options: [5, 7, 8, 10], rule: "Fibonacci: sum of previous two" },
    { sequence: [100, 50, 25, 12], nextValue: 6, options: [6, 8, 10, 12], rule: "Divide by 2 (rounded)" },
    { sequence: [1, 4, 9, 16, 25], nextValue: 36, options: [30, 35, 36, 40], rule: "Perfect squares: 1², 2², 3²..." },
  ];

  const level = levels[currentLevel];

  useEffect(() => {
    if (gameStarted && currentLevel < levels.length) {
      setSelectedAnswer(null);
      setFeedback("none");
      setRevealed(false);
      setAttempts(3);
      setWon(false);
      triggerAnimation();
    }
  }, [currentLevel, gameStarted]);

  const triggerAnimation = () => {
    setAnimatingTiles(true);
    setTimeout(() => setAnimatingTiles(false), 1500);
  };

  const handleAnswer = (answer: number) => {
    if (revealed || won) return;

    setSelectedAnswer(answer);
    setAttempts(attempts - 1);

    if (answer === level.nextValue) {
      setFeedback("correct");
      setWon(true);
      setScore(score + 30);
    } else {
      setFeedback("wrong");
      if (attempts - 1 === 0) {
        setRevealed(true);
      }
    }
  };

  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(currentLevel + 1);
    } else {
      setGameStarted(false);
    }
  };

  const skipLevel = () => {
    setRevealed(true);
  };

  if (!gameStarted) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pattern Lock 🔓</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-semibold">📘 What You Will Discover</h3>
              <p className="text-sm text-muted-foreground">
                How number patterns follow logical rules.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🎯 What You Need To Do</h3>
              <p className="text-sm text-muted-foreground">
                Watch the sequence flow and predict the next number to unlock.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🏆 What Success Looks Like</h3>
              <p className="text-sm text-muted-foreground">
                The pattern lock opens with a satisfying click.
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
          <DialogTitle>Pattern Lock 🔓 - Level {currentLevel + 1}/{levels.length}</DialogTitle>
          <div className="flex gap-4 mt-4">
            <div>Score: <span className="font-bold text-primary">{score}</span></div>
            <div>Attempts: <span className="font-bold">{attempts}</span></div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sequence Display */}
          <div className="bg-gradient-to-b from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950 rounded-lg p-8">
            <p className="text-center text-sm font-semibold mb-6">Watch the pattern flow →</p>
            
            <div className="flex justify-center items-center gap-3 mb-8 flex-wrap">
              {level.sequence.map((num, idx) => (
                <div key={idx} className="relative">
                  <div
                    className={`w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl transition-all ${
                      animatingTiles ? "animate-bounce" : ""
                    }`}
                    style={{ animationDelay: `${idx * 150}ms` }}
                  >
                    {num}
                  </div>
                  {idx < level.sequence.length - 1 && (
                    <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 text-indigo-600 text-xl">→</div>
                  )}
                </div>
              ))}
              
              {/* Next Mystery Tile */}
              <div className="relative">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-2xl border-4 border-dashed border-orange-300">
                  ?
                </div>
              </div>
            </div>

            {/* Rule Hint */}
            <div className="text-center bg-white dark:bg-slate-800 rounded p-3">
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Pattern Rule:</p>
              <p className="text-sm text-muted-foreground mt-1">{level.rule}</p>
            </div>
          </div>

          {/* Answer Options */}
          {!revealed && !won && (
            <div className="space-y-3">
              <p className="text-sm font-semibold">What number unlocks the lock?</p>
              <div className="grid grid-cols-2 gap-3">
                {level.options.map((option, idx) => (
                  <Button
                    key={idx}
                    onClick={() => handleAnswer(option)}
                    variant={selectedAnswer === option ? "default" : "outline"}
                    className="text-2xl font-bold h-20"
                    disabled={selectedAnswer !== null && selectedAnswer !== option}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Feedback */}
          {feedback !== "none" && !won && !revealed && (
            <div className={`p-4 rounded-lg text-center ${
              feedback === "correct"
                ? "bg-green-100 dark:bg-green-900"
                : "bg-red-100 dark:bg-red-900"
            }`}>
              {feedback === "correct" ? (
                <p className="font-bold text-green-800 dark:text-green-200">✓ Correct!</p>
              ) : (
                <p className="font-bold text-red-800 dark:text-red-200">✗ Not quite. Try again!</p>
              )}
            </div>
          )}

          {/* Success State */}
          {won && (
            <div className="bg-green-100 dark:bg-green-900 rounded-lg p-6 text-center">
              <p className="text-4xl mb-2">🔓</p>
              <p className="font-bold text-lg text-green-800 dark:text-green-200">Lock Unlocked!</p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                The correct answer was <span className="font-bold">{level.nextValue}</span>
              </p>
            </div>
          )}

          {/* Revealed State */}
          {revealed && !won && (
            <div className="bg-amber-100 dark:bg-amber-900 rounded-lg p-4 text-center">
              <p className="font-bold text-amber-800 dark:text-amber-200 mb-2">The pattern was:</p>
              <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{level.rule}</p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-2">
                The next number is <span className="font-bold">{level.nextValue}</span>
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!won && !revealed && attempts > 0 && (
              <Button onClick={skipLevel} variant="outline" className="flex-1">
                Show Answer
              </Button>
            )}
            {(won || revealed) && (
              <Button
                onClick={nextLevel}
                className="w-full"
                size="lg"
              >
                {currentLevel < levels.length - 1 ? "Next Pattern" : "Finish Game"}
              </Button>
            )}
          </div>

          {/* Concept Strip */}
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">
            💡 "Patterns follow rules."
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
