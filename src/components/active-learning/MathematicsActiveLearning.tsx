import React, { useState } from "react";
import { ChevronRight } from "lucide-react";

interface ModuleProps {
  title: string;
  goal: string;
  children: React.ReactNode;
}

function ActiveLearningModule({ title, goal, children }: ModuleProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h4 className="font-heading font-semibold text-foreground mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground mb-4">{goal}</p>
      <div className="bg-primary/5 rounded-lg p-4 min-h-32">
        {children}
      </div>
    </div>
  );
}

// Module 1: Number Playground
function NumberPlayground() {
  const [position, setPosition] = useState(0);
  const [operation, setOperation] = useState<"add" | "subtract" | null>(null);
  const [jumps, setJumps] = useState<number[]>([]);

  const handleOperation = (op: "add" | "subtract", amount: number) => {
    const newPos = op === "add" ? position + amount : position - amount;
    setPosition(newPos);
    setJumps([...jumps, amount * (op === "add" ? 1 : -1)]);
  };

  const handleReset = () => {
    setPosition(0);
    setJumps([]);
  };

  return (
    <ActiveLearningModule
      title="📍 Number Playground"
      goal="Drag number blocks right to add, left to subtract"
    >
      <div className="space-y-4">
        {/* Number Line */}
        <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-lg">
          <div className="text-xs font-semibold text-muted-foreground">-10</div>
          <div className="flex-1 mx-2 relative h-1 bg-slate-300 rounded-full">
            <div
              className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-primary rounded-full shadow-md transition-all duration-300 flex items-center justify-center text-white text-xs font-bold"
              style={{ left: `calc(${(position + 10) * 5}% - 12px)` }}
            >
              ●
            </div>
          </div>
          <div className="text-xs font-semibold text-muted-foreground">+10</div>
        </div>

        {/* Position Display */}
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">{position}</div>
          <div className="text-xs text-muted-foreground">Current Position</div>
        </div>

        {/* Controls */}
        <div className="flex gap-2 flex-wrap justify-center">
          <button
            onClick={() => handleOperation("add", 1)}
            className="px-4 py-2 bg-green-500/20 text-green-600 rounded-lg font-semibold hover:bg-green-500/30 transition-colors"
          >
            +1
          </button>
          <button
            onClick={() => handleOperation("add", 5)}
            className="px-4 py-2 bg-green-500/20 text-green-600 rounded-lg font-semibold hover:bg-green-500/30 transition-colors"
          >
            +5
          </button>
          <button
            onClick={() => handleOperation("subtract", 1)}
            className="px-4 py-2 bg-red-500/20 text-red-600 rounded-lg font-semibold hover:bg-red-500/30 transition-colors"
          >
            -1
          </button>
          <button
            onClick={() => handleOperation("subtract", 5)}
            className="px-4 py-2 bg-red-500/20 text-red-600 rounded-lg font-semibold hover:bg-red-500/30 transition-colors"
          >
            -5
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-slate-500/20 text-slate-600 rounded-lg font-semibold hover:bg-slate-500/30 transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Jump History */}
        {jumps.length > 0 && (
          <div className="text-xs text-muted-foreground text-center">
            Jumps: {jumps.map((j) => (j > 0 ? `+${j}` : j)).join(" → ")}
          </div>
        )}
      </div>
    </ActiveLearningModule>
  );
}

// Module 2: Operation Builder
function OperationBuilder() {
  const [num1, setNum1] = useState(5);
  const [num2, setNum2] = useState(3);
  const [operation, setOperation] = useState<"add" | "subtract" | "multiply" | "divide">("add");

  const getResult = () => {
    switch (operation) {
      case "add":
        return num1 + num2;
      case "subtract":
        return num1 - num2;
      case "multiply":
        return num1 * num2;
      case "divide":
        return num2 !== 0 ? (num1 / num2).toFixed(1) : "undefined";
      default:
        return 0;
    }
  };

  const getOperationSymbol = () => {
    switch (operation) {
      case "add":
        return "+";
      case "subtract":
        return "-";
      case "multiply":
        return "×";
      case "divide":
        return "÷";
      default:
        return "";
    }
  };

  return (
    <ActiveLearningModule
      title="🧮 Operation Builder"
      goal="Choose an operation and adjust numbers to see results update"
    >
      <div className="space-y-4">
        {/* Equation Display */}
        <div className="flex items-center justify-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-primary">{num1}</div>
          <div className="text-2xl font-bold text-accent">{getOperationSymbol()}</div>
          <div className="text-2xl font-bold text-primary">{num2}</div>
          <div className="text-2xl font-bold text-muted-foreground">=</div>
          <div className="text-2xl font-bold text-secondary">{getResult()}</div>
        </div>

        {/* Number Sliders */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold block mb-2">
              First Number: {num1}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={num1}
              onChange={(e) => setNum1(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-2">
              Second Number: {num2}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={num2}
              onChange={(e) => setNum2(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Operation Buttons */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setOperation("add")}
            className={`py-2 rounded-lg font-semibold transition-colors ${
              operation === "add"
                ? "bg-primary text-primary-foreground"
                : "bg-slate-500/20 text-slate-600 hover:bg-slate-500/30"
            }`}
          >
            +
          </button>
          <button
            onClick={() => setOperation("subtract")}
            className={`py-2 rounded-lg font-semibold transition-colors ${
              operation === "subtract"
                ? "bg-primary text-primary-foreground"
                : "bg-slate-500/20 text-slate-600 hover:bg-slate-500/30"
            }`}
          >
            −
          </button>
          <button
            onClick={() => setOperation("multiply")}
            className={`py-2 rounded-lg font-semibold transition-colors ${
              operation === "multiply"
                ? "bg-primary text-primary-foreground"
                : "bg-slate-500/20 text-slate-600 hover:bg-slate-500/30"
            }`}
          >
            ×
          </button>
          <button
            onClick={() => setOperation("divide")}
            className={`py-2 rounded-lg font-semibold transition-colors ${
              operation === "divide"
                ? "bg-primary text-primary-foreground"
                : "bg-slate-500/20 text-slate-600 hover:bg-slate-500/30"
            }`}
          >
            ÷
          </button>
        </div>
      </div>
    </ActiveLearningModule>
  );
}

// Module 3: Real-Life Math Board
function RealLifeMathBoard() {
  const [scenario, setScenario] = useState<"shopping" | "distance" | "time">("shopping");
  const [values, setValues] = useState({ shopping: 50, distance: 10, time: 2 });

  const scenarios: Record<"shopping" | "distance" | "time", { label: string; unit: string; min: number; max: number; question: string }> = {
    shopping: {
      label: "Shopping Budget",
      unit: "₹",
      min: 10,
      max: 500,
      question: "You have ₹{value}. How many items at ₹50 can you buy?",
    },
    distance: {
      label: "Walking Distance",
      unit: "km",
      min: 1,
      max: 20,
      question: "You need to walk {value}km. At 5km/h, it takes {result} hours.",
    },
    time: {
      label: "Study Time",
      unit: "hours",
      min: 1,
      max: 8,
      question: "If you study {value} hours daily for 5 days, that's {result} total hours.",
    },
  };

  const getResult = () => {
    if (scenario === "shopping") {
      return Math.floor(values.shopping / 50);
    } else if (scenario === "distance") {
      return (values.distance / 5).toFixed(1);
    } else {
      return values.time * 5;
    }
  };

  const config = scenarios[scenario];

  return (
    <ActiveLearningModule
      title="📊 Real-Life Math Board"
      goal="Adjust values and see math used in real situations"
    >
      <div className="space-y-4">
        {/* Scenario Selector */}
        <div className="flex gap-2 flex-wrap">
          {(["shopping", "distance", "time"] as const).map((scen) => (
            <button
              key={scen}
              onClick={() => setScenario(scen)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                scenario === scen
                  ? "bg-primary text-primary-foreground"
                  : "bg-slate-500/20 text-slate-600 hover:bg-slate-500/30"
              }`}
            >
              {scen === "shopping" && "🛍️ Shopping"}
              {scen === "distance" && "🚶 Walking"}
              {scen === "time" && "⏱️ Time"}
            </button>
          ))}
        </div>

        {/* Value Slider */}
        <div>
          <label className="text-xs font-semibold block mb-2">
            {config.label}: {values[scenario]} {config.unit}
          </label>
          <input
            type="range"
            min={config.min}
            max={config.max}
            value={values[scenario]}
            onChange={(e) =>
              setValues({
                ...values,
                [scenario]: Number(e.target.value),
              })
            }
            className="w-full"
          />
        </div>

        {/* Result Display */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
          <div className="text-sm text-muted-foreground mb-2">
            {config.question.replace("{value}", String(values[scenario])).replace("{result}", String(getResult()))}
          </div>
          <div className="text-xl font-bold text-secondary">
            Answer: {getResult()} {scenario === "shopping" ? "items" : scenario === "distance" ? "hours" : "hours total"}
          </div>
        </div>
      </div>
    </ActiveLearningModule>
  );
}

export function MathematicsActiveLearning() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 font-heading font-semibold">Active Learning</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Learn math by doing — drag, adjust, and see results instantly!
        </p>
      </div>
      <NumberPlayground />
      <OperationBuilder />
      <RealLifeMathBoard />
    </div>
  );
}
