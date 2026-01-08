import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RotateCcw, Maximize2, X } from "lucide-react";

interface MathHeistLevel {
  targetNumber: number;
  availableCards: Array<{ value: number; operator: "+" | "-" }>;
  maxMoves: number;
}

interface GameState {
  currentValue: number;
  moves: number;
  history: Array<{ value: number; operator: "+" | "-" }>;
  isFullscreen: boolean;
  gameResult: "none" | "won" | "lost";
}

export function MathHeist({ onClose }: { onClose: () => void }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>({
    currentValue: 0,
    moves: 0,
    history: [],
    isFullscreen: false,
    gameResult: "none",
  });

  const levels: MathHeistLevel[] = [
    {
      targetNumber: 30,
      availableCards: [
        { value: 10, operator: "+" },
        { value: 10, operator: "+" },
        { value: 5, operator: "+" },
        { value: 5, operator: "-" },
        { value: 3, operator: "-" },
        { value: 2, operator: "-" },
      ],
      maxMoves: 6,
    },
    {
      targetNumber: 50,
      availableCards: [
        { value: 20, operator: "+" },
        { value: 15, operator: "+" },
        { value: 10, operator: "+" },
        { value: 7, operator: "-" },
        { value: 5, operator: "-" },
        { value: 3, operator: "-" },
      ],
      maxMoves: 6,
    },
    {
      targetNumber: 42,
      availableCards: [
        { value: 25, operator: "+" },
        { value: 20, operator: "+" },
        { value: 15, operator: "+" },
        { value: 10, operator: "-" },
        { value: 8, operator: "-" },
        { value: 3, operator: "-" },
      ],
      maxMoves: 6,
    },
  ];

  const level = levels[currentLevel];

  useEffect(() => {
    if (gameStarted && currentLevel < levels.length) {
      setGameState({
        currentValue: 0,
        moves: 0,
        history: [],
        isFullscreen: false,
        gameResult: "none",
      });
    }
  }, [currentLevel, gameStarted]);

  const handleCardClick = (card: { value: number; operator: "+" | "-" }) => {
    if (gameState.gameResult !== "none" || gameState.moves >= level.maxMoves) return;

    let newValue = gameState.currentValue;
    if (card.operator === "+") {
      newValue += card.value;
    } else {
      newValue -= card.value;
    }

    const newHistory = [
      ...gameState.history,
      { value: card.value, operator: card.operator },
    ];
    const newMoves = gameState.moves + 1;

    let result: "none" | "won" | "lost" = "none";
    if (newValue === level.targetNumber) {
      result = "won";
    } else if (newMoves >= level.maxMoves && newValue !== level.targetNumber) {
      result = "lost";
    }

    setGameState({
      ...gameState,
      currentValue: newValue,
      moves: newMoves,
      history: newHistory,
      gameResult: result,
    });
  };

  const handleUndo = () => {
    if (gameState.history.length === 0 || gameState.gameResult !== "none") return;

    const newHistory = gameState.history.slice(0, -1);
    let newValue = 0;

    newHistory.forEach((op) => {
      if (op.operator === "+") {
        newValue += op.value;
      } else {
        newValue -= op.value;
      }
    });

    setGameState({
      ...gameState,
      currentValue: newValue,
      moves: Math.max(0, gameState.moves - 1),
      history: newHistory,
    });
  };

  const handleRetry = () => {
    setGameState({
      currentValue: 0,
      moves: 0,
      history: [],
      isFullscreen: gameState.isFullscreen,
      gameResult: "none",
    });
  };

  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(currentLevel + 1);
      setScore(score + 50);
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

  const exceedsTarget = gameState.currentValue > level.targetNumber;
  const isCloseToTarget =
    gameState.currentValue >= level.targetNumber - 10 &&
    gameState.currentValue < level.targetNumber;

  if (!gameStarted) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>🔐 Math Heist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-semibold">🧠 Concept: Smart Addition & Subtraction</h3>
              <p className="text-sm text-muted-foreground">
                Numbers combine and cancel to reach an exact value.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🎯 How to Play</h3>
              <p className="text-sm text-muted-foreground">
                Use number cards wisely to reach the vault's exact code. Only exact matches unlock the vault!
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🏆 Winning Means</h3>
              <p className="text-sm text-muted-foreground">
                You open the vault using the exact number — no extra, no less.
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
      {/* Vault Display */}
      <div
        className={`rounded-lg p-8 text-center transition-all duration-300 ${
          gameState.gameResult === "won"
            ? "bg-gradient-to-b from-green-400 to-green-600 dark:from-green-600 dark:to-green-800"
            : exceedsTarget
              ? "bg-gradient-to-b from-red-400 to-red-600 dark:from-red-600 dark:to-red-800"
              : isCloseToTarget
                ? "bg-gradient-to-b from-yellow-400 to-yellow-600 dark:from-yellow-600 dark:to-yellow-800"
                : "bg-gradient-to-b from-purple-400 to-purple-600 dark:from-purple-600 dark:to-purple-800"
        }`}
      >
        <div className="text-sm font-semibold text-white mb-2">🎯 Target Code</div>
        <div className="text-5xl font-bold text-white mb-4">{level.targetNumber}</div>
        <div className="text-xs text-white/80">Vault Requires Exact Match</div>
      </div>

      {/* Current Value Display */}
      <div className="bg-card border-2 border-badge rounded-lg p-6 text-center">
        <div className="text-sm text-muted-foreground mb-2">📊 Current Value</div>
        <div className="text-6xl font-bold text-badge mb-4">{gameState.currentValue}</div>
        {exceedsTarget && (
          <div className="text-sm text-red-500 font-semibold">⚠️ Too High!</div>
        )}
        {gameState.currentValue < level.targetNumber && gameState.currentValue > 0 && (
          <div className="text-sm text-yellow-500 font-semibold">📈 Keep Going</div>
        )}
        {gameState.currentValue === 0 && (
          <div className="text-sm text-muted-foreground">Start by tapping a card</div>
        )}
      </div>

      {/* Moves Counter */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border-2 border-secondary rounded-lg p-4 text-center">
          <div className="text-xs text-muted-foreground mb-2">Moves Used</div>
          <div className="text-3xl font-bold text-secondary">
            {gameState.moves}/{level.maxMoves}
          </div>
        </div>
        <div className="bg-card border-2 border-accent rounded-lg p-4 text-center">
          <div className="text-xs text-muted-foreground mb-2">Remaining</div>
          <div className="text-3xl font-bold text-accent">
            {level.maxMoves - gameState.moves}
          </div>
        </div>
      </div>

      {/* Number Cards */}
      <div className="space-y-2">
        <div className="text-sm font-semibold text-muted-foreground">🃏 Available Cards</div>
        <div className="grid grid-cols-3 gap-3">
          {level.availableCards.map((card, idx) => (
            <button
              key={idx}
              onClick={() => handleCardClick(card)}
              disabled={gameState.gameResult !== "none" || gameState.moves >= level.maxMoves}
              className={`p-3 rounded-lg font-bold text-lg transition-all ${
                card.operator === "+"
                  ? "bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white"
                  : "bg-gradient-to-br from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white"
              } ${gameState.gameResult !== "none" || gameState.moves >= level.maxMoves ? "opacity-50 cursor-not-allowed" : "hover:scale-105 cursor-pointer"}`}
            >
              {card.operator === "+" ? "+" : "−"}
              {card.value}
            </button>
          ))}
        </div>
      </div>

      {/* History */}
      {gameState.history.length > 0 && (
        <div className="bg-card border border-muted rounded-lg p-4">
          <div className="text-xs font-semibold text-muted-foreground mb-2">📋 Your Path</div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-primary">0</span>
            {gameState.history.map((op, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  {op.operator === "+" ? "+" : "−"}
                </span>
                <span className="bg-muted px-2 py-1 rounded text-sm font-bold">
                  {op.value}
                </span>
                {idx === gameState.history.length - 1 && (
                  <>
                    <span className="text-muted-foreground">=</span>
                    <span className="font-bold text-accent">
                      {gameState.currentValue}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Game Result */}
      {gameState.gameResult === "won" && (
        <div className="bg-green-100 dark:bg-green-900 rounded-lg p-4 text-center border-2 border-green-500">
          <div className="text-4xl mb-2">🎉</div>
          <div className="font-bold text-lg text-green-800 dark:text-green-200">
            Perfect Calculation!
          </div>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
            You cracked the vault code!
          </p>
        </div>
      )}

      {gameState.gameResult === "lost" && (
        <div className="bg-red-100 dark:bg-red-900 rounded-lg p-4 text-center border-2 border-red-500">
          <div className="text-4xl mb-2">🔒</div>
          <div className="font-bold text-lg text-red-800 dark:text-red-200">
            Vault Locked!
          </div>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            {gameState.currentValue > level.targetNumber
              ? "You went too high. Try again!"
              : "You went too low. Try again!"}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        {gameState.gameResult === "none" && (
          <>
            <Button
              onClick={handleUndo}
              variant="outline"
              disabled={gameState.history.length === 0}
              className="flex-1"
            >
              ↶ Undo
            </Button>
            <Button onClick={handleRetry} variant="outline" className="flex-1">
              <RotateCcw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </>
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
        💡 "Plan your moves carefully. Random tapping never wins!"
      </div>
    </div>
  );

  if (gameState.isFullscreen) {
    return (
      <div className="fixed inset-0 bg-background z-50 p-4 flex flex-col overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-badge">
            🔐 Math Heist - Level {currentLevel + 1}/{levels.length}
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
              <DialogTitle>🔐 Math Heist - Level {currentLevel + 1}/{levels.length}</DialogTitle>
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
