import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GameBadge } from "@/components/ui/game-badge";
import {
  Droplets,
  CheckCircle,
  RotateCcw,
  HelpCircle,
  Minus,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useSoundEffects } from "@/hooks/use-sound-effects";

interface PHQuestProps {
  onComplete: (score: number, maxScore: number) => void;
}

interface Challenge {
  id: string;
  name: string;
  startingPH: number;
  targetPH: number;
  points: number;
}

const challenges: Challenge[] = [
  { id: "1", name: "Acidic Soil", startingPH: 3, targetPH: 7, points: 40 },
  { id: "2", name: "Basic River", startingPH: 11, targetPH: 7, points: 40 },
  { id: "3", name: "Industrial Waste", startingPH: 2, targetPH: 7, points: 50 },
];

const getPHColor = (ph: number) => {
  if (ph < 3) return "bg-red-600";
  if (ph < 5) return "bg-red-400";
  if (ph < 7) return "bg-yellow-400";
  if (ph === 7) return "bg-green-500";
  if (ph < 9) return "bg-blue-400";
  if (ph < 11) return "bg-blue-600";
  return "bg-indigo-700";
};

const getPHLabel = (ph: number) => {
  if (ph < 7) return "Acidic 🔴";
  if (ph === 7) return "Neutral 🟢";
  return "Basic 🔵";
};

export default function PHQuest({ onComplete }: PHQuestProps) {
  const { playCorrect, playIncorrect, playSuccess } = useSoundEffects();

  const [showTutorial, setShowTutorial] = useState(true);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [currentPH, setCurrentPH] = useState(challenges[0].startingPH);
  const [challengesCompleted, setChallengesCompleted] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [drops, setDrops] = useState(0);
  const [maxDropsUsed, setMaxDropsUsed] = useState(0);

  const challenge = challenges[currentChallenge];
  const targetPH = challenge.targetPH;
  const isNeutral = currentPH === targetPH;
  const needsAcid = currentPH > targetPH;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dropsUsedToReach = Math.abs(challenge.startingPH - currentPH);

  const handleAddDrop = (type: "acid" | "base") => {
    let newPH = currentPH;

    if (type === "acid") {
      newPH = Math.max(1, currentPH - 1);
    } else {
      newPH = Math.min(14, currentPH + 1);
    }

    setCurrentPH(newPH);
    setDrops(drops + 1);
    setMaxDropsUsed(Math.max(maxDropsUsed, drops + 1));

    // Check if overshot
    if (type === "acid" && newPH < targetPH) {
      playIncorrect();
      toast({
        title: "Too acidic!",
        description: "Add base to neutralize.",
        variant: "destructive",
      });
    } else if (type === "base" && newPH > targetPH) {
      playIncorrect();
      toast({
        title: "Too basic!",
        description: "Add acid to neutralize.",
        variant: "destructive",
      });
    }

    // Check if perfect
    if (newPH === targetPH) {
      playCorrect();
      setTimeout(() => {
        handleChallengeComplete();
      }, 800);
    }
  };

  const handleChallengeComplete = () => {
    const pointsEarned = Math.max(40, challenge.points - (drops - Math.abs(challenge.startingPH - targetPH)) * 2);
    const newScore = score + pointsEarned;
    setScore(newScore);
    setChallengesCompleted(challengesCompleted + 1);

    toast({
      title: "🎉 Neutralized!",
      description: `${challenge.name} is safe! +${pointsEarned} points`,
      className: "bg-green-500 text-white border-none"
    });

    if (currentChallenge < challenges.length - 1) {
      setTimeout(() => {
        setCurrentChallenge(currentChallenge + 1);
        setCurrentPH(challenges[currentChallenge + 1].startingPH);
        setDrops(0);
      }, 1500);
    } else {
      handleWin(newScore);
    }
  };

  const handleWin = (finalScore: number) => {
    playSuccess();
    setGameOver(true);
    setTimeout(() => {
      // Max score is rough estimate or sum of points
      const maxScore = challenges.reduce((acc, c) => acc + c.points, 0);
      onComplete(finalScore, maxScore);
    }, 1500);
  };

  const resetGame = () => {
    setCurrentChallenge(0);
    setCurrentPH(challenges[0].startingPH);
    setChallengesCompleted(0);
    setScore(0);
    setGameOver(false);
    setDrops(0);
    setMaxDropsUsed(0);
  };

  if (gameOver) {
    // Small Loading or final state before unmount if needed
    return <div className="p-8 text-center">Completing Quest...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Helper Header */}
      <div className="mb-2 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={resetGame}>
          <RotateCcw className="h-4 w-4 mr-1" />
          Restart
        </Button>
        <GameBadge variant="accent" size="sm">
          Score: {score}
        </GameBadge>
      </div>

      {/* Start Popup */}
      {showTutorial && (
        <div className="mb-4 rounded-xl border border-primary/30 bg-primary/10 p-4 slide-up">
          <div className="flex items-start gap-3">
            <HelpCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold mb-2">📘 pH Quest</h4>
              <div className="text-sm space-y-2 mb-3">
                <p><strong>What You'll Discover:</strong> How acids and bases affect pH</p>
                <p><strong>What You Need To Do:</strong> Add drops to bring pH to 7 (neutral)</p>
                <p><strong>What Success Looks Like:</strong> A safe, balanced environment with pH 7 🟢</p>
              </div>
              <Button size="sm" onClick={() => setShowTutorial(false)}>
                Start Quest! 🚀
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mb-4 grid grid-cols-2 gap-3 slide-up" style={{ animationDelay: "50ms" }}>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <Droplets className="mx-auto mb-1 h-5 w-5 text-primary" />
          <p className="font-heading text-lg font-bold">{score}</p>
          <p className="text-xs text-muted-foreground">Points</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <CheckCircle className="mx-auto mb-1 h-5 w-5 text-secondary" />
          <p className="font-heading text-lg font-bold">{challengesCompleted}/{challenges.length}</p>
          <p className="text-xs text-muted-foreground">Balanced</p>
        </div>
      </div>

      {/* Challenge Info */}
      <div className="mb-4 rounded-xl border border-border bg-card p-4 slide-up" style={{ animationDelay: "100ms" }}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-heading font-semibold">
            {challenge.name}
          </h4>
          <GameBadge variant="accent" size="sm">
            +{challenge.points} 🪙
          </GameBadge>
        </div>
        <p className="text-sm text-muted-foreground">
          Starting pH: {challenge.startingPH} • Target: {targetPH}
        </p>
      </div>

      {/* pH Meter */}
      <div className="mb-4 rounded-xl border border-border bg-card p-6 slide-up text-center" style={{ animationDelay: "150ms" }}>
        <h4 className="mb-4 font-heading font-semibold">Current pH</h4>

        <div className="mb-6">
          <div className={cn(
            "mx-auto h-24 w-24 rounded-full flex items-center justify-center text-white font-bold text-3xl transition-all duration-500",
            getPHColor(currentPH),
            isNeutral && "ring-4 ring-green-300 scale-110"
          )}>
            {currentPH}
          </div>
        </div>

        <p className={cn(
          "text-lg font-semibold mb-4 transition-colors",
          isNeutral ? "text-green-500" : needsAcid ? "text-red-500" : "text-blue-500"
        )}>
          {getPHLabel(currentPH)}
        </p>

        {!isNeutral && (
          <p className="text-sm text-muted-foreground mb-4">
            {needsAcid ? "Add acid drops to lower pH" : "Add base drops to raise pH"}
          </p>
        )}
      </div>

      {/* pH Scale */}
      <div className="mb-4 rounded-xl border border-border bg-card p-4 slide-up" style={{ animationDelay: "200ms" }}>
        <h4 className="mb-3 font-heading font-semibold text-sm text-center">pH Scale (1-14)</h4>
        <div className="flex gap-0.5 h-8 rounded-lg overflow-hidden border border-border">
          {Array.from({ length: 14 }).map((_, i) => {
            const ph = i + 1;
            const isTarget = ph === targetPH;
            const isCurrent = ph === currentPH;
            return (
              <div
                key={ph}
                className={cn(
                  "flex-1 transition-all",
                  getPHColor(ph),
                  isTarget && "ring-2 ring-offset-2 ring-offset-card ring-white scale-110",
                  isCurrent && !isTarget && "ring-2 ring-yellow-300"
                )}
                title={`pH ${ph}`}
              />
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="mb-4 rounded-xl border border-border bg-card p-4 slide-up" style={{ animationDelay: "250ms" }}>
        <h4 className="mb-4 font-heading font-semibold text-center">Add Drops</h4>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <Button
            onClick={() => handleAddDrop("acid")}
            disabled={isNeutral}
            className="bg-red-500 hover:bg-red-600 disabled:opacity-50"
          >
            <Minus className="h-4 w-4 mr-2" />
            Acid
          </Button>
          <Button
            onClick={() => handleAddDrop("base")}
            disabled={isNeutral}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Base
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-3">
          Drops used: {drops} • Max efficiency: {Math.abs(challenge.startingPH - targetPH)}
        </p>
      </div>
    </div>
  );
}
