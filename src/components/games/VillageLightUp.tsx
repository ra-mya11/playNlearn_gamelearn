import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RotateCcw, Maximize2, X } from "lucide-react";

type WireType = "straight" | "L" | "T" | "cross" | "end";
type Direction = "up" | "down" | "left" | "right";

interface WireTile {
  id: string;
  type: WireType;
  rotation: number;
  x: number;
  y: number;
  connections: Direction[];
}

interface GameState {
  tiles: WireTile[];
  powered: Set<string>;
  isFullscreen: boolean;
  gameResult: "none" | "won" | "lost";
}

export function VillageLightUp({ onClose }: { onClose: () => void }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>({
    tiles: [],
    powered: new Set(),
    isFullscreen: false,
    gameResult: "none",
  });

  const levels = [
    {
      gridSize: 3,
      targetTiles: ["1", "2"],
      initialTiles: [
        { id: "0", type: "end" as const, x: 0, y: 1, rotation: 0 },
        { id: "1", type: "straight", x: 1, y: 1, rotation: 0 },
        { id: "2", type: "L", x: 2, y: 1, rotation: 0 },
      ],
    },
    {
      gridSize: 4,
      targetTiles: ["1", "2", "3"],
      initialTiles: [
        { id: "0", type: "end" as const, x: 0, y: 1, rotation: 0 },
        { id: "1", type: "straight", x: 1, y: 1, rotation: 0 },
        { id: "2", type: "T", x: 2, y: 1, rotation: 0 },
        { id: "3", type: "straight", x: 3, y: 2, rotation: 90 },
      ],
    },
    {
      gridSize: 5,
      targetTiles: ["1", "2", "3", "4"],
      initialTiles: [
        { id: "0", type: "end" as const, x: 0, y: 2, rotation: 0 },
        { id: "1", type: "straight", x: 1, y: 2, rotation: 0 },
        { id: "2", type: "L", x: 2, y: 2, rotation: 0 },
        { id: "3", type: "straight", x: 2, y: 3, rotation: 90 },
        { id: "4", type: "L", x: 3, y: 3, rotation: 180 },
      ],
    },
  ];

  const level = levels[currentLevel];

  useEffect(() => {
    if (gameStarted && currentLevel < levels.length) {
      initializeLevel();
    }
  }, [currentLevel, gameStarted]);

  const initializeLevel = () => {
    const tiles: WireTile[] = level.initialTiles.map((tile) => ({
      ...tile,
      connections: getConnections(tile.type, tile.rotation),
    }));
    setGameState({
      tiles,
      powered: new Set(),
      isFullscreen: gameState.isFullscreen,
      gameResult: "none",
    });
    checkPowerFlow(tiles);
  };

  const getConnections = (type: WireType, rotation: number): Direction[] => {
    const baseConnections: Record<WireType, Direction[]> = {
      straight: ["left", "right"],
      L: ["up", "right"],
      T: ["up", "right", "left"],
      cross: ["up", "down", "left", "right"],
      end: ["right"],
    };

    let connections = baseConnections[type];
    const rotations = Math.floor(rotation / 90) % 4;

    for (let i = 0; i < rotations; i++) {
      connections = connections.map((dir) => {
        const map: Record<Direction, Direction> = {
          up: "right",
          right: "down",
          down: "left",
          left: "up",
        };
        return map[dir];
      });
    }

    return connections;
  };

  const rotate = (tileId: string) => {
    if (gameState.gameResult !== "none") return;

    const newTiles = gameState.tiles.map((tile) => {
      if (tile.id === tileId) {
        const newRotation = (tile.rotation + 90) % 360;
        return {
          ...tile,
          rotation: newRotation,
          connections: getConnections(tile.type, newRotation),
        };
      }
      return tile;
    });

    setGameState({ ...gameState, tiles: newTiles });
    checkPowerFlow(newTiles);
  };

  const checkPowerFlow = (tiles: WireTile[]) => {
    const powered = new Set<string>();
    const queue: string[] = ["0"];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);
      powered.add(currentId);

      const current = tiles.find((t) => t.id === currentId)!;
      const directions = current.connections;

      directions.forEach((dir) => {
        const next = getAdjacentTile(tiles, current.x, current.y, dir);
        if (next && !visited.has(next.id)) {
          const reverseDir = getReverseDirection(dir);
          if (next.connections.includes(reverseDir)) {
            queue.push(next.id);
          }
        }
      });
    }

    setGameState((prev) => ({ ...prev, powered }));

    const allTargetsPowered = level.targetTiles.every((id) => powered.has(id));
    if (allTargetsPowered) {
      setGameState((prev) => ({ ...prev, gameResult: "won" }));
    }
  };

  const getAdjacentTile = (
    tiles: WireTile[],
    x: number,
    y: number,
    direction: Direction
  ): WireTile | undefined => {
    const coords: Record<Direction, [number, number]> = {
      up: [x, y - 1],
      down: [x, y + 1],
      left: [x - 1, y],
      right: [x + 1, y],
    };

    const [newX, newY] = coords[direction];
    return tiles.find((t) => t.x === newX && t.y === newY);
  };

  const getReverseDirection = (dir: Direction): Direction => {
    const map: Record<Direction, Direction> = {
      up: "down",
      down: "up",
      left: "right",
      right: "left",
    };
    return map[dir];
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
            <DialogTitle>⚡ Village Light-Up</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-semibold">🔌 Concept: Electrical Circuits</h3>
              <p className="text-sm text-muted-foreground">
                Electricity flows only through complete circuits where all connections link together.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🎮 How To Play</h3>
              <p className="text-sm text-muted-foreground">
                Tap wire tiles to rotate them. Connect all wires from the generator to light up the village!
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🏆 What Success Means</h3>
              <p className="text-sm text-muted-foreground">
                All houses glow when the circuit is complete and electricity flows through.
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
      <div className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-lg p-4 text-center">
        <div className="text-sm text-muted-foreground mb-2">🌙 Village Festival Night</div>
        <div className="text-lg font-bold text-primary">
          Level {currentLevel + 1}/{levels.length}
        </div>
      </div>

      {/* Grid */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg p-6">
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(5, 1fr)` }}>
          {gameState.tiles.map((tile) => (
            <button
              key={tile.id}
              onClick={() => rotate(tile.id)}
              disabled={gameState.gameResult !== "none"}
              className={`aspect-square rounded-lg border-2 transition-all flex items-center justify-center cursor-pointer ${
                gameState.powered.has(tile.id)
                  ? "bg-yellow-400 border-yellow-500 shadow-lg shadow-yellow-400"
                  : "bg-gray-700 border-gray-600 hover:bg-gray-600"
              }`}
              style={{ transform: `rotate(${tile.rotation}deg)` }}
            >
              {tile.type === "straight" && <div className="w-1 h-8 bg-gray-500" />}
              {tile.type === "L" && (
                <div className="relative w-8 h-8">
                  <div className="absolute top-0 left-1/2 w-1 h-4 bg-gray-500 transform -translate-x-1/2" />
                  <div className="absolute top-1/2 left-1/2 w-4 h-1 bg-gray-500 transform -translate-x-1/2" />
                </div>
              )}
              {tile.type === "T" && (
                <div className="relative w-8 h-8">
                  <div className="absolute top-0 left-1/2 w-1 h-4 bg-gray-500 transform -translate-x-1/2" />
                  <div className="absolute top-1/2 left-0 w-8 h-1 bg-gray-500 transform -translate-y-1/2" />
                </div>
              )}
              {tile.type === "cross" && (
                <div className="relative w-8 h-8">
                  <div className="absolute top-0 left-1/2 w-1 h-8 bg-gray-500 transform -translate-x-1/2" />
                  <div className="absolute top-1/2 left-0 w-8 h-1 bg-gray-500 transform -translate-y-1/2" />
                </div>
              )}
              {tile.type === "end" && (
                <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-red-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="bg-card rounded-lg p-4 text-center border border-muted">
        <div className="text-sm font-semibold text-muted-foreground mb-2">
          💡 Houses Lit: {gameState.powered.size} / {level.targetTiles.length + 1}
        </div>
        {gameState.gameResult === "none" && (
          <p className="text-xs text-muted-foreground">
            Tap wires to rotate and create a complete path
          </p>
        )}
      </div>

      {/* Win State */}
      {gameState.gameResult === "won" && (
        <div className="bg-green-100 dark:bg-green-900 rounded-lg p-4 text-center border-2 border-green-500">
          <div className="text-4xl mb-2">🎉</div>
          <div className="font-bold text-lg text-green-800 dark:text-green-200">
            Festival Lights On!
          </div>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
            Perfect circuit! Electricity flows through all houses!
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
        💡 "Electricity needs a complete path to flow!"
      </div>
    </div>
  );

  if (gameState.isFullscreen) {
    return (
      <div className="fixed inset-0 bg-background z-50 p-4 flex flex-col overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">
            ⚡ Village Light-Up
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
            <DialogTitle>⚡ Village Light-Up</DialogTitle>
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
