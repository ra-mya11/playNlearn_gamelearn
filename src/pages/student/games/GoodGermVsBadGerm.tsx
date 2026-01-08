import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ConceptIntroPopup } from "@/components/ui/concept-intro-popup";
import { GameCompletionPopup } from "@/components/ui/game-completion-popup";
import { Maximize2, Minimize2, RotateCcw, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Germ {
  id: string;
  type: "good" | "bad";
  emoji: string;
  x: number;
  y: number;
}

interface ToolUse {
  type: "soap" | "medicine" | "heat";
  emoji: string;
  label: string;
  description: string;
}

const TOOLS: ToolUse[] = [
  {
    type: "soap",
    emoji: "🧼",
    label: "Soap",
    description: "Kills ALL germs",
  },
  {
    type: "medicine",
    emoji: "💊",
    label: "Medicine",
    description: "Targets BAD germs only",
  },
  {
    type: "heat",
    emoji: "🔥",
    label: "Heat",
    description: "Reduces all activity",
  },
];

export default function GoodGermVsBadGerm() {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [germs, setGerms] = useState<Germ[]>([]);
  const [feedback, setFeedback] = useState("");
  const [bodyHealth, setBodyHealth] = useState(100);
  const [soapUsed, setSoapUsed] = useState(0);
  const [medicineUsed, setMedicineUsed] = useState(0);

  // Initialize germs on game start
  useEffect(() => {
    if (gameStarted && germs.length === 0) {
      const initialGerms: Germ[] = [];
      // Add good germs
      for (let i = 0; i < 5; i++) {
        initialGerms.push({
          id: `good-${i}`,
          type: "good",
          emoji: "🟢",
          x: Math.random() * 80 + 10,
          y: Math.random() * 60 + 10,
        });
      }
      // Add bad germs
      for (let i = 0; i < 7; i++) {
        initialGerms.push({
          id: `bad-${i}`,
          type: "bad",
          emoji: "🔴",
          x: Math.random() * 80 + 10,
          y: Math.random() * 60 + 30,
        });
      }
      setGerms(initialGerms);
    }
  }, [gameStarted, germs.length]);

  // Check win condition
  useEffect(() => {
    const badGermCount = germs.filter((g) => g.type === "bad").length;
    const goodGermCount = germs.filter((g) => g.type === "good").length;

    if (badGermCount === 0 && goodGermCount > 2 && bodyHealth > 50) {
      setShowCompletion(true);
    }
  }, [germs, bodyHealth]);

  const handleToolClick = (toolType: string) => {
    if (germs.length === 0) return;

    let newGerms = [...germs];
    let feedback = "";
    let healthChange = 0;

    if (toolType === "soap") {
      newGerms = newGerms.filter((g) => Math.random() > 0.85); // Kills most germs
      feedback = "⚠️ Soap kills ALL germs - even the good ones!";
      healthChange = -15;
      setSoapUsed((prev) => prev + 1);
    } else if (toolType === "medicine") {
      const medicinedGerms = newGerms.map((g) => {
        if (g.type === "bad" && Math.random() > 0.3) {
          return null;
        }
        return g;
      });
      newGerms = medicinedGerms.filter((g) => g !== null) as Germ[];
      feedback = "✨ Medicine targets bad germs effectively!";
      healthChange = 10;
      setMedicineUsed((prev) => prev + 1);
    } else if (toolType === "heat") {
      newGerms = newGerms.filter((g) => Math.random() > 0.4); // Reduces all
      feedback = "🔥 Heat reduces germ activity";
      healthChange = 5;
    }

    setGerms(newGerms);
    setSelectedTool(null);
    setFeedback(feedback);
    setBodyHealth((prev) => Math.max(0, Math.min(100, prev + healthChange)));

    setTimeout(() => setFeedback(""), 2000);
  };

  const handleRetry = () => {
    setGerms([]);
    setFeedback("");
    setBodyHealth(100);
    setSoapUsed(0);
    setMedicineUsed(0);
    setGameStarted(false);
    setShowCompletion(false);
  };

  const badGermCount = germs.filter((g) => g.type === "bad").length;
  const goodGermCount = germs.filter((g) => g.type === "good").length;

  const getHealthColor = () => {
    if (bodyHealth > 70) return "text-green-500";
    if (bodyHealth > 40) return "text-yellow-500";
    return "text-red-500";
  };

  const getBodyEmoji = () => {
    if (bodyHealth > 70) return "😊";
    if (bodyHealth > 40) return "😐";
    return "😷";
  };

  const content = (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-red-900/10 to-blue-900/20 relative overflow-hidden p-4">
      {/* Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-8 right-1/4 text-5xl animate-pulse">💪</div>
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        {/* Body Status */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-2">{getBodyEmoji()}</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Your Body</h2>
          <div className="flex justify-center items-center gap-4">
            <div className="flex-1 max-w-xs">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-muted-foreground">Overall Health</p>
                <p className={`text-sm font-bold ${getHealthColor()}`}>
                  {bodyHealth}%
                </p>
              </div>
              <div className="h-4 bg-muted rounded-full overflow-hidden border border-border">
                <div
                  className={`h-full transition-all duration-500 ${
                    bodyHealth > 70
                      ? "bg-green-500"
                      : bodyHealth > 40
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${bodyHealth}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Germ Display */}
        <div className="mb-8 bg-gradient-to-b from-blue-500/20 to-blue-500/10 rounded-2xl p-8 border-2 border-blue-500/30 relative h-64 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm opacity-50">
            Inside Your Body
          </div>

          {germs.map((germ) => (
            <div
              key={germ.id}
              className="absolute text-3xl animate-bounce"
              style={{
                left: `${germ.x}%`,
                top: `${germ.y}%`,
                animation: `bounce ${2 + Math.random()}s infinite`,
              }}
            >
              {germ.emoji}
            </div>
          ))}

          {/* Germ counter */}
          <div className="absolute bottom-4 right-4 text-xs bg-background/80 px-3 py-1 rounded-full">
            <span className="text-red-500">Bad: {badGermCount}</span>
            {" / "}
            <span className="text-green-500">Good: {goodGermCount}</span>
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div
            className={`text-center mb-4 p-3 rounded-lg ${
              feedback.includes("targets bad")
                ? "bg-green-500/20 text-green-600"
                : feedback.includes("Soap")
                  ? "bg-red-500/20 text-red-600"
                  : "bg-yellow-500/20 text-yellow-600"
            }`}
          >
            {feedback}
          </div>
        )}

        {/* Tool Options */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {TOOLS.map((tool) => (
            <button
              key={tool.type}
              onClick={() => handleToolClick(tool.type)}
              className={`p-4 rounded-lg border-2 transition-all transform hover:scale-105 ${
                selectedTool === tool.type
                  ? "border-primary bg-primary/20"
                  : "border-border bg-card/50 hover:border-primary/50"
              }`}
            >
              <div className="text-3xl mb-2">{tool.emoji}</div>
              <p className="font-medium text-foreground text-sm">{tool.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
            </button>
          ))}
        </div>

        {/* Warning */}
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 text-center text-xs text-muted-foreground">
          ⚠️ Too much of anything is bad! Good germs help protect your body!
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
              🧠 Learning: Microorganisms & Health
            </p>
            <p className="text-xs text-muted-foreground">
              Learn that not all germs are bad, and balance is key to health
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
        conceptName="🦠 Good Germ vs Bad Germ"
        whatYouWillUnderstand="Learn that not all germs are bad! Good germs help your body, and using too much soap or medicine destroys the helpful ones too."
        gameSteps={[
          "See good germs (green) and bad germs (red) in your body",
          "Use soap, medicine, or heat to fight bad germs",
          "Keep good germs alive while eliminating the bad ones",
        ]}
        successMeaning="Your body will glow with health as you learn that balance—not complete elimination—is the key to health!"
        icon="🛡️"
      />

      <GameCompletionPopup
        isOpen={showCompletion}
        onPlayAgain={handleRetry}
        onExitFullscreen={() => setIsFullscreen(false)}
        onBackToGames={() => navigate("/student/biology")}
        learningOutcome="You've mastered immune health! You now understand that good germs are your allies and balance is more important than killing everything!"
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
