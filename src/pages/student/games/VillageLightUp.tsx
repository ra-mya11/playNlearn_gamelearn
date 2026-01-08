import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { ConceptIntroPopup } from "@/components/ui/concept-intro-popup";
import { GameCompletionPopup } from "@/components/ui/game-completion-popup";
import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface WireTile {
  id: number;
  row: number;
  col: number;
  rotation: number;
  type: "straight" | "corner";
}

const GAME_WIDTH = 800;
const GAME_HEIGHT = 500;
const GRID_SIZE = 70;
const COLS = 4;
const ROWS = 4;
const TILE_SIZE = 60;

// Correct circuit path (L-shaped)
const CORRECT_CIRCUIT = [
  { row: 0, col: 1, type: "straight" as const, rotation: 0 },
  { row: 0, col: 2, type: "straight" as const, rotation: 0 },
  { row: 0, col: 3, type: "corner" as const, rotation: 90 },
  { row: 1, col: 3, type: "straight" as const, rotation: 90 },
  { row: 2, col: 3, type: "corner" as const, rotation: 180 },
  { row: 2, col: 2, type: "straight" as const, rotation: 0 },
  { row: 2, col: 1, type: "straight" as const, rotation: 0 },
  { row: 2, col: 0, type: "corner" as const, rotation: 270 },
  { row: 1, col: 0, type: "straight" as const, rotation: 90 },
];

export default function VillageLightUp() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [tiles, setTiles] = useState<WireTile[]>(
    Array.from({ length: COLS * ROWS }, (_, i) => {
      const row = Math.floor(i / COLS);
      const col = i % COLS;
      const correct = CORRECT_CIRCUIT.find((c) => c.row === row && c.col === col);

      if (correct) {
        return {
          id: i,
          row,
          col,
          rotation: (Math.random() > 0.5 ? correct.rotation + 90 : correct.rotation + 270) % 360,
          type: correct.type,
        };
      }

      return {
        id: i,
        row,
        col,
        rotation: Math.random() * 360,
        type: Math.random() > 0.5 ? "straight" : "corner",
      };
    })
  );
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [circuitComplete, setCircuitComplete] = useState(false);
  const [hints, setHints] = useState(0);

  const rotateTile = (id: number) => {
    setTiles((prev) =>
      prev.map((tile) =>
        tile.id === id
          ? { ...tile, rotation: (tile.rotation + 90) % 360 }
          : tile
      )
    );
    setSelectedTile(id);
    setAttempts((prev) => prev + 1);
  };

  const checkCircuit = () => {
    return CORRECT_CIRCUIT.every((correct) => {
      const tile = tiles.find((t) => t.row === correct.row && t.col === correct.col);
      return tile && tile.rotation === correct.rotation && tile.type === correct.type;
    });
  };

  useEffect(() => {
    if (checkCircuit()) {
      setCircuitComplete(true);
    } else {
      setCircuitComplete(false);
    }
  }, [tiles]);

  const getTileX = (col: number) => 150 + col * GRID_SIZE + GRID_SIZE / 2;
  const getTileY = (row: number) => 100 + row * GRID_SIZE + GRID_SIZE / 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Night sky background
    ctx.fillStyle = "#0a0e27";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Stars
    ctx.fillStyle = "#FFD700";
    for (let i = 0; i < 40; i++) {
      const x = (i * 59) % GAME_WIDTH;
      const y = (i * 37) % 80;
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Title
    ctx.fillStyle = "#FFF";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Connect the circuit to light up the village", GAME_WIDTH / 2, 30);

    // ===== BATTERY (START POINT) =====
    const batteryX = 80;
    const batteryY = 100 + GRID_SIZE / 2;

    ctx.fillStyle = "#FF0000";
    ctx.fillRect(batteryX - 15, batteryY - 25, 30, 50);
    ctx.fillStyle = "#FFF";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("+", batteryX, batteryY + 5);

    ctx.fillStyle = "#FFF";
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.fillText("BATTERY", batteryX, batteryY + 40);

    // ===== GRID BACKGROUND =====
    ctx.strokeStyle = "rgba(100, 150, 255, 0.15)";
    ctx.lineWidth = 1;
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const x = getTileX(col);
        const y = getTileY(row);
        ctx.strokeRect(x - TILE_SIZE / 2, y - TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);
      }
    }

    // ===== DRAW TILES =====
    tiles.forEach((tile) => {
      const x = getTileX(tile.col);
      const y = getTileY(tile.row);
      const isSelected = selectedTile === tile.id;
      const isCorrect =
        CORRECT_CIRCUIT.some(
          (c) => c.row === tile.row && c.col === tile.col && c.rotation === tile.rotation
        );

      // Tile background
      ctx.fillStyle = isSelected ? "#4a90e2" : isCorrect ? "#22c55e" : "#1a2a4a";
      ctx.fillRect(x - TILE_SIZE / 2, y - TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);

      // Tile border
      ctx.strokeStyle = isSelected ? "#FFF" : isCorrect ? "#22c55e" : "rgba(100, 150, 255, 0.3)";
      ctx.lineWidth = isSelected ? 3 : isCorrect ? 2 : 1;
      ctx.strokeRect(x - TILE_SIZE / 2, y - TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);

      // Draw wire pattern
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((tile.rotation * Math.PI) / 180);

      ctx.strokeStyle = isCorrect ? "#22c55e" : "#FFD700";
      ctx.lineWidth = 4;

      if (tile.type === "straight") {
        // Horizontal line
        ctx.beginPath();
        ctx.moveTo(-20, 0);
        ctx.lineTo(20, 0);
        ctx.stroke();

        // Connection points
        ctx.fillStyle = isCorrect ? "#22c55e" : "#FFD700";
        ctx.beginPath();
        ctx.arc(-20, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(20, 0, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Corner line (L-shaped)
        ctx.beginPath();
        ctx.moveTo(-20, 0);
        ctx.lineTo(0, 0);
        ctx.lineTo(0, -20);
        ctx.stroke();

        // Connection points
        ctx.fillStyle = isCorrect ? "#22c55e" : "#FFD700";
        ctx.beginPath();
        ctx.arc(-20, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, -20, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    // ===== LIGHT BULB (END POINT) =====
    const bulbX = GAME_WIDTH - 80;
    const bulbY = 100 + GRID_SIZE / 2;

    if (circuitComplete) {
      // Glowing bulb
      ctx.fillStyle = "rgba(255, 215, 0, 0.4)";
      ctx.beginPath();
      ctx.arc(bulbX, bulbY, 35, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(255, 215, 0, 0.6)";
      ctx.beginPath();
      ctx.arc(bulbX, bulbY, 25, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = circuitComplete ? "#FFD700" : "#444";
    ctx.beginPath();
    ctx.arc(bulbX, bulbY, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#888";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#FFF";
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.fillText("💡", bulbX - 1, bulbY + 3);

    ctx.fillStyle = "#FFF";
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.fillText("LIGHT", bulbX, bulbY + 40);

    // ===== ANIMATED ELECTRICITY FLOW =====
    if (circuitComplete) {
      const pathOffset = (Date.now() / 30) % 100;

      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.lineDashOffset = -pathOffset;
      ctx.globalAlpha = 0.8;

      // Draw circuit path
      ctx.beginPath();
      ctx.moveTo(batteryX + 15, batteryY);

      // Follow the correct circuit
      CORRECT_CIRCUIT.forEach((pos, index) => {
        const x = getTileX(pos.col);
        const y = getTileY(pos.row);
        if (index === 0) {
          ctx.lineTo(x - TILE_SIZE / 2, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.lineTo(bulbX - 15, bulbY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      // Sparkling effect on the path
      for (let i = 0; i < 5; i++) {
        const t = ((Date.now() / 60 + i * 0.2) % 1);
        ctx.fillStyle = `rgba(255, 215, 0, ${0.5 * (1 - Math.abs(t - 0.5) * 2)})`;
        const pathIdx = Math.floor(t * CORRECT_CIRCUIT.length);
        if (pathIdx < CORRECT_CIRCUIT.length) {
          const pos = CORRECT_CIRCUIT[pathIdx];
          const x = getTileX(pos.col);
          const y = getTileY(pos.row);
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // ===== STATUS MESSAGE =====
    ctx.fillStyle = circuitComplete ? "#22c55e" : "#FF6B6B";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      circuitComplete ? "✓ CIRCUIT COMPLETE!" : "Circuit Broken",
      GAME_WIDTH / 2,
      GAME_HEIGHT - 30
    );

    if (circuitComplete) {
      ctx.fillStyle = "#FFD700";
      ctx.font = "14px Arial";
      ctx.fillText("Electricity is flowing!", GAME_WIDTH / 2, GAME_HEIGHT - 5);
    } else if (attempts > 8 && hints === 0) {
      ctx.fillStyle = "#FFA500";
      ctx.font = "12px Arial";
      ctx.fillText("Tip: Look for the green-glowing tiles!", GAME_WIDTH / 2, GAME_HEIGHT - 5);
    }
  }, [tiles, selectedTile, circuitComplete, attempts, hints]);

  const handleStart = () => {
    setShowTutorial(false);
  };

  const handleGoBack = () => {
    navigate("/student/physics");
  };

  const handleExitFullscreen = () => {
    setIsFullscreen(false);
  };

  const handleReset = () => {
    setTiles(
      Array.from({ length: COLS * ROWS }, (_, i) => {
        const row = Math.floor(i / COLS);
        const col = i % COLS;
        const correct = CORRECT_CIRCUIT.find((c) => c.row === row && c.col === col);

        if (correct) {
          return {
            id: i,
            row,
            col,
            rotation: (Math.random() > 0.5 ? correct.rotation + 90 : correct.rotation + 270) % 360,
            type: correct.type,
          };
        }

        return {
          id: i,
          row,
          col,
          rotation: Math.random() * 360,
          type: Math.random() > 0.5 ? "straight" : "corner",
        };
      })
    );
    setAttempts(0);
    setShowCompletion(false);
  };

  const gameContainer = (
    <div
      className={cn(
        "flex flex-col items-center justify-center transition-all duration-300",
        isFullscreen ? "fixed inset-0 z-50 bg-black p-0 overflow-hidden" : "w-full bg-gray-900 p-4"
      )}
    >
      {/* Fullscreen button */}
      {!isFullscreen && (
        <div className="absolute top-4 right-4 z-10">
          <Button
            onClick={() => setIsFullscreen(true)}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <Maximize2 className="w-4 h-4" />
            Full Screen
          </Button>
        </div>
      )}

      {isFullscreen && (
        <Button
          onClick={() => setIsFullscreen(false)}
          size="sm"
          variant="outline"
          className="absolute top-4 right-4 z-10 gap-2 bg-white hover:bg-gray-100"
        >
          <Minimize2 className="w-4 h-4" />
          Exit
        </Button>
      )}

      {/* Canvas */}
      <div className={cn(
        "rounded-lg border-2 border-yellow-500 shadow-lg bg-gray-950 overflow-hidden",
        isFullscreen ? "w-screen h-screen" : "w-full max-w-4xl"
      )}>
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="w-full h-full cursor-pointer"
          onClick={(e) => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Find clicked tile
            tiles.forEach((tile) => {
              const tileX = getTileX(tile.col);
              const tileY = getTileY(tile.row);
              const dist = Math.sqrt((x - tileX) ** 2 + (y - tileY) ** 2);
              if (dist < TILE_SIZE / 2) {
                rotateTile(tile.id);
              }
            });
          }}
        />
      </div>

      {/* Controls */}
      {!isFullscreen && (
        <div className="mt-6 w-full max-w-4xl bg-gray-800 p-6 rounded-lg border border-yellow-500 shadow-md">
          <div className="space-y-6">
            <div className="text-white text-center">
              <p className="text-sm mb-2 font-semibold">
                Click tiles to rotate them. Complete the circuit to light up the bulb!
              </p>
              <p className="text-xs text-gray-400">
                Green glow = correct rotation | Yellow electricity = circuit active
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-gray-700 rounded-lg text-white text-center">
              <div>
                <div className="text-xs text-gray-400">Rotations</div>
                <div className="text-2xl font-bold text-yellow-400">{attempts}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Correct Tiles</div>
                <div className="text-2xl font-bold text-green-400">
                  {tiles.filter((t) => {
                    const correct = CORRECT_CIRCUIT.find((c) => c.row === t.row && c.col === t.col);
                    return correct && t.rotation === correct.rotation;
                  }).length}
                  /{COLS * ROWS}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Status</div>
                <div className="text-2xl font-bold" style={{ color: circuitComplete ? "#22c55e" : "#FF6B6B" }}>
                  {circuitComplete ? "✓" : "✗"}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleReset}
                variant="outline"
                className="text-yellow-400 border-yellow-500 hover:bg-yellow-500 hover:text-black font-bold"
              >
                🔄 Reset
              </Button>
              <Button
                onClick={() => setShowCompletion(true)}
                disabled={!circuitComplete}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold disabled:opacity-50"
              >
                ✅ Check Circuit
              </Button>
            </div>

            {attempts > 8 && hints === 0 && (
              <Button
                onClick={() => setHints(1)}
                variant="outline"
                className="w-full text-orange-400 border-orange-400 hover:bg-orange-400 hover:text-black font-bold"
              >
                💡 Show Hint
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Embedded Info */}
      {!isFullscreen && (
        <div className="mt-6 w-full max-w-4xl bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-800 mb-2">📘 Concept</h3>
              <p className="text-sm text-gray-700">
                Electricity needs a complete, unbroken loop to flow. If the circuit is broken anywhere, electricity stops!
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">🕹 How to Play</h3>
              <p className="text-sm text-gray-700">
                Click on wire tiles to rotate them. Connect all tiles to create an unbroken path from the battery to the bulb.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">🧠 What You Learn</h3>
              <p className="text-sm text-gray-700">
                Circuits must form a closed loop. Broken paths = no electricity. Complete loop = electricity flows and lights work!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <AppLayout>
      <ConceptIntroPopup
        isOpen={showTutorial}
        onStart={handleStart}
        onGoBack={handleGoBack}
        conceptName="Village Light-Up"
        whatYouWillUnderstand="Learn how electricity flows in closed circuits. A broken path = no light!"
        gameSteps={[
          "Look at the battery (red box) and light bulb",
          "Click on wire tiles to rotate them",
          "Create a complete path from battery to bulb",
          "When all tiles are correct, electricity flows!",
        ]}
        successMeaning="When all wires connect perfectly, you'll see yellow electricity flowing and the bulb will light up!"
        icon="💡"
      />

      <GameCompletionPopup
        isOpen={showCompletion && circuitComplete}
        onPlayAgain={handleReset}
        onExitFullscreen={handleExitFullscreen}
        onBackToGames={handleGoBack}
        learningOutcome="You mastered circuits! Electricity needs a complete, unbroken loop to flow. Broken paths = no power. Closed loops = power!"
        isFullscreen={isFullscreen}
      />

      <div className="py-6">
        <div className="mb-4 flex items-center gap-2">
          <Button
            onClick={handleGoBack}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Physics
          </Button>
        </div>

        {gameContainer}
      </div>
    </AppLayout>
  );
}
