import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ConceptIntroPopup } from "@/components/ui/concept-intro-popup";
import { GameCompletionPopup } from "@/components/ui/game-completion-popup";
import { Maximize2, Minimize2, RotateCcw, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Reaction {
  id: string;
  substance1: string;
  substance1Formula: string;
  substance2: string;
  substance2Formula: string;
  result: string;
  resultColor: string;
  productFormula: string;
  emoji1: string;
  emoji2: string;
  effects: string[];
  effectEmojis: string[];
  correctTags: string[];
  reactionColor: string;
  visualEffects: string[];
}

const REACTIONS: Reaction[] = [
  {
    id: "iron-acid",
    substance1: "Iron",
    substance1Formula: "Fe",
    substance2: "Acid",
    substance2Formula: "HCl",
    result: "Iron reacts",
    resultColor: "Orange-Brown",
    emoji1: "⬛",
    emoji2: "🟡",
    effects: ["Bubbling", "Heat"],
    effectEmojis: ["💨", "🔥"],
    correctTags: ["gas", "heat"],
    reactionColor: "from-gray-400 to-orange-400",
    visualEffects: ["bubbles", "heat"],
  },
  {
    id: "milk-vinegar",
    substance1: "Milk",
    substance1Formula: "Ca₃(PO₄)₂",
    substance2: "Vinegar",
    substance2Formula: "CH₃COOH",
    result: "Milk curdles",
    resultColor: "Yellowish-White",
    emoji1: "🥛",
    emoji2: "🍶",
    effects: ["Color change", "Bubbling"],
    effectEmojis: ["🎨", "💨"],
    correctTags: ["color_change", "gas"],
    reactionColor: "from-white to-yellow-100",
    visualEffects: ["color_change", "bubbles"],
  },
  {
    id: "water-copper",
    substance1: "Water",
    substance1Formula: "H₂O",
    substance2: "Copper Salt",
    substance2Formula: "CuSO₄",
    result: "Blue solution",
    resultColor: "Blue",
    emoji1: "💧",
    emoji2: "🔮",
    effects: ["Color change"],
    effectEmojis: ["🎨"],
    correctTags: ["color_change"],
    reactionColor: "from-blue-200 to-blue-500",
    visualEffects: ["color_change"],
  },
  {
    id: "bread-yeast",
    substance1: "Flour & Yeast",
    substance1Formula: "C₆H₁₀O₅",
    substance2: "Water",
    substance2Formula: "H₂O",
    result: "Bread rises",
    resultColor: "Golden-Brown",
    emoji1: "🍞",
    emoji2: "💧",
    effects: ["Bubbling", "Growth"],
    effectEmojis: ["💨", "📈"],
    correctTags: ["gas", "physical_change"],
    reactionColor: "from-yellow-100 to-orange-200",
    visualEffects: ["bubbles", "growth"],
  },
  {
    id: "burning-candle",
    substance1: "Candle",
    substance1Formula: "C₂₀H₄₂",
    substance2: "Oxygen",
    substance2Formula: "O₂",
    result: "Light & Heat",
    resultColor: "Yellow-Orange",
    emoji1: "🕯️",
    emoji2: "💨",
    effects: ["Heat", "Light"],
    effectEmojis: ["🔥", "💡"],
    correctTags: ["heat", "light"],
    reactionColor: "from-yellow-300 to-red-400",
    visualEffects: ["heat", "light"],
  },
];

const EFFECT_OPTIONS = [
  { id: "color_change", label: "Color Change", emoji: "🎨" },
  { id: "gas", label: "Gas Bubbles", emoji: "💨" },
  { id: "heat", label: "Heat Released", emoji: "🔥" },
  { id: "light", label: "Light Produced", emoji: "💡" },
  { id: "physical_change", label: "Physical Change", emoji: "📈" },
  { id: "temperature", label: "Temperature Drop", emoji: "❄️" },
];

interface GameState {
  currentReactionIndex: number;
  score: number;
  selectedEffects: string[];
  hasReacted: boolean;
  feedback: string;
  isReacting: boolean;
  showObservationPanel: boolean;
}

export default function ReactionDetective() {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    currentReactionIndex: 0,
    score: 0,
    selectedEffects: [],
    hasReacted: false,
    feedback: "",
    isReacting: false,
    showObservationPanel: false,
  });

  const currentReaction = REACTIONS[gameState.currentReactionIndex];

  const handleMix = () => {
    if (gameState.hasReacted) return;

    setGameState((prev) => ({
      ...prev,
      isReacting: true,
    }));

    setTimeout(() => {
      setGameState((prev) => ({
        ...prev,
        hasReacted: true,
        isReacting: false,
        showObservationPanel: true,
      }));
    }, 2500);
  };

  const handleEffectTag = (effectId: string) => {
    if (!gameState.hasReacted) return;

    const isCorrect = currentReaction.correctTags.includes(effectId);
    const isAlreadySelected = gameState.selectedEffects.includes(effectId);

    if (isAlreadySelected) {
      setGameState((prev) => ({
        ...prev,
        selectedEffects: prev.selectedEffects.filter((e) => e !== effectId),
      }));
    } else {
      if (isCorrect) {
        const newSelected = [...gameState.selectedEffects, effectId];
        setGameState((prev) => ({
          ...prev,
          selectedEffects: newSelected,
        }));

        // Check if all correct effects are selected
        const allCorrectSelected = currentReaction.correctTags.every((tag) =>
          newSelected.includes(tag)
        );

        if (allCorrectSelected) {
          setGameState((prev) => ({
            ...prev,
            score: prev.score + 1,
            feedback: "Perfect observation! ✨",
          }));

          setTimeout(() => {
            if (gameState.currentReactionIndex < REACTIONS.length - 1) {
              setGameState((prev) => ({
                ...prev,
                currentReactionIndex: prev.currentReactionIndex + 1,
                selectedEffects: [],
                hasReacted: false,
                showObservationPanel: false,
                feedback: "",
                isReacting: false,
              }));
            } else {
              setShowCompletion(true);
            }
          }, 1200);
        }
      } else {
        setGameState((prev) => ({
          ...prev,
          feedback: "That doesn't seem right... 🤔",
        }));

        setTimeout(() => {
          setGameState((prev) => ({ ...prev, feedback: "" }));
        }, 1000);
      }
    }
  };

  const handleRetry = () => {
    setGameState({
      currentReactionIndex: 0,
      score: 0,
      selectedEffects: [],
      hasReacted: false,
      feedback: "",
      isReacting: false,
      showObservationPanel: false,
    });
    setShowCompletion(false);
  };

  const gameView = (
    <div className={`${isFullscreen ? "fixed inset-0 z-50 bg-background" : ""} flex flex-col`}>
      <style>{`
        @keyframes bubble-rise {
          0% { transform: translateY(0) translateX(0); opacity: 1; }
          100% { transform: translateY(-80px) translateX(var(--tx, 0)); opacity: 0; }
        }
        @keyframes heat-pulse {
          0% { transform: scale(1) translateY(0); opacity: 0.7; }
          100% { transform: scale(1.3) translateY(-40px); opacity: 0; }
        }
        @keyframes light-flash {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        @keyframes smoke-rise {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          100% { transform: translateY(-100px) scale(1.2); opacity: 0; }
        }
        @keyframes color-shift {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        @keyframes observation-slide-up {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .bubble {
          animation: bubble-rise 1.5s ease-out forwards;
        }
        .heat-wave {
          animation: heat-pulse 1.2s ease-out forwards;
        }
        .light-effect {
          animation: light-flash 0.8s ease-in-out;
        }
        .smoke-particle {
          animation: smoke-rise 2s ease-out forwards;
        }
        .observation-panel {
          animation: observation-slide-up 0.5s ease-out forwards;
        }
      `}</style>

      <div className={`${isFullscreen ? "h-screen" : "h-[650px]"} flex flex-col overflow-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔬</span>
            <div>
              <h2 className="font-bold text-lg text-foreground">Reaction Detective</h2>
              <p className="text-sm text-muted-foreground">Reaction {gameState.currentReactionIndex + 1}/{REACTIONS.length}</p>
            </div>
          </div>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 className="h-5 w-5" />
            ) : (
              <Maximize2 className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="flex-1 p-6 overflow-auto flex flex-col gap-6">
          {/* Reaction Chamber */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-muted-foreground text-center">Mix these substances and observe what happens</p>

            {/* Reaction Container */}
            <div className="relative bg-gradient-to-br from-gray-100 to-gray-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border-2 border-border p-8 min-h-64 flex flex-col items-center justify-center overflow-hidden">
              {!gameState.isReacting && !gameState.hasReacted && (
                <>
                  {/* Pre-reaction substances */}
                  <div className="flex items-center justify-center gap-6 w-full">
                    {/* Substance 1 */}
                    <div className="flex flex-col items-center">
                      <div className="text-6xl mb-3 transition-transform hover:scale-110">{currentReaction.emoji1}</div>
                      <p className="text-sm font-semibold text-center text-black dark:text-white">{currentReaction.substance1}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 font-mono mt-1">{currentReaction.substance1Formula}</p>
                    </div>

                    {/* Plus Sign */}
                    <div className="text-3xl text-muted-foreground">+</div>

                    {/* Substance 2 */}
                    <div className="flex flex-col items-center">
                      <div className="text-6xl mb-3 transition-transform hover:scale-110">{currentReaction.emoji2}</div>
                      <p className="text-sm font-semibold text-center text-black dark:text-white">{currentReaction.substance2}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 font-mono mt-1">{currentReaction.substance2Formula}</p>
                    </div>
                  </div>

                  {/* Mix Button */}
                  <button
                    onClick={handleMix}
                    className="mt-6 px-6 py-3 bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-secondary-foreground font-bold rounded-lg transition-all hover:scale-105 active:scale-95 text-lg"
                  >
                    🧪 Mix Substances
                  </button>
                </>
              )}

              {(gameState.isReacting || gameState.hasReacted) && (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 relative">
                  {/* Reaction Result with Dynamic Color */}
                  <div className={`bg-gradient-to-br ${currentReaction.reactionColor} rounded-2xl w-32 h-32 flex items-center justify-center text-5xl shadow-lg ${gameState.isReacting ? 'animate-pulse' : ''}`}>
                    {currentReaction.effectEmojis[0]}
                  </div>

                  {/* Animated Visual Effects */}
                  {gameState.isReacting && (
                    <>
                      {/* Bubbles */}
                      {currentReaction.visualEffects.includes("bubbles") && (
                        <>
                          {[...Array(6)].map((_, i) => (
                            <div
                              key={`bubble-${i}`}
                              className="bubble absolute text-2xl pointer-events-none"
                              style={{
                                left: `${30 + i * 10}%`,
                                bottom: '20%',
                                '--tx': `${Math.random() * 40 - 20}px`,
                                animationDelay: `${i * 0.15}s`,
                              } as React.CSSProperties}
                            >
                              💨
                            </div>
                          ))}
                        </>
                      )}

                      {/* Heat Waves */}
                      {currentReaction.visualEffects.includes("heat") && (
                        <>
                          {[...Array(4)].map((_, i) => (
                            <div
                              key={`heat-${i}`}
                              className="heat-wave absolute text-3xl pointer-events-none"
                              style={{
                                left: `${35 + i * 10}%`,
                                bottom: '25%',
                                animationDelay: `${i * 0.2}s`,
                              }}
                            >
                              🔥
                            </div>
                          ))}
                        </>
                      )}

                      {/* Light Flashes */}
                      {currentReaction.visualEffects.includes("light") && (
                        <>
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={`light-${i}`}
                              className="light-effect absolute text-4xl pointer-events-none"
                              style={{
                                left: `${35 + i * 15}%`,
                                bottom: '20%',
                                animationDelay: `${i * 0.25}s`,
                              }}
                            >
                              💡
                            </div>
                          ))}
                        </>
                      )}

                      {/* Smoke/Growth */}
                      {currentReaction.visualEffects.includes("growth") && (
                        <>
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={`smoke-${i}`}
                              className="smoke-particle absolute text-2xl pointer-events-none"
                              style={{
                                left: `${30 + i * 8}%`,
                                bottom: '15%',
                                animationDelay: `${i * 0.1}s`,
                              }}
                            >
                              ☁️
                            </div>
                          ))}
                        </>
                      )}

                      {/* Color Change Label */}
                      {currentReaction.visualEffects.includes("color_change") && (
                        <div className="absolute top-6 left-6 bg-gradient-to-r from-blue-400 to-purple-400 text-white px-3 py-1 rounded-full text-xs font-bold animate-bounce">
                          🎨 Color Changing
                        </div>
                      )}
                    </>
                  )}

                  {gameState.hasReacted && !gameState.isReacting && (
                    <div className="text-center space-y-3">
                      <p className="text-lg font-bold text-black dark:text-white">Reaction Complete!</p>
                      <div className="bg-muted/50 rounded-lg p-3 border-2 border-secondary/30 space-y-2">
                        <p className="text-sm font-semibold text-black dark:text-white">Product Color: <span className="text-secondary font-bold">{currentReaction.resultColor}</span></p>
                      </div>
                      <p className="text-sm text-black dark:text-muted-foreground">What did you observe?</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {gameState.feedback && (
            <div className="p-4 text-center rounded-lg bg-green-500/10 border-2 border-green-500/50">
              <p className="font-semibold text-green-600">{gameState.feedback}</p>
            </div>
          )}

          {/* Observation Panel */}
          {gameState.showObservationPanel && (
            <div className="observation-panel space-y-3">
              <p className="text-sm font-bold text-foreground text-center">What did you observe? Select all that apply:</p>
              <div className="grid grid-cols-2 gap-2">
                {EFFECT_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleEffectTag(option.id)}
                    disabled={!gameState.showObservationPanel}
                    className={`p-3 rounded-lg transition-all flex flex-col items-center gap-2 font-medium ${
                      gameState.selectedEffects.includes(option.id)
                        ? "bg-green-500/30 border-2 border-green-500 ring-2 ring-green-500/30 scale-105"
                        : currentReaction.correctTags.includes(option.id)
                          ? "bg-muted/50 border-2 border-border hover:border-green-500/50 cursor-pointer hover:scale-105"
                          : "bg-muted/30 border-2 border-border/30 cursor-default opacity-50"
                    }`}
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <span className="text-xs font-semibold text-center">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="p-4 border-t border-border/50">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold">Reactions Identified</span>
            <span className="text-sm text-muted-foreground">{gameState.score}/{REACTIONS.length}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-secondary to-secondary/80 h-full transition-all duration-300"
              style={{ width: `${(gameState.score / REACTIONS.length) * 100}%` }}
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
        conceptName="Reaction Detective"
        whatYouWillUnderstand="Chemical reactions aren't just about formulas - they're about what you can see! Color changes, bubbles, heat, and light are all signs that a chemical reaction is happening. Scientists identify reactions by observing these changes."
        gameSteps={[
          "Mix two substances together by tapping the Mix button",
          "Observe the reaction happening (you'll see visual effects)",
          "Tag what you see: color changes, bubbles, heat, light, etc.",
        ]}
        successMeaning="You learned to identify chemical reactions by their observable properties!"
        icon="🔬"
      />

      <GameCompletionPopup
        isOpen={showCompletion}
        isFullscreen={isFullscreen}
        onPlayAgain={handleRetry}
        onExitFullscreen={() => setIsFullscreen(false)}
        onBackToGames={() => navigate("/student/chemistry")}
        learningOutcome={`You correctly identified ${gameState.score} chemical reactions! You learned to identify chemical reactions by observable changes!`}
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
