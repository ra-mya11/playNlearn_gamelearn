import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RotateCcw, Maximize2, X } from "lucide-react";

interface LogicBlock {
  id: string;
  label: string;
  correct: boolean;
  selected: boolean;
}

interface GameState {
  blocks: LogicBlock[];
  fixedBlocks: number;
  isFullscreen: boolean;
  gameResult: "none" | "won" | "lost";
  showFeedback: string;
}

export function DebugDungeon({ onClose }: { onClose: () => void }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>({
    blocks: [],
    fixedBlocks: 0,
    isFullscreen: false,
    gameResult: "none",
    showFeedback: "",
  });

  const levels = [
    {
      roomName: "Entry Chamber",
      blocks: [
        { id: "1", label: "IF age > 18", correct: true },
        { id: "2", label: "THEN show adult content", correct: false },
        { id: "3", label: "THEN show blocked message", correct: true },
      ],
      required: 2,
    },
    {
      roomName: "Logic Maze",
      blocks: [
        { id: "1", label: "IF password is correct", correct: true },
        { id: "2", label: "THEN store as plain text", correct: false },
        { id: "3", label: "THEN encrypt password", correct: true },
        { id: "4", label: "THEN check permissions", correct: true },
      ],
      required: 3,
    },
    {
      roomName: "Final Vault",
      blocks: [
        { id: "1", label: "READ user input", correct: true },
        { id: "2", label: "EXECUTE input directly", correct: false },
        { id: "3", label: "VALIDATE input first", correct: true },
        { id: "4", label: "SANITIZE for security", correct: true },
        { id: "5", label: "PROCESS safely", correct: true },
      ],
      required: 4,
    },
  ];

  const level = levels[currentLevel];

  useEffect(() => {
    if (gameStarted && currentLevel < levels.length) {
      initializeLevel();
    }
  }, [currentLevel, gameStarted]);

  const initializeLevel = () => {
    const blocks = level.blocks.map((b) => ({
      ...b,
      selected: false,
    }));
    setGameState({
      blocks,
      fixedBlocks: 0,
      isFullscreen: gameState.isFullscreen,
      gameResult: "none",
      showFeedback: "",
    });
  };

  const selectBlock = (blockId: string) => {
    if (gameState.gameResult !== "none") return;

    const block = gameState.blocks.find((b) => b.id === blockId)!;

    if (block.correct) {
      const newBlocks = gameState.blocks.map((b) =>
        b.id === blockId ? { ...b, selected: true } : b
      );
      const fixedCount = newBlocks.filter((b) => b.selected && b.correct).length;

      setGameState({
        ...gameState,
        blocks: newBlocks,
        fixedBlocks: fixedCount,
        showFeedback: "✅ Correct! This logic is safe!",
      });

      if (fixedCount === level.required) {
        setGameState((prev) => ({
          ...prev,
          gameResult: "won",
        }));
      }
    } else {
      setGameState({
        ...gameState,
        showFeedback: "❌ This block has a bug! Avoid it!",
      });
    }

    setTimeout(() => {
      setGameState((prev) => ({
        ...prev,
        showFeedback: "",
      }));
    }, 1500);
  };

  const handleRetry = () => {
    initializeLevel();
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
            <DialogTitle>🐛 Debug Dungeon</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-semibold">🔍 Concept: Logical Error Detection</h3>
              <p className="text-sm text-muted-foreground">
                Small logic errors break entire systems. Find and fix them!
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🎮 How To Play</h3>
              <p className="text-sm text-muted-foreground">
                Tap logic blocks. Select the correct ones to unlock the room. Avoid buggy code!
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🏆 What Success Means</h3>
              <p className="text-sm text-muted-foreground">
                Fix enough logic blocks to unlock the door and escape!
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
      {/* Room Info */}
      <div className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900 dark:to-orange-900 rounded-lg p-4 text-center">
        <div className="text-sm text-muted-foreground mb-2">🏰 Dungeon</div>
        <div className="text-lg font-bold text-destructive">{level.roomName}</div>
      </div>

      {/* Progress */}
      <div className="bg-card rounded-lg p-4 border border-muted">
        <div className="text-sm font-semibold text-muted-foreground mb-2">
          🔓 Logic Blocks Fixed
        </div>
        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
          <div
            className="bg-green-500 h-full transition-all"
            style={{
              width: `${(gameState.fixedBlocks / level.required) * 100}%`,
            }}
          />
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          {gameState.fixedBlocks} / {level.required} blocks fixed
        </div>
      </div>

      {/* Logic Blocks */}
      <div className="space-y-2">
        <div className="text-sm font-semibold text-muted-foreground">
          🐛 Logic Blocks (Tap to Fix)
        </div>
        <div className="space-y-2">
          {gameState.blocks.map((block) => (
            <button
              key={block.id}
              onClick={() => selectBlock(block.id)}
              disabled={gameState.gameResult !== "none" || block.selected}
              className={`w-full p-3 rounded-lg font-semibold transition-all text-left border-2 ${
                block.selected
                  ? "bg-green-100 dark:bg-green-900 border-green-500 cursor-not-allowed"
                  : "bg-red-100 dark:bg-red-900 border-red-500 hover:bg-red-200 dark:hover:bg-red-800"
              }`}
            >
              <span className="flex items-center gap-2">
                {block.selected ? "✅" : "❌"} {block.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {gameState.showFeedback && (
        <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-3 text-center text-sm font-semibold text-blue-800 dark:text-blue-200 animate-pulse">
          {gameState.showFeedback}
        </div>
      )}

      {/* Win State */}
      {gameState.gameResult === "won" && (
        <div className="bg-green-100 dark:bg-green-900 rounded-lg p-4 text-center border-2 border-green-500">
          <div className="text-4xl mb-2">🎉</div>
          <div className="font-bold text-lg text-green-800 dark:text-green-200">
            Room Unlocked!
          </div>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
            All bugs fixed! Logic is now safe!
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
        {gameState.gameResult === "won" && (
          <>
            <Button onClick={handleRetry} variant="outline" className="flex-1">
              Try Again
            </Button>
            {currentLevel < levels.length - 1 && (
              <Button onClick={nextLevel} className="flex-1">
                Next Level →
              </Button>
            )}
            {currentLevel === levels.length - 1 && (
              <Button onClick={() => setGameStarted(false)} className="flex-1">
                Finish
              </Button>
            )}
          </>
        )}
      </div>

      {/* Info */}
      <div className="bg-muted rounded-lg p-3 text-center text-sm font-semibold text-muted-foreground">
        💡 "One small bug can break the whole system!"
      </div>
    </div>
  );

  if (gameState.isFullscreen) {
    return (
      <div className="fixed inset-0 bg-background z-50 p-4 flex flex-col overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-destructive">
            🐛 Debug Dungeon
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
            <DialogTitle>🐛 Debug Dungeon</DialogTitle>
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
