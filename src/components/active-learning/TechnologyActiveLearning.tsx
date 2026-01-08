import React, { useState } from "react";

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

// Module 1: Input → Process → Output
function InputProcessOutput() {
  const [blocks, setBlocks] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const [success, setSuccess] = useState(false);

  const correctOrder = ["input", "process", "output"];

  const addBlock = (type: string) => {
    if (blocks.length < 3) {
      const newBlocks = [...blocks, type];
      setBlocks(newBlocks);
      checkOrder(newBlocks);
    }
  };

  const removeBlock = (index: number) => {
    const newBlocks = blocks.filter((_, i) => i !== index);
    setBlocks(newBlocks);
    setSuccess(false);
    setFeedback("");
  };

  const checkOrder = (arr: string[]) => {
    if (arr.length === 3) {
      if (JSON.stringify(arr) === JSON.stringify(correctOrder)) {
        setSuccess(true);
        setFeedback("✓ System works! 🎉");
      } else {
        setSuccess(false);
        setFeedback("❌ Wrong order! Try again.");
      }
    } else {
      setFeedback("");
    }
  };

  const blockIcons: Record<string, string> = {
    input: "📥",
    process: "⚙️",
    output: "📤",
  };

  const blockLabels: Record<string, string> = {
    input: "Input",
    process: "Process",
    output: "Output",
  };

  return (
    <ActiveLearningModule
      title="🧩 Input → Process → Output"
      goal="Arrange blocks in the correct order to make a working system"
    >
      <div className="space-y-4">
        {/* Available Blocks */}
        <div>
          <div className="text-xs font-semibold mb-2">Available Blocks:</div>
          <div className="flex gap-2 flex-wrap">
            {(["input", "process", "output"] as const).map((type) => (
              <button
                key={type}
                onClick={() => addBlock(type)}
                disabled={blocks.includes(type)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  blocks.includes(type)
                    ? "opacity-50 cursor-not-allowed bg-slate-500/20 text-slate-600"
                    : "bg-primary/20 text-primary hover:bg-primary/30"
                }`}
              >
                {blockIcons[type]} {blockLabels[type]}
              </button>
            ))}
          </div>
        </div>

        {/* System Display */}
        <div className="glass-card p-4 rounded-lg border-2 border-dashed border-border/50 bg-card/50">
          {blocks.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm">
              Drag blocks here to build your system
            </div>
          ) : (
            <div className="flex items-center gap-2 justify-center flex-wrap">
              {blocks.map((block, index) => (
                <div key={index} className="flex items-center gap-2">
                  <button
                    onClick={() => removeBlock(index)}
                    className="px-3 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors text-sm font-semibold"
                  >
                    {blockIcons[block]} {blockLabels[block]}
                  </button>
                  {index < blocks.length - 1 && (
                    <div className="text-primary font-bold">→</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feedback */}
        {feedback && (
          <div
            className={`p-3 rounded-lg text-center font-semibold text-sm ${
              success
                ? "bg-green-500/20 text-green-600"
                : "bg-red-500/20 text-red-600"
            }`}
          >
            {feedback}
          </div>
        )}

        <div className="text-xs text-center text-muted-foreground glass-card bg-card/50 p-2 rounded border border-border/30">
          Systems follow Input → Process → Output order
        </div>
      </div>
    </ActiveLearningModule>
  );
}

// Module 2: Inside an App
function InsideAnApp() {
  const [clicked, setClicked] = useState<string | null>(null);

  const flows = {
    button: {
      title: "Button Click",
      emoji: "🔘",
      steps: [
        "👤 You tap the button",
        "⚙️ App receives your action",
        "🧠 Logic decides what to do",
        "📱 Screen updates with new info",
      ],
    },
    text: {
      title: "Type Text",
      emoji: "⌨️",
      steps: [
        "👤 You type a letter",
        "⚙️ App records each keystroke",
        "🧠 Checks spelling and grammar",
        "📱 Text appears on screen",
      ],
    },
    swipe: {
      title: "Swipe Screen",
      emoji: "👆",
      steps: [
        "👤 Your finger moves",
        "⚙️ App tracks movement",
        "🧠 Decides scroll direction",
        "📱 Screen scrolls smoothly",
      ],
    },
  };

  return (
    <ActiveLearningModule
      title="🖥️ Inside an App"
      goal="Tap UI elements to see data flow behind the scenes"
    >
      <div className="space-y-4">
        {/* Interactive Elements */}
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(flows).map(([key, flow]) => (
            <button
              key={key}
              onClick={() => setClicked(clicked === key ? null : key)}
              className={`p-4 rounded-lg transition-all ${
                clicked === key
                  ? "bg-primary text-primary-foreground"
                  : "glass-card bg-card/50 border border-primary/30 hover:border-primary/60"
              }`}
            >
              <div className="text-3xl mb-2">{flow.emoji}</div>
              <div className="text-xs font-semibold text-center">{flow.title}</div>
            </button>
          ))}
        </div>

        {/* Data Flow Display */}
        {clicked && (
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg">
            <h5 className="font-semibold mb-3 text-sm">Data Flow:</h5>
            <div className="space-y-2">
              {flows[clicked as keyof typeof flows].steps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2 glass-card bg-card/50 rounded-lg border border-border/30"
                >
                  <div className="text-sm font-bold text-primary min-w-6">{idx + 1}</div>
                  <div className="text-sm text-foreground">{step}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-center text-muted-foreground glass-card bg-card/50 p-2 rounded border border-border/30">
          Tap an action to see what happens inside the app
        </div>
      </div>
    </ActiveLearningModule>
  );
}

// Module 3: Technology Around Us
function TechnologyAroundUs() {
  const devices = [
    {
      name: "Electric Fan",
      emoji: "🌀",
      input: "Electricity",
      process: "Motor spins blades",
      output: "Air flow",
    },
    {
      name: "ATM Machine",
      emoji: "🏧",
      input: "Your card & PIN",
      process: "Checks account",
      output: "Money out",
    },
    {
      name: "Smartphone",
      emoji: "📱",
      input: "Touches & voice",
      process: "Processes commands",
      output: "Display & sound",
    },
    {
      name: "Microwave",
      emoji: "🌊",
      input: "Heat setting",
      process: "Emits radiation",
      output: "Hot food",
    },
  ];

  const [selected, setSelected] = useState<number | null>(0);

  return (
    <ActiveLearningModule
      title="🔌 Technology Around Us"
      goal="Select a device and identify its input, process, and output"
    >
      <div className="space-y-4">
        {/* Device Selection */}
        <div className="grid grid-cols-2 gap-2">
          {devices.map((device, idx) => (
            <button
              key={idx}
              onClick={() => setSelected(selected === idx ? null : idx)}
              className={`p-3 rounded-lg transition-all ${
                selected === idx
                  ? "bg-primary text-primary-foreground"
                  : "glass-card bg-card/50 border border-primary/30 hover:border-primary/60"
              }`}
            >
              <div className="text-3xl mb-2">{device.emoji}</div>
              <div className="text-xs font-semibold">{device.name}</div>
            </button>
          ))}
        </div>

        {/* Device Details */}
        {selected !== null && (
          <div className="space-y-3">
            <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/50">
              <div className="text-xs font-semibold text-blue-600 mb-1">📥 Input</div>
              <div className="text-sm text-foreground">{devices[selected].input}</div>
            </div>

            <div className="bg-purple-500/20 p-3 rounded-lg border border-purple-500/50">
              <div className="text-xs font-semibold text-purple-600 mb-1">⚙️ Process</div>
              <div className="text-sm text-foreground">{devices[selected].process}</div>
            </div>

            <div className="bg-green-500/20 p-3 rounded-lg border border-green-500/50">
              <div className="text-xs font-semibold text-green-600 mb-1">📤 Output</div>
              <div className="text-sm text-foreground">{devices[selected].output}</div>
            </div>
          </div>
        )}

        <div className="text-xs text-center text-muted-foreground glass-card bg-card/50 p-2 rounded border border-border/30">
          All technology has Input → Process → Output!
        </div>
      </div>
    </ActiveLearningModule>
  );
}

export function TechnologyActiveLearning() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 font-heading font-semibold">Active Learning</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Learn technology by building, exploring, and discovering systems!
        </p>
      </div>
      <InputProcessOutput />
      <InsideAnApp />
      <TechnologyAroundUs />
    </div>
  );
}
