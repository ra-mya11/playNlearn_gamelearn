import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RotateCcw, Maximize2, X } from "lucide-react";

interface Device {
  id: string;
  type: "computer" | "phone" | "router" | "server";
  name: string;
  connected: boolean;
  x: number;
  y: number;
}

interface GameState {
  devices: Device[];
  connectedPairs: Set<string>;
  isFullscreen: boolean;
  gameResult: "none" | "won" | "lost";
}

export function NetworkBuilder({ onClose }: { onClose: () => void }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>({
    devices: [],
    connectedPairs: new Set(),
    isFullscreen: false,
    gameResult: "none",
  });

  const levels = [
    {
      title: "Simple Network",
      devices: [
        { id: "c1", type: "computer" as const, name: "PC1", x: 20, y: 30 },
        { id: "r1", type: "router" as const, name: "Router", x: 50, y: 30 },
        { id: "c2", type: "computer" as const, name: "PC2", x: 80, y: 30 },
      ],
      requiredConnections: [["c1", "r1"], ["c2", "r1"]],
    },
    {
      title: "Multi-Device Network",
      devices: [
        { id: "c1", type: "computer" as const, name: "PC", x: 20, y: 25 },
        { id: "p1", type: "phone" as const, name: "Phone", x: 20, y: 55 },
        { id: "r1", type: "router" as const, name: "Router", x: 50, y: 40 },
        { id: "s1", type: "server" as const, name: "Server", x: 80, y: 40 },
      ],
      requiredConnections: [["c1", "r1"], ["p1", "r1"], ["r1", "s1"]],
    },
    {
      title: "Full Network",
      devices: [
        { id: "c1", type: "computer" as const, name: "PC1", x: 10, y: 20 },
        { id: "c2", type: "computer" as const, name: "PC2", x: 10, y: 60 },
        { id: "p1", type: "phone" as const, name: "Phone", x: 50, y: 60 },
        { id: "r1", type: "router" as const, name: "Router", x: 50, y: 40 },
        { id: "s1", type: "server" as const, name: "Server", x: 90, y: 40 },
      ],
      requiredConnections: [
        ["c1", "r1"],
        ["c2", "r1"],
        ["p1", "r1"],
        ["r1", "s1"],
      ],
    },
  ];

  const level = levels[currentLevel];

  useEffect(() => {
    if (gameStarted && currentLevel < levels.length) {
      setGameState({
        devices: level.devices,
        connectedPairs: new Set(),
        isFullscreen: gameState.isFullscreen,
        gameResult: "none",
      });
    }
  }, [currentLevel, gameStarted]);

  const connectDevices = (device1Id: string, device2Id: string) => {
    if (gameState.gameResult !== "none") return;

    const pair = [device1Id, device2Id].sort().join("-");
    const newConnections = new Set(gameState.connectedPairs);

    if (newConnections.has(pair)) {
      newConnections.delete(pair);
    } else {
      newConnections.add(pair);
    }

    setGameState({
      ...gameState,
      connectedPairs: newConnections,
    });

    // Check if all required connections are made
    const allRequired = level.requiredConnections.every((conn) => {
      const sortedConn = conn.sort().join("-");
      return newConnections.has(sortedConn);
    });

    if (allRequired) {
      setGameState((prev) => ({
        ...prev,
        gameResult: "won",
      }));
    }
  };

  const isConnected = (device1Id: string, device2Id: string): boolean => {
    const pair = [device1Id, device2Id].sort().join("-");
    return gameState.connectedPairs.has(pair);
  };

  const handleRetry = () => {
    setGameState({
      devices: level.devices,
      connectedPairs: new Set(),
      isFullscreen: gameState.isFullscreen,
      gameResult: "none",
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
            <DialogTitle>🌐 Network Builder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-semibold">🔗 Concept: Networking & Communication</h3>
              <p className="text-sm text-muted-foreground">
                Devices communicate only through proper network connections.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🎮 How To Play</h3>
              <p className="text-sm text-muted-foreground">
                Click on devices to connect them. Build a network where all devices can communicate!
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🏆 What Success Means</h3>
              <p className="text-sm text-muted-foreground">
                All devices are properly connected and data can flow through the network.
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
      <div className="bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900 dark:to-blue-900 rounded-lg p-4 text-center">
        <div className="text-sm text-muted-foreground mb-2">Level {currentLevel + 1}/{levels.length}</div>
        <div className="text-lg font-bold text-primary">{level.title}</div>
      </div>

      {/* Network Canvas */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-6 relative h-64 border-2 border-gray-700">
        {/* Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <defs>
            <pattern
              id="grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Connections */}
        <svg className="absolute inset-0 w-full h-full z-0">
          {gameState.connectedPairs.map((pair) => {
            const [id1, id2] = pair.split("-");
            const dev1 = gameState.devices.find((d) => d.id === id1)!;
            const dev2 = gameState.devices.find((d) => d.id === id2)!;

            const x1 = (dev1.x / 100) * 100 + "%";
            const y1 = (dev1.y / 100) * 100 + "%";
            const x2 = (dev2.x / 100) * 100 + "%";
            const y2 = (dev2.y / 100) * 100 + "%";

            return (
              <line
                key={pair}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#10b981"
                strokeWidth="2"
                className="animate-pulse"
              />
            );
          })}
        </svg>

        {/* Devices */}
        <div className="absolute inset-0 pointer-events-none">
          {gameState.devices.map((device) => (
            <button
              key={device.id}
              onClick={() => {
                // Create a simple connection interface
              }}
              className="absolute pointer-events-auto w-16 h-16 flex flex-col items-center justify-center bg-card rounded-lg border-2 border-muted hover:border-primary transition-all cursor-pointer"
              style={{
                left: `calc(${device.x}% - 32px)`,
                top: `calc(${device.y}% - 32px)`,
              }}
              title={device.name}
            >
              <span className="text-2xl">
                {device.type === "computer" && "💻"}
                {device.type === "phone" && "📱"}
                {device.type === "router" && "🔄"}
                {device.type === "server" && "🖥️"}
              </span>
              <span className="text-xs text-center mt-1 font-semibold">
                {device.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Connection Grid */}
      <div className="space-y-2">
        <div className="text-sm font-semibold text-muted-foreground">
          🔗 Make Connections
        </div>
        <div className="space-y-2">
          {gameState.devices.map((device1, idx) =>
            gameState.devices.slice(idx + 1).map((device2) => (
              <button
                key={`${device1.id}-${device2.id}`}
                onClick={() => connectDevices(device1.id, device2.id)}
                disabled={gameState.gameResult !== "none"}
                className={`w-full p-3 rounded-lg transition-all text-left font-semibold ${
                  isConnected(device1.id, device2.id)
                    ? "bg-green-500 text-white shadow-lg shadow-green-500"
                    : "bg-card border-2 border-muted hover:border-primary"
                }`}
              >
                {isConnected(device1.id, device2.id) && "✓ "}
                {device1.name} ↔ {device2.name}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="bg-card rounded-lg p-4 border border-muted">
        <div className="text-sm font-semibold text-muted-foreground mb-2">
          📊 Connections Made
        </div>
        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
          <div
            className="bg-secondary h-full transition-all"
            style={{
              width: `${(gameState.connectedPairs.size / level.requiredConnections.length) * 100}%`,
            }}
          />
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          {gameState.connectedPairs.size} / {level.requiredConnections.length}
        </div>
      </div>

      {/* Win State */}
      {gameState.gameResult === "won" && (
        <div className="bg-green-100 dark:bg-green-900 rounded-lg p-4 text-center border-2 border-green-500">
          <div className="text-4xl mb-2">🎉</div>
          <div className="font-bold text-lg text-green-800 dark:text-green-200">
            Network Complete!
          </div>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
            All devices connected! Data flows freely!
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
        💡 "Communication needs proper structure!"
      </div>
    </div>
  );

  if (gameState.isFullscreen) {
    return (
      <div className="fixed inset-0 bg-background z-50 p-4 flex flex-col overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">
            🌐 Network Builder
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
            <DialogTitle>🌐 Network Builder</DialogTitle>
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
