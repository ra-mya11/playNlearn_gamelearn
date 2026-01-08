import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { GameBadge } from "@/components/ui/game-badge";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import {
  ArrowLeft,
  Wind,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface BoxState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isMoving: boolean;
  trail: Array<{ x: number; y: number }>;
}

const TRACK_Y = 200;
const TARGET_X = 350;
const TARGET_WIDTH = 60;
const BOX_SIZE = 30;
const FRICTION = 0.92;
const PUSH_FORCE = 8;
const STOP_FORCE = -3;

export default function ForceBalance() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [box, setBox] = useState<BoxState>({
    x: 50,
    y: TRACK_Y,
    vx: 0,
    vy: 0,
    isMoving: false,
    trail: [],
  });
  const [gameState, setGameState] = useState<"ready" | "playing" | "result">(
    "ready"
  );
  const [result, setResult] = useState<"hit" | "miss" | null>(null);
  const [score, setScore] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const animationRef = useRef<number | null>(null);
  const shouldCheckResultRef = useRef(false);

  // Physics simulation
  useEffect(() => {
    if (gameState !== "playing") return;

    const animate = () => {
      setBox((prev) => {
        let newBox = { ...prev };

        // Apply friction
        newBox.vx *= FRICTION;

        // Update position
        newBox.x += newBox.vx;

        // Track trail
        if (newBox.vx > 0.1) {
          newBox.trail = [
            ...newBox.trail.slice(-30),
            { x: newBox.x, y: newBox.y },
          ];
        }

        // Stop box if velocity is too small
        if (Math.abs(newBox.vx) < 0.1) {
          newBox.vx = 0;
          newBox.isMoving = false;
        }

        // Boundary checks
        if (newBox.x < 20) {
          newBox.x = 20;
          newBox.vx = 0;
        }
        if (newBox.x > 550) {
          newBox.x = 550;
          newBox.vx = 0;
        }

        return newBox;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 600;
    const height = 300;

    ctx.clearRect(0, 0, width, height);

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(219, 234, 254, 0.3)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Track
    ctx.fillStyle = "#e5e7eb";
    ctx.fillRect(20, TRACK_Y + BOX_SIZE / 2 - 2, width - 40, 4);

    // Target zone
    ctx.fillStyle = "rgba(16, 185, 129, 0.2)";
    ctx.fillRect(TARGET_X, TRACK_Y - 40, TARGET_WIDTH, 80);
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2;
    ctx.strokeRect(TARGET_X, TRACK_Y - 40, TARGET_WIDTH, 80);

    // Glow on target
    ctx.shadowColor = "rgba(16, 185, 129, 0.6)";
    ctx.shadowBlur = 15;
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 1;
    ctx.strokeRect(TARGET_X - 5, TRACK_Y - 45, TARGET_WIDTH + 10, 90);
    ctx.shadowColor = "transparent";

    // Target label
    ctx.fillStyle = "#10b981";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("STOP HERE", TARGET_X + TARGET_WIDTH / 2, TRACK_Y - 50);

    // Motion trail
    if (box.trail.length > 1) {
      ctx.strokeStyle = "rgba(59, 130, 246, 0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(box.trail[0].x, box.trail[0].y);
      for (let i = 1; i < box.trail.length; i++) {
        const opacity = (i / box.trail.length) * 0.5;
        ctx.globalAlpha = opacity;
        ctx.lineTo(box.trail[i].x, box.trail[i].y);
      }
      ctx.globalAlpha = 1;
      ctx.stroke();
    }

    // Box
    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(
      box.x - BOX_SIZE / 2,
      box.y - BOX_SIZE / 2,
      BOX_SIZE,
      BOX_SIZE
    );

    ctx.strokeStyle = "#1e40af";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      box.x - BOX_SIZE / 2,
      box.y - BOX_SIZE / 2,
      BOX_SIZE,
      BOX_SIZE
    );

    // Velocity arrow
    if (Math.abs(box.vx) > 0.2) {
      const arrowLength = Math.min(Math.abs(box.vx) * 10, 40);
      ctx.strokeStyle = "rgba(59, 130, 246, 0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(box.x, box.y - BOX_SIZE / 2 - 10);
      ctx.lineTo(box.x + arrowLength, box.y - BOX_SIZE / 2 - 10);
      ctx.stroke();

      // Arrowhead
      ctx.beginPath();
      ctx.moveTo(box.x + arrowLength, box.y - BOX_SIZE / 2 - 10);
      ctx.lineTo(box.x + arrowLength - 5, box.y - BOX_SIZE / 2 - 15);
      ctx.lineTo(box.x + arrowLength - 5, box.y - BOX_SIZE / 2 - 5);
      ctx.closePath();
      ctx.fill();
    }

    // Speed indicator
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(
      `Velocity: ${Math.abs(box.vx).toFixed(2)} units`,
      20,
      30
    );

    // Landing zone feedback
    if (result === "hit") {
      ctx.fillStyle = "rgba(16, 185, 129, 0.3)";
      ctx.fillRect(box.x - 20, box.y - 40, 40, 80);
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2;
      ctx.strokeRect(box.x - 20, box.y - 40, 40, 80);
    } else if (result === "miss") {
      ctx.fillStyle = "rgba(239, 68, 68, 0.3)";
      ctx.fillRect(box.x - 20, box.y - 40, 40, 80);
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.strokeRect(box.x - 20, box.y - 40, 40, 80);
    }
  }, [box, result]);

  const handlePush = () => {
    if (gameState !== "playing" || !box.isMoving) {
      setBox((prev) => ({
        ...prev,
        vx: PUSH_FORCE,
        isMoving: true,
        trail: [],
      }));
      setGameState("playing");
    }
  };

  // Check result when box stops
  useEffect(() => {
    if (shouldCheckResultRef.current && gameState === "playing" && !box.isMoving) {
      shouldCheckResultRef.current = false;

      const hit =
        box.x > TARGET_X &&
        box.x < TARGET_X + TARGET_WIDTH &&
        Math.abs(box.vx) < 0.5;

      setGameState("result");
      setResult(hit ? "hit" : "miss");

      if (hit) {
        setSuccessCount(prev => prev + 1);
        setScore(prev => prev + 100);
        toast({
          title: "✅ Perfect Stop!",
          description:
            "You understood inertia! The box continued moving until you stopped it.",
        });
      } else if (box.x > TARGET_X + TARGET_WIDTH) {
        toast({
          title: "❌ Overshot",
          description:
            "The box had too much inertia. Apply the stopping force sooner.",
        });
      } else {
        toast({
          title: "❌ Didn't Reach",
          description: "Push harder or don't stop it too early.",
        });
      }
    }
  }, [box.x, box.vx, box.isMoving, gameState]);

  const handleStop = () => {
    if (gameState !== "playing" || !box.isMoving) return;

    setBox((prev) => ({
      ...prev,
      vx: Math.max(prev.vx + STOP_FORCE, 0),
    }));

    shouldCheckResultRef.current = true;
  };

  const handleReset = () => {
    setBox({
      x: 50,
      y: TRACK_Y,
      vx: 0,
      vy: 0,
      isMoving: false,
      trail: [],
    });
    setGameState("ready");
    setResult(null);
  };

  const handleRetry = () => {
    handleReset();
  };

  const isLevelComplete = successCount >= 3;
  const progressPercent = (successCount / 3) * 100;

  return (
    <AppLayout role="student" playCoins={1250} title="Force Balance">
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
          <div className="mb-4 rounded-xl border border-primary/30 bg-primary/10 p-4 slide-up">
            <div className="flex items-start gap-3">
              <Wind className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold mb-1">📘 What You Will Learn</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Why objects keep moving after you stop pushing.
                </p>
                <h4 className="font-semibold mb-1">🎯 What You Need To Do</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Move the box and stop it exactly on the target.
                </p>
                <h4 className="font-semibold mb-1">🏆 What Success Looks Like</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Perfect timing and control.
                </p>
                <Button size="sm" onClick={() => setShowTutorial(false)}>
                  Got It!
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Game Stats */}
        <div className="mb-4 grid grid-cols-3 gap-3 slide-up" style={{ animationDelay: "50ms" }}>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <Play className="mx-auto mb-1 h-5 w-5 text-primary" />
            <p className="font-heading text-lg font-bold">{score}</p>
            <p className="text-xs text-muted-foreground">Score</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <CheckCircle className="mx-auto mb-1 h-5 w-5 text-secondary" />
            <p className="font-heading text-lg font-bold">{successCount}/3</p>
            <p className="text-xs text-muted-foreground">Perfect Stops</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <AlertCircle
              className={cn(
                "mx-auto mb-1 h-5 w-5",
                box.isMoving ? "text-accent" : "text-muted-foreground"
              )}
            />
            <p className="font-heading text-lg font-bold">
              {box.isMoving ? "Moving" : "Still"}
            </p>
            <p className="text-xs text-muted-foreground">Status</p>
          </div>
        </div>

        {/* Game Canvas */}
        <div className="mb-4 rounded-xl border border-border bg-card p-4 slide-up" style={{ animationDelay: "100ms" }}>
          <div className="relative bg-gradient-to-b from-blue-50 to-white rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              width={600}
              height={300}
              className="w-full border border-border rounded"
            />
            <div className="mt-2 px-3 py-2 bg-primary/10 rounded text-center">
              <p className="text-xs text-primary font-medium">
                💡 Motion continues unless stopped.
              </p>
            </div>
          </div>
        </div>

        {/* Control Instructions */}
        <div className="mb-4 rounded-xl border border-border bg-muted/50 p-4 slide-up" style={{ animationDelay: "150ms" }}>
          <h4 className="font-semibold mb-3 text-sm">How to Play</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="font-bold text-primary min-w-fit">1. Push</span>
              <span>Click "Push Box" to give it initial force</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-primary min-w-fit">2. Observe</span>
              <span>Watch it slide—inertia keeps it moving</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-primary min-w-fit">3. Stop</span>
              <span>Click "Apply Brakes" at the right moment</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-4 grid grid-cols-2 gap-3 slide-up" style={{ animationDelay: "200ms" }}>
          <Button
            size="lg"
            onClick={handlePush}
            disabled={gameState === "result"}
            variant={gameState === "ready" ? "default" : "outline"}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            Push Box
          </Button>
          <Button
            size="lg"
            onClick={handleStop}
            disabled={gameState !== "playing" || !box.isMoving}
            variant="outline"
            className="gap-2"
          >
            <Pause className="h-4 w-4" />
            Apply Brakes
          </Button>
        </div>

        {/* Result Feedback */}
        {gameState === "result" && (
          <div
            className={cn(
              "mb-4 rounded-xl border p-4 slide-up",
              result === "hit"
                ? "border-secondary/50 bg-secondary/10"
                : "border-destructive/50 bg-destructive/10"
            )}
            style={{ animationDelay: "250ms" }}
          >
            <div className="flex items-start gap-3 mb-3">
              {result === "hit" ? (
                <CheckCircle className="h-5 w-5 text-secondary mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              )}
              <div className="flex-1">
                <h4 className="font-semibold">
                  {result === "hit"
                    ? "✅ Perfectly Timed!"
                    : "❌ Try Again"}
                </h4>
              </div>
            </div>
            <Button size="sm" onClick={handleRetry} className="w-full">
              Retry
            </Button>
          </div>
        )}

        {/* Progress */}
        <div className="rounded-xl border border-border bg-card p-4 slide-up" style={{ animationDelay: "300ms" }}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-heading font-semibold">Mission Progress</h4>
            <GameBadge variant="accent" size="sm">
              +100 🪙
            </GameBadge>
          </div>
          <AnimatedProgress value={progressPercent} />
          <p className="mt-2 text-sm text-muted-foreground">
            {isLevelComplete
              ? "🏆 You mastered inertia!"
              : `Get ${3 - successCount} more perfect stops.`}
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
