import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ConceptIntroPopup } from "@/components/ui/concept-intro-popup";
import { GameCompletionPopup } from "@/components/ui/game-completion-popup";
import { Maximize2, Minimize2, RotateCcw, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LifeStage {
  id: string;
  name: string;
  emoji: string;
  description: string;
  order: number;
}

interface Organism {
  id: string;
  name: string;
  emoji: string;
  color: string;
  stages: LifeStage[];
}

const ORGANISMS: Record<string, Organism> = {
  butterfly: {
    id: "butterfly",
    name: "Butterfly",
    emoji: "🦋",
    color: "from-orange-500/30 to-pink-500/30",
    stages: [
      { id: "b1", name: "Egg", emoji: "🥚", description: "Tiny eggs on a leaf", order: 0 },
      { id: "b2", name: "Caterpillar", emoji: "🐛", description: "Hungry eating stage", order: 1 },
      { id: "b3", name: "Chrysalis", emoji: "🫘", description: "Transformation stage", order: 2 },
      { id: "b4", name: "Butterfly", emoji: "🦋", description: "Beautiful flying stage", order: 3 },
    ],
  },
  frog: {
    id: "frog",
    name: "Frog",
    emoji: "🐸",
    color: "from-green-500/30 to-blue-500/30",
    stages: [
      { id: "f1", name: "Eggs", emoji: "🥚", description: "Jelly-like frog eggs", order: 0 },
      { id: "f2", name: "Tadpole", emoji: "🐟", description: "Water-dwelling stage", order: 1 },
      { id: "f3", name: "Tadpole + Legs", emoji: "🐸", description: "Growing legs", order: 2 },
      { id: "f4", name: "Froglet", emoji: "🐸", description: "Tail shrinking", order: 3 },
      { id: "f5", name: "Adult Frog", emoji: "🐸", description: "Full grown amphibian", order: 4 },
    ],
  },
  plant: {
    id: "plant",
    name: "Plant",
    emoji: "🌱",
    color: "from-green-500/30 to-lime-500/30",
    stages: [
      { id: "p1", name: "Seed", emoji: "🫘", description: "Dormant stage", order: 0 },
      { id: "p2", name: "Sprout", emoji: "🌱", description: "First growth", order: 1 },
      { id: "p3", name: "Seedling", emoji: "🌿", description: "Young plant", order: 2 },
      { id: "p4", name: "Flowering", emoji: "🌸", description: "Blooming stage", order: 3 },
      { id: "p5", name: "Mature Plant", emoji: "🌳", description: "Full grown", order: 4 },
    ],
  },
  human: {
    id: "human",
    name: "Human",
    emoji: "👶",
    color: "from-yellow-500/30 to-orange-500/30",
    stages: [
      { id: "h1", name: "Baby", emoji: "👶", description: "Newborn", order: 0 },
      { id: "h2", name: "Toddler", emoji: "🧒", description: "Early childhood", order: 1 },
      { id: "h3", name: "Child", emoji: "👦", description: "Growing up", order: 2 },
      { id: "h4", name: "Teenager", emoji: "👨", description: "Adolescence", order: 3 },
      { id: "h5", name: "Adult", emoji: "🧑", description: "Fully grown", order: 4 },
    ],
  },
};

interface DraggedStage extends LifeStage {
  position: number; // Current position in sequence
}

export default function CycleTap() {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [selectedOrganism, setSelectedOrganism] = useState<string | null>(null);
  const [gameWon, setGameWon] = useState(false);

  // Game state
  const [sequence, setSequence] = useState<DraggedStage[]>([]);
  const [unplacedStages, setUnplacedStages] = useState<LifeStage[]>([]);
  const [feedback, setFeedback] = useState("");
  const [shakeStage, setShakeStage] = useState<string | null>(null);

  // Initialize game when organism is selected
  useEffect(() => {
    if (selectedOrganism && gameStarted) {
      const organism = ORGANISMS[selectedOrganism];
      const shuffled = [...organism.stages].sort(() => Math.random() - 0.5);
      setUnplacedStages(shuffled);
      setSequence([]);
    }
  }, [selectedOrganism, gameStarted]);

  const handleOrganismSelect = (orgId: string) => {
    setSelectedOrganism(orgId);
  };

  const handleDragStart = (e: React.DragEvent, stage: LifeStage, from: "unplaced" | "sequence", sequenceIndex?: number) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("stageId", stage.id);
    e.dataTransfer.setData("from", from);
    if (sequenceIndex !== undefined) {
      e.dataTransfer.setData("sequenceIndex", sequenceIndex.toString());
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropOnSequence = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const stageId = e.dataTransfer.getData("stageId");
    const from = e.dataTransfer.getData("from") as "unplaced" | "sequence";
    const sequenceIndexStr = e.dataTransfer.getData("sequenceIndex");

    const organism = ORGANISMS[selectedOrganism!];
    const stage = organism.stages.find((s) => s.id === stageId);
    if (!stage) return;

    // Remove from source
    if (from === "unplaced") {
      setUnplacedStages((prev) => prev.filter((s) => s.id !== stageId));
    } else {
      const sequenceIndex = parseInt(sequenceIndexStr);
      setSequence((prev) => prev.filter((_, i) => i !== sequenceIndex));
    }

    // Add to sequence at drop position
    const draggedStage: DraggedStage = { ...stage, position: dropIndex };
    const newSequence = [...sequence];
    newSequence.splice(dropIndex, 0, draggedStage);

    // Reassign positions
    newSequence.forEach((s, i) => (s.position = i));
    setSequence(newSequence);

    // Check if correct order
    const isCorrect = newSequence.every((s, i) => s.order === i);
    if (isCorrect && newSequence.length === organism.stages.length) {
      handleSequenceComplete();
    }
  };

  const handleDropOnUnplaced = (e: React.DragEvent) => {
    e.preventDefault();
    const stageId = e.dataTransfer.getData("stageId");
    const from = e.dataTransfer.getData("from") as "unplaced" | "sequence";

    if (from === "sequence") {
      const sequenceIndex = parseInt(e.dataTransfer.getData("sequenceIndex"));
      const organism = ORGANISMS[selectedOrganism!];
      const stage = sequence[sequenceIndex];

      setSequence((prev) => prev.filter((_, i) => i !== sequenceIndex));
      setUnplacedStages((prev) => [...prev, stage]);
    }
  };

  const handleIncorrectPlacement = (stageId: string) => {
    setShakeStage(stageId);
    setFeedback("❌ Wrong position! Try again.");
    setTimeout(() => {
      setShakeStage(null);
      setFeedback("");
    }, 600);
  };

  const handleSequenceComplete = () => {
    setShowCompletion(true);
    setGameWon(true);
    setFeedback("✅ Perfect sequence! The life cycle is complete!");
  };

  const handleRetry = () => {
    setSelectedOrganism(null);
    setSequence([]);
    setUnplacedStages([]);
    setFeedback("");
    setShakeStage(null);
    setGameStarted(false);
    setShowCompletion(false);
    setGameWon(false);
  };

  const organism = selectedOrganism ? ORGANISMS[selectedOrganism] : null;

  const gameContent = (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-purple-900/10 to-blue-900/20 relative overflow-hidden p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 right-1/4 text-6xl animate-bounce">🌞</div>
        <div className="absolute bottom-20 left-1/4 text-5xl animate-pulse">🌿</div>
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        {/* Organism Selection */}
        {!selectedOrganism ? (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Select an Organism
              </h2>
              <p className="text-sm text-muted-foreground">
                Choose which life cycle you want to master!
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.values(ORGANISMS).map((org) => (
                <button
                  key={org.id}
                  onClick={() => handleOrganismSelect(org.id)}
                  className={`p-4 rounded-lg border-2 transition-all transform hover:scale-105 flex flex-col items-center gap-2 ${
                    selectedOrganism === org.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card/50 hover:border-primary/50"
                  }`}
                >
                  <div className="text-4xl">{org.emoji}</div>
                  <span className="text-sm font-medium text-foreground">
                    {org.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {org.stages.length} stages
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setGameStarted(true);
              }}
              disabled={!selectedOrganism}
              className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-bold rounded-lg transition-all transform hover:scale-105"
            >
              ▶️ Start Game
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Organism Header */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground mb-1">
                {organism?.emoji} {organism?.name} Life Cycle
              </h2>
              <p className="text-sm text-muted-foreground">
                Arrange the stages in the correct order
              </p>
            </div>

            {/* Feedback */}
            {feedback && (
              <div
                className={`p-3 rounded-lg text-center transition-all ${
                  feedback.includes("Perfect") || feedback.includes("Wrong")
                    ? feedback.includes("Wrong")
                      ? "bg-orange-500/20 text-orange-600 border border-orange-500/30"
                      : "bg-green-500/20 text-green-600 border border-green-500/30"
                    : "bg-blue-500/20 text-blue-600 border border-blue-500/30"
                }`}
              >
                {feedback}
              </div>
            )}

            {/* Sequence Builder */}
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => {
                e.preventDefault();
                const from = e.dataTransfer.getData("from");
                if (from === "unplaced") {
                  const stageId = e.dataTransfer.getData("stageId");
                  const stage = unplacedStages.find((s) => s.id === stageId);
                  if (stage) {
                    handleDropOnSequence(e, sequence.length);
                  }
                }
              }}
              className={`bg-gradient-to-br ${organism?.color} border-2 border-dashed border-border rounded-lg p-6 min-h-32 flex items-center justify-center transition-all`}
            >
              {sequence.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center">
                  Drag stages here to build the life cycle in order →
                </p>
              ) : (
                <div className="flex gap-3 flex-wrap justify-center items-center w-full">
                  {sequence.map((stage, index) => (
                    <div
                      key={`${stage.id}-${index}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, stage, "sequence", index)}
                      className={`flex flex-col items-center gap-1 p-3 bg-card rounded-lg border-2 border-primary/50 cursor-move transition-all transform hover:scale-105 ${
                        shakeStage === stage.id ? "animate-bounce" : ""
                      }`}
                    >
                      <div className="text-3xl">{stage.emoji}</div>
                      <span className="text-xs font-medium text-foreground">
                        {stage.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Unplaced Stages */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                🎴 Available Stages ({unplacedStages.length})
              </p>
              <div
                onDragOver={handleDragOver}
                onDrop={handleDropOnUnplaced}
                className="bg-muted/30 border border-border rounded-lg p-4 flex flex-wrap gap-3 justify-center min-h-24 items-center"
              >
                {unplacedStages.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    All stages placed! ✅
                  </p>
                ) : (
                  unplacedStages.map((stage) => (
                    <div
                      key={stage.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, stage, "unplaced")}
                      className="flex flex-col items-center gap-1 p-3 bg-card rounded-lg border-2 border-border hover:border-primary/50 cursor-move transition-all transform hover:scale-105"
                    >
                      <div className="text-3xl">{stage.emoji}</div>
                      <span className="text-xs font-medium text-foreground text-center">
                        {stage.name}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Stage Descriptions */}
            {selectedOrganism && sequence.length === 0 && (
              <div className="bg-accent/20 border border-accent/50 rounded-lg p-3 text-center text-xs text-muted-foreground">
                💡 Drag each stage into the sequence area in the correct biological order
              </div>
            )}

            {/* Help Text */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                {organism?.stages.length === sequence.length
                  ? `You've arranged all ${sequence.length} stages! Check if the order is correct.`
                  : `Place ${sequence.length}/${organism?.stages.length} stages`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const gameView = (
    <div className={isFullscreen ? "fixed inset-0 z-50 bg-background" : "relative"}>
      <div className={isFullscreen ? "h-screen flex flex-col" : "h-[650px] relative"}>
        {/* Game Canvas with Fullscreen Button */}
        <div className="flex-1 overflow-auto relative">
          {gameContent}

          {/* Fullscreen Button - Positioned Top-Right Inside Canvas */}
          {selectedOrganism && (
            <button
              onClick={() => setIsFullscreen(true)}
              className="absolute top-4 right-4 z-40 w-11 h-11 flex items-center justify-center rounded-lg bg-primary/90 hover:bg-primary text-primary-foreground transition-all transform hover:scale-110 shadow-lg border border-primary/20 touch-none"
              title="Fullscreen"
              aria-label="Toggle fullscreen"
            >
              <Maximize2 className="h-5 w-5" />
            </button>
          )}
        </div>

        {!isFullscreen && selectedOrganism && (
          <div className="border-t border-border bg-card/50 p-4 space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                🧠 Learning: Life Cycle Stages
              </p>
              <p className="text-xs text-muted-foreground">
                Arrange the stages of an organism's life cycle in the correct biological order
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" /> Retry
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/student/biology")}
                className="gap-2 ml-auto"
              >
                <ChevronLeft className="h-4 w-4" /> Back to Biology
              </Button>
            </div>
          </div>
        )}

        {!isFullscreen && !selectedOrganism && (
          <div className="border-t border-border bg-card/50 p-4 space-y-3">
            <p className="text-xs text-muted-foreground">
              ← Select an organism to begin
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/student/biology")}
              className="gap-2 ml-auto"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Biology
            </Button>
          </div>
        )}
      </div>

      {isFullscreen && (
        <div className="fixed bottom-6 right-6 flex gap-2 z-50">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRetry}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" /> Retry
          </Button>
          <Button
            size="sm"
            onClick={() => setIsFullscreen(false)}
            className="gap-2"
          >
            <Minimize2 className="h-4 w-4" /> Exit
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <ConceptIntroPopup
        isOpen={showIntro}
        onStart={() => {
          setShowIntro(false);
          setGameStarted(true);
        }}
        conceptName="🔄 Cycle Connect"
        whatYouWillUnderstand="Learn that living organisms go through specific life cycle stages in a fixed order. Each stage is necessary and cannot be skipped."
        gameSteps={[
          "Select an organism (butterfly, frog, plant, or human)",
          "Drag the scrambled life cycle stages into the correct order",
          "Complete the sequence to see the full life cycle animation",
        ]}
        successMeaning="You'll understand how nature follows patterns and why the order of life stages matters!"
        icon="🦋"
      />

      <GameCompletionPopup
        isOpen={showCompletion}
        onPlayAgain={handleRetry}
        onExitFullscreen={() => setIsFullscreen(false)}
        onBackToGames={() => navigate("/student/biology")}
        learningOutcome={
          gameWon
            ? `You mastered the ${organism?.name} life cycle! You learned that each stage is necessary and happens in a precise order.`
            : "Good try! Remember: life cycles follow nature's rules. Practice ordering different organisms!"
        }
        isFullscreen={isFullscreen}
      />

      <div className="bg-background">
        {!isFullscreen ? (
          <div className="max-w-4xl mx-auto">
            {gameView}
          </div>
        ) : (
          gameView
        )}
      </div>
    </>
  );
}
