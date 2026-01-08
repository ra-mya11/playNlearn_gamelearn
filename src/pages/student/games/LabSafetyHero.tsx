import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GameBadge } from "@/components/ui/game-badge";
import {
  Flame,
  Droplets,
  Glasses,
  Trash2,
  FireExtinguisher,
  ShieldAlert,
  Beaker,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useSoundEffects } from "@/hooks/use-sound-effects";

interface LabSafetyHeroProps {
  onComplete: (score: number, maxScore: number) => void;
}

interface Hazard {
  id: string;
  type: "fire" | "spill" | "glass" | "nogoggles";
  position: { x: number; y: number }; // Percentage position
  resolved: boolean;
  description: string;
}

interface Tool {
  id: "extinguisher" | "neutralizer" | "broom" | "goggles";
  name: string;
  icon: React.ElementType;
  color: string;
}

const initialHazards: Hazard[] = [
  { id: "h1", type: "fire", position: { x: 20, y: 30 }, resolved: false, description: "Small chemical fire!" },
  { id: "h2", type: "spill", position: { x: 50, y: 60 }, resolved: false, description: "Acid spill on floor!" },
  { id: "h3", type: "glass", position: { x: 80, y: 40 }, resolved: false, description: "Broken beaker!" },
  { id: "h4", type: "nogoggles", position: { x: 35, y: 50 }, resolved: false, description: "Student without protection!" },
];

const tools: Tool[] = [
  { id: "extinguisher", name: "Extinguisher", icon: FireExtinguisher, color: "bg-red-500" },
  { id: "neutralizer", name: "Neutralizer", icon: Beaker, color: "bg-green-500" },
  { id: "broom", name: "Broom & Pan", icon: Trash2, color: "bg-yellow-500" },
  { id: "goggles", name: "Safety Glasses", icon: Glasses, color: "bg-blue-500" },
];

export default function LabSafetyHero({ onComplete }: LabSafetyHeroProps) {
  const { playCorrect, playIncorrect, playSuccess } = useSoundEffects();

  const [showTutorial, setShowTutorial] = useState(true);
  const [hazards, setHazards] = useState<Hazard[]>(initialHazards);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const resolvedCount = hazards.filter(h => h.resolved).length;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const progress = (resolvedCount / hazards.length) * 100;

  useEffect(() => {
    if (resolvedCount === hazards.length && !gameOver) {
      handleWin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedCount]);

  const handleToolSelect = (toolId: string) => {
    if (gameOver) return;
    setSelectedTool(toolId === selectedTool ? null : toolId);
  };

  const handleHazardClick = (hazard: Hazard) => {
    if (gameOver || hazard.resolved) return;

    if (!selectedTool) {
      toast({
        title: "Select a tool first!",
        description: "Choose a safety tool from the toolbar below.",
        variant: "default",
      });
      return;
    }

    let isCorrect = false;

    // Logic for correct tool usage
    switch (hazard.type) {
      case "fire":
        isCorrect = selectedTool === "extinguisher";
        break;
      case "spill":
        isCorrect = selectedTool === "neutralizer";
        break;
      case "glass":
        isCorrect = selectedTool === "broom";
        break;
      case "nogoggles":
        isCorrect = selectedTool === "goggles";
        break;
    }

    if (isCorrect) {
      // Resolve hazard
      playCorrect();
      setHazards(prev => prev.map(h => h.id === hazard.id ? { ...h, resolved: true } : h));
      setScore(prev => prev + 100);
      setSelectedTool(null);
      toast({
        title: "Hazard Resolved!",
        description: "Great job keeping the lab safe.",
        variant: "default",
        className: "bg-green-500 text-white border-none"
      });
    } else {
      // Mistake
      playIncorrect();
      setMistakes(prev => prev + 1);
      setScore(prev => Math.max(0, prev - 20));
      toast({
        title: "Wrong Tool!",
        description: "That won't work on this hazard. Think carefully!",
        variant: "destructive",
      });

      if (mistakes >= 2) { // 3 strikes you're out
        handleLoss();
      }
    }
  };

  const handleWin = () => {
    playSuccess();
    setGameOver(true);
    // Delay slightly to show visual state
    setTimeout(() => {
      onComplete(score, hazards.length * 100);
    }, 1500);
  };

  const handleLoss = () => {
    setGameOver(true);
    toast({
      title: "Mission Failed",
      description: "Too many safety violations!",
      variant: "destructive"
    });
    // Return partial score or fail state? 
    // Usually game allows to retry. 
    // If we call onComplete with low score, GameLevelPage handles stars/success.
    setTimeout(() => {
      onComplete(score, hazards.length * 100);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Helper Header */}
      <div className="mb-2 flex items-center justify-between">
        <div>{/* Spacer */}</div>
        <div className="flex gap-2">
          <GameBadge variant="accent" size="sm">
            Score: {score}
          </GameBadge>
          <GameBadge variant={mistakes > 0 ? "destructive" : "secondary"} size="sm">
            Mistakes: {mistakes}/3
          </GameBadge>
        </div>
      </div>

      {/* Tutorial Popup */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl border-2 border-primary p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <ShieldAlert className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-heading text-xl font-bold">Lab Safety Mission</h3>
                <p className="text-sm text-muted-foreground">Protect the lab!</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <p><strong>🚨 The lab is in chaos!</strong> Several unsafe situations need your immediate attention.</p>
              <div className="bg-muted p-3 rounded-lg text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <FireExtinguisher className="h-4 w-4 text-red-500" />
                  <span>Use <strong>Extinguisher</strong> for fires</span>
                </div>
                <div className="flex items-center gap-2">
                  <Beaker className="h-4 w-4 text-green-500" />
                  <span>Use <strong>Neutralizer</strong> for acid spills</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-yellow-500" />
                  <span>Use <strong>Broom</strong> for broken glass</span>
                </div>
                <div className="flex items-center gap-2">
                  <Glasses className="h-4 w-4 text-blue-500" />
                  <span>Give <strong>Goggles</strong> to students</span>
                </div>
              </div>
            </div>

            <Button className="w-full" size="lg" onClick={() => setShowTutorial(false)}>
              I'm Ready! 🛡️
            </Button>
          </div>
        </div>
      )}

      {/* Game Area - Lab Scene */}
      <div className="flex-1 min-h-[400px] relative bg-slate-900 rounded-xl overflow-hidden mb-4 border-2 border-slate-700 shadow-inner">
        {/* Background visuals (simplified lab setting) */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-slate-800 border-t border-slate-700"></div>
        <div className="absolute top-10 left-10 w-24 h-32 bg-slate-700 rounded opacity-50"></div>
        <div className="absolute top-10 right-20 w-48 h-32 bg-slate-700 rounded opacity-50"></div>
        <div className="absolute top-1/2 left-0 right-0 h-4 bg-slate-600"></div> {/* Bench */}

        {hazards.map((hazard) => {
          if (hazard.resolved) return null;

          return (
            <button
              key={hazard.id}
              onClick={() => handleHazardClick(hazard)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110 active:scale-95 animate-pulse"
              style={{ left: `${hazard.position.x}%`, top: `${hazard.position.y}%` }}
            >
              <div className={cn(
                "h-16 w-16 rounded-full flex items-center justify-center shadow-lg border-2",
                hazard.type === "fire" ? "bg-red-500/20 border-red-500 text-red-500" :
                  hazard.type === "spill" ? "bg-green-500/20 border-green-500 text-green-500" :
                    hazard.type === "glass" ? "bg-gray-500/20 border-gray-400 text-gray-300" :
                      "bg-blue-500/20 border-blue-500 text-blue-500"
              )}>
                {hazard.type === "fire" && <Flame className="h-8 w-8" />}
                {hazard.type === "spill" && <Droplets className="h-8 w-8" />}
                {hazard.type === "glass" && <AlertTriangle className="h-8 w-8" />}
                {hazard.type === "nogoggles" && <Glasses className="h-8 w-8" />}
              </div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                {hazard.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* Tools Palette */}
      <div className="h-24 bg-card border-t border-border p-2 rounded-xl border">
        <p className="text-xs text-center text-muted-foreground mb-2">Select a tool to use</p>
        <div className="flex justify-center gap-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isSelected = selectedTool === tool.id;

            return (
              <button
                key={tool.id}
                onClick={() => handleToolSelect(tool.id)}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all p-2 rounded-xl",
                  isSelected ? "bg-secondary/20 scale-110 -translate-y-2 ring-2 ring-secondary" : "hover:bg-muted"
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center text-white shadow-md",
                  tool.color
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={cn(
                  "text-[10px] font-medium",
                  isSelected ? "text-secondary font-bold" : "text-muted-foreground"
                )}>
                  {tool.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
