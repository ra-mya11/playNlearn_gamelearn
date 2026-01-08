import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ConceptIntroPopup } from "@/components/ui/concept-intro-popup";
import { GameCompletionPopup } from "@/components/ui/game-completion-popup";
import { Maximize2, Minimize2, RotateCcw, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type GrowthStage = "seed" | "sprout" | "seedling" | "young-plant" | "flowering" | "blooming";

const GROWTH_STAGES: Record<GrowthStage, { emoji: string; label: string }> = {
  seed: { emoji: "🫘", label: "Seed" },
  sprout: { emoji: "🌱", label: "Sprout" },
  seedling: { emoji: "🌿", label: "Seedling" },
  "young-plant": { emoji: "🪴", label: "Young Plant" },
  flowering: { emoji: "🌸", label: "Flowering" },
  blooming: { emoji: "🌻", label: "Blooming" },
};

const STAGE_ORDER: GrowthStage[] = [
  "seed",
  "sprout",
  "seedling",
  "young-plant",
  "flowering",
  "blooming",
];

interface PlantState {
  stage: GrowthStage;
  sunlight: number;
  water: number;
  air: number;
  health: number;
}

interface DayRecord {
  day: number;
  sunlight: number;
  water: number;
  air: number;
  balanced: boolean;
}

const isBalanced = (sunlight: number, water: number, air: number): boolean => {
  // Optimal ranges:
  // Sunlight: 50-80%
  // Water: 40-70%
  // Air: 60-100%
  const sunOk = sunlight >= 50 && sunlight <= 80;
  const waterOk = water >= 40 && water <= 70;
  const airOk = air >= 60 && air <= 100;
  return sunOk && waterOk && airOk;
};

const getConditionFeedback = (
  sunlight: number,
  water: number,
  air: number
): { message: string; healthDelta: number; visual: string } => {
  let issues: string[] = [];
  let healthDelta = 0;

  if (sunlight > 90) {
    issues.push("burnt leaves");
    healthDelta -= 4;
  } else if (sunlight < 35) {
    issues.push("weak growth");
    healthDelta -= 3;
  }

  if (water > 85) {
    issues.push("root rot");
    healthDelta -= 5;
  } else if (water < 20) {
    issues.push("dried out");
    healthDelta -= 4;
  }

  if (air < 30) {
    issues.push("suffocation");
    healthDelta -= 3;
  }

  if (issues.length === 0) {
    return {
      message: "Perfect balance! Plant is thriving 🌟",
      healthDelta: 5,
      visual: "healthy",
    };
  }

  return {
    message: `Issues: ${issues.join(", ")}`,
    healthDelta,
    visual: "stressed",
  };
};

export default function SproutHelp() {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // Game state
  const [currentDay, setCurrentDay] = useState(1);
  const [dayInputs, setDayInputs] = useState({ sunlight: 65, water: 55, air: 80 });
  const [plant, setPlant] = useState<PlantState>({
    stage: "seed",
    sunlight: 65,
    water: 55,
    air: 80,
    health: 100,
  });
  const [dayHistory, setDayHistory] = useState<DayRecord[]>([]);
  const [consecutiveImbalance, setConsecutiveImbalance] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [showDayResult, setShowDayResult] = useState(false);

  // Check for win condition
  useEffect(() => {
    if (gameStarted && !showCompletion) {
      const balancedDays = dayHistory.filter((d) => d.balanced).length;
      if (
        balancedDays >= 4 &&
        plant.stage !== "seed" &&
        plant.stage !== "sprout"
      ) {
        setShowCompletion(true);
        setGameWon(true);
      }
    }
  }, [dayHistory, plant.stage, gameStarted, showCompletion]);

  // Check for lose condition
  useEffect(() => {
    if (consecutiveImbalance >= 2) {
      setShowCompletion(true);
      setGameWon(false);
      setFeedback("Plant wilted from too many consecutive imbalances ☹️");
    }
  }, [consecutiveImbalance]);

  const handleNextDay = () => {
    if (currentDay > 5) return;

    const balanced = isBalanced(dayInputs.sunlight, dayInputs.water, dayInputs.air);
    const feedback = getConditionFeedback(
      dayInputs.sunlight,
      dayInputs.water,
      dayInputs.air
    );

    // Record day
    const newRecord: DayRecord = {
      day: currentDay,
      sunlight: dayInputs.sunlight,
      water: dayInputs.water,
      air: dayInputs.air,
      balanced,
    };
    setDayHistory([...dayHistory, newRecord]);

    // Update plant state
    const newHealth = Math.max(0, plant.health + feedback.healthDelta);
    let newStage = plant.stage;

    // Advance stage if conditions are right
    if (balanced && newHealth > 60) {
      const currentIndex = STAGE_ORDER.indexOf(plant.stage);
      if (currentIndex < STAGE_ORDER.length - 1) {
        newStage = STAGE_ORDER[currentIndex + 1];
      }
    }

    setPlant({
      stage: newStage,
      sunlight: dayInputs.sunlight,
      water: dayInputs.water,
      air: dayInputs.air,
      health: newHealth,
    });

    setFeedback(feedback.message);
    setShowDayResult(true);

    // Update imbalance counter
    if (!balanced) {
      setConsecutiveImbalance(consecutiveImbalance + 1);
    } else {
      setConsecutiveImbalance(0);
    }

    // Move to next day after showing result
    setTimeout(() => {
      if (currentDay < 5) {
        setCurrentDay(currentDay + 1);
        setShowDayResult(false);
        setFeedback("");
      } else {
        // Game ends after day 5
        setShowCompletion(true);
        setGameWon(false);
      }
    }, 2000);
  };

  const handleRetry = () => {
    setCurrentDay(1);
    setDayInputs({ sunlight: 65, water: 55, air: 80 });
    setPlant({
      stage: "seed",
      sunlight: 65,
      water: 55,
      air: 80,
      health: 100,
    });
    setDayHistory([]);
    setConsecutiveImbalance(0);
    setFeedback("");
    setShowDayResult(false);
    setGameStarted(false);
    setShowCompletion(false);
    setGameWon(false);
  };

  const getHealthColor = () => {
    if (plant.health > 80) return "text-green-500";
    if (plant.health > 50) return "text-yellow-500";
    if (plant.health > 0) return "text-orange-500";
    return "text-red-500";
  };

  const getStageProgress = () => {
    const currentIndex = STAGE_ORDER.indexOf(plant.stage);
    return ((currentIndex + 1) / STAGE_ORDER.length) * 100;
  };

  const gameContent = (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-900/10 to-green-900/20 relative overflow-hidden p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-4 right-1/4 text-6xl animate-bounce">☀️</div>
        <div className="absolute bottom-1/4 left-1/4 text-5xl animate-pulse">🌍</div>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Day Counter */}
        <div className="text-center mb-6">
          <p className="text-sm font-medium text-muted-foreground">
            📅 Day {currentDay} of 5
          </p>
        </div>

        {/* Plant Display */}
        <div className="text-center mb-8">
          <div className={`text-8xl mb-4 transition-all duration-300 ${plant.health < 40 ? "opacity-60" : ""}`}>
            {GROWTH_STAGES[plant.stage].emoji}
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {GROWTH_STAGES[plant.stage].label}
          </h2>

          {/* Growth Progress Bar */}
          <div className="mt-4 w-full max-w-xs mx-auto">
            <div className="h-3 bg-muted rounded-full overflow-hidden border border-border">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
                style={{ width: `${getStageProgress()}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {GROWTH_STAGES[plant.stage].label} Stage
            </p>
          </div>
        </div>

        {/* Health Status */}
        <div className="text-center mb-8">
          <div className={`text-3xl font-bold ${getHealthColor()}`}>
            Health: {Math.round(plant.health)}%
          </div>
          {consecutiveImbalance > 0 && (
            <p className="text-xs text-red-500 mt-1">
              ⚠️ Imbalances: {consecutiveImbalance}/2
            </p>
          )}
        </div>

        {/* Day Result Feedback */}
        {showDayResult && (
          <div
            className={`mb-6 p-3 rounded-lg text-center text-sm transition-all ${
              feedback.includes("Perfect")
                ? "bg-green-500/20 text-green-600 border border-green-500/30"
                : "bg-orange-500/20 text-orange-600 border border-orange-500/30"
            }`}
          >
            {feedback}
          </div>
        )}

        {/* Player Controls - Day Input */}
        {!showDayResult && currentDay <= 5 && (
          <div className="space-y-6 mb-8">
            <div className="bg-muted/20 rounded-xl p-4 space-y-4 border border-border">
              {/* Sunlight Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    ☀️ Sunlight
                  </label>
                  <span className="text-sm font-bold text-yellow-500">
                    {dayInputs.sunlight}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={dayInputs.sunlight}
                  onChange={(e) =>
                    setDayInputs({ ...dayInputs, sunlight: parseInt(e.target.value) })
                  }
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Too Low</span>
                  <span>Optimal (50-80%)</span>
                  <span>Too High</span>
                </div>
              </div>

              {/* Water Button */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    💧 Water
                  </label>
                  <span className="text-sm font-bold text-blue-500">
                    {dayInputs.water}%
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setDayInputs({
                        ...dayInputs,
                        water: Math.min(100, dayInputs.water + 15),
                      })
                    }
                    className="flex-1 px-3 py-2 bg-primary/20 border border-primary/50 rounded hover:bg-primary/30 transition-all font-medium"
                  >
                    💧 Add Water
                  </button>
                  <button
                    onClick={() =>
                      setDayInputs({
                        ...dayInputs,
                        water: Math.max(0, dayInputs.water - 10),
                      })
                    }
                    className="flex-1 px-3 py-2 bg-muted border border-border rounded hover:bg-muted/80 transition-all"
                  >
                    🏜️ Drain
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Optimal: 40-70% | Current: {dayInputs.water}%
                </p>
              </div>

              {/* Air Toggle */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    🌬️ Air Flow
                  </label>
                  <span className="text-sm font-bold text-cyan-500">
                    {dayInputs.air}%
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setDayInputs({ ...dayInputs, air: Math.min(100, dayInputs.air + 10) })
                    }
                    className="flex-1 px-3 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded hover:bg-cyan-500/30 transition-all font-medium"
                  >
                    🌬️ Increase
                  </button>
                  <button
                    onClick={() =>
                      setDayInputs({ ...dayInputs, air: Math.max(0, dayInputs.air - 10) })
                    }
                    className="flex-1 px-3 py-2 bg-muted border border-border rounded hover:bg-muted/80 transition-all"
                  >
                    🪟 Decrease
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Optimal: 60-100% | Current: {dayInputs.air}%
                </p>
              </div>
            </div>

            {/* Next Day Button */}
            <button
              onClick={handleNextDay}
              className="w-full px-4 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold rounded-lg transition-all transform hover:scale-105"
            >
              ➡️ Next Day
            </button>
          </div>
        )}

        {/* Day History/Progress */}
        {dayHistory.length > 0 && (
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 text-xs">
            <p className="font-medium text-foreground mb-2">📊 Progress:</p>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((day) => {
                const record = dayHistory.find((d) => d.day === day);
                return (
                  <div
                    key={day}
                    className={`p-2 rounded text-center font-medium text-xs ${
                      record
                        ? record.balanced
                          ? "bg-green-500/20 text-green-600 border border-green-500/30"
                          : "bg-red-500/20 text-red-600 border border-red-500/30"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    D{day}
                    <div className="text-2xl mt-1">
                      {record ? (record.balanced ? "✅" : "❌") : "○"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const gameView = (
    <div className={isFullscreen ? "fixed inset-0 z-50 bg-background" : "relative"}>
      <div className={isFullscreen ? "h-screen flex flex-col" : "h-[600px] relative"}>
        {/* Game Canvas with Fullscreen Button */}
        <div className="flex-1 overflow-hidden relative">
          {gameContent}

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

        {!isFullscreen && (
          <div className="border-t border-border bg-card/50 p-4 space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                🧠 Learning: Plant Growth Balance
              </p>
              <p className="text-xs text-muted-foreground">
                Adjust sunlight, water, and air to keep your plant healthy. Balance is key!
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
        conceptName="🌱 Sprout Help"
        whatYouWillUnderstand="Learn that plants need balanced amounts of sunlight, water, and air. Too much or too little of anything slows growth and harms health."
        gameSteps={[
          "Adjust sunlight, water, and air for 5 days",
          "Keep all three in their optimal ranges to help the plant thrive",
          "Two consecutive imbalances will wilt the plant",
          "Get 4+ balanced days to reach the flowering stage",
        ]}
        successMeaning="Your plant will bloom into a beautiful flower, and you'll understand how plants need precise balance to grow!"
        icon="🌻"
      />

      <GameCompletionPopup
        isOpen={showCompletion}
        onPlayAgain={handleRetry}
        onExitFullscreen={() => setIsFullscreen(false)}
        onBackToGames={() => navigate("/student/biology")}
        learningOutcome={
          gameWon
            ? "You mastered plant balance! You learned that sunlight, water, and air must work together for healthy growth."
            : "Good try! Remember: too much or too little of any input harms plants. Try to balance all three needs!"
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
