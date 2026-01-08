import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { GameBadge } from "@/components/ui/game-badge";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import {
  ArrowLeft,
  Zap,
  RotateCcw,
  AlertTriangle,
  Lightbulb,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface GameState {
  voltage: number;
  resistance: number;
  current: number;
  isChallenge: boolean;
  fuseBlown: boolean;
  bulbOn: boolean;
  elapsedTime: number;
  level: number;
}

export default function VoltageTrap() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>({
    voltage: 3,
    resistance: 8,
    current: 0.375,
    isChallenge: false,
    fuseBlown: false,
    bulbOn: false,
    elapsedTime: 0,
    level: 1,
  });
  const [score, setScore] = useState(0);
  const [levelsCompleted, setLevelsCompleted] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate current based on Ohm's Law: I = V/R
  const calculateCurrent = (v: number, r: number) => {
    return r > 0 ? v / r : 0;
  };

  const handleVoltageChange = (newVoltage: number) => {
    if (gameState.fuseBlown) return;

    const newCurrent = calculateCurrent(newVoltage, gameState.resistance);

    // Fuse blows if current exceeds 2.5A
    const fuseBlowsNow = newCurrent > 2.5;

    setGameState((prev) => ({
      ...prev,
      voltage: newVoltage,
      current: newCurrent,
      bulbOn: newCurrent > 0.5,
      fuseBlown: prev.fuseBlown || fuseBlowsNow,
    }));

    if (fuseBlowsNow) {
      toast({
        title: "💥 Fuse Blown!",
        description:
          "Current was too high. Lower the voltage to keep it safe.",
      });
    }
  };

  // Resistance trap trigger
  useEffect(() => {
    if (gameState.fuseBlown || gameState.isChallenge) return;

    const challengeTimer = setTimeout(() => {
      if (!gameState.isChallenge) {
        // Suddenly drop resistance
        const newResistance = 3;
        const newCurrent = calculateCurrent(gameState.voltage, newResistance);

        setGameState((prev) => ({
          ...prev,
          resistance: newResistance,
          current: newCurrent,
          isChallenge: true,
          fuseBlown: newCurrent > 2.5,
        }));

        toast({
          title: "⚠️ Resistance Changed!",
          description:
            "A component in the circuit burned out. Resistance dropped!",
        });

        if (newCurrent > 2.5) {
          toast({
            title: "💥 Fuse Blown!",
            description: "Current spiked too high. Game over.",
          });
        }
      }
    }, 3000);

    return () => clearTimeout(challengeTimer);
  }, [gameState.isChallenge, gameState.fuseBlown, gameState.voltage, gameState.resistance]);

  // Timer for successful completion
  useEffect(() => {
    if (
      gameState.isChallenge &&
      !gameState.fuseBlown &&
      gameState.current > 0.5 &&
      gameState.current <= 2.5
    ) {
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setGameState((prev) => {
            const newTime = prev.elapsedTime + 1;

            // Success after 10 seconds of safe operation
            if (newTime >= 10 && !prev.fuseBlown) {
              return {
                ...prev,
                elapsedTime: newTime,
              };
            }

            return {
              ...prev,
              elapsedTime: newTime,
            };
          });
        }, 1000);
      }
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState.isChallenge, gameState.fuseBlown, gameState.current]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 400;
    const height = 250;

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = "#f8f8f8";
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Circuit Diagram", 10, 20);

    // Wire from positive terminal
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(30, 50);
    ctx.lineTo(80, 50);
    ctx.lineTo(80, 100);
    ctx.stroke();

    // Voltage source icon
    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(10, 45, 20, 20);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("V", 20, 58);

    // Resistor symbol (zigzag)
    ctx.strokeStyle = "#8b5cf6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, 100);
    const zigzagPoints = [
      [85, 110],
      [95, 105],
      [105, 110],
      [115, 105],
      [125, 110],
    ];
    for (const [x, y] of zigzagPoints) {
      ctx.lineTo(x, y);
    }
    ctx.lineTo(130, 100);
    ctx.stroke();

    // Resistance label
    ctx.fillStyle = "#8b5cf6";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`R: ${gameState.resistance}Ω`, 105, 140);

    // Wire to bulb
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(130, 100);
    ctx.lineTo(200, 100);
    ctx.lineTo(200, 50);
    ctx.stroke();

    // Bulb
    const bulbRadius = 15;
    ctx.strokeStyle = gameState.bulbOn ? "#fbbf24" : "#d1d5db";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(220, 50, bulbRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Bulb filament
    if (gameState.bulbOn) {
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(220, 50, bulbRadius - 3, 0, Math.PI * 2);
      ctx.fill();

      // Glow
      ctx.shadowColor = "rgba(251, 191, 36, 0.6)";
      ctx.shadowBlur = 15;
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(220, 50, bulbRadius + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowColor = "transparent";
    }

    // Fuse
    const fuseX = 260;
    const fuseY = 50;
    ctx.fillStyle = gameState.fuseBlown ? "#ef4444" : "#10b981";
    ctx.fillRect(fuseX, fuseY - 5, 25, 10);
    ctx.strokeStyle = gameState.fuseBlown ? "#dc2626" : "#059669";
    ctx.lineWidth = 2;
    ctx.strokeRect(fuseX, fuseY - 5, 25, 10);

    if (gameState.fuseBlown) {
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fuseX + 5, fuseY - 3);
      ctx.lineTo(fuseX + 15, fuseY + 3);
      ctx.stroke();

      // Fuse glow
      ctx.shadowColor = "rgba(239, 68, 68, 0.7)";
      ctx.shadowBlur = 20;
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 1;
      ctx.strokeRect(fuseX - 5, fuseY - 10, 35, 20);
      ctx.shadowColor = "transparent";
    }

    ctx.fillStyle = gameState.fuseBlown ? "#ef4444" : "#10b981";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Fuse", fuseX + 12.5, 75);

    // Return wire
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(300, 50);
    ctx.lineTo(350, 50);
    ctx.lineTo(350, 150);
    ctx.lineTo(20, 150);
    ctx.lineTo(20, 65);
    ctx.stroke();

    // Current indicator
    ctx.fillStyle = "#dc2626";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      `I: ${gameState.current.toFixed(2)}A`,
      200,
      200
    );

    // Safe zone indicator
    ctx.fillStyle = gameState.current > 2.5 ? "#dc2626" : "#10b981";
    ctx.fillRect(200, 215, 30, 5);
    ctx.fillStyle = "#666";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Safe", 235, 220);
    ctx.fillText("Danger", 235, 230);
  }, [gameState]);

  const handleReset = () => {
    setGameState({
      voltage: 3,
      resistance: 8,
      current: 0.375,
      isChallenge: false,
      fuseBlown: false,
      bulbOn: false,
      elapsedTime: 0,
      level: gameState.level,
    });

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleLevelComplete = () => {
    const levelScore = gameState.isChallenge ? 120 : 50;
    setScore(score + levelScore);
    setLevelsCompleted(levelsCompleted + 1);

    toast({
      title: "🎉 Level Complete!",
      description: `You managed the current safely! +${levelScore} coins`,
    });

    // Move to next level
    setGameState({
      voltage: 3,
      resistance: gameState.level === 1 ? 6 : 4, // Harder resistance on level 2
      current: 0,
      isChallenge: false,
      fuseBlown: false,
      bulbOn: false,
      elapsedTime: 0,
      level: gameState.level + 1,
    });
  };

  const isSuccess =
    gameState.isChallenge &&
    !gameState.fuseBlown &&
    gameState.elapsedTime >= 10;

  const progressPercent = Math.min(100, (levelsCompleted / 3) * 100);

  return (
    <AppLayout role="student" playCoins={1250} title="Voltage Trap">
      <div className="px-4 py-6">
        {/* Header */}
        <div className="mb-4 slide-up">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2"
            onClick={() => navigate("/student/physics")}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Tutorial Popup */}
        {showTutorial && (
          <div className="mb-4 rounded-xl border border-accent/30 bg-accent/10 p-4 slide-up">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold mb-1">📘 What You Will Learn</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  How voltage and resistance control current flow.
                </p>
                <h4 className="font-semibold mb-1">🎯 What You Need To Do</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Turn the voltage knob to safely power the circuit.
                </p>
                <h4 className="font-semibold mb-1">🏆 What Success Looks Like</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  A glowing bulb and an intact fuse.
                </p>
                <Button size="sm" onClick={() => setShowTutorial(false)}>
                  Ready!
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Game Stats */}
        <div className="mb-4 grid grid-cols-3 gap-3 slide-up" style={{ animationDelay: "50ms" }}>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <Zap className="mx-auto mb-1 h-5 w-5 text-accent" />
            <p className="font-heading text-lg font-bold">{score}</p>
            <p className="text-xs text-muted-foreground">Score</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <Lightbulb
              className={cn(
                "mx-auto mb-1 h-5 w-5",
                gameState.bulbOn ? "text-badge" : "text-muted-foreground"
              )}
            />
            <p className="font-heading text-lg font-bold">
              {gameState.bulbOn ? "ON" : "OFF"}
            </p>
            <p className="text-xs text-muted-foreground">Bulb</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <AlertTriangle
              className={cn(
                "mx-auto mb-1 h-5 w-5",
                gameState.fuseBlown ? "text-destructive" : "text-secondary"
              )}
            />
            <p className="font-heading text-lg font-bold">
              {gameState.fuseBlown ? "BLOWN" : "SAFE"}
            </p>
            <p className="text-xs text-muted-foreground">Fuse</p>
          </div>
        </div>

        {/* Circuit Diagram */}
        <div className="mb-4 rounded-xl border border-border bg-card p-4 slide-up" style={{ animationDelay: "100ms" }}>
          <canvas
            ref={canvasRef}
            width={400}
            height={250}
            className="w-full border border-border rounded"
          />
          <div className="mt-2 px-3 py-2 bg-accent/10 rounded text-center">
            <p className="text-xs text-accent font-medium">
              💡 Lower resistance lets more current flow.
            </p>
          </div>
        </div>

        {/* Voltage Control */}
        <div className="mb-4 rounded-xl border border-border bg-card p-4 slide-up" style={{ animationDelay: "150ms" }}>
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4 text-accent" />
            Voltage Control
          </h4>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Voltage Setting</p>
              <p className="text-2xl font-bold text-accent">{gameState.voltage}V</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Now</p>
              <p className={cn(
                "text-2xl font-bold",
                gameState.current > 2.5 ? "text-destructive" : "text-secondary"
              )}>
                {gameState.current.toFixed(2)}A
              </p>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={gameState.voltage}
            onChange={(e) => handleVoltageChange(Number(e.target.value))}
            disabled={gameState.fuseBlown}
            className={cn(
              "w-full h-3 rounded-lg appearance-none cursor-pointer",
              gameState.current > 2.5
                ? "bg-destructive/30"
                : "bg-secondary/30"
            )}
          />

          <div className="grid grid-cols-3 gap-2 mt-4 text-xs text-muted-foreground">
            <div className="text-left">Min</div>
            <div className="text-center">Max Safe (2.5A)</div>
            <div className="text-right">Critical</div>
          </div>

          {/* Current safety bar */}
          <div className="mt-4 p-2 bg-muted/30 rounded">
            <div className="flex justify-between items-center text-xs mb-1">
              <span>Safety Level</span>
              <span className={cn(
                "font-bold",
                gameState.current > 2.5 ? "text-destructive" : "text-secondary"
              )}>
                {gameState.current > 2.5 ? "DANGER!" : "SAFE"}
              </span>
            </div>
            <div className="h-2 bg-muted rounded overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-200",
                  gameState.current > 2.5 ? "bg-destructive" : "bg-secondary"
                )}
                style={{
                  width: `${Math.min(100, (gameState.current / 3) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Challenge Status */}
        {gameState.isChallenge && !gameState.fuseBlown && (
          <div className="mb-4 rounded-xl border border-secondary/50 bg-secondary/10 p-4 slide-up" style={{ animationDelay: "200ms" }}>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold mb-1">⚡ Challenge Active!</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Resistance dropped! Keep the circuit stable for 10 seconds.
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded overflow-hidden">
                    <div
                      className="h-full bg-secondary transition-all"
                      style={{ width: `${Math.min(100, (gameState.elapsedTime / 10) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold">
                    {gameState.elapsedTime}/10s
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fuse Blown Alert */}
        {gameState.fuseBlown && (
          <div className="mb-4 rounded-xl border border-destructive/50 bg-destructive/10 p-4 slide-up" style={{ animationDelay: "200ms" }}>
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold mb-1">💥 Fuse Blown</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Current exceeded safe levels. Lower the voltage next time!
                </p>
                <Button size="sm" onClick={handleReset}>
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {isSuccess && (
          <div className="mb-4 rounded-xl border border-secondary/50 bg-secondary/10 p-4 slide-up" style={{ animationDelay: "200ms" }}>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold mb-1">🎉 Circuit Stable!</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  You managed the electrical current perfectly!
                </p>
                <Button size="sm" onClick={handleLevelComplete}>
                  Next Level
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Progress */}
        <div className="rounded-xl border border-border bg-card p-4 slide-up" style={{ animationDelay: "250ms" }}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-heading font-semibold">Mission Progress</h4>
            <GameBadge variant="accent" size="sm">
              +120 🪙
            </GameBadge>
          </div>
          <AnimatedProgress value={progressPercent} />
          <p className="mt-2 text-sm text-muted-foreground">
            {levelsCompleted >= 3
              ? "🏆 You mastered Ohm's Law!"
              : `Complete ${3 - levelsCompleted} more level${3 - levelsCompleted === 1 ? "" : "s"}.`}
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
