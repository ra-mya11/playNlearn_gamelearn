import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ConceptIntroPopup } from "@/components/ui/concept-intro-popup";
import { GameCompletionPopup } from "@/components/ui/game-completion-popup";
import { Maximize2, Minimize2, RotateCcw, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Scenario {
  id: string;
  title: string;
  description: string;
  emoji: string;
  correctMaterial: string;
  requiredProperties: string[];
}

interface Material {
  id: string;
  name: string;
  emoji: string;
  properties: string[];
}

const SCENARIOS: Scenario[] = [
  {
    id: "raincoat",
    title: "Make a Raincoat",
    description: "You need material that keeps water out",
    emoji: "🌧️",
    correctMaterial: "plastic",
    requiredProperties: ["waterproof", "flexible"],
  },
  {
    id: "acid-container",
    title: "Store Acid",
    description: "You need material that won't dissolve",
    emoji: "🧪",
    correctMaterial: "glass",
    requiredProperties: ["non-reactive", "strong"],
  },
  {
    id: "cooking-pot",
    title: "Make a Cooking Pot",
    description: "You need material that conducts heat well",
    emoji: "🍲",
    correctMaterial: "iron",
    requiredProperties: ["heat-conductive", "strong"],
  },
  {
    id: "bridge",
    title: "Build a Bridge",
    description: "You need material that is very strong and doesn't rust easily",
    emoji: "🌉",
    correctMaterial: "copper",
    requiredProperties: ["strong", "rust-resistant"],
  },
];

const MATERIALS: Material[] = [
  {
    id: "plastic",
    name: "Plastic",
    emoji: "🟦",
    properties: ["waterproof", "flexible", "lightweight"],
  },
  {
    id: "glass",
    name: "Glass",
    emoji: "🟫",
    properties: ["non-reactive", "strong", "transparent"],
  },
  {
    id: "iron",
    name: "Iron",
    emoji: "⬛",
    properties: ["heat-conductive", "strong", "magnetic"],
  },
  {
    id: "rubber",
    name: "Rubber",
    emoji: "🟪",
    properties: ["waterproof", "flexible", "insulator"],
  },
  {
    id: "wood",
    name: "Wood",
    emoji: "🟫",
    properties: ["insulator", "lightweight", "flexible"],
  },
  {
    id: "copper",
    name: "Copper",
    emoji: "🟠",
    properties: ["heat-conductive", "strong", "rust-resistant"],
  },
];

interface GameState {
  currentScenarioIndex: number;
  score: number;
  attempts: number;
  selectedMaterial: string | null;
  feedback: string;
  isCorrect: boolean | null;
}

export default function PropertyPuzzle() {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    currentScenarioIndex: 0,
    score: 0,
    attempts: 0,
    selectedMaterial: null,
    feedback: "",
    isCorrect: null,
  });

  const currentScenario = SCENARIOS[gameState.currentScenarioIndex];

  const handleMaterialSelect = (materialId: string) => {
    if (gameState.isCorrect !== null) return; // Already answered

    const isCorrect = materialId === currentScenario.correctMaterial;
    setGameState((prev) => ({
      ...prev,
      selectedMaterial: materialId,
      isCorrect,
      attempts: prev.attempts + 1,
      score: isCorrect ? prev.score + 1 : prev.score,
      feedback: isCorrect ? "Perfect match! ✨" : "Not quite right... try another! 🤔",
    }));

    // Auto-advance after delay if correct
    if (isCorrect) {
      setTimeout(() => {
        if (gameState.currentScenarioIndex < SCENARIOS.length - 1) {
          setGameState((prev) => ({
            ...prev,
            currentScenarioIndex: prev.currentScenarioIndex + 1,
            selectedMaterial: null,
            feedback: "",
            isCorrect: null,
          }));
        } else {
          setShowCompletion(true);
        }
      }, 1200);
    }
  };

  const handleRetry = () => {
    setGameState({
      currentScenarioIndex: 0,
      score: 0,
      attempts: 0,
      selectedMaterial: null,
      feedback: "",
      isCorrect: null,
    });
    setShowCompletion(false);
  };

  const gameView = (
    <div className={`${isFullscreen ? "fixed inset-0 z-50 bg-background" : ""} flex flex-col`}>
      <div className={`${isFullscreen ? "h-screen" : "h-[600px]"} flex flex-col overflow-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{currentScenario.emoji}</span>
            <div>
              <h2 className="font-bold text-lg text-foreground">{currentScenario.title}</h2>
              <p className="text-sm text-muted-foreground">Scenario {gameState.currentScenarioIndex + 1}/{SCENARIOS.length}</p>
            </div>
          </div>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-5 w-5" />
            ) : (
              <Maximize2 className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Scenario Description */}
        <div className="p-6 text-center border-b border-border/50">
          <p className="text-lg text-foreground font-semibold mb-2">{currentScenario.description}</p>
          <p className="text-sm text-muted-foreground">Choose the right material</p>
        </div>

        {/* Materials Grid */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-2 gap-4">
            {MATERIALS.map((material) => {
              const isSelected = gameState.selectedMaterial === material.id;
              const isCorrectAnswer = material.id === currentScenario.correctMaterial;

              return (
                <button
                  key={material.id}
                  onClick={() => handleMaterialSelect(material.id)}
                  disabled={gameState.isCorrect !== null}
                  className={`p-4 rounded-xl transition-all transform ${
                    gameState.isCorrect === null
                      ? "hover:scale-105 cursor-pointer"
                      : "cursor-not-allowed"
                  } ${
                    isSelected
                      ? isCorrectAnswer
                        ? "bg-green-500/30 border-2 border-green-500 scale-105"
                        : "bg-red-500/30 border-2 border-red-500 shake"
                      : "bg-muted/50 border-2 border-border hover:border-muted-foreground"
                  }`}
                >
                  <div className="text-4xl mb-2">{material.emoji}</div>
                  <p className="font-semibold text-sm">{material.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {material.properties.join(", ")}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback */}
        {gameState.feedback && (
          <div className="p-4 text-center border-t border-border/50">
            <p
              className={`text-lg font-semibold ${
                gameState.isCorrect ? "text-green-500" : "text-yellow-500"
              }`}
            >
              {gameState.feedback}
            </p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="p-4 border-t border-border/50">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold">Progress</span>
            <span className="text-sm text-muted-foreground">{gameState.score}/{SCENARIOS.length}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-secondary to-secondary/80 h-full transition-all duration-300"
              style={{ width: `${(gameState.score / SCENARIOS.length) * 100}%` }}
            />
          </div>
        </div>

        {isFullscreen && (
          <div className="fixed bottom-6 right-6 z-40 flex gap-2">
            <Button
              onClick={handleRetry}
              variant="outline"
              size="sm"
              className="glass-card"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button
              onClick={() => setIsFullscreen(false)}
              size="sm"
              className="bg-secondary hover:bg-secondary/90"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Exit
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <ConceptIntroPopup
        isOpen={showIntro && !gameStarted}
        onStart={() => {
          setShowIntro(false);
          setGameStarted(true);
        }}
        onGoBack={() => navigate("/student/chemistry")}
        conceptName="Property Puzzle"
        whatYouWillUnderstand="Different materials have different properties that make them perfect for different uses. Understanding these properties helps us choose the right material for the job."
        gameSteps={[
          "Read the scenario and what properties you need",
          "Tap on the material you think is best suited",
          "Correct choices will glow green and move to the next challenge",
        ]}
        successMeaning="You understand how materials are chosen based on their properties for real-world applications!"
        icon="🔧"
      />

      <GameCompletionPopup
        isOpen={showCompletion}
        isFullscreen={isFullscreen}
        onPlayAgain={handleRetry}
        onExitFullscreen={() => setIsFullscreen(false)}
        onBackToGames={() => navigate("/student/chemistry")}
        learningOutcome={`You matched ${gameState.score} out of ${SCENARIOS.length} scenarios correctly! You learned how to match materials to their real-world uses based on properties!`}
      />

      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/5 p-4">
        {gameStarted ? (
          <>
            {gameView}
            {!isFullscreen && (
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={() => navigate("/student/chemistry")}
                  variant="outline"
                  className="flex-1"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  className="flex-1"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            )}
          </>
        ) : null}
      </div>
    </>
  );
}
