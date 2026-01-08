import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GameBadge } from "@/components/ui/game-badge";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import {
  Zap,
  CheckCircle,
  RotateCcw,
  HelpCircle,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useSoundEffects } from "@/hooks/use-sound-effects";

interface ElementHunterProps {
  onComplete: (score: number, maxScore: number) => void;
}

interface Element {
  id: string;
  name: string;
  symbol: string;
  properties: string[];
  color: string;
}

interface Mission {
  id: string;
  task: string;
  requirement: string;
  correctElementId: string;
  points: number;
}

const elements: Element[] = [
  { id: "cu", name: "Copper", symbol: "Cu", properties: ["conducts electricity", "malleable"], color: "bg-orange-500" },
  { id: "al", name: "Aluminum", symbol: "Al", properties: ["conducts electricity", "lightweight"], color: "bg-gray-400" },
  { id: "fe", name: "Iron", symbol: "Fe", properties: ["magnetic", "strong"], color: "bg-gray-600" },
  { id: "ne", name: "Neon", symbol: "Ne", properties: ["glows", "gas"], color: "bg-red-500" },
  { id: "o2", name: "Oxygen", symbol: "O", properties: ["supports combustion", "gas"], color: "bg-blue-400" },
  { id: "c", name: "Carbon", symbol: "C", properties: ["forms gems", "strong"], color: "bg-gray-800" },
  { id: "n2", name: "Nitrogen", symbol: "N", properties: ["inert", "gas"], color: "bg-purple-400" },
  { id: "na", name: "Sodium", symbol: "Na", properties: ["reactive", "soft"], color: "bg-yellow-300" },
];

const missions: Mission[] = [
  {
    id: "1",
    task: "Build an electrical wire",
    requirement: "Must conduct electricity",
    correctElementId: "cu",
    points: 50,
  },
  {
    id: "2",
    task: "Decorate a sign with glowing tubes",
    requirement: "Must glow brightly",
    correctElementId: "ne",
    points: 50,
  },
  {
    id: "3",
    task: "Build the frame of a building",
    requirement: "Must be strong",
    correctElementId: "fe",
    points: 60,
  },
];

export default function ElementHunter({ onComplete }: ElementHunterProps) {
  const { playCorrect, playIncorrect, playSuccess } = useSoundEffects();

  const [showTutorial, setShowTutorial] = useState(true);
  const [currentMission, setCurrentMission] = useState(0);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [missionsCompleted, setMissionsCompleted] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackCorrect, setFeedbackCorrect] = useState(false);

  const mission = missions[currentMission];

  const handleSelectElement = (elementId: string) => {
    if (showFeedback) return;
    setSelectedElement(elementId);
  };

  const handleSubmit = () => {
    if (!selectedElement) {
      toast({ title: "Select an element!", description: "Choose an element to solve the mission." });
      return;
    }

    const isCorrect = selectedElement === mission.correctElementId;
    const element = elements.find(e => e.id === selectedElement);

    setFeedbackCorrect(isCorrect);
    setShowFeedback(true);

    if (isCorrect) {
      playCorrect();
      setScore(score + mission.points);
      toast({
        title: "✅ Correct!",
        description: `${element?.name} is perfect for this job! +${mission.points} points`,
        className: "bg-green-500 text-white"
      });

      setTimeout(() => {
        setMissionsCompleted(missionsCompleted + 1);

        if (currentMission < missions.length - 1) {
          setCurrentMission(currentMission + 1);
          setSelectedElement(null);
          setShowFeedback(false);
        } else {
          handleWin();
        }
      }, 1500);
    } else {
      playIncorrect();
      toast({
        title: "❌ Not quite right",
        description: `${element?.name} doesn't have the right properties.`,
        variant: "destructive",
      });
    }
  };

  const handleWin = () => {
    playSuccess();
    setGameOver(true);
    setTimeout(() => {
      // Max score sum
      const maxScore = missions.reduce((acc, m) => acc + m.points, 0);
      onComplete(score, maxScore);
    }, 1500);
  };

  const resetGame = () => {
    setCurrentMission(0);
    setSelectedElement(null);
    setMissionsCompleted(0);
    setScore(0);
    setGameOver(false);
    setShowFeedback(false);
  };

  if (gameOver) {
    return <div className="p-8 text-center">Completing Hunt...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Helper Header */}
      <div className="mb-2 flex items-center justify-between">
        <div>{/* Spacer */}</div>
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
              <h4 className="font-semibold mb-2">📘 Element Hunter</h4>
              <div className="text-sm space-y-2 mb-3">
                <p><strong>What You'll Discover:</strong> Why elements behave differently</p>
                <p><strong>What You Need To Do:</strong> Select the best element for each mission</p>
                <p><strong>What Success Looks Like:</strong> The element's properties match the job! 🎯</p>
              </div>
              <Button size="sm" onClick={() => setShowTutorial(false)}>
                Hunt Elements! 🚀
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mb-4 grid grid-cols-2 gap-3 slide-up" style={{ animationDelay: "50ms" }}>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <Zap className="mx-auto mb-1 h-5 w-5 text-accent" />
          <p className="font-heading text-lg font-bold">{score}</p>
          <p className="text-xs text-muted-foreground">Points</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <Target className="mx-auto mb-1 h-5 w-5 text-primary" />
          <p className="font-heading text-lg font-bold">{missionsCompleted}/{missions.length}</p>
          <p className="text-xs text-muted-foreground">Missions</p>
        </div>
      </div>

      {/* Mission Card */}
      <div className="mb-4 rounded-xl border border-border bg-card p-4 slide-up" style={{ animationDelay: "100ms" }}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-heading font-semibold text-lg">{mission.task}</h4>
            <p className="text-sm text-muted-foreground mt-1">📌 {mission.requirement}</p>
          </div>
          <GameBadge variant="accent" size="sm">
            +{mission.points} 🪙
          </GameBadge>
        </div>
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div className={cn(
          "mb-4 rounded-xl border p-4 slide-up",
          feedbackCorrect
            ? "border-secondary bg-secondary/10"
            : "border-destructive bg-destructive/10"
        )}>
          <p className={cn(
            "font-semibold",
            feedbackCorrect ? "text-secondary" : "text-destructive"
          )}>
            {feedbackCorrect ? "✅ Perfect Choice!" : "❌ Wrong Element"}
          </p>
          {feedbackCorrect && (
            <p className="text-sm text-muted-foreground mt-1">
              {elements.find(e => e.id === selectedElement)?.name} has all the properties needed for this job!
            </p>
          )}
        </div>
      )}

      {/* Element Grid */}
      <div className="mb-4 rounded-xl border border-border bg-card p-4 slide-up" style={{ animationDelay: "150ms" }}>
        <h4 className="mb-4 font-heading font-semibold">Select an Element</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {elements.map((element) => (
            <button
              key={element.id}
              onClick={() => handleSelectElement(element.id)}
              disabled={showFeedback}
              className={cn(
                "rounded-xl border-2 p-4 text-center transition-all hover:scale-105 active:scale-95",
                selectedElement === element.id && !showFeedback
                  ? "border-primary bg-primary/20"
                  : "border-border hover:border-primary/50",
                showFeedback && selectedElement !== element.id && "opacity-50",
                showFeedback && selectedElement === element.id && (
                  feedbackCorrect
                    ? "border-secondary bg-secondary/20"
                    : "border-destructive bg-destructive/20"
                )
              )}
            >
              <div className={cn(
                "h-16 w-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-2xl",
                element.color
              )}>
                {element.symbol}
              </div>
              <p className="text-sm font-medium mb-1">{element.name}</p>
              <p className="text-xs text-muted-foreground">{element.properties[0]}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Element Properties Reference */}
      {selectedElement && (
        <div className="mb-4 rounded-xl border border-accent/30 bg-accent/10 p-4 slide-up">
          {elements.find(e => e.id === selectedElement) && (
            <>
              <p className="text-sm font-semibold mb-2">Properties of {elements.find(e => e.id === selectedElement)?.name}:</p>
              <ul className="text-sm space-y-1">
                {elements.find(e => e.id === selectedElement)?.properties.map((prop, idx) => (
                  <li key={idx} className="text-muted-foreground">• {prop}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {/* Submit Button */}
      {!showFeedback && (
        <Button
          onClick={handleSubmit}
          className="w-full bg-primary mb-4 slide-up"
          style={{ animationDelay: "200ms" }}
          disabled={!selectedElement}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Submit Answer
        </Button>
      )}

      {showFeedback && !feedbackCorrect && (
        <Button
          onClick={() => setShowFeedback(false)}
          className="w-full bg-destructive mb-4 slide-up"
        >
          Try Again
        </Button>
      )}
    </div>
  );
}
