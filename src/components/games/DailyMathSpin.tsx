import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RotateCcw, Maximize2, X } from "lucide-react";

interface MathProblem {
  a: number;
  b: number;
  operator: "*" | "+" | "-" | "/";
  answers: number[];
  correct: number;
}

interface SpinLevel {
  problems: MathProblem[];
  timeLimit: number; // seconds per problem
  difficulty: "easy" | "medium" | "hard";
}

interface GameState {
  streak: number;
  correct: number;
  wrong: number;
  currentProblemIdx: number;
  timeLeft: number;
  isSpinning: boolean;
  selectedAnswer: number | null;
  isFullscreen: boolean;
  gameResult: "none" | "won" | "lost";
}

export function DailyMathSpin({ onClose }: { onClose: () => void }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>({
    streak: 0,
    correct: 0,
    wrong: 0,
    currentProblemIdx: 0,
    timeLeft: 10,
    isSpinning: true,
    selectedAnswer: null,
    isFullscreen: false,
    gameResult: "none",
  });

  const problems: MathProblem[] = [
    {
      a: 7,
      b: 8,
      operator: "*",
      answers: [56, 54, 60, 52],
      correct: 56,
    },
    {
      a: 12,
      b: 5,
      operator: "+",
      answers: [17, 15, 19, 20],
      correct: 17,
    },
    {
      a: 20,
      b: 8,
      operator: "-",
      answers: [10, 12, 14, 11],
      correct: 12,
    },
    {
      a: 9,
      b: 6,
      operator: "*",
      answers: [54, 52, 56, 50],
      correct: 54,
    },
    {
      a: 30,
      b: 5,
      operator: "/",
      answers: [6, 5, 7, 8],
      correct: 6,
    },
    {
      a: 15,
      b: 8,
      operator: "+",
      answers: [23, 24, 22, 25],
      correct: 23,
    },
    {
      a: 25,
      b: 12,
      operator: "-",
      answers: [13, 12, 14, 15],
      correct: 13,
    },
    {
      a: 8,
      b: 7,
      operator: "*",
      answers: [56, 54, 58, 60],
      correct: 56,
    },
    {
      a: 100,
      b: 10,
      operator: "/",
      answers: [10, 8, 9, 12],
      correct: 10,
    },
    {
      a: 45,
      b: 20,
      operator: "+",
      answers: [65, 64, 66, 67],
      correct: 65,
    },
  ];

  const currentProblem = problems[gameState.currentProblemIdx];

  useEffect(() => {
    if (!gameStarted || gameState.gameResult !== "none") return;

    const timer = setInterval(() => {
      setGameState((prev) => {
        if (prev.timeLeft <= 1) {
          // Time's up, move to next problem
          if (prev.selectedAnswer === null) {
            return {
              ...prev,
              wrong: prev.wrong + 1,
              currentProblemIdx:
                prev.currentProblemIdx >= problems.length - 1
                  ? prev.currentProblemIdx
                  : prev.currentProblemIdx + 1,
              timeLeft: 10,
              selectedAnswer: null,
              streak: 0,
              gameResult:
                prev.currentProblemIdx >= problems.length - 1 ? "won" : "none",
            };
          }
          return prev;
        }
        return {
          ...prev,
          timeLeft: prev.timeLeft - 1,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameState.gameResult]);

  useEffect(() => {
    if (gameStarted && currentProblem) {
      const spin = setTimeout(() => {
        setGameState((prev) => ({
          ...prev,
          isSpinning: false,
        }));
      }, 800);
      return () => clearTimeout(spin);
    }
  }, [gameState.currentProblemIdx, gameStarted]);

  const handleAnswer = (answer: number) => {
    if (gameState.selectedAnswer !== null || !currentProblem) return;

    const isCorrect = answer === currentProblem.correct;

    setGameState((prev) => {
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      const newCorrect = isCorrect ? prev.correct + 1 : prev.correct;
      const newWrong = isCorrect ? prev.wrong : prev.wrong + 1;

      return {
        ...prev,
        selectedAnswer: answer,
        streak: newStreak,
        correct: newCorrect,
        wrong: newWrong,
      };
    });

    setTimeout(() => {
      setGameState((prev) => {
        const nextIdx =
          prev.currentProblemIdx >= problems.length - 1
            ? prev.currentProblemIdx
            : prev.currentProblemIdx + 1;

        return {
          ...prev,
          currentProblemIdx: nextIdx,
          timeLeft: 10,
          selectedAnswer: null,
          isSpinning: true,
          gameResult:
            prev.currentProblemIdx >= problems.length - 1 ? "won" : "none",
        };
      });
    }, 1200);
  };

  const handleRetry = () => {
    setGameState({
      streak: 0,
      correct: 0,
      wrong: 0,
      currentProblemIdx: 0,
      timeLeft: 10,
      isSpinning: true,
      selectedAnswer: null,
      isFullscreen: gameState.isFullscreen,
      gameResult: "none",
    });
  };

  const toggleFullscreen = () => {
    setGameState({
      ...gameState,
      isFullscreen: !gameState.isFullscreen,
    });
  };

  if (!gameStarted) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>🎡 Daily Math Spin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-semibold">⚡ Concept: Mental Math & Speed</h3>
              <p className="text-sm text-muted-foreground">
                A spinner shows math problems — calculate fast and choose the right answer.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🎯 How to Play</h3>
              <p className="text-sm text-muted-foreground">
                Watch the spinner reveal a math problem. Select your answer before time runs out!
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🏆 Build Your Streak</h3>
              <p className="text-sm text-muted-foreground">
                Correct answers build your combo streak. Wrong answers reset it.
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={onClose} variant="outline" className="flex-1">
                ❌ Go Back
              </Button>
              <Button onClick={() => setGameStarted(true)} className="flex-1">
                ▶️ Start Game
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const operatorSymbol: Record<string, string> = {
    "*": "×",
    "+": "+",
    "-": "−",
    "/": "÷",
  };

  const GameplayUI = () => (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-secondary rounded-lg p-3 text-center">
          <div className="text-xs text-white/80 mb-1">✅ Correct</div>
          <div className="text-2xl font-bold text-white">{gameState.correct}</div>
        </div>
        <div className="bg-destructive rounded-lg p-3 text-center">
          <div className="text-xs text-white/80 mb-1">❌ Wrong</div>
          <div className="text-2xl font-bold text-white">{gameState.wrong}</div>
        </div>
        <div className="bg-accent rounded-lg p-3 text-center">
          <div className="text-xs text-white/80 mb-1">🔥 Streak</div>
          <div className="text-2xl font-bold text-white">{gameState.streak}</div>
        </div>
      </div>

      {/* Timer */}
      <div className="relative">
        <div
          className={`rounded-lg p-8 text-center transition-all ${
            gameState.timeLeft <= 3
              ? "bg-red-100 dark:bg-red-900 border-2 border-red-500"
              : "bg-gradient-to-r from-accent/20 to-badge/20 border-2 border-accent"
          }`}
        >
          <div className="text-sm text-muted-foreground mb-2">⏱️ Time Remaining</div>
          <div
            className={`text-5xl font-bold transition-colors ${
              gameState.timeLeft <= 3
                ? "text-red-600 dark:text-red-400"
                : "text-accent"
            }`}
          >
            {gameState.timeLeft}s
          </div>
          {gameState.timeLeft <= 3 && (
            <div className="text-sm text-red-600 dark:text-red-400 mt-2 animate-pulse">
              Hurry up!
            </div>
          )}
        </div>
      </div>

      {/* Spinner / Problem */}
      <div className="relative">
        {gameState.isSpinning ? (
          <div className="bg-gradient-to-r from-purple-400 to-pink-400 dark:from-purple-600 dark:to-pink-600 rounded-lg p-12 text-center animate-spin">
            <div className="text-6xl">🎡</div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-primary to-badge rounded-lg p-12 text-center">
            <div className="text-sm text-white/80 mb-4">🧮 Solve the Problem</div>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-4xl font-bold text-white">
                {currentProblem.a}
              </div>
              <div className="text-3xl text-white/80">
                {operatorSymbol[currentProblem.operator]}
              </div>
              <div className="text-4xl font-bold text-white">
                {currentProblem.b}
              </div>
            </div>
            <div className="text-white/80 text-sm mt-2">= ?</div>
          </div>
        )}
      </div>

      {/* Answer Options */}
      {!gameState.isSpinning && gameState.selectedAnswer === null && (
        <div className="space-y-2">
          <div className="text-sm font-semibold">🎯 Choose Your Answer</div>
          <div className="grid grid-cols-2 gap-3">
            {currentProblem.answers.map((answer, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(answer)}
                className="p-4 rounded-lg font-bold text-xl transition-all hover:scale-105 bg-card border-2 border-muted hover:border-accent cursor-pointer"
              >
                {answer}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Answer Feedback */}
      {gameState.selectedAnswer !== null && (
        <div
          className={`rounded-lg p-4 text-center border-2 ${
            gameState.selectedAnswer === currentProblem.correct
              ? "bg-green-100 dark:bg-green-900 border-green-500"
              : "bg-red-100 dark:bg-red-900 border-red-500"
          }`}
        >
          {gameState.selectedAnswer === currentProblem.correct ? (
            <>
              <div className="text-4xl mb-2">🎉</div>
              <div className="font-bold text-lg text-green-800 dark:text-green-200">
                Correct! Streak: {gameState.streak}
              </div>
            </>
          ) : (
            <>
              <div className="text-4xl mb-2">❌</div>
              <div className="font-bold text-lg text-red-800 dark:text-red-200">
                Wrong! Answer was {currentProblem.correct}
              </div>
            </>
          )}
        </div>
      )}

      {/* Game Result */}
      {gameState.gameResult === "won" && (
        <div className="bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-lg p-6 text-center border-2 border-green-500">
          <div className="text-5xl mb-2">🏆</div>
          <div className="font-bold text-2xl text-green-800 dark:text-green-200 mb-2">
            Game Complete!
          </div>
          <div className="space-y-2 text-green-700 dark:text-green-300">
            <p className="font-semibold">✅ Correct: {gameState.correct}</p>
            <p className="font-semibold">Best Streak: {gameState.streak}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {gameState.gameResult === "won" && (
        <div className="flex gap-2">
          <Button onClick={handleRetry} variant="outline" className="flex-1">
            <RotateCcw className="mr-2 h-4 w-4" />
            Play Again
          </Button>
          <Button onClick={() => setGameStarted(false)} className="flex-1">
            Finish Game
          </Button>
        </div>
      )}

      {/* Info Strip */}
      <div className="bg-muted rounded-lg p-3 text-center text-sm font-semibold text-muted-foreground">
        💡 "Speed builds confidence, not pressure!"
      </div>
    </div>
  );

  if (gameState.isFullscreen) {
    return (
      <div className="fixed inset-0 bg-background z-50 p-4 flex flex-col overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-badge">🎡 Daily Math Spin</h2>
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-muted rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 max-w-2xl mx-auto w-full">
          <GameplayUI />
        </div>
      </div>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle>
                🎡 Daily Math Spin - Problem {gameState.currentProblemIdx + 1}/
                {problems.length}
              </DialogTitle>
              <div className="flex gap-4 mt-4 text-sm">
                <div>
                  Score: <span className="font-bold text-badge">{score}</span>
                </div>
              </div>
            </div>
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-muted rounded-lg transition"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <GameplayUI />
      </DialogContent>
    </Dialog>
  );
}
