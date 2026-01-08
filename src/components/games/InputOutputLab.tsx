import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RotateCcw, Maximize2, X } from "lucide-react";

interface IOLevel {
  title: string;
  inputs: number[];
  process: (x: number) => number;
  description: string;
}

interface GameState {
  currentInputIdx: number;
  currentOutput: number | null;
  isProcessing: boolean;
  isFullscreen: boolean;
  gameResult: "none" | "won" | "lost";
  correct: number;
  total: number;
}

export function InputOutputLab({ onClose }: { onClose: () => void }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>({
    currentInputIdx: 0,
    currentOutput: null,
    isProcessing: false,
    isFullscreen: false,
    gameResult: "none",
    correct: 0,
    total: 3,
  });

  const levels: IOLevel[] = [
    {
      title: "Multiply by 2",
      inputs: [3, 5, 7],
      process: (x) => x * 2,
      description: "The system multiplies input by 2",
    },
    {
      title: "Add 10",
      inputs: [5, 15, 20],
      process: (x) => x + 10,
      description: "The system adds 10 to the input",
    },
    {
      title: "Double & Add 5",
      inputs: [2, 4, 10],
      process: (x) => x * 2 + 5,
      description: "The system multiplies by 2 and adds 5",
    },
  ];

  const level = levels[currentLevel];
  const currentInput = level.inputs[gameState.currentInputIdx];
  const correctOutput = level.process(currentInput);

  useEffect(() => {
    if (gameStarted && currentLevel < levels.length) {
      setGameState({
        currentInputIdx: 0,
        currentOutput: null,
        isProcessing: false,
        isFullscreen: gameState.isFullscreen,
        gameResult: "none",
        correct: 0,
        total: level.inputs.length,
      });
    }
  }, [currentLevel, gameStarted]);

  const process = () => {
    setGameState((prev) => ({
      ...prev,
      isProcessing: true,
    }));

    setTimeout(() => {
      setGameState((prev) => ({
        ...prev,
        currentOutput: correctOutput,
        isProcessing: false,
      }));
    }, 1500);
  };

  const guess = (input: number) => {
    if (gameState.gameResult !== "none") return;

    const isCorrect = input === correctOutput;
    const newCorrect = isCorrect ? gameState.correct + 1 : gameState.correct;
    const nextIdx = gameState.currentInputIdx + 1;

    if (nextIdx >= level.inputs.length) {
      setGameState((prev) => ({
        ...prev,
        correct: newCorrect,
        gameResult: newCorrect >= 2 ? "won" : "lost",
      }));
    } else {
      setGameState((prev) => ({
        ...prev,
        correct: newCorrect,
        currentInputIdx: nextIdx,
        currentOutput: null,
      }));
    }
  };

  const handleRetry = () => {
    setGameState({
      currentInputIdx: 0,
      currentOutput: null,
      isProcessing: false,
      isFullscreen: gameState.isFullscreen,
      gameResult: "none",
      correct: 0,
      total: level.inputs.length,
    });
  };

  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(currentLevel + 1);
      setScore(score + 100);
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
            <DialogTitle>🔄 Input Output Lab</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-semibold">🧪 Concept: Input → Output Systems</h3>
              <p className="text-sm text-muted-foreground">
                Every system processes inputs and produces outputs consistently.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🎮 How To Play</h3>
              <p className="text-sm text-muted-foreground">
                Feed input to the system, observe the output, then predict the next one!
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🏆 What Success Means</h3>
              <p className="text-sm text-muted-foreground">
                Correctly predict outputs by understanding the system's logic.
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={onClose} variant="outline" className="flex-1">
                ❌ Go Back
              </Button>
              <Button onClick={() => setGameStarted(true)} className="flex-1">
                ▶ Start Game
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const GameplayUI = () => (
    <div className="space-y-6">
      {/* Level Info */}
      <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-lg p-4 text-center">
        <div className="text-sm text-muted-foreground mb-2">Level {currentLevel + 1}/{levels.length}</div>
        <div className="text-lg font-bold text-primary">{level.title}</div>
        <div className="text-xs text-muted-foreground mt-1">{level.description}</div>
      </div>

      {/* System Flow */}
      <div className="bg-card rounded-lg p-6 border-2 border-primary">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Input */}
          <div className="text-center flex-1 min-w-[60px]">
            <div className="text-2xl font-bold text-primary mb-2">
              {currentInput}
            </div>
            <div className="text-xs text-muted-foreground">INPUT</div>
          </div>

          {/* Arrow */}
          <div className="text-2xl">→</div>

          {/* System */}
          <div className="text-center flex-1 min-w-[80px]">
            <div className="bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg p-4 text-white font-bold">
              🔧 SYSTEM
            </div>
          </div>

          {/* Arrow */}
          <div className="text-2xl">→</div>

          {/* Output */}
          <div className="text-center flex-1 min-w-[60px]">
            {gameState.isProcessing ? (
              <div className="text-2xl animate-pulse">⏳</div>
            ) : gameState.currentOutput !== null ? (
              <div className="text-2xl font-bold text-secondary mb-2">
                {gameState.currentOutput}
              </div>
            ) : (
              <div className="text-2xl text-gray-500">?</div>
            )}
            <div className="text-xs text-muted-foreground">OUTPUT</div>
          </div>
        </div>
      </div>

      {/* Process Button */}
      {gameState.currentOutput === null && (
        <div className="text-center">
          <Button onClick={process} disabled={gameState.isProcessing} size="lg">
            {gameState.isProcessing ? "⏳ Processing..." : "▶ Feed Input"}
          </Button>
        </div>
      )}

      {/* Prediction */}
      {gameState.currentOutput !== null && gameState.gameResult === "none" && (
        <div className="space-y-3">
          <div className="text-sm font-semibold text-muted-foreground">
            🤔 What's next? Predict the output for {level.inputs[gameState.currentInputIdx + 1] !== undefined ? level.inputs[gameState.currentInputIdx + 1] : "the next input"}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              correctOutput - 5,
              correctOutput,
              correctOutput + 5,
              correctOutput - 2,
              correctOutput + 2,
              correctOutput + 10,
            ]
              .filter((x, i, arr) => arr.indexOf(x) === i)
              .slice(0, 3)
              .map((option) => (
                <button
                  key={option}
                  onClick={() => guess(option)}
                  className="p-3 rounded-lg font-bold bg-card border-2 border-muted hover:border-primary transition-all"
                >
                  {option}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="bg-card rounded-lg p-4 border border-muted">
        <div className="text-sm font-semibold text-muted-foreground mb-2">
          📊 Progress
        </div>
        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
          <div
            className="bg-secondary h-full transition-all"
            style={{
              width: `${((gameState.currentInputIdx + 1) / level.inputs.length) * 100}%`,
            }}
          />
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          {gameState.currentInputIdx + 1} / {level.inputs.length}
        </div>
      </div>

      {/* Result */}
      {gameState.gameResult === "won" && (
        <div className="bg-green-100 dark:bg-green-900 rounded-lg p-4 text-center border-2 border-green-500">
          <div className="text-4xl mb-2">🎉</div>
          <div className="font-bold text-lg text-green-800 dark:text-green-200">
            System Mastered!
          </div>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
            You understand the system's logic!
          </p>
        </div>
      )}

      {gameState.gameResult === "lost" && (
        <div className="bg-red-100 dark:bg-red-900 rounded-lg p-4 text-center border-2 border-red-500">
          <div className="text-4xl mb-2">❌</div>
          <div className="font-bold text-lg text-red-800 dark:text-red-200">
            Try Again!
          </div>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            You predicted {gameState.correct} / {gameState.total} correctly
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {gameState.gameResult === "none" && (
          <Button onClick={handleRetry} variant="outline" className="flex-1">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
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
                Finish
              </Button>
            )}
          </>
        )}
      </div>

      {/* Info */}
      <div className="bg-muted rounded-lg p-3 text-center text-sm font-semibold text-muted-foreground">
        💡 "Systems transform data, not guess it!"
      </div>
    </div>
  );

  if (gameState.isFullscreen) {
    return (
      <div className="fixed inset-0 bg-background z-50 p-4 flex flex-col overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">
            🔄 Input Output Lab
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
            <DialogTitle>🔄 Input Output Lab</DialogTitle>
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
