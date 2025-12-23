import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ConceptIntroPopup } from "@/components/ui/concept-intro-popup";
import { GameCompletionPopup } from "@/components/ui/game-completion-popup";
import { Maximize2, Minimize2, RotateCcw, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AtomBlock {
  id: string;
  element: string;
  emoji: string;
}

interface Equation {
  id: string;
  title: string;
  emoji: string;
  description: string;
  reactants: { element: string; count: number; emoji: string }[];
  products: { element: string; count: number; emoji: string }[];
}

const EQUATIONS: Equation[] = [
  {
    id: "hydrogen-combustion",
    title: "Hydrogen Combustion",
    emoji: "🔥",
    description: "Balance the combustion of hydrogen gas",
    reactants: [
      { element: "H", count: 2, emoji: "⚪" },
      { element: "O", count: 2, emoji: "🔴" },
    ],
    products: [{ element: "H₂O", count: 2, emoji: "💧" }],
  },
  {
    id: "magnesium-oxygen",
    title: "Magnesium & Oxygen",
    emoji: "✨",
    description: "Balance the reaction of magnesium with oxygen",
    reactants: [
      { element: "Mg", count: 2, emoji: "🟦" },
      { element: "O", count: 2, emoji: "🔴" },
    ],
    products: [{ element: "MgO", count: 2, emoji: "🟪" }],
  },
  {
    id: "iron-sulfur",
    title: "Iron & Sulfur",
    emoji: "⬛",
    description: "Balance the reaction between iron and sulfur",
    reactants: [
      { element: "Fe", count: 1, emoji: "⬛" },
      { element: "S", count: 1, emoji: "🟡" },
    ],
    products: [{ element: "FeS", count: 1, emoji: "🟫" }],
  },
  {
    id: "carbon-oxygen",
    title: "Carbon Combustion",
    emoji: "💨",
    description: "Balance the combustion of carbon",
    reactants: [
      { element: "C", count: 1, emoji: "⚫" },
      { element: "O", count: 2, emoji: "🔴" },
    ],
    products: [{ element: "CO₂", count: 1, emoji: "💨" }],
  },
];

interface AtomCount {
  left: Record<string, number>;
  right: Record<string, number>;
}

interface GameState {
  currentEquationIndex: number;
  score: number;
  leftAtoms: AtomBlock[];
  rightAtoms: AtomBlock[];
  isBalanced: boolean;
  feedback: string;
  showBalanceLabel: boolean;
}

export default function EquationBuilder() {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    currentEquationIndex: 0,
    score: 0,
    leftAtoms: [],
    rightAtoms: [],
    isBalanced: false,
    feedback: "",
    showBalanceLabel: false,
  });

  const currentEquation = EQUATIONS[gameState.currentEquationIndex];

  // Check if equation is balanced
  useEffect(() => {
    if (gameState.leftAtoms.length === 0 && gameState.rightAtoms.length === 0) {
      setGameState((prev) => ({ ...prev, isBalanced: false, showBalanceLabel: false }));
      return;
    }

    const leftCounts: Record<string, number> = {};
    const rightCounts: Record<string, number> = {};

    gameState.leftAtoms.forEach((atom) => {
      leftCounts[atom.element] = (leftCounts[atom.element] || 0) + 1;
    });

    gameState.rightAtoms.forEach((atom) => {
      rightCounts[atom.element] = (rightCounts[atom.element] || 0) + 1;
    });

    // Check if balanced
    const allElements = new Set([...Object.keys(leftCounts), ...Object.keys(rightCounts)]);
    const isBalanced = Array.from(allElements).every(
      (el) => (leftCounts[el] || 0) === (rightCounts[el] || 0)
    );

    if (isBalanced && gameState.leftAtoms.length > 0) {
      if (!gameState.isBalanced) {
        setGameState((prev) => ({
          ...prev,
          isBalanced: true,
          showBalanceLabel: true,
          feedback: "Perfect balance! ⚖️",
          score: prev.score + 1,
        }));

        setTimeout(() => {
          if (gameState.currentEquationIndex < EQUATIONS.length - 1) {
            setGameState((prev) => ({
              ...prev,
              currentEquationIndex: prev.currentEquationIndex + 1,
              leftAtoms: [],
              rightAtoms: [],
              isBalanced: false,
              showBalanceLabel: false,
              feedback: "",
            }));
          } else {
            setShowCompletion(true);
          }
        }, 2000);
      }
    } else {
      setGameState((prev) => ({ ...prev, isBalanced: false, showBalanceLabel: false }));
    }
  }, [gameState.leftAtoms, gameState.rightAtoms, gameState.isBalanced, gameState.currentEquationIndex]);

  const handleAddReactant = (reactant: (typeof currentEquation.reactants)[0]) => {
    if (gameState.isBalanced) return;

    const newAtom: AtomBlock = {
      id: `${reactant.element}-${Date.now()}-${Math.random()}`,
      element: reactant.element,
      emoji: reactant.emoji,
    };

    setGameState((prev) => ({
      ...prev,
      leftAtoms: [...prev.leftAtoms, newAtom],
    }));
  };

  const handleAddProduct = (product: (typeof currentEquation.products)[0]) => {
    if (gameState.isBalanced) return;

    const newAtom: AtomBlock = {
      id: `${product.element}-${Date.now()}-${Math.random()}`,
      element: product.element,
      emoji: product.emoji,
    };

    setGameState((prev) => ({
      ...prev,
      rightAtoms: [...prev.rightAtoms, newAtom],
    }));
  };

  const handleRemoveAtom = (atomId: string, side: "left" | "right") => {
    if (gameState.isBalanced) return;

    setGameState((prev) => ({
      ...prev,
      [side === "left" ? "leftAtoms" : "rightAtoms"]: prev[
        side === "left" ? "leftAtoms" : "rightAtoms"
      ].filter((a) => a.id !== atomId),
    }));
  };

  const handleClear = () => {
    setGameState((prev) => ({
      ...prev,
      leftAtoms: [],
      rightAtoms: [],
      isBalanced: false,
      showBalanceLabel: false,
      feedback: "",
    }));
  };

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleRetry = () => {
    setGameState({
      currentEquationIndex: 0,
      score: 0,
      leftAtoms: [],
      rightAtoms: [],
      isBalanced: false,
      feedback: "",
      showBalanceLabel: false,
    });
    setShowCompletion(false);
  };

  const leftCount = gameState.leftAtoms.length;
  const rightCount = gameState.rightAtoms.length;
  const scalePosition = rightCount > leftCount ? 30 : leftCount > rightCount ? -30 : 0;

  const gameView = (
    <div className={`${isFullscreen ? "fixed inset-0 z-50 bg-background" : ""} flex flex-col`}>
      <style>{`
        @keyframes balance-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.4), inset 0 0 20px rgba(34, 197, 94, 0.2); }
          50% { box-shadow: 0 0 40px rgba(34, 197, 94, 0.6), inset 0 0 30px rgba(34, 197, 94, 0.3); }
        }
        @keyframes balance-label-fade-in {
          0% { opacity: 0; transform: scale(0.9) translateY(-10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes atom-settle {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes atom-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .balance-glow {
          animation: balance-glow 2s ease-in-out infinite;
        }
        .balance-label {
          animation: balance-label-fade-in 0.6s ease-out forwards;
        }
        .atom-settle {
          animation: atom-settle 0.4s ease-out forwards;
        }
        .atom-pulse {
          animation: atom-pulse 0.5s ease-in-out;
        }
      `}</style>

      <div className={`${isFullscreen ? "h-screen" : "h-[700px]"} flex flex-col overflow-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚖️</span>
            <div>
              <h2 className="font-bold text-lg text-foreground">{currentEquation.title}</h2>
              <p className="text-sm text-muted-foreground">Equation {gameState.currentEquationIndex + 1}/{EQUATIONS.length}</p>
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

        {/* Description */}
        <div className="p-4 border-b border-border/50 text-center">
          <p className="text-sm text-muted-foreground">{currentEquation.description}</p>
        </div>

        <div className="flex-1 p-6 overflow-auto flex flex-col gap-6">
          {/* Balance Confirmation Label */}
          {gameState.showBalanceLabel && (
            <div className="flex justify-center">
              <div className="balance-label flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border-2 border-green-500 text-green-600 font-bold">
                <span>✅</span>
                <span>Balanced Equation!</span>
              </div>
            </div>
          )}

          {/* Balance Scale */}
          <div
            className={`flex flex-col items-center gap-4 ${
              gameState.isBalanced ? "balance-glow rounded-2xl p-4" : ""
            }`}
          >
            <div className="relative w-full h-32 flex items-end justify-center">
              {/* Scale Beam */}
              <div
                className={`absolute w-48 h-2 rounded-full transition-all ${
                  gameState.isBalanced ? "bg-green-500" : "bg-muted"
                }`}
                style={{ transform: `rotate(${scalePosition * 0.5}deg)` }}
              />

              {/* Left Pan */}
              <div
                className={`absolute left-8 bottom-2 w-20 h-12 rounded-lg border-2 flex flex-wrap gap-1 items-center justify-center overflow-hidden transition-all ${
                  gameState.isBalanced
                    ? "bg-green-500/20 border-green-500"
                    : "bg-muted border-border"
                }`}
                style={{ transform: `translateY(${scalePosition * 0.3}px)` }}
              >
                {gameState.leftAtoms.map((atom, index) => (
                  <div
                    key={atom.id}
                    onClick={() => handleRemoveAtom(atom.id, "left")}
                    className={`cursor-pointer hover:scale-110 transition-transform text-lg ${
                      gameState.isBalanced ? "atom-pulse" : ""
                    }`}
                    style={gameState.isBalanced ? { animationDelay: `${index * 0.1}s` } : {}}
                    title="Click to remove"
                  >
                    {atom.emoji}
                  </div>
                ))}
              </div>

              {/* Center Fulcrum */}
              <div
                className={`absolute w-8 h-12 rounded-b-lg border-2 transition-all ${
                  gameState.isBalanced
                    ? "bg-gradient-to-b from-green-500/30 to-green-500/10 border-green-500"
                    : "bg-gradient-to-b from-muted to-muted/50 border-border"
                }`}
              />

              {/* Right Pan */}
              <div
                className={`absolute right-8 bottom-2 w-20 h-12 rounded-lg border-2 flex flex-wrap gap-1 items-center justify-center overflow-hidden transition-all ${
                  gameState.isBalanced
                    ? "bg-green-500/20 border-green-500"
                    : "bg-muted border-border"
                }`}
                style={{ transform: `translateY(${-scalePosition * 0.3}px)` }}
              >
                {gameState.rightAtoms.map((atom, index) => (
                  <div
                    key={atom.id}
                    onClick={() => handleRemoveAtom(atom.id, "right")}
                    className={`cursor-pointer hover:scale-110 transition-transform text-lg ${
                      gameState.isBalanced ? "atom-pulse" : ""
                    }`}
                    style={gameState.isBalanced ? { animationDelay: `${index * 0.1}s` } : {}}
                    title="Click to remove"
                  >
                    {atom.emoji}
                  </div>
                ))}
              </div>
            </div>

            {/* Balance Status */}
            <div className="text-center">
              {gameState.isBalanced ? (
                <div className="space-y-2">
                  <p className="text-2xl">✨</p>
                  <p className="text-sm font-semibold text-green-600">Atoms are now equal on both sides</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Left: <span className="font-bold">{leftCount}</span> atoms | Right: <span className="font-bold">{rightCount}</span> atoms
                </p>
              )}
            </div>
          </div>

          {gameState.feedback && !gameState.isBalanced && (
            <div className="p-3 text-center rounded-lg bg-secondary/10 border-2 border-secondary">
              <p className="font-semibold text-secondary">{gameState.feedback}</p>
            </div>
          )}

          {/* Reactants */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">Reactants (Left Side):</p>
            <div className="flex flex-wrap gap-2">
              {currentEquation.reactants.map((reactant) => (
                <button
                  key={reactant.element}
                  onClick={() => handleAddReactant(reactant)}
                  disabled={gameState.isBalanced}
                  className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    gameState.isBalanced
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-105 active:scale-95"
                  } bg-muted hover:bg-muted/70 border-2 border-border`}
                >
                  <span className="text-lg">{reactant.emoji}</span>
                  <span className="text-sm font-semibold">{reactant.element}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Products */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">Products (Right Side):</p>
            <div className="flex flex-wrap gap-2">
              {currentEquation.products.map((product) => (
                <button
                  key={product.element}
                  onClick={() => handleAddProduct(product)}
                  disabled={gameState.isBalanced}
                  className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    gameState.isBalanced
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-105 active:scale-95"
                  } bg-muted hover:bg-muted/70 border-2 border-border`}
                >
                  <span className="text-lg">{product.emoji}</span>
                  <span className="text-sm font-semibold">{product.element}</span>
                </button>
              ))}
            </div>
          </div>

          {gameState.leftAtoms.length > 0 || gameState.rightAtoms.length > 0 ? (
            <button
              onClick={handleClear}
              className="px-4 py-2 rounded-lg border-2 border-red-500/50 text-red-500 hover:bg-red-500/10 transition-all"
            >
              Clear All
            </button>
          ) : null}
        </div>

        {/* Progress Bar */}
        <div className="p-4 border-t border-border/50">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold">Equations Balanced</span>
            <span className="text-sm text-muted-foreground">{gameState.score}/{EQUATIONS.length}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-secondary to-secondary/80 h-full transition-all duration-300"
              style={{ width: `${(gameState.score / EQUATIONS.length) * 100}%` }}
            />
          </div>
        </div>

        {isFullscreen && (
          <div className="fixed bottom-6 right-6 z-40 flex gap-2">
            <Button
              onClick={handleClear}
              variant="outline"
              size="sm"
              className="glass-card"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear
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
        conceptName="Equation Builder"
        whatYouWillUnderstand="Chemical equations must be balanced - the same number of atoms must appear on both sides. Atoms are never created or destroyed in a reaction, they just rearrange. You'll balance equations by counting atoms and adjusting the numbers."
        gameSteps={[
          "Drag atoms from the reactants section to the left pan",
          "Drag atoms from the products section to the right pan",
          "Keep adding atoms until the scale balances perfectly",
        ]}
        successMeaning="You understand conservation of atoms and how to balance chemical equations!"
        icon="⚖️"
      />

      <GameCompletionPopup
        isOpen={showCompletion}
        isFullscreen={isFullscreen}
        onPlayAgain={handleRetry}
        onExitFullscreen={() => setIsFullscreen(false)}
        onBackToGames={() => navigate("/student/chemistry")}
        learningOutcome={`You correctly balanced ${gameState.score} equations! You learned to balance chemical equations and understand atom conservation!`}
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
                  onClick={handleClear}
                  variant="outline"
                  className="flex-1"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            )}
          </>
        ) : null}
      </div>
    </>
  );
}
