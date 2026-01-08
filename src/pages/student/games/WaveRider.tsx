import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { GameBadge } from "@/components/ui/game-badge";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import {
  ArrowLeft,
  Waves,
  RotateCcw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface Gate {
  x: number;
  height: number; // "high", "mid", "low"
  id: number;
}

const GATES: Gate[] = [
  { x: 100, height: 60, id: 1 },
  { x: 200, height: 40, id: 2 },
  { x: 300, height: 80, id: 3 },
  { x: 400, height: 50, id: 4 },
];

export default function WaveRider() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frequency, setFrequency] = useState(1.5);
  const [amplitude, setAmplitude] = useState(40);
  const [phase, setPhase] = useState(0);
  const [score, setScore] = useState(0);
  const [levelsCompleted, setLevelsCompleted] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [gatesMatched, setGatesMatched] = useState(0);
  const animationRef = useRef<number | null>(null);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      setPhase((prev) => (prev + 0.02) % (Math.PI * 2));
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 500;
    const height = 300;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(59, 130, 246, 0.05)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Frequency information
    ctx.fillStyle = "#666";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(
      `Frequency: ${frequency.toFixed(2)} Hz`,
      10,
      20
    );
    ctx.fillText(
      `Amplitude: ${amplitude} units`,
      10,
      35
    );

    // Draw wave
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 3;
    ctx.beginPath();

    for (let x = 0; x < width; x += 5) {
      const y =
        centerY -
        Math.sin(frequency * (x / 50) - phase) * amplitude;
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();

    // Draw gates
    const gatesPassed = checkGates();
    
    for (const gate of GATES) {
      const gatePassed = gatesPassed.includes(gate.id);
      
      // Gate area
      ctx.fillStyle = gatePassed
        ? "rgba(16, 185, 129, 0.3)"
        : "rgba(239, 68, 68, 0.15)";
      ctx.fillRect(gate.x - 10, centerY - gate.height - 5, 20, gate.height + 5);

      // Gate outline
      ctx.strokeStyle = gatePassed ? "#10b981" : "#ef4444";
      ctx.lineWidth = 2;
      ctx.strokeRect(gate.x - 10, centerY - gate.height - 5, 20, gate.height + 5);

      // Gate label
      ctx.fillStyle = gatePassed ? "#10b981" : "#ef4444";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(gatePassed ? "✓" : "✗", gate.x, centerY + 15);
    }

    // Center line
    ctx.strokeStyle = "rgba(200, 200, 200, 0.5)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [frequency, amplitude, phase]);

  const checkGates = (): number[] => {
    const centerY = 150;
    const matched: number[] = [];

    for (const gate of GATES) {
      const waveY =
        centerY -
        Math.sin(frequency * (gate.x / 50) - phase) * amplitude;

      // Check if wave passes through gate (with tolerance)
      if (
        waveY > centerY - gate.height - 10 &&
        waveY < centerY + 10
      ) {
        matched.push(gate.id);
      }
    }

    return matched;
  };

  const handleCheckSolution = () => {
    const matched = checkGates();
    const allMatched = matched.length === GATES.length;

    if (allMatched) {
      const levelScore = 140;
      setScore(score + levelScore);
      setLevelsCompleted(levelsCompleted + 1);
      setGatesMatched(matched.length);

      toast({
        title: "🎉 Perfect Match!",
        description: `All gates passed! +${levelScore} coins`,
      });

      if (levelsCompleted + 1 >= 3) {
        toast({
          title: "🏆 Level Complete!",
          description: "You mastered wave properties!",
        });
      }

      // Reset for next level
      setTimeout(() => {
        setFrequency(levelsCompleted + 1 === 1 ? 2 : levelsCompleted + 1 === 2 ? 2.5 : 3);
        setAmplitude(levelsCompleted + 1 === 1 ? 35 : levelsCompleted + 1 === 2 ? 45 : 50);
      }, 1000);
    } else {
      toast({
        title: "❌ Not Quite",
        description: `${matched.length}/${GATES.length} gates matched. Adjust frequency and amplitude.`,
      });
    }
  };

  const handleReset = () => {
    setFrequency(1.5);
    setAmplitude(40);
    setPhase(0);
    setGatesMatched(0);
  };

  const matched = checkGates();
  const progressPercent = (levelsCompleted / 3) * 100;

  return (
    <AppLayout role="student" playCoins={1250} title="Wave Rider">
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
          <div className="mb-4 rounded-xl border border-secondary/30 bg-secondary/10 p-4 slide-up">
            <div className="flex items-start gap-3">
              <Waves className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold mb-1">📘 What You Will Learn</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  How waves change in height and repetition.
                </p>
                <h4 className="font-semibold mb-1">🎯 What You Need To Do</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Adjust the wave to pass through all gates.
                </p>
                <h4 className="font-semibold mb-1">🏆 What Success Looks Like</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  A smooth wave matching every gate.
                </p>
                <Button size="sm" onClick={() => setShowTutorial(false)}>
                  Let's Ride!
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Game Stats */}
        <div className="mb-4 grid grid-cols-3 gap-3 slide-up" style={{ animationDelay: "50ms" }}>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <Waves className="mx-auto mb-1 h-5 w-5 text-secondary" />
            <p className="font-heading text-lg font-bold">{score}</p>
            <p className="text-xs text-muted-foreground">Score</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <CheckCircle className="mx-auto mb-1 h-5 w-5 text-accent" />
            <p className="font-heading text-lg font-bold">
              {matched.length}/{GATES.length}
            </p>
            <p className="text-xs text-muted-foreground">Gates Matched</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <AlertCircle className="mx-auto mb-1 h-5 w-5 text-primary" />
            <p className="font-heading text-lg font-bold">{levelsCompleted}/3</p>
            <p className="text-xs text-muted-foreground">Levels Done</p>
          </div>
        </div>

        {/* Wave Visualization */}
        <div className="mb-4 rounded-xl border border-border bg-card p-4 slide-up" style={{ animationDelay: "100ms" }}>
          <div className="relative bg-gradient-to-b from-blue-50 to-white rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              width={500}
              height={300}
              className="w-full border border-border rounded"
            />
            <div className="mt-2 px-3 py-2 bg-secondary/10 rounded text-center">
              <p className="text-xs text-secondary font-medium">
                💡 Frequency is how often a wave repeats.
              </p>
            </div>
          </div>
        </div>

        {/* Frequency Control */}
        <div className="mb-4 rounded-xl border border-border bg-card p-4 slide-up" style={{ animationDelay: "150ms" }}>
          <h4 className="font-semibold mb-4 text-sm">Wave Controls</h4>

          <div className="space-y-4">
            {/* Frequency Slider */}
            <div>
              <label className="text-sm font-medium flex items-center justify-between mb-2">
                <span>Frequency: {frequency.toFixed(2)} Hz</span>
                <span className="text-secondary font-semibold">
                  {frequency < 1.5
                    ? "Slow"
                    : frequency < 2.5
                    ? "Medium"
                    : "Fast"}
                </span>
              </label>
              <input
                type="range"
                min="0.5"
                max="3.5"
                step="0.1"
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="w-full h-2 bg-secondary/30 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Stretches wave</span>
                <span>Compresses wave</span>
              </div>
            </div>

            {/* Amplitude Slider */}
            <div>
              <label className="text-sm font-medium flex items-center justify-between mb-2">
                <span>Amplitude: {amplitude} units</span>
                <span className="text-accent font-semibold">
                  {amplitude < 35 ? "Short" : amplitude < 50 ? "Medium" : "Tall"}
                </span>
              </label>
              <input
                type="range"
                min="20"
                max="70"
                step="5"
                value={amplitude}
                onChange={(e) => setAmplitude(Number(e.target.value))}
                className="w-full h-2 bg-accent/30 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Short waves</span>
                <span>Tall waves</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Properties Info */}
        <div className="mb-4 rounded-xl border border-border bg-muted/50 p-4 slide-up" style={{ animationDelay: "200ms" }}>
          <h4 className="font-semibold mb-3 text-sm">Understanding Waves</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="font-bold text-secondary min-w-fit">Frequency</span>
              <span>How many waves repeat in a given distance</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-accent min-w-fit">Amplitude</span>
              <span>How tall (or short) the wave peaks reach</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-primary min-w-fit">Tall ≠ Frequent</span>
              <span>Amplitude and frequency are independent</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-4 grid grid-cols-2 gap-3 slide-up" style={{ animationDelay: "250ms" }}>
          <Button
            size="lg"
            onClick={handleCheckSolution}
            variant="default"
            className="w-full gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Check Solution
          </Button>
          <Button
            size="lg"
            onClick={handleReset}
            variant="outline"
            className="w-full gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Feedback */}
        {matched.length === GATES.length && (
          <div className="mb-4 rounded-xl border border-secondary/50 bg-secondary/10 p-4 slide-up" style={{ animationDelay: "300ms" }}>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">✨ All Gates Matched!</h4>
                <p className="text-sm text-muted-foreground">
                  You've mastered the relationship between frequency and amplitude.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress */}
        <div className="rounded-xl border border-border bg-card p-4 slide-up" style={{ animationDelay: "350ms" }}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-heading font-semibold">Mission Progress</h4>
            <GameBadge variant="accent" size="sm">
              +140 🪙
            </GameBadge>
          </div>
          <AnimatedProgress value={progressPercent} />
          <p className="mt-2 text-sm text-muted-foreground">
            {levelsCompleted >= 3
              ? "🏆 You mastered wave properties!"
              : `Complete ${3 - levelsCompleted} more level${3 - levelsCompleted === 1 ? "" : "s"}.`}
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
