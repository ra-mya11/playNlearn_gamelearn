import { useState } from "react";
import { AppLayout } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { GameBadge } from "@/components/ui/game-badge";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import { 
  ArrowLeft, 
  Heart,
  Brain,
  Eye,
  Hand,
  Ear,
  CircleDot,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface BodyPart {
  id: string;
  name: string;
  icon: typeof Heart;
  description: string;
  funFact: string;
  position: { top: string; left: string };
  learned: boolean;
}

const bodyParts: BodyPart[] = [
  { 
    id: "brain", 
    name: "Brain", 
    icon: Brain,
    description: "Controls all body functions and thoughts",
    funFact: "Your brain uses 20% of your body's energy!",
    position: { top: "8%", left: "45%" },
    learned: false,
  },
  { 
    id: "eyes", 
    name: "Eyes", 
    icon: Eye,
    description: "Allow us to see the world around us",
    funFact: "Your eyes can distinguish about 10 million colors!",
    position: { top: "15%", left: "45%" },
    learned: false,
  },
  { 
    id: "ears", 
    name: "Ears", 
    icon: Ear,
    description: "Help us hear sounds and maintain balance",
    funFact: "Your ears never stop working, even when you sleep!",
    position: { top: "15%", left: "58%" },
    learned: false,
  },
  { 
    id: "heart", 
    name: "Heart", 
    icon: Heart,
    description: "Pumps blood throughout your body",
    funFact: "Your heart beats about 100,000 times every day!",
    position: { top: "35%", left: "52%" },
    learned: false,
  },
  { 
    id: "hands", 
    name: "Hands", 
    icon: Hand,
    description: "Allow us to touch, grip, and create",
    funFact: "Your hands have 27 bones each!",
    position: { top: "55%", left: "30%" },
    learned: false,
  },
];

export default function BiologyExplorer() {
  const navigate = useNavigate();
  const [parts, setParts] = useState(bodyParts);
  const [selectedPart, setSelectedPart] = useState<BodyPart | null>(null);
  const [score, setScore] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);

  const handlePartClick = (part: BodyPart) => {
    setSelectedPart(part);
    if (!part.learned) {
      const newParts = parts.map(p => 
        p.id === part.id ? { ...p, learned: true } : p
      );
      setParts(newParts);
      setScore(score + 20);
      toast({ 
        title: `🧬 Learned about ${part.name}!`, 
        description: "+20 points",
      });
    }
  };

  const learnedCount = parts.filter(p => p.learned).length;
  const progress = (learnedCount / parts.length) * 100;

  return (
    <AppLayout role="student" playCoins={1250} title="Body Explorer">
      <div className="px-4 py-6">
        {/* Header */}
        <div className="mb-4 slide-up">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2"
            onClick={() => navigate("/student/biology")}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Tutorial */}
        {showTutorial && (
          <div className="mb-4 rounded-xl border border-primary/30 bg-primary/10 p-4 slide-up">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Explore the Human Body</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Tap on the glowing points to learn about different body parts!
                </p>
                <Button size="sm" onClick={() => setShowTutorial(false)}>
                  Start Exploring!
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mb-4 grid grid-cols-2 gap-3 slide-up" style={{ animationDelay: "50ms" }}>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <CircleDot className="mx-auto mb-1 h-5 w-5 text-primary" />
            <p className="font-heading text-lg font-bold">{score}</p>
            <p className="text-xs text-muted-foreground">Points</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <CheckCircle className="mx-auto mb-1 h-5 w-5 text-secondary" />
            <p className="font-heading text-lg font-bold">{learnedCount}/{parts.length}</p>
            <p className="text-xs text-muted-foreground">Discovered</p>
          </div>
        </div>

        {/* Body Map */}
        <div className="mb-4 rounded-xl border border-border bg-card p-4 slide-up" style={{ animationDelay: "100ms" }}>
          <div className="relative mx-auto h-80 w-48 rounded-xl bg-gradient-to-b from-primary/10 to-secondary/10">
            {/* Simple body outline */}
            <div className="absolute inset-0 flex flex-col items-center">
              {/* Head */}
              <div className="mt-4 h-16 w-16 rounded-full border-2 border-muted-foreground/30" />
              {/* Body */}
              <div className="mt-2 h-24 w-20 rounded-lg border-2 border-muted-foreground/30" />
              {/* Legs */}
              <div className="mt-1 flex gap-4">
                <div className="h-24 w-6 rounded-b-lg border-2 border-muted-foreground/30" />
                <div className="h-24 w-6 rounded-b-lg border-2 border-muted-foreground/30" />
              </div>
            </div>

            {/* Interactive points */}
            {parts.map((part) => (
              <button
                key={part.id}
                onClick={() => handlePartClick(part)}
                className={cn(
                  "absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 flex items-center justify-center transition-all",
                  part.learned 
                    ? "border-secondary bg-secondary/30" 
                    : "border-primary bg-primary/30 animate-pulse"
                )}
                style={{ top: part.position.top, left: part.position.left }}
              >
                <part.icon className={cn(
                  "h-4 w-4",
                  part.learned ? "text-secondary" : "text-primary"
                )} />
              </button>
            ))}
          </div>
        </div>

        {/* Info Panel */}
        {selectedPart && (
          <div className="mb-4 rounded-xl border border-secondary/30 bg-secondary/10 p-4 slide-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-full bg-secondary/20 p-2">
                <selectedPart.icon className="h-6 w-6 text-secondary" />
              </div>
              <h4 className="font-heading text-lg font-bold">{selectedPart.name}</h4>
            </div>
            <p className="text-sm mb-2">{selectedPart.description}</p>
            <div className="rounded-lg bg-background/50 p-3">
              <p className="text-xs font-medium text-muted-foreground">💡 Fun Fact</p>
              <p className="text-sm">{selectedPart.funFact}</p>
            </div>
          </div>
        )}

        {/* Progress */}
        <div className="rounded-xl border border-border bg-card p-4 slide-up" style={{ animationDelay: "150ms" }}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-heading font-semibold">Discovery Progress</h4>
            <GameBadge variant="accent" size="sm">
              +100 🪙
            </GameBadge>
          </div>
          <AnimatedProgress value={progress} variant="success" />
          <p className="mt-2 text-sm text-muted-foreground">
            {progress === 100 
              ? "🎉 You've explored all body parts! Mission complete!"
              : `Explore all body parts to complete the mission`}
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
