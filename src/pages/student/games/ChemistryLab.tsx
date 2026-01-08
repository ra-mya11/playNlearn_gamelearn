import { useState } from "react";
import { AppLayout } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { GameBadge } from "@/components/ui/game-badge";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import { 
  ArrowLeft, 
  FlaskConical,
  Droplets,
  Flame,
  Beaker,
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  HelpCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface Chemical {
  id: string;
  name: string;
  color: string;
  icon: typeof FlaskConical;
}

const chemicals: Chemical[] = [
  { id: "water", name: "Water (H₂O)", color: "bg-blue-400", icon: Droplets },
  { id: "acid", name: "Acid", color: "bg-yellow-400", icon: FlaskConical },
  { id: "base", name: "Base", color: "bg-purple-400", icon: Beaker },
  { id: "salt", name: "Salt", color: "bg-gray-300", icon: FlaskConical },
];

const reactions = [
  { chemicals: ["acid", "base"], result: "Neutralization!", color: "bg-green-400", points: 50 },
  { chemicals: ["water", "salt"], result: "Salt Solution!", color: "bg-blue-300", points: 30 },
];

export default function ChemistryLab() {
  const navigate = useNavigate();
  const [selectedChemicals, setSelectedChemicals] = useState<string[]>([]);
  const [reactionResult, setReactionResult] = useState<string | null>(null);
  const [resultColor, setResultColor] = useState<string>("bg-muted");
  const [score, setScore] = useState(0);
  const [experimentsCompleted, setExperimentsCompleted] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);

  const handleChemicalSelect = (chemicalId: string) => {
    if (selectedChemicals.includes(chemicalId)) {
      setSelectedChemicals(selectedChemicals.filter(id => id !== chemicalId));
      return;
    }

    if (selectedChemicals.length >= 2) {
      toast({ title: "Maximum 2 chemicals!", description: "Remove one to add another." });
      return;
    }

    setSelectedChemicals([...selectedChemicals, chemicalId]);
  };

  const mixChemicals = () => {
    if (selectedChemicals.length < 2) {
      toast({ title: "Add more chemicals!", description: "You need 2 chemicals to mix." });
      return;
    }

    const reaction = reactions.find(r => 
      r.chemicals.every(c => selectedChemicals.includes(c)) &&
      selectedChemicals.every(c => r.chemicals.includes(c))
    );

    if (reaction) {
      setReactionResult(reaction.result);
      setResultColor(reaction.color);
      setScore(score + reaction.points);
      setExperimentsCompleted(experimentsCompleted + 1);
      toast({ 
        title: "🧪 Reaction Complete!", 
        description: `${reaction.result} +${reaction.points} points`,
      });
    } else {
      setReactionResult("No reaction...");
      setResultColor("bg-muted");
      toast({ title: "No reaction", description: "Try a different combination!" });
    }
  };

  const resetExperiment = () => {
    setSelectedChemicals([]);
    setReactionResult(null);
    setResultColor("bg-muted");
  };

  return (
    <AppLayout role="student" playCoins={1250} title="Virtual Chemistry Lab">
      <div className="px-4 py-6">
        {/* Header */}
        <div className="mb-4 slide-up">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2"
            onClick={() => navigate("/student/chemistry")}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Safety Warning */}
        <div className="mb-4 rounded-xl border border-accent/30 bg-accent/10 p-4 slide-up">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-accent" />
            <p className="text-sm font-medium">Virtual Lab - Safe to experiment!</p>
          </div>
        </div>

        {/* Tutorial */}
        {showTutorial && (
          <div className="mb-4 rounded-xl border border-primary/30 bg-primary/10 p-4 slide-up">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">How to Experiment</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Select 2 chemicals, then tap "Mix" to see the reaction!
                </p>
                <Button size="sm" onClick={() => setShowTutorial(false)}>
                  Got it!
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
            <p className="font-heading text-lg font-bold">{experimentsCompleted}</p>
            <p className="text-xs text-muted-foreground">Experiments</p>
          </div>
        </div>

        {/* Reaction Vessel */}
        <div className="mb-4 rounded-xl border border-border bg-card p-6 slide-up" style={{ animationDelay: "100ms" }}>
          <h4 className="mb-4 font-heading font-semibold text-center">Reaction Vessel</h4>
          <div className={cn(
            "mx-auto h-32 w-32 rounded-b-full border-4 border-t-0 border-muted-foreground/30 flex items-center justify-center transition-all duration-500",
            resultColor
          )}>
            {reactionResult ? (
              <p className="text-sm font-medium text-center px-2">{reactionResult}</p>
            ) : selectedChemicals.length > 0 ? (
              <p className="text-sm text-muted-foreground">{selectedChemicals.length}/2</p>
            ) : (
              <Beaker className="h-8 w-8 text-muted-foreground/50" />
            )}
          </div>
          
          <div className="mt-4 flex justify-center gap-3">
            <Button onClick={mixChemicals} disabled={selectedChemicals.length < 2}>
              <Flame className="mr-2 h-4 w-4" />
              Mix
            </Button>
            <Button variant="outline" onClick={resetExperiment}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        {/* Chemical Palette */}
        <div className="rounded-xl border border-border bg-card p-4 slide-up" style={{ animationDelay: "150ms" }}>
          <h4 className="mb-3 font-heading font-semibold">Chemicals</h4>
          <div className="grid grid-cols-2 gap-3">
            {chemicals.map((chemical) => {
              const isSelected = selectedChemicals.includes(chemical.id);
              return (
                <button
                  key={chemical.id}
                  onClick={() => handleChemicalSelect(chemical.id)}
                  className={cn(
                    "rounded-xl border-2 p-4 transition-all flex items-center gap-3",
                    isSelected 
                      ? "border-primary bg-primary/20" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className={cn("h-8 w-8 rounded-full", chemical.color)} />
                  <span className="text-sm font-medium">{chemical.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4 rounded-xl border border-border bg-card p-4 slide-up" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-heading font-semibold">Mission Progress</h4>
            <GameBadge variant="accent" size="sm">
              +100 🪙
            </GameBadge>
          </div>
          <AnimatedProgress value={(experimentsCompleted / 5) * 100} />
          <p className="mt-2 text-sm text-muted-foreground">
            Complete 5 experiments to finish this mission ({experimentsCompleted}/5)
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
