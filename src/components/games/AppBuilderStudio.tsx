import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RotateCcw, Maximize2, X } from "lucide-react";

interface UIElement {
  id: string;
  type: "button" | "text";
  label: string;
  connected: boolean;
}

interface GameState {
  uiElements: UIElement[];
  connectedElements: Set<string>;
  appRunning: boolean;
  isFullscreen: boolean;
  gameResult: "none" | "won" | "lost";
}

export function AppBuilderStudio({ onClose }: { onClose: () => void }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>({
    uiElements: [],
    connectedElements: new Set(),
    appRunning: false,
    isFullscreen: false,
    gameResult: "none",
  });

  const levels = [
    {
      requiredElements: ["button"],
      requiredConnections: ["button"],
      title: "Simple Button Click",
      description: "Create a button that responds to clicks",
    },
    {
      requiredElements: ["button", "text"],
      requiredConnections: ["button", "text"],
      title: "Button with Display",
      description: "Button shows a message when clicked",
    },
    {
      requiredElements: ["button", "text", "text"],
      requiredConnections: ["button", "text"],
      title: "Multi-Element App",
      description: "Create an interactive app with multiple elements",
    },
  ];

  const level = levels[currentLevel];

  useEffect(() => {
    if (gameStarted && currentLevel < levels.length) {
      initializeLevel();
    }
  }, [currentLevel, gameStarted]);

  const initializeLevel = () => {
    const elements: UIElement[] = [
      { id: "btn1", type: "button", label: "Click Me", connected: false },
      { id: "text1", type: "text", label: "Hello!", connected: false },
      { id: "text2", type: "text", label: "App Built!", connected: false },
    ];
    setGameState({
      uiElements: elements,
      connectedElements: new Set(),
      appRunning: false,
      isFullscreen: gameState.isFullscreen,
      gameResult: "none",
    });
  };

  const connectElement = (elementId: string) => {
    if (gameState.gameResult !== "none") return;

    const newConnected = new Set(gameState.connectedElements);
    if (newConnected.has(elementId)) {
      newConnected.delete(elementId);
    } else {
      newConnected.add(elementId);
    }

    setGameState({
      ...gameState,
      connectedElements: newConnected,
    });
  };

  const runApp = () => {
    if (gameState.gameResult !== "none") return;

    const allConnected = gameState.uiElements.every((el) =>
      gameState.connectedElements.has(el.id)
    );

    if (allConnected) {
      setGameState((prev) => ({
        ...prev,
        appRunning: true,
        gameResult: "won",
      }));
    } else {
      setGameState((prev) => ({
        ...prev,
        appRunning: false,
        gameResult: "lost",
      }));
    }
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
            <DialogTitle>📱 App Builder Studio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-semibold">🧠 Concept: UI + Logic Connection</h3>
              <p className="text-sm text-muted-foreground">
                Apps don't work by design alone. UI and logic must be connected!
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🎮 How To Play</h3>
              <p className="text-sm text-muted-foreground">
                Click UI elements to connect them with logic. Then run your app to test it!
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🏆 What Success Means</h3>
              <p className="text-sm text-muted-foreground">
                All UI elements must be connected to logic before the app works.
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
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg p-4 text-center">
        <div className="text-sm text-muted-foreground mb-2">Level {currentLevel + 1}/{levels.length}</div>
        <div className="text-lg font-bold text-primary">{level.title}</div>
        <div className="text-xs text-muted-foreground mt-1">{level.description}</div>
      </div>

      {/* Phone Frame */}
      <div className="mx-auto w-64 bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl border-8 border-gray-900 p-4 aspect-video flex flex-col">
        <div className="bg-black rounded-2xl flex-1 flex flex-col gap-3 p-4 overflow-hidden">
          {gameState.uiElements.map((el) => (
            <button
              key={el.id}
              onClick={() => connectElement(el.id)}
              className={`p-2 rounded-lg font-semibold transition-all ${
                gameState.connectedElements.has(el.id)
                  ? "bg-green-500 text-white ring-2 ring-green-300"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              {el.type === "button" ? "🔘 " : "📝 "}
              {el.label}
            </button>
          ))}

          {gameState.appRunning && (
            <div className="bg-blue-500 text-white p-2 rounded-lg text-xs font-bold text-center animate-pulse">
              ✅ App Running!
            </div>
          )}
        </div>
      </div>

      {/* Connection Status */}
      <div className="bg-card rounded-lg p-4 border border-muted">
        <div className="text-sm font-semibold text-muted-foreground mb-3">
          🔗 Connections
        </div>
        <div className="grid grid-cols-2 gap-2">
          {gameState.uiElements.map((el) => (
            <div
              key={el.id}
              className={`text-xs p-2 rounded text-center font-semibold ${
                gameState.connectedElements.has(el.id)
                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                  : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
              }`}
            >
              {el.label}: {gameState.connectedElements.has(el.id) ? "✅" : "❌"}
            </div>
          ))}
        </div>
      </div>

      {/* Result */}
      {gameState.gameResult === "won" && (
        <div className="bg-green-100 dark:bg-green-900 rounded-lg p-4 text-center border-2 border-green-500">
          <div className="text-4xl mb-2">🎉</div>
          <div className="font-bold text-lg text-green-800 dark:text-green-200">
            App Works Perfectly!
          </div>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
            All elements connected and logic flowing!
          </p>
        </div>
      )}

      {gameState.gameResult === "lost" && (
        <div className="bg-red-100 dark:bg-red-900 rounded-lg p-4 text-center border-2 border-red-500">
          <div className="text-4xl mb-2">❌</div>
          <div className="font-bold text-lg text-red-800 dark:text-red-200">
            App Crashed!
          </div>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            Not all elements are connected. Complete the connections!
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {gameState.gameResult === "none" && (
          <>
            <Button onClick={handleRetry} variant="outline" className="flex-1">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button onClick={runApp} className="flex-1 bg-blue-600 hover:bg-blue-700">
              ▶ Run App
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
                Finish
              </Button>
            )}
          </>
        )}
      </div>

      {/* Info */}
      <div className="bg-muted rounded-lg p-3 text-center text-sm font-semibold text-muted-foreground">
        💡 "Design is nothing without logic!"
      </div>
    </div>
  );

  if (gameState.isFullscreen) {
    return (
      <div className="fixed inset-0 bg-background z-50 p-4 flex flex-col overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">
            📱 App Builder Studio
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
            <DialogTitle>📱 App Builder Studio</DialogTitle>
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
