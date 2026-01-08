import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ConceptIntroPopup } from "@/components/ui/concept-intro-popup";
import { GameCompletionPopup } from "@/components/ui/game-completion-popup";
import { Maximize2, Minimize2, RotateCcw, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Element {
  symbol: string;
  name: string;
  group: number; // 1-18
  period: number; // 1-7
  category: "metal" | "nonmetal" | "metalloid" | "halogen" | "noble";
  color: string;
  size: "small" | "medium" | "large";
}

const PERIODIC_ELEMENTS: Element[] = [
  { symbol: "H", name: "Hydrogen", group: 1, period: 1, category: "nonmetal", color: "bg-blue-500/30", size: "small" },
  { symbol: "Li", name: "Lithium", group: 1, period: 2, category: "metal", color: "bg-amber-500/30", size: "large" },
  { symbol: "Be", name: "Beryllium", group: 2, period: 2, category: "metal", color: "bg-amber-600/30", size: "medium" },
  { symbol: "C", name: "Carbon", group: 14, period: 2, category: "nonmetal", color: "bg-gray-700/30", size: "medium" },
  { symbol: "N", name: "Nitrogen", group: 15, period: 2, category: "nonmetal", color: "bg-blue-500/30", size: "small" },
  { symbol: "O", name: "Oxygen", group: 16, period: 2, category: "nonmetal", color: "bg-red-500/30", size: "small" },
  { symbol: "F", name: "Fluorine", group: 17, period: 2, category: "halogen", color: "bg-yellow-500/30", size: "small" },
  { symbol: "Ne", name: "Neon", group: 18, period: 2, category: "noble", color: "bg-purple-500/30", size: "small" },
  { symbol: "Na", name: "Sodium", group: 1, period: 3, category: "metal", color: "bg-amber-500/30", size: "large" },
  { symbol: "Al", name: "Aluminum", group: 13, period: 3, category: "metal", color: "bg-gray-400/30", size: "medium" },
  { symbol: "Cl", name: "Chlorine", group: 17, period: 3, category: "halogen", color: "bg-yellow-500/30", size: "small" },
  { symbol: "Ar", name: "Argon", group: 18, period: 3, category: "noble", color: "bg-purple-500/30", size: "small" },
];

interface PlacedElement {
  element: Element;
  placed: boolean;
}

interface GameState {
  elements: PlacedElement[];
  score: number;
  gridState: Map<string, Element | null>;
  selectedElement: Element | null;
  feedback: string;
}

const GRID_GROUPS = Array.from({ length: 18 }, (_, i) => i + 1);
const GRID_PERIODS = Array.from({ length: 3 }, (_, i) => i + 1);

export default function PeriodicTablePuzzle() {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    elements: PERIODIC_ELEMENTS.sort(() => Math.random() - 0.5).map((el) => ({
      element: el,
      placed: false,
    })),
    score: 0,
    gridState: new Map(),
    selectedElement: null,
    feedback: "",
  });

  const gridKey = (group: number, period: number) => `${group}-${period}`;

  const handleElementSelect = (element: Element) => {
    setGameState((prev) => ({
      ...prev,
      selectedElement: prev.selectedElement?.symbol === element.symbol ? null : element,
    }));
  };

  const handleGridCell = (group: number, period: number) => {
    if (!gameState.selectedElement) return;

    const isCorrect =
      gameState.selectedElement.group === group &&
      gameState.selectedElement.period === period;

    if (isCorrect) {
      const key = gridKey(group, period);
      const newGrid = new Map(gameState.gridState);
      newGrid.set(key, gameState.selectedElement);

      const newElements = gameState.elements.map((el) =>
        el.element.symbol === gameState.selectedElement?.symbol
          ? { ...el, placed: true }
          : el
      );

      setGameState((prev) => ({
        ...prev,
        gridState: newGrid,
        elements: newElements,
        score: prev.score + 1,
        selectedElement: null,
        feedback: "Perfect placement! ✨",
      }));

      setTimeout(() => {
        setGameState((prev) => ({ ...prev, feedback: "" }));

        if (newElements.every((el) => el.placed)) {
          setTimeout(() => setShowCompletion(true), 500);
        }
      }, 800);
    } else {
      setGameState((prev) => ({
        ...prev,
        feedback: "Not quite right... try another spot! 🤔",
      }));

      setTimeout(() => {
        setGameState((prev) => ({ ...prev, feedback: "" }));
      }, 1000);
    }
  };

  const handleRetry = () => {
    setGameState({
      elements: PERIODIC_ELEMENTS.sort(() => Math.random() - 0.5).map((el) => ({
        element: el,
        placed: false,
      })),
      score: 0,
      gridState: new Map(),
      selectedElement: null,
      feedback: "",
    });
    setShowCompletion(false);
  };

  const gameView = (
    <div className={`${isFullscreen ? "fixed inset-0 z-50 bg-background" : ""} flex flex-col`}>
      <div className={`${isFullscreen ? "h-screen" : "h-[700px]"} flex flex-col overflow-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📋</span>
            <div>
              <h2 className="font-bold text-lg text-foreground">Periodic Table Puzzle</h2>
              <p className="text-sm text-muted-foreground">Arrange {gameState.elements.length} elements</p>
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

        <div className="flex-1 p-6 overflow-auto">
          {/* Periodic Table Grid */}
          <div className="mb-6 bg-muted/20 rounded-xl p-4 overflow-x-auto">
            <div className="min-w-max">
              {/* Group Headers */}
              <div className="flex gap-1 mb-1">
                <div className="w-12" />
                {GRID_GROUPS.map((group) => (
                  <div
                    key={`header-${group}`}
                    className="w-10 h-10 flex items-center justify-center text-xs font-semibold text-muted-foreground"
                  >
                    {group}
                  </div>
                ))}
              </div>

              {/* Periods and Cells */}
              {GRID_PERIODS.map((period) => (
                <div key={`period-${period}`} className="flex gap-1 mb-1">
                  <div className="w-12 flex items-center justify-center text-xs font-semibold text-muted-foreground">
                    {period}
                  </div>
                  {GRID_GROUPS.map((group) => {
                    const key = gridKey(group, period);
                    const element = gameState.gridState.get(key);

                    return (
                      <button
                        key={key}
                        onClick={() => handleGridCell(group, period)}
                        className={`w-10 h-10 rounded text-xs font-bold transition-all border-2 ${
                          element
                            ? "border-secondary/60 bg-secondary/20 cursor-default"
                            : "border-border/40 hover:border-border/80 bg-muted/30"
                        }`}
                        title={element ? `${element.symbol} (${element.name})` : "Empty cell"}
                      >
                        {element && <span className="text-xs">{element.symbol}</span>}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {gameState.feedback && (
            <div className="mb-4 p-3 text-center rounded-lg bg-muted/50">
              <p className="font-semibold text-secondary">{gameState.feedback}</p>
            </div>
          )}

          {/* Element Tiles */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-muted-foreground mb-3">
              {gameState.elements.filter((e) => !e.placed).length} elements remaining
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {gameState.elements.map((item) => (
                <button
                  key={item.element.symbol}
                  onClick={() => handleElementSelect(item.element)}
                  disabled={item.placed}
                  className={`p-3 rounded-lg transition-all text-center ${
                    item.placed
                      ? "opacity-30 cursor-not-allowed"
                      : gameState.selectedElement?.symbol === item.element.symbol
                        ? "border-2 border-secondary scale-105 ring-2 ring-secondary/30"
                        : "border-2 border-border hover:border-secondary/50"
                  } ${item.element.color}`}
                >
                  <div className="text-lg font-bold">{item.element.symbol}</div>
                  <div className="text-xs text-muted-foreground mt-1">{item.element.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="p-4 border-t border-border/50">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold">Progress</span>
            <span className="text-sm text-muted-foreground">{gameState.score}/{gameState.elements.length}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-secondary to-secondary/80 h-full transition-all duration-300"
              style={{ width: `${(gameState.score / gameState.elements.length) * 100}%` }}
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
        conceptName="Periodic Table Puzzle"
        whatYouWillUnderstand="The periodic table is organized by patterns. Elements in the same column behave similarly, and elements in the same row share certain properties. These patterns help scientists understand and predict how elements will behave!"
        gameSteps={[
          "Select an element from the tiles below",
          "Click on the grid cell where you think it belongs",
          "Elements placed correctly will stay locked in position",
        ]}
        successMeaning="You understand the organization and patterns of the periodic table!"
        icon="📋"
      />

      <GameCompletionPopup
        isOpen={showCompletion}
        isFullscreen={isFullscreen}
        onPlayAgain={handleRetry}
        onExitFullscreen={() => setIsFullscreen(false)}
        onBackToGames={() => navigate("/student/chemistry")}
        learningOutcome={`You correctly placed all ${gameState.score} elements! You learned the organization and patterns of the periodic table!`}
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
