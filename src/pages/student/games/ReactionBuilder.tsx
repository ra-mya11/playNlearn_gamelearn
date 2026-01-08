import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GameBadge } from "@/components/ui/game-badge";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import {
  FlaskConical,
  Zap,
  CheckCircle,
  RotateCcw,
  HelpCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useSoundEffects } from "@/hooks/use-sound-effects";

interface ReactionBuilderProps {
  onComplete: (score: number, maxScore: number) => void;
}

interface Molecule {
  id: string;
  name: string;
  color: string;
  atoms: { type: string; count: number }[];
}

const molecules: Molecule[] = [
  { id: "h2", name: "H₂", color: "bg-blue-300", atoms: [{ type: "H", count: 2 }] },
  { id: "o2", name: "O₂", color: "bg-red-300", atoms: [{ type: "O", count: 2 }] },
  { id: "n2", name: "N₂", color: "bg-purple-300", atoms: [{ type: "N", count: 2 }] },
  { id: "cl2", name: "Cl₂", color: "bg-yellow-300", atoms: [{ type: "Cl", count: 2 }] },
];

const reactions = [
  {
    id: "1",
    name: "Water Formation",
    concept: "2H₂ + O₂ → 2H₂O",
    reactants: ["h2", "h2", "o2"],
    product: "Water (H₂O)",
    points: 50,
    hint: "You need 4 Hydrogen atoms and 2 Oxygen atoms total."
  },
  {
    id: "2",
    name: "Ammonia Synthesis",
    concept: "N₂ + 3H₂ → 2NH₃",
    reactants: ["n2", "h2", "h2", "h2"],
    product: "Ammonia (NH₃)",
    points: 60,
    hint: "1 Nitrogen molecule needs 3 Hydrogen molecules."
  },
];

export default function ReactionBuilder({ onComplete }: ReactionBuilderProps) {
  const { playCorrect, playIncorrect, playSuccess } = useSoundEffects();

  const [showTutorial, setShowTutorial] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedMolecules, setSelectedMolecules] = useState<string[]>([]);
  const [reactions_completed, setReactionsCompleted] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showConcept, setShowConcept] = useState(false);

  const currentReaction = reactions[currentLevel];

  const handleMoleculeSelect = (moleculeId: string) => {
    if (gameOver) return;
    setSelectedMolecules([...selectedMolecules, moleculeId]);
  };

  const handleRemoveMolecule = (index: number) => {
    if (gameOver) return;
    setSelectedMolecules(selectedMolecules.filter((_, i) => i !== index));
  };

  const checkReaction = () => {
    if (selectedMolecules.length === 0) {
      toast({ title: "Add molecules!", description: "Drag molecules into the chamber." });
      return;
    }

    const selectedSorted = selectedMolecules.sort();
    const expectedSorted = currentReaction.reactants.sort();

    const isCorrect =
      selectedSorted.length === expectedSorted.length &&
      selectedSorted.every((mol, idx) => mol === expectedSorted[idx]);

    if (isCorrect) {
      playCorrect();
      const newScore = score + currentReaction.points;
      setScore(newScore);
      setReactionsCompleted(reactions_completed + 1);

      toast({
        title: "🎉 Correct!",
        description: `${currentReaction.product} formed! +${currentReaction.points} points`,
        className: "bg-green-500 text-white border-none"
      });

      if (currentLevel < reactions.length - 1) {
        setTimeout(() => {
          setCurrentLevel(currentLevel + 1);
          setSelectedMolecules([]);
          setShowConcept(false);
        }, 1500);
      } else {
        handleWin(newScore);
      }
    } else {
      playIncorrect();
      toast({
        title: "Not quite right",
        description: currentReaction.hint,
        variant: "destructive",
      });
    }
  };

  const handleWin = (finalScore: number) => {
    playSuccess();
    setGameOver(true);
    setTimeout(() => {
      // Max score is sum of points
      const maxScore = reactions.reduce((acc, r) => acc + r.points, 0);
      onComplete(finalScore, maxScore);
    }, 1500);
  };

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
              <h4 className="font-semibold mb-2">📘 Reaction Builder</h4>
              <div className="text-sm space-y-2 mb-3">
                <p><strong>What You'll Discover:</strong> How atoms rearrange during chemical reactions</p>
                <p><strong>What You Need To Do:</strong> Add the right number of molecules into the chamber to balance the reaction</p>
                <p><strong>What Success Looks Like:</strong> A glowing chamber and the product forms!</p>
              </div>
              <Button size="sm" onClick={() => setShowTutorial(false)}>
                Let's Go! 🚀
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mb-4 grid grid-cols-2 gap-3 slide-up" style={{ animationDelay: "50ms" }}>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <FlaskConical className="mx-auto mb-1 h-5 w-5 text-secondary" />
          <p className="font-heading text-lg font-bold">{score}</p>
          <p className="text-xs text-muted-foreground">Points</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <CheckCircle className="mx-auto mb-1 h-5 w-5 text-secondary" />
          <p className="font-heading text-lg font-bold">{reactions_completed}/{reactions.length}</p>
          <p className="text-xs text-muted-foreground">Reactions</p>
        </div>
      </div>

      {/* Current Reaction */}
      <div className="mb-4 rounded-xl border border-border bg-card p-4 slide-up" style={{ animationDelay: "100ms" }}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-heading font-semibold">
            {currentReaction.name}
          </h4>
          <GameBadge variant="accent" size="sm">
            +{currentReaction.points} 🪙
          </GameBadge>
        </div>

        <div className="mb-4 p-3 rounded-lg bg-muted/50">
          <button
            onClick={() => setShowConcept(!showConcept)}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left"
          >
            💡 Chemistry Concept {showConcept ? "▼" : "▶"}
          </button>
          {showConcept && (
            <p className="text-sm mt-2 font-mono text-foreground">
              {currentReaction.concept}
            </p>
          )}
        </div>
      </div>

      {/* Reaction Chamber */}
      <div className="mb-4 rounded-xl border border-border bg-card p-4 slide-up" style={{ animationDelay: "150ms" }}>
        <h4 className="mb-3 font-heading font-semibold text-center">Reaction Chamber</h4>

        <div className={cn(
          "mx-auto mb-4 h-48 w-full rounded-2xl border-2 flex flex-wrap items-center justify-center gap-2 p-4 transition-all duration-300",
          selectedMolecules.length > 0 ? "border-secondary bg-secondary/10" : "border-dashed border-muted-foreground/30 bg-muted/20"
        )}>
          {selectedMolecules.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tap molecules below to add</p>
          ) : (
            selectedMolecules.map((molId, index) => {
              const molecule = molecules.find(m => m.id === molId);
              return (
                <div
                  key={index}
                  className={cn(
                    "relative h-16 w-16 rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:scale-110 transition-transform",
                    molecule?.color
                  )}
                >
                  {molecule?.name}
                  <button
                    onClick={() => handleRemoveMolecule(index)}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={checkReaction}
            className="flex-1 bg-secondary"
            disabled={selectedMolecules.length === 0}
          >
            <Zap className="h-4 w-4 mr-2" />
            React!
          </Button>
          <Button
            onClick={() => setSelectedMolecules([])}
            variant="outline"
            className="px-3"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Molecule Palette */}
      <div className="rounded-xl border border-border bg-card p-4 slide-up flex-1" style={{ animationDelay: "200ms" }}>
        <h4 className="mb-3 font-heading font-semibold">Available Molecules</h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {molecules.map((molecule) => (
            <button
              key={molecule.id}
              onClick={() => handleMoleculeSelect(molecule.id)}
              className={cn(
                "rounded-xl border-2 p-4 transition-all text-center hover:scale-105 active:scale-95",
                "border-border hover:border-secondary bg-card hover:bg-secondary/20"
              )}
            >
              <div className={cn("h-12 w-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold", molecule.color)}>
                {molecule.name}
              </div>
              <span className="text-sm font-medium">{molecule.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
