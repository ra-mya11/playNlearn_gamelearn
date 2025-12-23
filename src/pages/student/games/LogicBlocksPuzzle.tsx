import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { ConceptIntroPopup } from "@/components/ui/concept-intro-popup";
import { GameCompletionPopup } from "@/components/ui/game-completion-popup";
import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogicGate {
  id: number;
  type: "AND" | "OR";
  x: number;
  y: number;
  inputs: (boolean | null)[];
  output: boolean;
  inputValues: boolean[];
}

interface InputNode {
  id: number;
  value: boolean;
  x: number;
  y: number;
}

const GAME_WIDTH = 900;
const GAME_HEIGHT = 500;

export default function LogicBlocksPuzzle() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  const [inputNodes, setInputNodes] = useState<InputNode[]>([
    { id: 1, value: false, x: 50, y: 100 },
    { id: 2, value: false, x: 50, y: 250 },
  ]);

  const [gates, setGates] = useState<LogicGate[]>([
    {
      id: 1,
      type: "AND",
      x: 250,
      y: 150,
      inputs: [null, null],
      output: false,
      inputValues: [false, false],
    },
    {
      id: 2,
      type: "OR",
      x: 450,
      y: 150,
      inputs: [null, null],
      output: false,
      inputValues: [false, false],
    },
  ]);

  const [outputValue, setOutputValue] = useState(false);
  const [connections, setConnections] = useState<Array<{
    fromType: "input" | "gate";
    fromId: number;
    toGateId: number;
    toInputIndex: number;
  }>>([]);

  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // Auto-evaluate logic gates
  useEffect(() => {
    const newGates = gates.map((gate) => {
      const inputVals = [false, false];

      // Get input values from connections
      for (let i = 0; i < 2; i++) {
        const conn = connections.find(
          (c) => c.toGateId === gate.id && c.toInputIndex === i
        );
        if (!conn) continue;

        if (conn.fromType === "input") {
          const node = inputNodes.find((n) => n.id === conn.fromId);
          if (node) inputVals[i] = node.value;
        } else {
          const sourceGate = gates.find((g) => g.id === conn.fromId);
          if (sourceGate) inputVals[i] = sourceGate.output;
        }
      }

      let output = false;
      switch (gate.type) {
        case "AND":
          output = inputVals[0] && inputVals[1];
          break;
        case "OR":
          output = inputVals[0] || inputVals[1];
          break;
      }

      return { ...gate, inputValues: inputVals, output };
    });

    setGates(newGates);

    // Calculate final output
    const lastGate = newGates[newGates.length - 1];
    setOutputValue(lastGate.output);
  }, [inputNodes, connections]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Grid
    ctx.strokeStyle = "rgba(148, 163, 184, 0.1)";
    ctx.lineWidth = 1;
    for (let i = 0; i < GAME_WIDTH; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, GAME_HEIGHT);
      ctx.stroke();
    }

    // Title
    ctx.fillStyle = "#FFF";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Connect Logic Gates to Control the Output", GAME_WIDTH / 2, 25);

    // ===== CONNECTIONS =====
    connections.forEach((conn) => {
      let fromX = 0,
        fromY = 0;

      if (conn.fromType === "input") {
        const node = inputNodes.find((n) => n.id === conn.fromId);
        if (node) {
          fromX = node.x + 25;
          fromY = node.y;
        }
      } else {
        const gate = gates.find((g) => g.id === conn.fromId);
        if (gate) {
          fromX = gate.x + 50;
          fromY = gate.y;
        }
      }

      const toGate = gates.find((g) => g.id === conn.toGateId);
      if (!toGate) return;

      const toX = toGate.x;
      const toY = toGate.y + (conn.toInputIndex === 0 ? -20 : 20);

      // Connection line
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.quadraticCurveTo((fromX + toX) / 2, (fromY + toY) / 2, toX, toY);
      ctx.stroke();

      // Animated flow on connection
      const offset = (Date.now() / 30) % 100;
      const t = offset / 100;
      const x = fromX + (toX - fromX) * t;
      const y =
        fromY +
        (((toY - fromY) + 2 * (toY - fromY) * t * (1 - t)) -
          (fromY - fromY + 2 * (toY - fromY) * t * (1 - t)));

      ctx.fillStyle = "#60A5FA";
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // ===== INPUT NODES =====
    inputNodes.forEach((node) => {
      // Node circle
      ctx.fillStyle = node.value ? "#22c55e" : "#ef4444";
      ctx.beginPath();
      ctx.arc(node.x + 15, node.y, 15, 0, Math.PI * 2);
      ctx.fill();

      // Value indicator
      ctx.fillStyle = "#FFF";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(node.value ? "1" : "0", node.x + 15, node.y + 4);

      // Label
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "12px Arial";
      ctx.textAlign = "right";
      ctx.fillText(`Input ${node.id}`, node.x - 10, node.y + 5);

      // Tap feedback
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(node.x + 15, node.y, 18, 0, Math.PI * 2);
      ctx.stroke();
    });

    // ===== LOGIC GATES =====
    gates.forEach((gate) => {
      const width = 60;
      const height = 50;

      // Gate box
      ctx.fillStyle = gate.output ? "#22c55e" : "#334155";
      ctx.fillRect(gate.x, gate.y - height / 2, width, height);

      // Border
      ctx.strokeStyle = gate.output ? "#22c55e" : "#64748b";
      ctx.lineWidth = gate.output ? 3 : 2;
      ctx.strokeRect(gate.x, gate.y - height / 2, width, height);

      // Label
      ctx.fillStyle = gate.output ? "#000" : "#e2e8f0";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.fillText(gate.type, gate.x + width / 2, gate.y + 5);

      // Input points
      ctx.fillStyle = "#3b82f6";
      ctx.beginPath();
      ctx.arc(gate.x, gate.y - 18, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(gate.x, gate.y + 18, 5, 0, Math.PI * 2);
      ctx.fill();

      // Output point
      ctx.fillStyle = gate.output ? "#22c55e" : "#8b5cf6";
      ctx.beginPath();
      ctx.arc(gate.x + width, gate.y, 6, 0, Math.PI * 2);
      ctx.fill();

      // Input value indicators
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "10px Arial";
      ctx.textAlign = "center";
      ctx.fillText(gate.inputValues[0] ? "1" : "0", gate.x + width / 2, gate.y - 25);
      ctx.fillText(gate.inputValues[1] ? "1" : "0", gate.x + width / 2, gate.y + 30);
    });

    // ===== OUTPUT =====
    const outputX = 750;
    const outputY = 150;

    // Output node
    ctx.fillStyle = outputValue ? "#22c55e" : "#ef4444";
    ctx.beginPath();
    ctx.arc(outputX, outputY, 18, 0, Math.PI * 2);
    ctx.fill();

    // Glow if on
    if (outputValue) {
      ctx.strokeStyle = "rgba(34, 197, 94, 0.5)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(outputX, outputY, 25, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Value display
    ctx.fillStyle = "#FFF";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(outputValue ? "1" : "0", outputX, outputY + 5);

    // Label
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "12px Arial";
    ctx.textAlign = "left";
    ctx.fillText("OUTPUT", outputX + 30, outputY + 5);

    // ===== STATUS =====
    ctx.fillStyle = outputValue ? "#22c55e" : "#64748b";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      outputValue ? "✓ Output ON" : "Output OFF",
      GAME_WIDTH / 2,
      GAME_HEIGHT - 20
    );

    if (!outputValue && attempts > 5 && showHint) {
      ctx.fillStyle = "#FFA500";
      ctx.font = "12px Arial";
      ctx.fillText(
        "Try connecting both inputs to create AND logic",
        GAME_WIDTH / 2,
        GAME_HEIGHT - 40
      );
    }
  }, [inputNodes, gates, connections, outputValue, attempts, showHint]);

  // Mouse handlers for touch/click
  const handleCanvasClick = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let x = 0,
      y = 0;

    if ("touches" in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    // Click input nodes to toggle
    inputNodes.forEach((node) => {
      const dist = Math.sqrt((x - (node.x + 15)) ** 2 + (y - node.y) ** 2);
      if (dist < 20) {
        setInputNodes((prev) =>
          prev.map((n) => (n.id === node.id ? { ...n, value: !n.value } : n))
        );
        setAttempts((prev) => prev + 1);
      }
    });

    // Click gate output to start connection (simplified - just for visual feedback)
    gates.forEach((gate) => {
      const dist = Math.sqrt((x - (gate.x + 60)) ** 2 + (y - gate.y) ** 2);
      if (dist < 8) {
        // Gate output clicked - could start connection
      }
    });
  };

  const handleStart = () => {
    setShowTutorial(false);
  };

  const handleGoBack = () => {
    navigate("/student/physics");
  };

  const handleExitFullscreen = () => {
    setIsFullscreen(false);
  };

  const handleReset = () => {
    setInputNodes([
      { id: 1, value: false, x: 50, y: 100 },
      { id: 2, value: false, x: 50, y: 250 },
    ]);
    setConnections([]);
    setAttempts(0);
    setShowHint(false);
    setShowCompletion(false);
  };

  // Pre-connected example
  const addExampleConnection = () => {
    // Connect Input 1 and Input 2 to AND gate
    const newConns = [
      { fromType: "input" as const, fromId: 1, toGateId: 1, toInputIndex: 0 },
      { fromType: "input" as const, fromId: 2, toGateId: 1, toInputIndex: 1 },
      { fromType: "gate" as const, fromId: 1, toGateId: 2, toInputIndex: 0 },
    ];
    setConnections(newConns);
  };

  const gameContainer = (
    <div
      className={cn(
        "flex flex-col items-center justify-center transition-all duration-300",
        isFullscreen ? "fixed inset-0 z-50 bg-black p-0 overflow-hidden" : "w-full bg-slate-900 p-4"
      )}
    >
      {/* Fullscreen button */}
      {!isFullscreen && (
        <div className="absolute top-4 right-4 z-10">
          <Button
            onClick={() => setIsFullscreen(true)}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <Maximize2 className="w-4 h-4" />
            Full Screen
          </Button>
        </div>
      )}

      {isFullscreen && (
        <Button
          onClick={() => setIsFullscreen(false)}
          size="sm"
          variant="outline"
          className="absolute top-4 right-4 z-10 gap-2 bg-white hover:bg-gray-100"
        >
          <Minimize2 className="w-4 h-4" />
          Exit
        </Button>
      )}

      {/* Canvas */}
      <div className={cn(
        "rounded-lg border-2 border-purple-500 shadow-lg bg-slate-900 overflow-hidden",
        isFullscreen ? "w-screen h-screen" : "w-full max-w-5xl"
      )}>
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="w-full h-full cursor-pointer touch-none"
          onClick={handleCanvasClick}
          onTouchEnd={handleCanvasClick}
        />
      </div>

      {/* Controls */}
      {!isFullscreen && (
        <div className="mt-6 w-full max-w-5xl bg-slate-800 p-6 rounded-lg border border-purple-500 shadow-md">
          <div className="space-y-6">
            <div className="text-white text-center text-sm">
              <p className="mb-2 font-semibold">
                Click input circles (red/green) to toggle them ON and OFF.
              </p>
              <p className="text-xs text-gray-400">
                Goal: Make the output light green (value = 1)!
              </p>
            </div>

            {/* Logic Gate Explanation */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-700 rounded-lg">
              <div className="text-white text-center text-xs">
                <div className="font-bold mb-2">AND Gate</div>
                <p className="text-gray-400">Both inputs = 1</p>
                <p className="text-gray-300 font-mono text-sm mt-1">1 AND 1 = 1</p>
              </div>
              <div className="text-white text-center text-xs">
                <div className="font-bold mb-2">OR Gate</div>
                <p className="text-gray-400">One input = 1</p>
                <p className="text-gray-300 font-mono text-sm mt-1">1 OR 0 = 1</p>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={addExampleConnection}
                variant="outline"
                className="text-blue-400 border-blue-500 hover:bg-blue-500 hover:text-white font-bold text-xs"
              >
                📎 Connect
              </Button>
              <Button
                onClick={() => setShowHint(!showHint)}
                variant="outline"
                className="text-yellow-400 border-yellow-500 hover:bg-yellow-500 hover:text-black font-bold text-xs"
              >
                💡 Hint
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="text-red-400 border-red-500 hover:bg-red-500 hover:text-white font-bold text-xs"
              >
                🔄 Reset
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-700 rounded-lg text-white text-center">
              <div>
                <div className="text-xs text-gray-400">Connections</div>
                <div className="text-2xl font-bold text-blue-400">{connections.length}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Attempts</div>
                <div className="text-2xl font-bold text-purple-400">{attempts}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Output</div>
                <div className="text-2xl font-bold" style={{ color: outputValue ? "#22c55e" : "#ef4444" }}>
                  {outputValue ? "1" : "0"}
                </div>
              </div>
            </div>

            {outputValue && (
              <Button
                onClick={() => setShowCompletion(true)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold"
                size="lg"
              >
                ✅ Output is ON!
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Embedded Info */}
      {!isFullscreen && (
        <div className="mt-6 w-full max-w-5xl bg-purple-50 p-6 rounded-lg border border-purple-200">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-800 mb-2">📘 Concept</h3>
              <p className="text-sm text-gray-700">
                Logic gates are decision makers. AND gates need BOTH inputs ON. OR gates need at least ONE input ON.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">🕹 How to Play</h3>
              <p className="text-sm text-gray-700">
                Click the red/green input circles to toggle them. Use the Connect button to link inputs to gates. Make the output turn green!
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">🧠 What You Learn</h3>
              <p className="text-sm text-gray-700">
                Logic is predictable and follows clear rules. AND requires both. OR needs one. Logic gates combine to solve problems!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <AppLayout>
      <ConceptIntroPopup
        isOpen={showTutorial}
        onStart={handleStart}
        onGoBack={handleGoBack}
        conceptName="Logic Blocks Puzzle"
        whatYouWillUnderstand="Understand how logic gates work. AND needs both inputs. OR needs one. Combine them to solve puzzles!"
        gameSteps={[
          "Click input circles (red/green) to toggle them ON (green) and OFF (red)",
          "Click the Connect button to link inputs to logic gates",
          "AND gates output 1 only when BOTH inputs are 1",
          "OR gates output 1 when at least ONE input is 1",
          "Make the output turn green (= 1)!",
        ]}
        successMeaning="When the output turns green and shows 1, you've successfully activated the logic gates!"
        icon="⚙️"
      />

      <GameCompletionPopup
        isOpen={showCompletion && outputValue}
        onPlayAgain={handleReset}
        onExitFullscreen={handleExitFullscreen}
        onBackToGames={handleGoBack}
        learningOutcome="You mastered logic gates! AND gates need both inputs. OR gates need one. Logic is predictable!"
        isFullscreen={isFullscreen}
      />

      <div className="py-6">
        <div className="mb-4 flex items-center gap-2">
          <Button
            onClick={handleGoBack}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Physics
          </Button>
        </div>

        {gameContainer}
      </div>
    </AppLayout>
  );
}
