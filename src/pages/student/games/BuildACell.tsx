import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ConceptIntroPopup } from "@/components/ui/concept-intro-popup";
import { GameCompletionPopup } from "@/components/ui/game-completion-popup";
import { Maximize2, Minimize2, RotateCcw, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Organelle {
  id: string;
  name: string;
  emoji: string;
  function: string;
  required: boolean;
  x?: number;
  y?: number;
}

interface CellState {
  nucleus: boolean;
  mitochondria: boolean;
  ribosome: boolean;
  golgi: boolean;
  lysosome: boolean;
}

const ORGANELLES: Organelle[] = [
  {
    id: "nucleus",
    name: "Nucleus",
    emoji: "🟣",
    function: "Control center - runs the cell",
    required: true,
  },
  {
    id: "mitochondria",
    name: "Mitochondria",
    emoji: "🟢",
    function: "Power plant - creates energy",
    required: true,
  },
  {
    id: "ribosome",
    name: "Ribosome",
    emoji: "🔵",
    function: "Protein factory - builds proteins",
    required: true,
  },
  {
    id: "golgi",
    name: "Golgi Apparatus",
    emoji: "🟡",
    function: "Packaging station - ships proteins",
    required: false,
  },
  {
    id: "lysosome",
    name: "Lysosome",
    emoji: "🟠",
    function: "Garbage disposal - cleans waste",
    required: false,
  },
];

export default function BuildACell() {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [cellState, setCellState] = useState<CellState>({
    nucleus: false,
    mitochondria: false,
    ribosome: false,
    golgi: false,
    lysosome: false,
  });
  const [draggedOrganelle, setDraggedOrganelle] = useState<string | null>(null);
  const [cellHealth, setCellHealth] = useState(0);
  const [feedback, setFeedback] = useState("");

  // Calculate cell health based on organelles
  useEffect(() => {
    const requiredCount = ORGANELLES.filter((o) => o.required && cellState[o.id as keyof CellState]).length;
    const totalCount = Object.values(cellState).filter(Boolean).length;
    const requiredTotal = ORGANELLES.filter((o) => o.required).length;

    if (requiredCount === requiredTotal) {
      const health = 50 + (totalCount - requiredTotal) * 10;
      setCellHealth(Math.min(health, 100));

      if (health >= 80) {
        setShowCompletion(true);
      }
    } else {
      setCellHealth(Math.round((requiredCount / requiredTotal) * 100));
    }
  }, [cellState]);

  const handleDragStart = (organelleId: string) => {
    setDraggedOrganelle(organelleId);
  };

  const handleDragEnd = (organelleId: string) => {
    const newState = { ...cellState };
    newState[organelleId as keyof CellState] = true;

    const organelle = ORGANELLES.find((o) => o.id === organelleId);
    if (organelle?.required) {
      setFeedback(`✨ ${organelle.name} added! ${organelle.function}`);
    } else {
      setFeedback(`✨ ${organelle.name} added! Bonus: ${organelle.function}`);
    }

    setTimeout(() => setFeedback(""), 2000);
    setCellState(newState);
    setDraggedOrganelle(null);
  };

  const handleRetry = () => {
    setCellState({
      nucleus: false,
      mitochondria: false,
      ribosome: false,
      golgi: false,
      lysosome: false,
    });
    setCellHealth(0);
    setFeedback("");
    setGameStarted(false);
    setShowCompletion(false);
  };

  const unaddedOrganelles = ORGANELLES.filter(
    (o) => !cellState[o.id as keyof CellState]
  );

  const getHealthColor = () => {
    if (cellHealth >= 80) return "bg-green-500";
    if (cellHealth >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const content = (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-900/10 to-purple-900/20 relative overflow-hidden p-4">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-8 right-1/4 text-5xl animate-pulse">⚛️</div>
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        {/* Instructions */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Build a Healthy Cell</h2>
          <p className="text-sm text-muted-foreground">
            Drag organelles into the cell to make it function
          </p>
        </div>

        {/* Cell Health */}
        <div className="mb-6">
          <div className="flex justify-center items-center gap-4">
            <div className="flex-1 max-w-xs">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-muted-foreground">Cell Health</p>
                <p className="text-sm font-bold text-foreground">{cellHealth}%</p>
              </div>
              <div className="h-4 bg-muted rounded-full overflow-hidden border border-border">
                <div
                  className={`h-full transition-all duration-500 ${getHealthColor()}`}
                  style={{ width: `${cellHealth}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Cell Container */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Cell Display */}
          <div className="flex items-center justify-center">
            <div className="relative w-64 h-64 rounded-full border-4 border-primary/50 bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
              {/* Cell membrane */}
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 opacity-50" />

              {/* Organelles inside cell */}
              <div className="relative w-full h-full flex flex-col items-center justify-center gap-3">
                {/* Top row */}
                <div className="flex gap-3">
                  {cellState.nucleus && (
                    <div className="text-4xl animate-pulse">🟣</div>
                  )}
                  {cellState.golgi && (
                    <div className="text-4xl animate-pulse">🟡</div>
                  )}
                </div>

                {/* Middle row */}
                <div className="flex gap-3">
                  {cellState.ribosome && (
                    <div className="text-4xl animate-bounce">🔵</div>
                  )}
                  {cellState.mitochondria && (
                    <div className="text-4xl animate-bounce">🟢</div>
                  )}
                  {cellState.lysosome && (
                    <div className="text-4xl animate-bounce">🟠</div>
                  )}
                </div>
              </div>

              {/* Energy pulse when complete */}
              {cellHealth >= 80 && (
                <div className="absolute inset-2 rounded-full border-2 border-green-500/50 animate-pulse" />
              )}
            </div>
          </div>

          {/* Organelles to add */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground text-sm mb-3">Available Organelles</h4>
            <div className="space-y-2">
              {unaddedOrganelles.map((organelle) => (
                <div
                  key={organelle.id}
                  draggable
                  onDragStart={() => handleDragStart(organelle.id)}
                  onDragEnd={() => handleDragEnd(organelle.id)}
                  onClick={() => handleDragEnd(organelle.id)}
                  className={`p-3 rounded-lg border-2 cursor-move transition-all transform hover:scale-105 ${
                    organelle.required
                      ? "border-red-500/40 bg-red-500/10"
                      : "border-yellow-500/40 bg-yellow-500/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{organelle.emoji}</div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">
                        {organelle.name}
                        {organelle.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {organelle.function}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {unaddedOrganelles.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  All organelles added!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="text-center mb-4 p-3 rounded-lg bg-green-500/20 text-green-600">
            {feedback}
          </div>
        )}

        {/* Status */}
        <div className="bg-muted/20 rounded-lg p-3 text-center text-xs text-muted-foreground">
          * = Required organelle. Click or drag organelles to add them to the cell!
        </div>
      </div>
    </div>
  );

  const gameView = (
    <div className={isFullscreen ? "fixed inset-0 z-50 bg-background" : ""}>
      <div className={isFullscreen ? "h-screen flex flex-col" : "h-[700px]"}>
        {/* Game Canvas with Fullscreen Button */}
        <div className="flex-1 overflow-auto relative">
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

        {!isFullscreen && (
          <div className="border-t border-border bg-card/50 p-4 space-y-2">
            <p className="text-sm font-medium text-foreground">
              🧠 Learning: Cell Structure & Function
            </p>
            <p className="text-xs text-muted-foreground">
              Understand how each organelle works together to keep the cell alive
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
        conceptName="🧬 Build A Cell"
        whatYouWillUnderstand="Learn that cells have different parts called organelles, and each part has a specific job. Missing parts make the cell weaker."
        gameSteps={[
          "Drag or click organelles to add them into the cell",
          "Add the required organelles (marked with *) first",
          "Add extra organelles for bonus points and cell health",
        ]}
        successMeaning="Your cell will pulse with energy and you'll understand how each organelle helps keep the cell alive and working!"
        icon="🧬"
      />

      <GameCompletionPopup
        isOpen={showCompletion}
        onPlayAgain={handleRetry}
        onExitFullscreen={() => setIsFullscreen(false)}
        onBackToGames={() => navigate("/student/biology")}
        learningOutcome="You've built a healthy cell! You now understand that every organelle has a job and works together to keep the cell alive!"
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
