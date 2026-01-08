import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RotateCcw, Maximize2, X } from "lucide-react";

interface PatternLevel {
  sequence: number[];
  options: number[];
  missing: number;
  explanation: string;
}

interface GameState {
  selectedOption: number | null;
  isFullscreen: boolean;
  gameResult: "none" | "won" | "lost";
  showExplanation: boolean;
}

export function PatternMasterGame({ onClose }: { onClose: () => void }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>({
    selectedOption: null,
    isFullscreen: false,
    gameResult: "none",
    showExplanation: false,
  });

  const levels: PatternLevel[] = [
    {
      sequence: [2, 4, 6, null, 10],
      options: [8, 7, 9, 5],
      missing: 8,
      explanation: "Add 2 each time: 2→4→6→8→10",
    },
    {
      sequence: [3, 6, 9, null, 15],
      options: [12, 11, 10, 13],
      missing: 12,
      explanation: "Add 3 each time (counting by 3s)",
    },
    {
      sequence: [1, 2, 4, null, 16],
      options: [8, 6, 10, 12],
      missing: 8,
      explanation: "Multiply by 2 each time: 1→2→4→8→16",
    },
    {
      sequence: [100, 50, 25, null, 6.25],
      options: [12.5, 15, 20, 10],
      missing: 12.5,
      explanation: "Divide by 2 each time: 100→50→25→12.5→6.25",
    },
    {
      sequence: [5, 10, 15, 20, null],
      options: [25, 22, 24, 23],
      missing: 25,
      explanation: "Add 5 each time (counting by 5s)",
    },
    {
      sequence: [2, 3, 5, 8, null],
      options: [13, 12, 10, 11],
      missing: 13,
      explanation: "Fibonacci: add the two previous numbers",
    },
  ];

  const level = levels[currentLevel];

  useEffect(() => {
    if (gameStarted && currentLevel < levels.length) {
      setGameState({
        selectedOption: null,
        isFullscreen: false,
        gameResult: "none",
        showExplanation: false,
      });
    }
  }, [currentLevel, gameStarted]);

  const handleSelectOption = (option: number) => {
    if (gameState.gameResult !== "none" || gameState.selectedOption !== null)
      return;

    const isCorrect = option === level.missing;
    setGameState({
      ...gameState,
      selectedOption: option,
      gameResult: isCorrect ? "won" : "lost",
      showExplanation: true,
    });
  };

  const handleRetry = () => {
    setGameState({
      selectedOption: null,
      isFullscreen: gameState.isFullscreen,
      gameResult: "none",
      showExplanation: false,
    });
  };

  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(currentLevel + 1);
      setScore(score + 75);
    } else {
      setGameStarted(false);
    }
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
            <DialogTitle>🔗 Pattern Master</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-semibold">🔗 Concept: Number Patterns & Sequences</h3>
              <p className="text-sm text-muted-foreground">
                Discover the rule connecting numbers and find what comes next.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🎯 How to Play</h3>
              <p className="text-sm text-muted-foreground">
                Look at the sequence, identify the pattern, and select the missing number.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🏆 Success Requires</h3>
              <p className="text-sm text-muted-foreground">
                Logical reasoning and pattern recognition.
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

  const GameplayUI = () => (
    <div className="space-y-6">
      {/* Sequence Display */}
      <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg p-8">
        <div className="text-sm font-semibold text-muted-foreground mb-4 text-center">
          🔗 Complete the Sequence
        </div>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {level.sequence.map((num, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {idx > 0 && (
                <span className="text-muted-foreground text-lg">→</span>
              )}
              {num === null ? (
                <div className="w-16 h-16 bg-badge/20 border-4 border-dashed border-badge rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-badge">?</span>
                </div>
              ) : (
                <div
                  className={`w-16 h-16 bg-gradient-to-br from-primary to-badge rounded-lg flex items-center justify-center border-2 border-primary transition-all ${
                    gameState.gameResult === "won"
                      ? "scale-105 shadow-lg"
                      : ""
                  }`}
                >
                  <span className="text-2xl font-bold text-white">
                    {num}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pattern Information */}
      {!gameState.showExplanation && (
        <div className="bg-muted rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground font-semibold">
            🤔 What's the pattern?
          </p>
        </div>
      )}

      {gameState.showExplanation && (
        <div
          className={`rounded-lg p-4 text-center border-2 ${
            gameState.gameResult === "won"
              ? "bg-green-100 dark:bg-green-900 border-green-500"
              : "bg-red-100 dark:bg-red-900 border-red-500"
          }`}
        >
          <p className="text-sm font-semibold mb-2">
            {gameState.gameResult === "won" ? "✅ Pattern Found!" : "❌ Wrong Pattern"}
          </p>
          <p className="text-sm text-muted-foreground">
            {level.explanation}
          </p>
        </div>
      )}

      {/* Options */}
      <div className="space-y-2">
        <div className="text-sm font-semibold">🎯 Choose the Missing Number</div>
        <div className="grid grid-cols-2 gap-3">
          {level.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectOption(option)}
              disabled={gameState.gameResult !== "none"}
              className={`p-4 rounded-lg font-bold text-xl transition-all border-2 ${
                gameState.selectedOption === option
                  ? gameState.gameResult === "won"
                    ? "border-green-500 bg-green-100 dark:bg-green-900 scale-105"
                    : "border-red-500 bg-red-100 dark:bg-red-900 scale-105"
                  : "border-muted hover:border-accent bg-card hover:bg-muted"
              } ${gameState.gameResult === "none" ? "cursor-pointer hover:scale-105" : "cursor-not-allowed opacity-50"}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Pattern Indicator */}
      <div className="bg-card rounded-lg p-4 border border-muted">
        <div className="text-xs font-semibold text-muted-foreground mb-3">
          📊 Sequence Analysis
        </div>
        <div className="space-y-2 text-xs">
          {level.sequence.slice(0, -1).map((num, idx) => {
            const nextNum = level.sequence[idx + 1];
            if (num !== null && nextNum !== null) {
              const diff = nextNum - num;
              const ratio = nextNum / num;
              return (
                <div key={idx} className="flex justify-between text-muted-foreground">
                  <span>
                    {num} → {nextNum}
                  </span>
                  {diff !== 0 && ratio === 1 && (
                    <span className="text-accent font-semibold">
                      +{diff}
                    </span>
                  )}
                  {ratio > 1 && ratio < 2 && (
                    <span className="text-secondary font-semibold">
                      ÷{(num / nextNum).toFixed(2)}
                    </span>
                  )}
                  {ratio > 1 && (
                    <span className="text-secondary font-semibold">
                      ×{ratio.toFixed(2)}
                    </span>
                  )}
                </div>
              );
            }
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {gameState.gameResult === "none" && (
          <Button onClick={handleRetry} variant="outline" className="flex-1">
            <RotateCcw className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
        {gameState.gameResult !== "none" && (
          <>
            <Button onClick={handleRetry} variant="outline" className="flex-1">
              Try Again
            </Button>
            {gameState.gameResult === "won" && currentLevel < levels.length - 1 && (
              <Button onClick={nextLevel} className="flex-1">
                Next Level →
              </Button>
            )}
            {gameState.gameResult === "won" && currentLevel === levels.length - 1 && (
              <Button onClick={() => setGameStarted(false)} className="flex-1">
                Finish Game
              </Button>
            )}
          </>
        )}
      </div>

      {/* Info Strip */}
      <div className="bg-muted rounded-lg p-3 text-center text-sm font-semibold text-muted-foreground">
        💡 "Every sequence has a rule. Find it!"
      </div>
    </div>
  );

  if (gameState.isFullscreen) {
    return (
      <div className="fixed inset-0 bg-background z-50 p-4 flex flex-col overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-badge">
            🔗 Pattern Master - Level {currentLevel + 1}/{levels.length}
          </h2>
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
                🔗 Pattern Master - Level {currentLevel + 1}/{levels.length}
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
