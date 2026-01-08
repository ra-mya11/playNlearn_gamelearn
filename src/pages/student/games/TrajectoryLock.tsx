import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { GameBadge } from "@/components/ui/game-badge";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import {
  ArrowLeft,
  Target,
  RotateCcw,
  CheckCircle,
  Star,
  Wind,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
  trail: Array<{ x: number; y: number }>;
}

const GAME_WIDTH = 600;
const GAME_HEIGHT = 300;
const CANNON_X = 30;
const CANNON_Y = 250;
const TARGET_X = 500;
const TARGET_Y = 200;
const TARGET_WIDTH = 60;
const TARGET_HEIGHT = 40;
const GRAVITY = 0.4;
const WIND = 0.08;
const MAX_ATTEMPTS = 5;

export default function TrajectoryLock() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(45);
  const [speed, setSpeed] = useState(12);
  const [projectile, setProjectile] = useState<Projectile>({
    x: CANNON_X,
    y: CANNON_Y,
    vx: 0,
    vy: 0,
    active: false,
    trail: [],
  });
  const [attempts, setAttempts] = useState(0);
  const [hits, setHits] = useState(0);
  const [gameStatus, setGameStatus] = useState<"ready" | "firing" | "result">("ready");
  const [lastResult, setLastResult] = useState<"hit" | "miss" | null>(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const animationRef = useRef<number | null>(null);

  // Check hit after projectile stops
  useEffect(() => {
    if (!projectile.active && gameStatus === "firing") {
      checkHit(projectile.x, projectile.y);
    }
  }, [projectile.active, gameStatus]);

  // Physics simulation
  useEffect(() => {
    if (!projectile.active || gameStatus !== "firing") return;

    const animate = () => {
      setProjectile((prev) => {
        let newProjectile = { ...prev };
        newProjectile.x += newProjectile.vx;
        newProjectile.y += newProjectile.vy;
        newProjectile.vy += GRAVITY;
        newProjectile.vx += WIND;

        newProjectile.trail = [
          ...newProjectile.trail.slice(-20),
          { x: newProjectile.x, y: newProjectile.y },
        ];

        // Out of bounds
        if (
          newProjectile.x > GAME_WIDTH ||
          newProjectile.y > GAME_HEIGHT ||
          newProjectile.x < 0
        ) {
          newProjectile.active = false;
          return newProjectile;
        }

        // Check collision with target
        if (
          newProjectile.x > TARGET_X &&
          newProjectile.x < TARGET_X + TARGET_WIDTH &&
          newProjectile.y > TARGET_Y &&
          newProjectile.y < TARGET_Y + TARGET_HEIGHT
        ) {
          newProjectile.active = false;
          return newProjectile;
        }

        return newProjectile;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [projectile.active, gameStatus]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, "rgba(59, 130, 246, 0.1)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Wind indicator
    const windStrength = Math.min(10, WIND * 100);
    ctx.fillStyle = "rgba(59, 130, 246, 0.3)";
    for (let i = 0; i < windStrength; i++) {
      ctx.fillRect(GAME_WIDTH - 20 - i * 3, 10, 2, 5);
    }

    // Cannon
    ctx.save();
    ctx.translate(CANNON_X, CANNON_Y);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(0, -4, 20, 8);
    ctx.restore();

    ctx.fillStyle = "#1e40af";
    ctx.beginPath();
    ctx.arc(CANNON_X, CANNON_Y, 8, 0, Math.PI * 2);
    ctx.fill();

    // Target platform
    ctx.fillStyle = "#10b981";
    ctx.fillRect(TARGET_X, TARGET_Y, TARGET_WIDTH, TARGET_HEIGHT);
    ctx.strokeStyle = "#059669";
    ctx.lineWidth = 2;
    ctx.strokeRect(TARGET_X, TARGET_Y, TARGET_WIDTH, TARGET_HEIGHT);

    // Glow effect on target
    ctx.shadowColor = "rgba(16, 185, 129, 0.5)";
    ctx.shadowBlur = 10;
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 1;
    ctx.strokeRect(TARGET_X - 5, TARGET_Y - 5, TARGET_WIDTH + 10, TARGET_HEIGHT + 10);
    ctx.shadowColor = "transparent";

    // Projectile trail
    if (projectile.trail.length > 1) {
      ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(projectile.trail[0].x, projectile.trail[0].y);
      for (let i = 1; i < projectile.trail.length; i++) {
        ctx.lineTo(projectile.trail[i].x, projectile.trail[i].y);
      }
      ctx.stroke();
    }

    // Projectile
    if (projectile.active) {
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#dc2626";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Landing zone indicator (for misses)
    if (lastResult === "miss" && !projectile.active) {
      ctx.fillStyle = "rgba(239, 68, 68, 0.2)";
      ctx.fillRect(projectile.x - 10, projectile.y - 10, 20, 20);
      ctx.strokeStyle = "rgba(239, 68, 68, 0.5)";
      ctx.lineWidth = 1;
      ctx.strokeRect(projectile.x - 10, projectile.y - 10, 20, 20);
    }
  }, [projectile, angle, lastResult]);

  const checkHit = (x: number, y: number) => {
    const hit =
      x > TARGET_X &&
      x < TARGET_X + TARGET_WIDTH &&
      y > TARGET_Y &&
      y < TARGET_Y + TARGET_HEIGHT;

    setGameStatus("result");
    setLastResult(hit ? "hit" : "miss");

    if (hit) {
      setHits(hits + 1);
      toast({
        title: "🎯 Perfect Landing!",
        description: "You nailed it! Angle and speed worked together perfectly.",
      });

      if (hits + 1 >= 3) {
        toast({
          title: "🏆 Level Complete!",
          description: "You mastered projectile motion! +150 coins",
        });
      }
    } else {
      const feedback =
        x < TARGET_X
          ? "⬅️ Fell short. Try more speed or a steeper angle."
          : "➡️ Overshot. Wind pushed it further. Try less speed.";
      toast({
        title: "❌ Missed",
        description: feedback,
      });
    }
  };

  const handleLaunch = () => {
    if (attempts >= MAX_ATTEMPTS) {
      toast({
        title: "Out of Attempts",
        description: "You've used all your shots. Reset to try again.",
      });
      return;
    }

    const angleRad = (angle * Math.PI) / 180;
    const vx = Math.cos(angleRad) * (speed / 3);
    const vy = -Math.sin(angleRad) * (speed / 3);

    setProjectile({
      x: CANNON_X,
      y: CANNON_Y,
      vx,
      vy,
      active: true,
      trail: [],
    });

    setAttempts(attempts + 1);
    setGameStatus("firing");
    setLastResult(null);
  };

  const handleReset = () => {
    setProjectile({
      x: CANNON_X,
      y: CANNON_Y,
      vx: 0,
      vy: 0,
      active: false,
      trail: [],
    });
    setAttempts(0);
    setHits(0);
    setGameStatus("ready");
    setLastResult(null);
    setAngle(45);
    setSpeed(12);
  };

  const handleRetry = () => {
    setProjectile({
      x: CANNON_X,
      y: CANNON_Y,
      vx: 0,
      vy: 0,
      active: false,
      trail: [],
    });
    setGameStatus("ready");
    setLastResult(null);
  };

  const isLevelComplete = hits >= 3;
  const progressPercent = (hits / 3) * 100;

  return (
    <AppLayout role="student" playCoins={1250} title="Trajectory Lock">
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
              <Target className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold mb-1">📘 What You Will Learn</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  How angle and speed decide where an object lands.
                </p>
                <h4 className="font-semibold mb-1">🎯 What You Need To Do</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Launch the ball so it lands on the glowing platform.
                </p>
                <h4 className="font-semibold mb-1">🏆 What Success Looks Like</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  A perfect landing using smart choices—not luck.
                </p>
                <Button size="sm" onClick={() => setShowTutorial(false)}>
                  Let's Play!
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Game Stats */}
        <div className="mb-4 grid grid-cols-3 gap-3 slide-up" style={{ animationDelay: "50ms" }}>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <Target className="mx-auto mb-1 h-5 w-5 text-primary" />
            <p className="font-heading text-lg font-bold">{hits}/3</p>
            <p className="text-xs text-muted-foreground">Perfect Shots</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <AlertCircle className="mx-auto mb-1 h-5 w-5 text-accent" />
            <p className="font-heading text-lg font-bold">{MAX_ATTEMPTS - attempts}</p>
            <p className="text-xs text-muted-foreground">Attempts Left</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <Wind className="mx-auto mb-1 h-5 w-5 text-secondary" />
            <p className="font-heading text-lg font-bold">Active</p>
            <p className="text-xs text-muted-foreground">Wind Effect</p>
          </div>
        </div>

        {/* Game Canvas */}
        <div className="mb-4 rounded-xl border border-border bg-card p-4 slide-up" style={{ animationDelay: "100ms" }}>
          <div className="relative bg-gradient-to-b from-blue-50 to-white rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              width={GAME_WIDTH}
              height={GAME_HEIGHT}
              className="w-full border border-border rounded"
            />
            {/* Concept strip */}
            <div className="mt-2 px-3 py-2 bg-primary/10 rounded text-center">
              <p className="text-xs text-primary font-medium">
                💡 Staying longer in the air means more wind push.
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-4 rounded-xl border border-border bg-card p-4 slide-up" style={{ animationDelay: "150ms" }}>
          <div className="space-y-4">
            {/* Angle Slider */}
            <div>
              <label className="text-sm font-medium flex items-center justify-between mb-2">
                <span>Angle: {angle}°</span>
                <span className="text-primary font-semibold">{angle < 30 ? "Flat" : angle > 60 ? "High" : "Balanced"}</span>
              </label>
              <input
                type="range"
                min="10"
                max="80"
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                disabled={gameStatus !== "ready"}
                className="w-full h-2 bg-secondary/30 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Low Power</span>
                <span>Max Distance</span>
              </div>
            </div>

            {/* Speed Slider */}
            <div>
              <label className="text-sm font-medium flex items-center justify-between mb-2">
                <span>Speed: {speed}</span>
                <span className="text-accent font-semibold">{speed < 8 ? "Gentle" : speed > 15 ? "Powerful" : "Moderate"}</span>
              </label>
              <input
                type="range"
                min="5"
                max="20"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                disabled={gameStatus !== "ready"}
                className="w-full h-2 bg-accent/30 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Close Range</span>
                <span>Far Range</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-4 grid grid-cols-2 gap-3 slide-up" style={{ animationDelay: "200ms" }}>
          <Button
            size="lg"
            onClick={handleLaunch}
            disabled={gameStatus !== "ready" || attempts >= MAX_ATTEMPTS}
            className="w-full gap-2"
            variant={gameStatus === "ready" ? "default" : "ghost"}
          >
            <span className="text-lg">🎯</span>
            {gameStatus === "ready" ? "Launch" : "Launching..."}
          </Button>
          <Button
            size="lg"
            onClick={gameStatus === "result" ? handleRetry : handleReset}
            variant="outline"
            className="w-full gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {gameStatus === "result" ? "Retry" : "Reset"}
          </Button>
        </div>

        {/* Result Feedback */}
        {gameStatus === "result" && (
          <div
            className={cn(
              "mb-4 rounded-xl border p-4 slide-up",
              lastResult === "hit"
                ? "border-secondary/50 bg-secondary/10"
                : "border-destructive/50 bg-destructive/10"
            )}
            style={{ animationDelay: "250ms" }}
          >
            <div className="flex items-start gap-3">
              {lastResult === "hit" ? (
                <CheckCircle className="h-5 w-5 text-secondary mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              )}
              <div>
                <h4 className="font-semibold mb-1">
                  {lastResult === "hit"
                    ? "🎉 Excellent Shot!"
                    : "💭 Let's Analyze"}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {lastResult === "hit"
                    ? "You understood how angle and speed work together!"
                    : "The wind pushed your projectile. Shorter flight time = less wind effect."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress */}
        <div className="rounded-xl border border-border bg-card p-4 slide-up" style={{ animationDelay: "300ms" }}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-heading font-semibold">Mission Progress</h4>
            <GameBadge variant="accent" size="sm">
              +150 🪙
            </GameBadge>
          </div>
          <AnimatedProgress value={progressPercent} />
          <p className="mt-2 text-sm text-muted-foreground">
            {isLevelComplete
              ? "🏆 You mastered projectile motion! Great job!"
              : `Get ${3 - hits} more perfect landings to complete the level.`}
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
