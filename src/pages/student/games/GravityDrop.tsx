import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { GameBadge } from "@/components/ui/game-badge";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import {
  ArrowLeft,
  Feather,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Play,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface DroppingObject {
  x: number;
  y: number;
  size: number;
  falling: boolean;
  reachedTarget: boolean;
}

interface Target {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MovingTarget {
  x: number;
  dx: number;
}

const OBJECTS = [
  { id: "feather", name: "Feather", size: 20, weight: "Light" },
  { id: "ball", name: "Ball", size: 25, weight: "Medium" },
  { id: "rock", name: "Rock", size: 30, weight: "Heavy" },
];

const DROP_Y = 50;
const TARGET_Y = 320;
const GRAVITY = 0.6;
const MAX_ATTEMPTS = 5;

export default function GravityDrop() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedObject, setSelectedObject] = useState("ball");
  const [dropObject, setDropObject] = useState<DroppingObject>({
    x: 0,
    y: DROP_Y,
    size: 25,
    falling: false,
    reachedTarget: false,
  });
  const [movingTarget, setMovingTarget] = useState<MovingTarget>({
    x: 200,
    dx: 3,
  });
  const [dropTime, setDropTime] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [hits, setHits] = useState(0);
  const [score, setScore] = useState(0);
  const [gamePhase, setGamePhase] = useState<"waiting" | "dropping" | "result">(
    "waiting"
  );
  const [lastResult, setLastResult] = useState<"hit" | "miss" | null>(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const animationRef = useRef<number | null>(null);
  const fallSpeedRef = useRef(0);
  const checkResultRef = useRef<{ x: number; hit: boolean } | null>(null);

  // Target movement
  useEffect(() => {
    let targetInterval: NodeJS.Timeout | null = null;

    if (gamePhase === "waiting" || gamePhase === "dropping") {
      targetInterval = setInterval(() => {
        setMovingTarget((prev) => {
          let newX = prev.x + prev.dx;
          let newDx = prev.dx;

          // Bounce at edges
          if (newX < 50) {
            newX = 50;
            newDx = 3;
          } else if (newX > 350) {
            newX = 350;
            newDx = -3;
          }

          return { x: newX, dx: newDx };
        });
      }, 30);
    }

    return () => {
      if (targetInterval) {
        clearInterval(targetInterval);
      }
    };
  }, [gamePhase]);

  // Check result when object lands
  useEffect(() => {
    if (checkResultRef.current && !dropObject.falling) {
      const { x, hit } = checkResultRef.current;
      checkResultRef.current = null;
      checkResult(x, hit);
    }
  }, [dropObject.falling]);

  // Object falling physics
  useEffect(() => {
    if (!dropObject.falling || gamePhase !== "dropping") return;

    const animate = () => {
      setDropObject((prev) => {
        let newObj = { ...prev };
        fallSpeedRef.current += GRAVITY;
        newObj.y += fallSpeedRef.current;
        setDropTime((t) => t + 1);

        // Check if reached target
        if (newObj.y >= TARGET_Y - newObj.size / 2) {
          newObj.y = TARGET_Y;
          newObj.falling = false;

          // Check if hit
          const targetWidth = 80;
          const hit =
            newObj.x > movingTarget.x - targetWidth / 2 &&
            newObj.x < movingTarget.x + targetWidth / 2;

          checkResultRef.current = { x: newObj.x, hit };
          return newObj;
        }

        return newObj;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dropObject.falling, gamePhase, movingTarget.x]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 500;
    const height = 400;

    ctx.clearRect(0, 0, width, height);

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(59, 130, 246, 0.1)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Drop line
    ctx.strokeStyle = "rgba(200, 200, 200, 0.3)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(dropObject.x, DROP_Y);
    ctx.lineTo(dropObject.x, TARGET_Y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Gravity indicator
    ctx.fillStyle = "#3b82f6";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("Gravity", width - 10, 25);
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(width - 25 - i * 5, 30 + i * 5, 3, 3);
    }

    // Drop platform
    ctx.fillStyle = "#1e40af";
    ctx.fillRect(dropObject.x - 30, DROP_Y - 10, 60, 10);
    ctx.strokeStyle = "#1e40af";
    ctx.lineWidth = 2;
    ctx.strokeRect(dropObject.x - 30, DROP_Y - 10, 60, 10);

    // Label
    ctx.fillStyle = "#1e40af";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Drop", dropObject.x, DROP_Y - 15);

    // Falling object
    if (dropObject.falling) {
      // Object shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.beginPath();
      ctx.ellipse(dropObject.x, TARGET_Y + 10, dropObject.size, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Object
      const objColor =
        selectedObject === "feather"
          ? "#f59e0b"
          : selectedObject === "ball"
          ? "#ec4899"
          : "#6b7280";
      ctx.fillStyle = objColor;
      ctx.beginPath();
      ctx.arc(dropObject.x, dropObject.y, dropObject.size / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Velocity indicator
      ctx.strokeStyle = objColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(dropObject.x - 20, dropObject.y - 5);
      ctx.lineTo(
        dropObject.x - 20,
        dropObject.y - 5 - Math.min(fallSpeedRef.current * 3, 40)
      );
      ctx.stroke();
    }

    // Moving target
    const targetWidth = 80;
    const targetHeight = 30;

    ctx.fillStyle = "rgba(16, 185, 129, 0.3)";
    ctx.fillRect(
      movingTarget.x - targetWidth / 2,
      TARGET_Y,
      targetWidth,
      targetHeight
    );
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      movingTarget.x - targetWidth / 2,
      TARGET_Y,
      targetWidth,
      targetHeight
    );

    // Target glow
    ctx.shadowColor = "rgba(16, 185, 129, 0.5)";
    ctx.shadowBlur = 10;
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      movingTarget.x - targetWidth / 2 - 5,
      TARGET_Y - 5,
      targetWidth + 10,
      targetHeight + 10
    );
    ctx.shadowColor = "transparent";

    // Target label
    ctx.fillStyle = "#10b981";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("TARGET", movingTarget.x, TARGET_Y + 20);

    // Landing feedback
    if (lastResult === "hit" && !dropObject.falling) {
      ctx.fillStyle = "rgba(16, 185, 129, 0.4)";
      ctx.beginPath();
      ctx.arc(dropObject.x, TARGET_Y, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (lastResult === "miss" && !dropObject.falling) {
      ctx.fillStyle = "rgba(239, 68, 68, 0.4)";
      ctx.beginPath();
      ctx.arc(dropObject.x, TARGET_Y, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Drop time display
    ctx.fillStyle = "#666";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`Fall time: ${dropTime}ms`, 10, 30);
  }, [dropObject, movingTarget.x, lastResult, gamePhase, selectedObject, dropTime]);

  const checkResult = (x: number, hit: boolean) => {
    setGamePhase("result");
    setLastResult(hit ? "hit" : "miss");

    if (hit) {
      setHits(hits + 1);
      setScore(score + 110);
      toast({
        title: "🎯 Direct Hit!",
        description:
          "Timing was perfect! Weight doesn't matter—only gravity and timing.",
      });
    } else {
      toast({
        title: "❌ Missed",
        description: "The target moved. Adjust your drop timing.",
      });
    }
  };

  const handleDrop = () => {
    if (gamePhase !== "waiting" || attempts >= MAX_ATTEMPTS) return;

    fallSpeedRef.current = 0;
    setDropTime(0);
    setDropObject({
      x: movingTarget.x,
      y: DROP_Y,
      size:
        selectedObject === "feather"
          ? 20
          : selectedObject === "ball"
          ? 25
          : 30,
      falling: true,
      reachedTarget: false,
    });

    setGamePhase("dropping");
    setAttempts(attempts + 1);
    setLastResult(null);
  };

  const handleReset = () => {
    setDropObject({
      x: 0,
      y: DROP_Y,
      size: 25,
      falling: false,
      reachedTarget: false,
    });
    setDropTime(0);
    setAttempts(0);
    setHits(0);
    setScore(0);
    setGamePhase("waiting");
    setLastResult(null);
    fallSpeedRef.current = 0;
  };

  const handleRetry = () => {
    setGamePhase("waiting");
    setLastResult(null);
    fallSpeedRef.current = 0;
  };

  const isLevelComplete = hits >= 3;
  const progressPercent = (hits / 3) * 100;

  return (
    <AppLayout role="student" playCoins={1250} title="Gravity Drop">
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
              <Feather className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold mb-1">📘 What You Will Learn</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  How gravity pulls objects downward.
                </p>
                <h4 className="font-semibold mb-1">🎯 What You Need To Do</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Drop the object to hit the moving target.
                </p>
                <h4 className="font-semibold mb-1">🏆 What Success Looks Like</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Perfect timing.
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
            <Feather className="mx-auto mb-1 h-5 w-5 text-accent" />
            <p className="font-heading text-lg font-bold">{score}</p>
            <p className="text-xs text-muted-foreground">Score</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <CheckCircle className="mx-auto mb-1 h-5 w-5 text-secondary" />
            <p className="font-heading text-lg font-bold">{hits}/3</p>
            <p className="text-xs text-muted-foreground">Direct Hits</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <AlertCircle className="mx-auto mb-1 h-5 w-5 text-primary" />
            <p className="font-heading text-lg font-bold">
              {MAX_ATTEMPTS - attempts}
            </p>
            <p className="text-xs text-muted-foreground">Attempts Left</p>
          </div>
        </div>

        {/* Game Canvas */}
        <div className="mb-4 rounded-xl border border-border bg-card p-4 slide-up" style={{ animationDelay: "100ms" }}>
          <div className="relative bg-gradient-to-b from-blue-50 to-white rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              width={500}
              height={400}
              className="w-full border border-border rounded"
            />
            <div className="mt-2 px-3 py-2 bg-accent/10 rounded text-center">
              <p className="text-xs text-accent font-medium">
                💡 Gravity pulls everything the same way.
              </p>
            </div>
          </div>
        </div>

        {/* Object Selection */}
        <div className="mb-4 rounded-xl border border-border bg-card p-4 slide-up" style={{ animationDelay: "150ms" }}>
          <h4 className="font-semibold mb-3 text-sm">Select Object to Drop</h4>
          <div className="grid grid-cols-3 gap-2">
            {OBJECTS.map((obj) => (
              <button
                key={obj.id}
                onClick={() => setSelectedObject(obj.id)}
                disabled={gamePhase !== "waiting"}
                className={cn(
                  "rounded-lg border-2 p-3 transition-all text-center",
                  selectedObject === obj.id
                    ? "border-primary bg-primary/20"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="text-2xl mb-1">
                  {obj.id === "feather"
                    ? "🪶"
                    : obj.id === "ball"
                    ? "🎱"
                    : "🪨"}
                </div>
                <p className="text-xs font-medium">{obj.name}</p>
                <p className="text-xs text-muted-foreground">{obj.weight}</p>
              </button>
            ))}
          </div>
          <div className="mt-3 p-3 bg-secondary/10 rounded text-xs text-muted-foreground">
            <p className="font-medium text-secondary mb-1">💡 Fun fact:</p>
            <p>All objects fall at the same speed regardless of weight!</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-4 grid grid-cols-2 gap-3 slide-up" style={{ animationDelay: "200ms" }}>
          <Button
            size="lg"
            onClick={handleDrop}
            disabled={
              gamePhase !== "waiting" || attempts >= MAX_ATTEMPTS
            }
            variant={gamePhase === "waiting" ? "default" : "ghost"}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            Drop Now!
          </Button>
          <Button
            size="lg"
            onClick={gamePhase === "result" ? handleRetry : handleReset}
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {gamePhase === "result" ? "Retry" : "Reset"}
          </Button>
        </div>

        {/* Result Feedback */}
        {gamePhase === "result" && (
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
                <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h4 className="font-semibold mb-1">
                  {lastResult === "hit"
                    ? "🎯 Bullseye!"
                    : "⏱️ Timing Matters"}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {lastResult === "hit"
                    ? "Perfect drop timing! You understood gravity."
                    : "The target was too fast or too slow. Adjust your timing."}
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
              +110 🪙
            </GameBadge>
          </div>
          <AnimatedProgress value={progressPercent} />
          <p className="mt-2 text-sm text-muted-foreground">
            {isLevelComplete
              ? "🏆 You mastered gravity!"
              : `Get ${3 - hits} more direct hits.`}
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
