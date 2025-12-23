import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ConceptIntroPopup } from "@/components/ui/concept-intro-popup";
import { GameCompletionPopup } from "@/components/ui/game-completion-popup";
import { Maximize2, Minimize2, RotateCcw, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Atom {
  id: string;
  element: string;
  valence: number;
  emoji: string;
  bonds: string[];
}

interface Challenge {
  id: string;
  title: string;
  emoji: string;
  targetAtoms: { element: string; count: number }[];
  validBonds: string[][];
  description: string;
}

const ATOMS = {
  H: { element: "H", valence: 1, emoji: "⚪" }, // Hydrogen
  O: { element: "O", valence: 2, emoji: "🔴" }, // Oxygen
  C: { element: "C", valence: 4, emoji: "⚫" }, // Carbon
  N: { element: "N", valence: 3, emoji: "🔵" }, // Nitrogen
};

const CHALLENGES: Challenge[] = [
  {
    id: "water",
    title: "Water (H₂O)",
    emoji: "💧",
    description: "Create water by bonding atoms to balance",
    targetAtoms: [
      { element: "H", count: 2 },
      { element: "O", count: 1 },
    ],
    validBonds: [["H", "O"], ["H", "O"]],
  },
  {
    id: "oxygen",
    title: "Oxygen Gas (O₂)",
    emoji: "💨",
    description: "Create oxygen by bonding two oxygen atoms with a double bond",
    targetAtoms: [
      { element: "O", count: 2 },
    ],
    validBonds: [["O", "O"]],
  },
  {
    id: "methane",
    title: "Methane (CH₄)",
    emoji: "🔥",
    description: "Bond carbon with hydrogen to create methane",
    targetAtoms: [
      { element: "C", count: 1 },
      { element: "H", count: 4 },
    ],
    validBonds: [
      ["C", "H"],
      ["C", "H"],
      ["C", "H"],
      ["C", "H"],
    ],
  },
];

interface BondedAtom {
  atomId: string;
  element: string;
  x: number;
  y: number;
  bonds: string[];
}

interface GameState {
  currentChallengeIndex: number;
  score: number;
  bondedAtoms: BondedAtom[];
  selectedAtom: string | null;
  isComplete: boolean;
  showInvalidFeedback: boolean;
}

// Helper function to generate formula from atoms
const generateFormula = (atoms: BondedAtom[]): string => {
  if (atoms.length === 0) return "";

  const elementCounts: Record<string, number> = {};
  atoms.forEach((atom) => {
    elementCounts[atom.element] = (elementCounts[atom.element] || 0) + 1;
  });

  // Format: H₂O, CH₄, etc.
  return Object.entries(elementCounts)
    .map(([element, count]) => {
      if (count === 1) return element;
      const subscript = "₀₁₂₃₄₅₆₇₈₉";
      return element + subscript[count];
    })
    .join("");
};

export default function MoleculeBuilder() {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    currentChallengeIndex: 0,
    score: 0,
    bondedAtoms: [],
    selectedAtom: null,
    isComplete: false,
  });

  const currentChallenge = CHALLENGES[gameState.currentChallengeIndex];

  // Check if current molecule is complete and valid
  useEffect(() => {
    if (gameState.bondedAtoms.length === 0) return;

    const atomElements = gameState.bondedAtoms.map((a) => a.element);
    const targetElements = currentChallenge.targetAtoms.map((t) =>
      Array(t.count).fill(t.element)
    ).flat();

    const isCorrect =
      atomElements.length === targetElements.length &&
      atomElements.every((el) => targetElements.includes(el));

    if (isCorrect && !gameState.isComplete) {
      setGameState((prev) => ({ ...prev, isComplete: true, score: prev.score + 1 }));

      setTimeout(() => {
        if (gameState.currentChallengeIndex < CHALLENGES.length - 1) {
          setGameState((prev) => ({
            ...prev,
            currentChallengeIndex: prev.currentChallengeIndex + 1,
            bondedAtoms: [],
            selectedAtom: null,
            isComplete: false,
          }));
        } else {
          setShowCompletion(true);
        }
      }, 1500);
    }
  }, [gameState.bondedAtoms, currentChallenge, gameState.isComplete, gameState.currentChallengeIndex]);

  const handleAddAtom = (element: string) => {
    if (gameState.isComplete) return;

    const newAtom: BondedAtom = {
      atomId: `${element}-${Date.now()}`,
      element,
      x: Math.random() * 200 - 100,
      y: Math.random() * 200 - 100,
      bonds: [],
    };

    setGameState((prev) => ({
      ...prev,
      bondedAtoms: [...prev.bondedAtoms, newAtom],
    }));
  };

  const handleClear = () => {
    setGameState((prev) => ({
      ...prev,
      bondedAtoms: [],
      selectedAtom: null,
      isComplete: false,
    }));
  };

  const handleRetry = () => {
    setGameState({
      currentChallengeIndex: 0,
      score: 0,
      bondedAtoms: [],
      selectedAtom: null,
      isComplete: false,
    });
    setShowCompletion(false);
  };

  const gameView = (
    <div className={`${isFullscreen ? "fixed inset-0 z-50 bg-background" : ""} flex flex-col`}>
      <div className={`${isFullscreen ? "h-screen" : "h-[600px]"} flex flex-col overflow-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{currentChallenge.emoji}</span>
            <div>
              <h2 className="font-bold text-lg text-foreground">{currentChallenge.title}</h2>
              <p className="text-sm text-muted-foreground">Challenge {gameState.currentChallengeIndex + 1}/{CHALLENGES.length}</p>
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

        {/* Challenge Description */}
        <div className="p-4 border-b border-border/50 text-center">
          <p className="text-sm text-muted-foreground">{currentChallenge.description}</p>
        </div>

        {/* Build Area */}
        <div className="flex-1 p-6 flex flex-col gap-4">
          {/* Molecule Canvas */}
          <div className="relative bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border-2 border-dashed border-secondary/30 h-64 flex items-center justify-center overflow-hidden">
            {gameState.bondedAtoms.length === 0 ? (
              <div className="text-center">
                <p className="text-4xl mb-2">⚛️</p>
                <p className="text-sm text-muted-foreground">Build your molecule by adding atoms below</p>
              </div>
            ) : (
              <>
                {gameState.bondedAtoms.map((atom, index) => (
                  <div
                    key={atom.atomId}
                    className={`absolute w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                      gameState.isComplete
                        ? "animate-pulse scale-110"
                        : "hover:scale-110"
                    }`}
                    style={{
                      transform: gameState.isComplete
                        ? `translate(calc(-50% + ${Math.cos((index * 360) / gameState.bondedAtoms.length) * 40}px), calc(-50% + ${Math.sin((index * 360) / gameState.bondedAtoms.length) * 40}px))`
                        : `translate(calc(-50% + ${atom.x}px), calc(-50% + ${atom.y}px))`,
                      left: "50%",
                      top: "50%",
                    }}
                  >
                    {ATOMS[atom.element as keyof typeof ATOMS]?.emoji}
                  </div>
                ))}

                {gameState.isComplete && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-secondary/10 via-transparent to-secondary/10 rounded-xl">
                    <div className="text-center">
                      <p className="text-4xl mb-2">✨</p>
                      <p className="text-lg font-bold text-secondary">Perfect! Stable molecule!</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Atom Buttons */}
          <div className="flex gap-2 flex-wrap justify-center">
            {currentChallenge.targetAtoms.map((target) => (
              <button
                key={target.element}
                onClick={() => handleAddAtom(target.element)}
                disabled={gameState.isComplete}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  gameState.isComplete
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-110 active:scale-95"
                } bg-muted hover:bg-muted/70 border-2 border-border`}
              >
                <span className="text-xl">{ATOMS[target.element as keyof typeof ATOMS]?.emoji}</span>
                <span className="ml-2">{target.element} (need {target.count})</span>
              </button>
            ))}
          </div>

          {gameState.bondedAtoms.length > 0 && (
            <button
              onClick={handleClear}
              className="px-4 py-2 rounded-lg border-2 border-red-500/50 text-red-500 hover:bg-red-500/10 transition-all"
            >
              Clear Atoms
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="p-4 border-t border-border/50">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold">Molecules Built</span>
            <span className="text-sm text-muted-foreground">{gameState.score}/{CHALLENGES.length}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-secondary to-secondary/80 h-full transition-all duration-300"
              style={{ width: `${(gameState.score / CHALLENGES.length) * 100}%` }}
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
        conceptName="Molecule Builder"
        whatYouWillUnderstand="Atoms bond together to create stable molecules. Each atom wants to bond a certain number of times - when they're all bonded correctly, the molecule is stable and happy!"
        gameSteps={[
          "Read the target molecule and how many atoms you need",
          "Click on atom buttons to add them to the build area",
          "When you have the right atoms in the right amounts, they snap together into a stable molecule",
        ]}
        successMeaning="You understand atomic bonding and how atoms combine to form stable molecules!"
        icon="⚛️"
      />

      <GameCompletionPopup
        isOpen={showCompletion}
        isFullscreen={isFullscreen}
        onPlayAgain={handleRetry}
        onExitFullscreen={() => setIsFullscreen(false)}
        onBackToGames={() => navigate("/student/chemistry")}
        learningOutcome={`You built ${gameState.score} molecules successfully! You learned how atoms bond together to create stable molecules!`}
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
