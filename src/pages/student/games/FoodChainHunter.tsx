import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ConceptIntroPopup } from "@/components/ui/concept-intro-popup";
import { GameCompletionPopup } from "@/components/ui/game-completion-popup";
import { Maximize2, Minimize2, RotateCcw, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FoodChainStage {
  animal: string;
  emoji: string;
  requiredFood: string;
  foodEmoji: string;
  foodOptions: { name: string; emoji: string; correct: boolean }[];
}

const FOOD_CHAIN_STAGES: FoodChainStage[] = [
  {
    animal: "Deer",
    emoji: "🦌",
    requiredFood: "Grass",
    foodEmoji: "🌱",
    foodOptions: [
      { name: "Grass", emoji: "🌱", correct: true },
      { name: "Meat", emoji: "🥩", correct: false },
      { name: "Corn", emoji: "🌽", correct: true },
    ],
  },
  {
    animal: "Lion",
    emoji: "🦁",
    requiredFood: "Deer",
    foodEmoji: "🦌",
    foodOptions: [
      { name: "Grass", emoji: "🌱", correct: false },
      { name: "Deer", emoji: "🦌", correct: true },
      { name: "Zebra", emoji: "🦓", correct: true },
    ],
  },
  {
    animal: "Sun",
    emoji: "☀️",
    requiredFood: "Energy",
    foodEmoji: "⚡",
    foodOptions: [
      { name: "Energy", emoji: "⚡", correct: true },
      { name: "Water", emoji: "💧", correct: false },
      { name: "Light", emoji: "✨", correct: true },
    ],
  },
];

export default function FoodChainHunter() {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);
  const [currentStage, setCurrentStage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showCompletion, setShowCompletion] = useState(false);
  const [energyFilled, setEnergyFilled] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const stage = FOOD_CHAIN_STAGES[currentStage];

  useEffect(() => {
    if (selectedFood) {
      const isCorrect = stage.foodOptions.find(
        (f) => f.name === selectedFood
      )?.correct;

      setIsAnimating(true);
      if (isCorrect) {
        setFeedbackMessage("✨ Perfect! Energy flowing!");
        setEnergyFilled((prev) => Math.min(prev + 33, 100));
        setTimeout(() => {
          if (currentStage < FOOD_CHAIN_STAGES.length - 1) {
            setCurrentStage(currentStage + 1);
            setSelectedFood(null);
            setFeedbackMessage("");
            setIsAnimating(false);
          } else {
            setShowCompletion(true);
          }
        }, 1500);
      } else {
        setFeedbackMessage("⚠️ Not quite right. Try again!");
        setTimeout(() => {
          setSelectedFood(null);
          setFeedbackMessage("");
          setIsAnimating(false);
        }, 1500);
      }
    }
  }, [selectedFood, currentStage]);

  const handleRetry = () => {
    setCurrentStage(0);
    setSelectedFood(null);
    setFeedbackMessage("");
    setEnergyFilled(0);
    setShowCompletion(false);
  };

  const content = (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-green-900/20 to-blue-900/20 relative overflow-hidden p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl animate-float">☀️</div>
        <div className="absolute top-20 right-12 text-4xl animate-pulse">🌤️</div>
        <div className="absolute bottom-20 left-1/3 text-5xl opacity-20">🌳</div>
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        {/* Stage Info */}
        <div className="mb-6 text-center">
          <h3 className="text-sm text-muted-foreground mb-2">
            Stage {currentStage + 1} of {FOOD_CHAIN_STAGES.length}
          </h3>
          <p className="text-xs text-muted-foreground">Building the Food Chain...</p>
        </div>

        {/* Energy Bar */}
        <div className="mb-8 flex justify-center">
          <div className="w-full max-w-xs">
            <div className="text-center mb-2">
              <p className="text-xs text-muted-foreground">Energy Level</p>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden border border-border">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
                style={{ width: `${energyFilled}%` }}
              />
            </div>
            <p className="text-center text-xs mt-1 text-foreground font-medium">
              {energyFilled}%
            </p>
          </div>
        </div>

        {/* Current Animal */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-2 animate-pulse">{stage.emoji}</div>
          <h2 className="text-2xl font-bold text-foreground">{stage.animal}</h2>
          <p className="text-sm text-muted-foreground mt-1">needs to eat...</p>
        </div>

        {/* Feedback Message */}
        {feedbackMessage && (
          <div
            className={`text-center mb-6 p-3 rounded-lg transition-all ${
              feedbackMessage.includes("Perfect")
                ? "bg-green-500/20 text-green-600"
                : "bg-yellow-500/20 text-yellow-600"
            }`}
          >
            {feedbackMessage}
          </div>
        )}

        {/* Food Options */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {stage.foodOptions.map((food) => (
            <button
              key={food.name}
              onClick={() => !isAnimating && setSelectedFood(food.name)}
              disabled={isAnimating}
              className={`p-4 rounded-xl border-2 transition-all transform hover:scale-110 ${
                selectedFood === food.name
                  ? "border-green-500 bg-green-500/20 scale-110"
                  : "border-border bg-card/50 hover:border-primary/50"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="text-4xl mb-2">{food.emoji}</div>
              <p className="text-xs font-medium text-foreground">{food.name}</p>
            </button>
          ))}
        </div>

        {/* Instructions */}
        <div className="text-center text-xs text-muted-foreground bg-muted/20 rounded-lg p-3">
          👆 Tap the correct food to feed the {stage.animal}!
        </div>
      </div>
    </div>
  );

  const gameView = (
    <div className={isFullscreen ? "fixed inset-0 z-50 bg-background" : ""}>
      <div className={isFullscreen ? "h-screen flex flex-col" : "h-[400px]"}>
        {/* Game Canvas with Fullscreen Button */}
        <div className="flex-1 overflow-hidden relative">
          {content}

          {/* Fullscreen Button - Positioned Top-Right Inside Canvas */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-4 right-4 z-40 w-11 h-11 flex items-center justify-center rounded-lg bg-primary/90 hover:bg-primary text-primary-foreground transition-all transform hover:scale-110 shadow-lg border border-primary/20 touch-none"
            title="Fullscreen"
            aria-label="Toggle fullscreen"
          >
            <Maximize2 className="h-5 w-5" />
          </button>
        </div>

        {/* Controls */}
        {!isFullscreen && (
          <div className="border-t border-border bg-card/50 p-4 space-y-2">
            <p className="text-sm font-medium text-foreground">
              🧠 Learning: Food Chain & Energy Flow
            </p>
            <p className="text-xs text-muted-foreground">
              Complete the food chain by feeding each animal correctly
            </p>
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
      </div>

      {/* Fullscreen Controls */}
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
        onStart={() => setShowIntro(false)}
        conceptName="🌿 Food Chain Hunter"
        whatYouWillUnderstand="Understand how energy flows from plants to animals, and how removing one species affects the entire ecosystem."
        gameSteps={[
          "Feed each animal with the correct food source",
          "Watch energy flow through the food chain",
          "Complete all three levels to balance the ecosystem",
        ]}
        successMeaning="You'll see the complete food chain working and the ecosystem glowing with balance!"
        icon="🌍"
      />

      <GameCompletionPopup
        isOpen={showCompletion}
        onPlayAgain={handleRetry}
        onExitFullscreen={() => setIsFullscreen(false)}
        onBackToGames={() => navigate("/student/biology")}
        learningOutcome="You now understand how energy flows through the food chain and why every organism matters!"
        isFullscreen={isFullscreen}
      />

      {/* Game Container */}
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
