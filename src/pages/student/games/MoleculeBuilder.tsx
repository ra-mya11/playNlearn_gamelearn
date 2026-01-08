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
    showInvalidFeedback: false,
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
      showInvalidFeedback: false,
    }));
  };

  const handleRetry = () => {
    setGameState({
      currentChallengeIndex: 0,
      score: 0,
      bondedAtoms: [],
      selectedAtom: null,
      isComplete: false,
      showInvalidFeedback: false,
    });
    setShowCompletion(false);
  };

  const gameView = (
    <div className={`${isFullscreen ? "fixed inset-0 z-50 bg-background" : ""} flex flex-col`}>
      <style>{`
        @keyframes atom-appear {
          0% { transform: scale(0) rotate(180deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes bond-draw {
          0% { transform: scaleX(0); transform-origin: left; opacity: 0; }
          100% { transform: scaleX(1); transform-origin: left; opacity: 1; }
        }
        @keyframes molecule-spin {
          0% { transform: rotateZ(0deg); }
          100% { transform: rotateZ(360deg); }
        }
        @keyframes formula-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(34, 197, 94, 0.3); }
          50% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.6); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        @keyframes invalid-pulse {
          0%, 100% { border-color: rgba(239, 68, 68, 0.5); }
          50% { border-color: rgba(239, 68, 68, 1); }
        }
        .atom-appear {
          animation: atom-appear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .bond-draw {
          animation: bond-draw 0.4s ease-out forwards;
        }
        .molecule-spin {
          animation: molecule-spin 1.5s linear;
        }
        .formula-glow {
          animation: formula-glow 1.5s ease-in-out infinite;
        }
        .shake-molecule {
          animation: shake 0.4s ease-in-out;
        }
        .invalid-feedback {
          animation: invalid-pulse 0.6s ease-in-out;
        }
      `}</style>

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
          {/* Live Formula Panel */}
          <div className={`relative rounded-xl p-4 border-2 transition-all ${
            gameState.isComplete
              ? "bg-green-500/10 border-green-500/50 formula-glow"
              : gameState.showInvalidFeedback
                ? "bg-red-500/10 border-red-500/50 invalid-feedback"
                : "bg-muted/30 border-dashed border-secondary/30"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Formula</span>
              {gameState.isComplete && <span className="text-xl">✨</span>}
            </div>
            <div className={`text-3xl font-bold mt-2 font-mono ${
              gameState.isComplete ? "text-green-600" : "text-foreground"
            }`}>
              {generateFormula(gameState.bondedAtoms) || "—"}
            </div>
            {gameState.isComplete && (
              <div className="text-xs text-green-600 font-semibold mt-2">Stable Molecule!</div>
            )}
            {gameState.showInvalidFeedback && (
              <div className="text-xs text-red-600 font-semibold mt-2">Keep building...</div>
            )}
          </div>

          {/* Molecule Canvas */}
          <div className={`relative bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 rounded-xl border-2 h-64 flex items-center justify-center overflow-hidden transition-all ${
            gameState.showInvalidFeedback ? "shake-molecule border-red-500/50 bg-red-500/5" : "border-secondary/30"
          }`}>
            {gameState.bondedAtoms.length === 0 ? (
              <div className="text-center">
                <p className="text-5xl mb-2 animate-bounce">⚛️</p>
                <p className="text-sm text-muted-foreground">Start building by clicking atoms below</p>
              </div>
            ) : (
              <>
                {/* Bond Lines */}
                {gameState.bondedAtoms.length > 1 && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {gameState.bondedAtoms.map((atom1, i) => (
                      gameState.bondedAtoms.slice(i + 1).map((atom2, j) => {
                        const x1 = 50 + (atom1.x / 200) * 30;
                        const y1 = 50 + (atom1.y / 200) * 30;
                        const x2 = 50 + (atom2.x / 200) * 30;
                        const y2 = 50 + (atom2.y / 200) * 30;
                        const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

                        if (distance < 15) {
                          return (
                            <line
                              key={`bond-${i}-${j}`}
                              x1={`${x1}%`}
                              y1={`${y1}%`}
                              x2={`${x2}%`}
                              y2={`${y2}%`}
                              stroke="currentColor"
                              strokeWidth="3"
                              className="text-secondary/60 bond-draw"
                              style={{ animationDelay: `${i * 0.1}s` }}
                            />
                          );
                        }
                      })
                    ))}
                  </svg>
                )}

                {/* Atoms */}
                {gameState.bondedAtoms.map((atom, index) => (
                  <div
                    key={atom.atomId}
                    className={`absolute w-14 h-14 rounded-full flex items-center justify-center text-3xl transition-all font-bold border-2 border-secondary/40 atom-appear ${
                      gameState.isComplete
                        ? "molecule-spin bg-green-500/10"
                        : "hover:scale-125 hover:shadow-lg bg-white/50 dark:bg-slate-700/50 backdrop-blur"
                    }`}
                    style={{
                      transform: gameState.isComplete
                        ? `translate(calc(-50% + ${Math.cos((index * 360) / gameState.bondedAtoms.length) * 50}px), calc(-50% + ${Math.sin((index * 360) / gameState.bondedAtoms.length) * 50}px))`
                        : `translate(calc(-50% + ${atom.x}px), calc(-50% + ${atom.y}px))`,
                      left: "50%",
                      top: "50%",
                      animationDelay: `${index * 0.1}s`,
                    }}
                  >
                    {ATOMS[atom.element as keyof typeof ATOMS]?.emoji}
                  </div>
                ))}

                {gameState.isComplete && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-green-500/10 via-transparent to-green-500/10 pointer-events-none">
                    <div className="text-center">
                      <p className="text-5xl mb-2">✨</p>
                      <p className="text-lg font-bold text-green-600">Stable Molecule!</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Atom Buttons */}
          <div className="flex gap-2 flex-wrap justify-center">
            {currentChallenge.targetAtoms.map((target) => {
              const atomCount = gameState.bondedAtoms.filter(a => a.element === target.element).length;
              const isComplete = atomCount >= target.count;
              return (
                <button
                  key={target.element}
                  onClick={() => handleAddAtom(target.element)}
                  disabled={gameState.isComplete || isComplete}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                    gameState.isComplete || isComplete
                      ? "opacity-50 cursor-not-allowed bg-muted/50 border-2 border-border"
                      : "hover:scale-110 active:scale-95 bg-muted hover:bg-muted/70 border-2 border-border hover:border-secondary/50"
                  }`}
                >
                  <span className="text-xl">{ATOMS[target.element as keyof typeof ATOMS]?.emoji}</span>
                  <div className="text-left">
                    <div className="text-sm">{target.element}</div>
                    <div className="text-xs text-muted-foreground">{atomCount}/{target.count}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {gameState.bondedAtoms.length > 0 && (
            <button
              onClick={handleClear}
              className="px-4 py-2 rounded-lg border-2 border-red-500/50 text-red-500 hover:bg-red-500/10 transition-all font-medium"
            >
              🗑️ Clear Atoms
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
