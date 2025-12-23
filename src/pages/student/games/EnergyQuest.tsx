import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { ConceptIntroPopup } from "@/components/ui/concept-intro-popup";
import { GameCompletionPopup } from "@/components/ui/game-completion-popup";
import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface GameState {
  waterLevel: number;
  turbineSpeed: number;
  powerGenerated: number;
  housesLit: number;
  gameTime: number;
  flowRate: number;
}

const GAME_WIDTH = 800;
const GAME_HEIGHT = 500;
const MAX_HOUSES = 4;
const WIN_CONDITION = 3; // Light up 3 houses

export default function EnergyQuest() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    waterLevel: 80,
    turbineSpeed: 0,
    powerGenerated: 0,
    housesLit: 0,
    gameTime: 0,
    flowRate: 0,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const animationRef = useRef<number | null>(null);

  const releaseWater = () => {
    setGameState((prev) => ({
      ...prev,
      flowRate: 5,
    }));
    setIsRunning(true);
    setAttempts((prev) => prev + 1);
  };

  const stopWater = () => {
    setGameState((prev) => ({
      ...prev,
      flowRate: 0,
    }));
  };

  const adjustFlow = (amount: number) => {
    setGameState((prev) => ({
      ...prev,
      flowRate: Math.max(0, Math.min(10, prev.flowRate + amount)),
    }));
  };

  // Physics simulation
  useEffect(() => {
    if (!isRunning && gameState.flowRate === 0) return;

    const animate = () => {
      setGameState((prev) => {
        let newState = { ...prev };

        // Water physics
        newState.waterLevel = Math.max(0, newState.waterLevel - newState.flowRate * 0.5);

        // Turbine speed depends on flow
        newState.turbineSpeed = newState.flowRate * 8;

        // Power generation
        newState.powerGenerated = Math.max(0, newState.turbineSpeed * 2);

        // Determine houses lit
        if (newState.powerGenerated > 20) {
          newState.housesLit = 1;
        }
        if (newState.powerGenerated > 40) {
          newState.housesLit = 2;
        }
        if (newState.powerGenerated > 60) {
          newState.housesLit = 3;
        }
        if (newState.powerGenerated > 80) {
          newState.housesLit = 4;
        }

        // Stop if water runs out
        if (newState.waterLevel <= 0) {
          newState.waterLevel = 0;
          newState.flowRate = 0;
          newState.turbineSpeed = 0;
          newState.powerGenerated = Math.max(0, newState.powerGenerated - 5);
          return newState;
        }

        // Energy loss over time
        newState.powerGenerated = Math.max(0, newState.powerGenerated - 1);

        return newState;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, gameState.flowRate]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Sky
    ctx.fillStyle = gameState.housesLit >= WIN_CONDITION ? "#1a472a" : "#87CEEB";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Stars if night (won)
    if (gameState.housesLit >= WIN_CONDITION) {
      ctx.fillStyle = "#FFD700";
      for (let i = 0; i < 20; i++) {
        const x = (i * 37) % GAME_WIDTH;
        const y = (i * 23) % 100;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Water Tank
    const tankX = 50;
    const tankY = 150;
    const tankWidth = 80;
    const tankHeight = 150;

    ctx.fillStyle = "#34495e";
    ctx.fillRect(tankX, tankY, tankWidth, tankHeight);
    ctx.strokeStyle = "#2c3e50";
    ctx.lineWidth = 2;
    ctx.strokeRect(tankX, tankY, tankWidth, tankHeight);

    // Water inside tank
    const waterHeight = (gameState.waterLevel / 100) * tankHeight;
    ctx.fillStyle = "#3498db";
    ctx.fillRect(tankX, tankY + tankHeight - waterHeight, tankWidth, waterHeight);

    // Water percentage text
    ctx.fillStyle = "#FFF";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`${Math.round(gameState.waterLevel)}%`, tankX + tankWidth / 2, tankY + tankHeight + 20);

    // Pipe from tank to turbine
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(tankX + tankWidth, tankY + 100);
    ctx.quadraticCurveTo(200, 120, 250, 200);
    ctx.stroke();

    // Flow indicator
    if (gameState.flowRate > 0) {
      ctx.fillStyle = "rgba(52, 152, 219, 0.7)";
      for (let i = 0; i < gameState.flowRate; i++) {
        const offset = (Date.now() / 10) % 100;
        const x = 150 + ((offset + i * 20) % 150);
        const y = 150 + (x - 150) * 0.67;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Turbine
    const turbineX = 350;
    const turbineY = 250;
    const turbineRadius = 40;

    ctx.fillStyle = "#e74c3c";
    ctx.beginPath();
    ctx.arc(turbineX, turbineY, turbineRadius, 0, Math.PI * 2);
    ctx.fill();

    // Turbine blades
    ctx.strokeStyle = "#c0392b";
    ctx.lineWidth = 3;
    const bladeAngle = (gameState.gameTime * gameState.turbineSpeed) % (Math.PI * 2);
    for (let i = 0; i < 3; i++) {
      const angle = bladeAngle + (i * Math.PI * 2) / 3;
      const x = turbineX + Math.cos(angle) * turbineRadius;
      const y = turbineY + Math.sin(angle) * turbineRadius;
      ctx.beginPath();
      ctx.moveTo(turbineX, turbineY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    // Turbine label
    ctx.fillStyle = "#FFF";
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.fillText("TURBINE", turbineX, turbineY + 65);

    // Power line from turbine
    ctx.strokeStyle = "#f39c12";
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(turbineX + turbineRadius, turbineY);
    ctx.lineTo(550, turbineY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Houses
    const houseX = 600;
    const houseSpacing = 50;
    for (let i = 0; i < MAX_HOUSES; i++) {
      const x = houseX + i * houseSpacing;
      const y = 250;

      // House
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(x, y, 40, 40);

      // Roof
      ctx.fillStyle = "#D2691E";
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 20, y - 15);
      ctx.lineTo(x + 40, y);
      ctx.closePath();
      ctx.fill();

      // Door
      ctx.fillStyle = "#654321";
      ctx.fillRect(x + 15, y + 20, 10, 20);

      // Light
      const isLit = i < gameState.housesLit;
      if (isLit) {
        ctx.fillStyle = "#FFD700";
        ctx.beginPath();
        ctx.arc(x + 10, y + 10, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(255, 215, 0, 0.5)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + 10, y + 10, 12, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // House label
    ctx.fillStyle = "#000";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("VILLAGE", houseX + MAX_HOUSES * houseSpacing / 2 - 10, 310);

    // Info display
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(10, 10, 250, 100);

    ctx.fillStyle = "#FFF";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`Flow: ${gameState.flowRate.toFixed(1)} L/s`, 20, 35);
    ctx.fillText(`Turbine Speed: ${gameState.turbineSpeed.toFixed(0)} RPM`, 20, 55);
    ctx.fillText(`Power: ${gameState.powerGenerated.toFixed(0)} kW`, 20, 75);
    ctx.fillText(`Houses Lit: ${gameState.housesLit}/${MAX_HOUSES}`, 20, 95);

    // Status message
    if (gameState.housesLit >= WIN_CONDITION) {
      ctx.fillStyle = "rgba(0, 255, 0, 0.8)";
      ctx.fillRect(GAME_WIDTH / 2 - 150, GAME_HEIGHT / 2 - 40, 300, 80);
      ctx.fillStyle = "#000";
      ctx.font = "bold 28px Arial";
      ctx.textAlign = "center";
      ctx.fillText("VICTORY! 🎉", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 15);
    }
  }, [gameState]);

  useEffect(() => {
    setGameState((prev) => ({
      ...prev,
      gameTime: prev.gameTime + 1,
    }));
  }, []);

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
    setGameState({
      waterLevel: 80,
      turbineSpeed: 0,
      powerGenerated: 0,
      housesLit: 0,
      gameTime: 0,
      flowRate: 0,
    });
    setIsRunning(false);
    setShowCompletion(false);
  };

  const gameContainer = (
    <div
      className={cn(
        "flex flex-col items-center justify-center transition-all duration-300",
        isFullscreen ? "fixed inset-0 z-50 bg-black p-0" : "w-full bg-gradient-to-br from-blue-50 to-cyan-50 p-4"
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
          className="absolute top-4 right-4 z-10 gap-2 bg-white"
        >
          <Minimize2 className="w-4 h-4" />
          Exit
        </Button>
      )}

      {/* Canvas */}
      <div className={cn(
        "rounded-lg border-2 border-gray-300 shadow-lg bg-white overflow-hidden",
        isFullscreen ? "w-screen h-screen" : "w-full max-w-4xl"
      )}>
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="w-full h-full"
        />
      </div>

      {/* Controls */}
      {!isFullscreen && (
        <div className="mt-6 w-full max-w-4xl bg-white p-6 rounded-lg border border-gray-200">
          <div className="space-y-6">
            {/* Flow Control */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">
                Control Water Flow
              </label>
              <div className="flex gap-2">
                <Button
                  onClick={() => adjustFlow(-1)}
                  variant="outline"
                  className="flex-1"
                >
                  ◀ Less
                </Button>
                <div className="flex-1 bg-gray-200 rounded-lg p-3 text-center font-bold">
                  {gameState.flowRate.toFixed(1)} L/s
                </div>
                <Button
                  onClick={() => adjustFlow(1)}
                  variant="outline"
                  className="flex-1"
                >
                  More ▶
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={releaseWater}
                disabled={gameState.waterLevel < 5}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold"
              >
                💧 Release Water
              </Button>
              <Button
                onClick={stopWater}
                variant="outline"
                className="font-bold"
              >
                🛑 Stop
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-xs text-gray-600">Water Level</div>
                <div className="text-xl font-bold text-blue-600">
                  {gameState.waterLevel.toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Houses Lit</div>
                <div className="text-xl font-bold text-yellow-600">
                  {gameState.housesLit}/{MAX_HOUSES}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Turbine Speed</div>
                <div className="text-xl font-bold text-orange-600">
                  {gameState.turbineSpeed.toFixed(0)} RPM
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Power Output</div>
                <div className="text-xl font-bold text-red-600">
                  {gameState.powerGenerated.toFixed(0)} kW
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Goal Progress</span>
                <span>{gameState.housesLit}/{WIN_CONDITION}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all"
                  style={{ width: `${(gameState.housesLit / WIN_CONDITION) * 100}%` }}
                />
              </div>
            </div>

            {gameState.housesLit >= WIN_CONDITION && (
              <Button
                onClick={() => setShowCompletion(true)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold"
                size="lg"
              >
                ✅ See Results
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Embedded Info */}
      {!isFullscreen && (
        <div className="mt-6 w-full max-w-4xl bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-800 mb-2">📘 Concept</h3>
              <p className="text-sm text-gray-700">
                Energy transforms from one form to another but never disappears. Water's potential energy becomes kinetic energy in the turbine, then electrical energy!
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">🕹 How to Play</h3>
              <p className="text-sm text-gray-700">
                Control the water flow to spin the turbine. The faster it spins, the more power is generated. Light up 3 houses to win!
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">🧠 What You Learn</h3>
              <p className="text-sm text-gray-700">
                Potential energy (water height) → Kinetic energy (spinning turbine) → Electrical energy (lights) → Heat loss.
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
        conceptName="Energy Quest"
        whatYouWillUnderstand="Energy changes form but is never lost. Water → Motion → Electricity → Light!"
        gameSteps={[
          "Release water from the tank",
          "Adjust flow to spin the turbine faster",
          "Watch power being generated",
          "Light up 3 houses to complete the quest",
        ]}
        successMeaning="When all 3 houses light up, you've successfully converted water's energy into electrical energy!"
        icon="⚡"
      />

      <GameCompletionPopup
        isOpen={showCompletion && gameState.housesLit >= WIN_CONDITION}
        onPlayAgain={handleReset}
        onExitFullscreen={handleExitFullscreen}
        onBackToGames={handleGoBack}
        learningOutcome="You mastered energy transformation! You understand how potential energy becomes kinetic, then electrical energy."
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
