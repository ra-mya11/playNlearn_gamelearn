import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { ConceptIntroPopup } from "@/components/ui/concept-intro-popup";
import { GameCompletionPopup } from "@/components/ui/game-completion-popup";
import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react";
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

interface Target {
  x: number;
  y: number;
  radius: number;
}

const GAME_WIDTH = 800;
const GAME_HEIGHT = 400;
const CANNON_X = 60;
const CANNON_Y = 320;
const GRAVITY = 0.35;
const HIT_RADIUS = 40; // Forgiving hit detection
const MAX_HITS = 3;

export default function ProjectileMotion() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [angle, setAngle] = useState(35);
  const [speed, setSpeed] = useState(12);
  const [projectile, setProjectile] = useState<Projectile>({
    x: CANNON_X,
    y: CANNON_Y,
    vx: 0,
    vy: 0,
    active: false,
    trail: [],
  });
  const [hits, setHits] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameStatus, setGameStatus] = useState<"ready" | "firing" | "result">("ready");
  const [lastResult, setLastResult] = useState<"hit" | "miss" | null>(null);
  const [ghostTrail, setGhostTrail] = useState<Array<{ x: number; y: number }>>([]);
  const [targetX, setTargetX] = useState(600);
  const animationRef = useRef<number | null>(null);

  // Generate reachable target based on physics
  const generateTarget = () => {
    // Target should be reachable with various angle/speed combinations
    // Place it at a moderate distance
    setTargetX(550 + Math.random() * 100); // 550-650 range
  };

  useEffect(() => {
    generateTarget();
  }, []);

  // Check hit after projectile stops
  useEffect(() => {
    if (!projectile.active && gameStatus === "firing") {
      const distance = Math.sqrt(
        Math.pow(projectile.x - targetX, 2) + Math.pow(projectile.y - 280, 2)
      );
      const isHit = distance < HIT_RADIUS;

      setLastResult(isHit ? "hit" : "miss");
      if (isHit) {
        setGhostTrail(projectile.trail);
      }
      setGameStatus("result");
    }
  }, [projectile.active, gameStatus, targetX]);

  // Physics simulation
  useEffect(() => {
    if (!projectile.active || gameStatus !== "firing") return;

    const animate = () => {
      setProjectile((prev) => {
        let newProjectile = { ...prev };
        newProjectile.x += newProjectile.vx;
        newProjectile.y += newProjectile.vy;
        newProjectile.vy += GRAVITY;

        newProjectile.trail = [
          ...newProjectile.trail.slice(-50),
          { x: newProjectile.x, y: newProjectile.y },
        ];

        // Out of bounds check
        if (newProjectile.x > GAME_WIDTH + 50 || newProjectile.y > GAME_HEIGHT) {
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

    // Clear canvas with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, "#87CEEB");
    gradient.addColorStop(1, "#E0F6FF");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Ground
    ctx.fillStyle = "#8B7355";
    ctx.fillRect(0, GAME_HEIGHT - 50, GAME_WIDTH, 50);

    // Grass pattern
    ctx.strokeStyle = "#228B22";
    ctx.lineWidth = 2;
    for (let i = 0; i < GAME_WIDTH; i += 30) {
      ctx.beginPath();
      ctx.moveTo(i, GAME_HEIGHT - 50);
      ctx.lineTo(i + 15, GAME_HEIGHT - 40);
      ctx.stroke();
    }

    // Wind indicator (visual)
    ctx.fillStyle = "rgba(100, 150, 200, 0.3)";
    ctx.font = "12px Arial";
    ctx.fillText("Light breeze →", 10, 20);

    // Distance scale
    ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
    ctx.lineWidth = 1;
    for (let i = 100; i < GAME_WIDTH; i += 100) {
      ctx.beginPath();
      ctx.moveTo(i, GAME_HEIGHT - 45);
      ctx.lineTo(i, GAME_HEIGHT - 35);
      ctx.stroke();
    }

    // Target (with visual clarity)
    ctx.fillStyle = "rgba(255, 0, 0, 0.8)";
    ctx.beginPath();
    ctx.arc(targetX, 280, 20, 0, Math.PI * 2);
    ctx.fill();

    // Target inner circle
    ctx.fillStyle = "#FFF";
    ctx.beginPath();
    ctx.arc(targetX, 280, 10, 0, Math.PI * 2);
    ctx.fill();

    // Target hit radius indicator (faint)
    ctx.strokeStyle = "rgba(255, 0, 0, 0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(targetX, 280, HIT_RADIUS, 0, Math.PI * 2);
    ctx.stroke();

    // Target label
    ctx.fillStyle = "#000";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("TARGET", targetX, 310);

    // Cannon base
    ctx.fillStyle = "#333";
    ctx.beginPath();
    ctx.arc(CANNON_X, CANNON_Y, 12, 0, Math.PI * 2);
    ctx.fill();

    // Cannon wheels
    ctx.fillStyle = "#555";
    ctx.beginPath();
    ctx.arc(CANNON_X - 8, CANNON_Y + 10, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(CANNON_X + 8, CANNON_Y + 10, 4, 0, Math.PI * 2);
    ctx.fill();

    // Cannon barrel
    const angleRad = (angle * Math.PI) / 180;
    const barrelLength = 28;
    const barrelEndX = CANNON_X + Math.cos(angleRad) * barrelLength;
    const barrelEndY = CANNON_Y - Math.sin(angleRad) * barrelLength;
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(CANNON_X, CANNON_Y);
    ctx.lineTo(barrelEndX, barrelEndY);
    ctx.stroke();

    // Cannon fire point
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.arc(barrelEndX, barrelEndY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Ghost trail from previous hit
    if (ghostTrail.length > 1) {
      ctx.strokeStyle = "rgba(100, 200, 100, 0.3)";
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(ghostTrail[0].x, ghostTrail[0].y);
      for (let i = 1; i < ghostTrail.length; i++) {
        ctx.lineTo(ghostTrail[i].x, ghostTrail[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Current projectile trail
    if (projectile.trail.length > 1) {
      ctx.strokeStyle = "rgba(255, 140, 0, 0.7)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(projectile.trail[0].x, projectile.trail[0].y);
      for (let i = 1; i < projectile.trail.length; i++) {
        ctx.lineTo(projectile.trail[i].x, projectile.trail[i].y);
      }
      ctx.stroke();
    }

    // Projectile
    if (projectile.active) {
      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#FFA500";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Velocity indicator
      const speed = Math.sqrt(projectile.vx ** 2 + projectile.vy ** 2);
      ctx.fillStyle = "rgba(255, 100, 0, 0.3)";
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, speed * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Result feedback with better visibility
    if (lastResult === "hit") {
      // Explosion effect
      ctx.fillStyle = "rgba(0, 255, 0, 0.2)";
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      ctx.fillStyle = "#00AA00";
      ctx.font = "bold 32px Arial";
      ctx.textAlign = "center";
      ctx.fillText("🎯 HIT!", GAME_WIDTH / 2, GAME_HEIGHT / 2);

      // Confetti particles
      for (let i = 0; i < 8; i++) {
        const x = targetX + (Math.random() - 0.5) * 80;
        const y = 280 + (Math.random() - 0.5) * 80;
        ctx.fillStyle = ["#FFD700", "#FF6B6B", "#4ECDC4"][i % 3];
        ctx.fillRect(x - 3, y - 3, 6, 6);
      }
    } else if (lastResult === "miss") {
      ctx.fillStyle = "rgba(255, 0, 0, 0.15)";
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      ctx.fillStyle = "#AA0000";
      ctx.font = "bold 28px Arial";
      ctx.textAlign = "center";
      ctx.fillText("❌ MISSED", GAME_WIDTH / 2, GAME_HEIGHT / 2);

      // Show miss distance
      const distance = Math.sqrt(
        Math.pow(projectile.x - targetX, 2) + Math.pow(projectile.y - 280, 2)
      );
      ctx.font = "14px Arial";
      ctx.fillStyle = "#666";
      ctx.fillText(`(off by ${Math.round(distance - HIT_RADIUS)}px)`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30);
    }
  }, [projectile, angle, lastResult, ghostTrail, targetX]);

  const handleFire = () => {
    if (gameStatus !== "ready") return;
    if (hits >= MAX_HITS) return;

    const angleRad = (angle * Math.PI) / 180;
    const speedMultiplier = speed / 20;

    setProjectile({
      x: CANNON_X,
      y: CANNON_Y,
      vx: Math.cos(angleRad) * speedMultiplier * 10,
      vy: -Math.sin(angleRad) * speedMultiplier * 10,
      active: true,
      trail: [{ x: CANNON_X, y: CANNON_Y }],
    });

    setAttempts((prev) => prev + 1);
    setLastResult(null);
    setGameStatus("firing");
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
    setLastResult(null);
    setGameStatus("ready");
  };

  const handleResultNext = () => {
    if (lastResult === "hit") {
      const newHits = hits + 1;
      setHits(newHits);
      if (newHits >= MAX_HITS) {
        setShowCompletion(true);
      }
    }

    handleRetry();
  };

  const handleStart = () => {
    setShowTutorial(false);
  };

  const handleGoBack = () => {
    navigate("/student/physics");
  };

  const handleExitFullscreen = () => {
    setIsFullscreen(false);
  };

  const gameContainer = (
    <div
      className={cn(
        "flex flex-col items-center justify-center transition-all duration-300",
        isFullscreen ? "fixed inset-0 z-50 bg-black p-0 overflow-hidden" : "w-full bg-gradient-to-br from-blue-50 to-cyan-50 p-4"
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
        <div className="mt-6 w-full max-w-4xl bg-white p-6 rounded-lg border border-gray-200 shadow-md">
          <div className="space-y-6">
            {/* Angle Control */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-800">
                  Angle: {angle}°
                </label>
                <span className="text-xs text-gray-500">
                  {angle < 30 ? "Flat" : angle < 50 ? "Good" : "High"}
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="75"
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                disabled={gameStatus !== "ready"}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>15°</span>
                <span>75°</span>
              </div>
            </div>

            {/* Speed Control */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-800">
                  Power: {speed}
                </label>
                <span className="text-xs text-gray-500">
                  {speed < 8 ? "Weak" : speed < 15 ? "Good" : "Strong"}
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="20"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                disabled={gameStatus !== "ready"}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>5</span>
                <span>20</span>
              </div>
            </div>

            {/* Fire Button */}
            <Button
              onClick={handleFire}
              disabled={gameStatus !== "ready" || hits >= MAX_HITS}
              size="lg"
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-lg py-3"
            >
              🔥 FIRE!
            </Button>

            {/* Result Display */}
            {lastResult && (
              <div className={cn(
                "p-4 rounded-lg text-center font-bold text-white animation-pulse",
                lastResult === "hit"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                  : "bg-gradient-to-r from-red-500 to-pink-500"
              )}>
                <div className="text-2xl mb-2">
                  {lastResult === "hit" ? "✅ PERFECT!" : "🎯 Try Again"}
                </div>
                <div className="text-sm mb-4">
                  {lastResult === "hit"
                    ? "You balanced angle and power!"
                    : "Adjust angle or speed for better aim"}
                </div>
                <Button
                  onClick={handleResultNext}
                  variant="outline"
                  className="w-full bg-white text-gray-800 font-bold hover:bg-gray-100"
                >
                  {lastResult === "hit" ? "Next Shot ▶" : "Try Again"}
                </Button>
              </div>
            )}

            {/* Progress Bar */}
            <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-800">Progress</span>
                <span className="text-sm text-gray-600">{hits}/{MAX_HITS}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(hits / MAX_HITS) * 100}%` }}
                />
              </div>
              <div className="text-xs text-gray-600 mt-2">
                Attempts: {attempts}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Info */}
      {!isFullscreen && (
        <div className="mt-6 w-full max-w-4xl bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-800 mb-2">📘 What You're Learning</h3>
              <p className="text-sm text-gray-700">
                Angle controls height; power controls distance. Gravity pulls the projectile down. Hit the target 3 times!
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">💡 Tips</h3>
              <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                <li>Low angles = far but flat arc</li>
                <li>High angles = tall but shorter distance</li>
                <li>45° is often the "sweet spot"</li>
              </ul>
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
        conceptName="Projectile Motion"
        whatYouWillUnderstand="Learn how angle and power affect where a projectile lands. Gravity always pulls it down."
        gameSteps={[
          "Adjust the angle slider (where the cannon points)",
          "Adjust the power slider (how hard you fire)",
          "Click FIRE! and watch the trajectory",
          "Hit the red target 3 times to win",
        ]}
        successMeaning="When your projectile lands in the red zone, you get a HIT! Green flash = victory!"
        icon="🎯"
      />

      <GameCompletionPopup
        isOpen={showCompletion}
        onPlayAgain={() => {
          setHits(0);
          setAttempts(0);
          setShowCompletion(false);
          setGhostTrail([]);
          generateTarget();
          handleRetry();
        }}
        onExitFullscreen={handleExitFullscreen}
        onBackToGames={handleGoBack}
        learningOutcome="You mastered projectile motion! You understand how angle, power, and gravity work together to control where things land."
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
