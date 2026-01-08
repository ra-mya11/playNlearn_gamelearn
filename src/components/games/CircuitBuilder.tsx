import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RotateCcw, Maximize2, X } from "lucide-react";

interface Component {
  id: string;
  type: "battery" | "switch" | "bulb";
  connected: boolean;
}

interface GameState {
  components: Component[];
  switchOn: boolean;
  circuitComplete: boolean;
  isFullscreen: boolean;
  gameResult: "none" | "won" | "lost";
}

export function CircuitBuilder({ onClose }: { onClose: () => void }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>({
    components: [],
    switchOn: false,
    circuitComplete: false,
    isFullscreen: false,
    gameResult: "none",
  });

  const levels = [
    {
      title: "Simple Circuit",
      required: ["battery", "switch", "bulb"],
      description: "Complete a basic circuit",
    },
    {
      title: "Dual Light Circuit",
      required: ["battery", "switch", "bulb", "bulb"],
      description: "Light up two bulbs",
    },
    {
      title: "Advanced Circuit",
      required: ["battery", "switch", "bulb", "bulb"],
      description: "Series and parallel circuits",
    },
  ];

  const level = levels[currentLevel];

  useEffect(() => {
    if (gameStarted && currentLevel < levels.length) {
      initializeLevel();
    }
  }, [currentLevel, gameStarted]);

  const initializeLevel = () => {
    const components: Component[] = level.required.map((type, idx) => ({
      id: `${type}-${idx}`,
      type: type as "battery" | "switch" | "bulb",
      connected: false,
    }));
    setGameState({
      components,
      switchOn: false,
      circuitComplete: false,
      isFullscreen: gameState.isFullscreen,
      gameResult: "none",
    });
  };

  const connectComponent = (componentId: string) => {
    if (gameState.gameResult !== "none") return;

    const newComponents = gameState.components.map((c) =>
      c.id === componentId ? { ...c, connected: !c.connected } : c
    );

    const allConnected = newComponents.every((c) => c.connected);
    const hasAll = level.required.every((type) =>
      newComponents.some((c) => c.type === type && c.connected)
    );

    setGameState({
      ...gameState,
      components: newComponents,
      circuitComplete: allConnected && hasAll,
    });
  };

  const toggleSwitch = () => {
    if (gameState.gameResult !== "none" || !gameState.circuitComplete) return;

    const newSwitchState = !gameState.switchOn;
    setGameState({
      ...gameState,
      switchOn: newSwitchState,
      gameResult: "won",
    });
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
            <DialogTitle>🔌 Circuit Builder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-semibold">⚡ Concept: Basic Electronic Circuits</h3>
              <p className="text-sm text-muted-foreground">
                Closed circuits are required for devices to work.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🎮 How To Play</h3>
              <p className="text-sm text-muted-foreground">
                Connect all components in a circuit, then flip the switch!
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🏆 What Success Means</h3>
              <p className="text-sm text-muted-foreground">
                The bulb lights up when the circuit is complete and the switch is ON.
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
      <div className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 rounded-lg p-4 text-center">
        <div className="text-sm text-muted-foreground mb-2">Level {currentLevel + 1}/{levels.length}</div>
        <div className="text-lg font-bold text-primary">{level.title}</div>
        <div className="text-xs text-muted-foreground mt-1">{level.description}</div>
      </div>

      {/* Circuit Board */}
      <div className="bg-gradient-to-b from-amber-900 to-amber-950 rounded-lg p-6 border-4 border-amber-800">
        <div className="text-center mb-4 text-yellow-300 font-bold">
          ⚡ Circuit Board
        </div>

        {/* Components */}
        <div className="space-y-3">
          {gameState.components.map((comp) => (
            <button
              key={comp.id}
              onClick={() => connectComponent(comp.id)}
              disabled={gameState.gameResult !== "none"}
              className={`w-full p-4 rounded-lg font-bold transition-all border-2 ${
                comp.connected
                  ? "bg-green-500 border-green-600 text-white shadow-lg shadow-green-500"
                  : "bg-gray-600 border-gray-700 text-gray-200 hover:bg-gray-700"
              }`}
            >
              {comp.type === "battery" && `🔋 Battery`}
              {comp.type === "switch" && `🔄 Switch`}
              {comp.type === "bulb" && `💡 Bulb`}
              {comp.connected && " ✓ Connected"}
            </button>
          ))}
        </div>
      </div>

      {/* Circuit Status */}
      <div className="bg-card rounded-lg p-4 border border-muted">
        <div className="text-sm font-semibold text-muted-foreground mb-3">
          🔗 Circuit Status
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>All components connected:</span>
            <span className={gameState.circuitComplete ? "text-green-500" : "text-red-500"}>
              {gameState.circuitComplete ? "✅ Yes" : "❌ No"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Circuit complete:</span>
            <span className={gameState.circuitComplete ? "text-green-500" : "text-red-500"}>
              {gameState.circuitComplete ? "✅ Ready" : "❌ Incomplete"}
            </span>
          </div>
        </div>
      </div>

      {/* Switch */}
      {gameState.circuitComplete && (
        <div className="text-center">
          <button
            onClick={toggleSwitch}
            disabled={gameState.gameResult !== "none"}
            className={`relative w-24 h-12 rounded-full transition-all ${
              gameState.switchOn
                ? "bg-green-500 shadow-lg shadow-green-500"
                : "bg-gray-600"
            }`}
          >
            <div className="absolute inset-1 flex items-center justify-between px-2 text-white font-bold text-xs">
              <span>OFF</span>
              <span>ON</span>
            </div>
            <div
              className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                gameState.switchOn ? "translate-x-12" : ""
              }`}
            />
          </button>
          <div className="text-xs text-muted-foreground mt-2">
            Flip the switch to turn on the light!
          </div>
        </div>
      )}

      {/* Bulb Status */}
      <div className="text-center">
        <div className="text-6xl">
          {gameState.switchOn && gameState.circuitComplete ? "💡" : "🌑"}
        </div>
        <div className="text-sm text-muted-foreground mt-2">
          {gameState.switchOn && gameState.circuitComplete
            ? "Light is ON!"
            : "Light is OFF"}
        </div>
      </div>

      {/* Win State */}
      {gameState.gameResult === "won" && (
        <div className="bg-green-100 dark:bg-green-900 rounded-lg p-4 text-center border-2 border-green-500">
          <div className="text-4xl mb-2">🎉</div>
          <div className="font-bold text-lg text-green-800 dark:text-green-200">
            Circuit Complete!
          </div>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
            Electricity flows and the light is on!
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
        💡 "Electricity needs a complete loop to flow!"
      </div>
    </div>
  );

  if (gameState.isFullscreen) {
    return (
      <div className="fixed inset-0 bg-background z-50 p-4 flex flex-col overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">
            🔌 Circuit Builder
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
            <DialogTitle>🔌 Circuit Builder</DialogTitle>
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
