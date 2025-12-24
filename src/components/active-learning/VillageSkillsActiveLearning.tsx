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

// Module 1: Water Usage Planner
function WaterUsagePlanner() {
  const [allocation, setAllocation] = useState({
    drinking: 20,
    cooking: 15,
    bathing: 25,
    farming: 40,
  });

  const total = Object.values(allocation).reduce((a, b) => a + b, 0);
  const available = 100;
  const remaining = available - total;

  const getStatus = () => {
    if (remaining < 0) return { text: "❌ Using too much!", color: "text-red-600", bg: "bg-red-500/20" };
    if (remaining > 20) return { text: "⚠️ Wasting water!", color: "text-orange-600", bg: "bg-orange-500/20" };
    return { text: "✓ Good balance!", color: "text-green-600", bg: "bg-green-500/20" };
  };

  const status = getStatus();

  const purposes = [
    { key: "drinking", label: "Drinking", icon: "🚰", min: 5, max: 30 },
    { key: "cooking", label: "Cooking", icon: "🍳", min: 10, max: 25 },
    { key: "bathing", label: "Bathing", icon: "🚿", min: 15, max: 35 },
    { key: "farming", label: "Farming", icon: "🌾", min: 20, max: 50 },
  ];

  const handleAllocationChange = (key: string, value: number) => {
    setAllocation({
      ...allocation,
      [key]: value,
    });
  };

  return (
    <ActiveLearningModule
      title="🚰 Water Usage Planner"
      goal="Allocate water wisely to avoid shortage or waste"
    >
      <div className="space-y-4">
        {/* Status */}
        <div className={`p-4 rounded-lg text-center ${status.bg}`}>
          <div className={`text-3xl font-bold ${status.color}`}>{remaining} L</div>
          <div className={`text-sm font-semibold ${status.color}`}>{status.text}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {total}/{available} L used
          </div>
        </div>

        {/* Water Distribution Sliders */}
        <div className="space-y-3">
          {purposes.map((purpose) => (
            <div key={purpose.key}>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-semibold">
                  {purpose.icon} {purpose.label}: {allocation[purpose.key as keyof typeof allocation]} L
                </label>
              </div>
              <input
                type="range"
                min={purpose.min}
                max={purpose.max}
                value={allocation[purpose.key as keyof typeof allocation]}
                onChange={(e) =>
                  handleAllocationChange(purpose.key, Number(e.target.value))
                }
                className="w-full"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {purpose.min}L - {purpose.max}L recommended
              </div>
            </div>
          ))}
        </div>

        {/* Water Visual */}
        <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-lg backdrop-blur-sm">
          <div className="h-6 bg-slate-700/50 rounded-full overflow-hidden border border-slate-600/30">
            <div
              className={`h-full transition-all duration-300 ${
                remaining < 0
                  ? "bg-red-500"
                  : remaining > 20
                    ? "bg-yellow-500"
                    : "bg-green-500"
              }`}
              style={{ width: `${Math.min(100, total)}%` }}
            />
          </div>
          <div className="text-xs text-center text-muted-foreground mt-2">
            {total}% of 100L used
          </div>
        </div>

        <div className="text-xs text-center text-muted-foreground bg-slate-800/50 border border-slate-700/50 p-2 rounded backdrop-blur-sm">
          Save water for farming — it feeds the village!
        </div>
      </div>
    </ActiveLearningModule>
  );
}

// Module 2: Farm Task Sequencer
function FarmTaskSequencer() {
  const allTasks = [
    { id: 1, name: "Prepare soil", emoji: "🌍" },
    { id: 2, name: "Plant seeds", emoji: "🌱" },
    { id: 3, name: "Water plants", emoji: "💧" },
    { id: 4, name: "Remove weeds", emoji: "🌿" },
    { id: 5, name: "Harvest crops", emoji: "🌾" },
  ];

  const correctOrder = [1, 2, 3, 4, 5];
  const [sequence, setSequence] = useState<number[]>([]);
  const [feedback, setFeedback] = useState("");
  const [success, setSuccess] = useState(false);

  const addTask = (id: number) => {
    if (sequence.length < 5 && !sequence.includes(id)) {
      const newSeq = [...sequence, id];
      setSequence(newSeq);
      checkSequence(newSeq);
    }
  };

  const removeTask = (index: number) => {
    const newSeq = sequence.filter((_, i) => i !== index);
    setSequence(newSeq);
    setFeedback("");
    setSuccess(false);
  };

  const checkSequence = (seq: number[]) => {
    if (seq.length === 5) {
      if (JSON.stringify(seq) === JSON.stringify(correctOrder)) {
        setSuccess(true);
        setFeedback("✓ Perfect timing! Crops will thrive! 🌾");
      } else {
        setSuccess(false);
        setFeedback("❌ Wrong order! Crops might fail.");
      }
    } else {
      setFeedback("");
    }
  };

  const getTaskEmoji = (id: number) => {
    return allTasks.find((t) => t.id === id)?.emoji;
  };

  const getTaskName = (id: number) => {
    return allTasks.find((t) => t.id === id)?.name;
  };

  return (
    <ActiveLearningModule
      title="🌾 Farm Task Sequencer"
      goal="Arrange farming tasks in the correct order for good harvest"
    >
      <div className="space-y-4">
        {/* Available Tasks */}
        <div>
          <div className="text-xs font-semibold mb-2">Available Tasks:</div>
          <div className="grid grid-cols-3 gap-2">
            {allTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => addTask(task.id)}
                disabled={sequence.includes(task.id)}
                className={`px-2 py-2 rounded-lg text-center transition-all ${
                  sequence.includes(task.id)
                    ? "opacity-50 cursor-not-allowed bg-slate-500/20"
                    : "bg-primary/20 text-primary hover:bg-primary/30"
                }`}
              >
                <div className="text-2xl mb-1">{task.emoji}</div>
                <div className="text-xs font-semibold line-clamp-2">{task.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Sequence Display */}
        <div className="bg-slate-800/50 border-2 border-dashed border-slate-600/50 p-4 rounded-lg backdrop-blur-sm">
          {sequence.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm">
              Click tasks to build your farming plan
            </div>
          ) : (
            <div className="flex items-center gap-2 justify-center flex-wrap">
              {sequence.map((id, index) => (
                <div key={index} className="flex items-center gap-2">
                  <button
                    onClick={() => removeTask(index)}
                    className="px-3 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors text-sm"
                  >
                    <div className="text-lg">{getTaskEmoji(id)}</div>
                    <div className="text-xs font-semibold">{getTaskName(id)}</div>
                  </button>
                  {index < sequence.length - 1 && (
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

        <div className="text-xs text-center text-muted-foreground bg-slate-800/50 border border-slate-700/50 p-2 rounded backdrop-blur-sm">
          Order and timing are critical for farming success
        </div>
      </div>
    </ActiveLearningModule>
  );
}

// Module 3: Household Fix-It
function HouseholdFixIt() {
  const problems = [
    {
      id: 1,
      problem: "Water leak in roof",
      fixes: [
        { text: "Patch with waterproof material", correct: true },
        { text: "Paint it blue", correct: false },
      ],
    },
    {
      id: 2,
      problem: "Power cut — no electricity",
      fixes: [
        { text: "Check circuit breaker, reset if tripped", correct: true },
        { text: "Dance around to restore power", correct: false },
      ],
    },
    {
      id: 3,
      problem: "Door hinge is broken",
      fixes: [
        { text: "Replace hinge with new one", correct: true },
        { text: "Use glue to hold door", correct: false },
      ],
    },
  ];

  const [solved, setSolved] = useState<Record<number, boolean | null>>({
    1: null,
    2: null,
    3: null,
  });

  const handleFix = (problemId: number, isCorrect: boolean) => {
    setSolved({ ...solved, [problemId]: isCorrect });
  };

  const correct = Object.values(solved).filter((v) => v === true).length;
  const allSolved = Object.values(solved).every((v) => v !== null);

  return (
    <ActiveLearningModule
      title="🏠 Household Fix-It"
      goal="Choose the right fix for common household problems"
    >
      <div className="space-y-4">
        {/* Problems */}
        {problems.map((problem) => (
          <div
            key={problem.id}
            className="p-3 rounded-lg border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm"
          >
            <div className="font-semibold text-sm mb-3">Problem {problem.id}: {problem.problem}</div>

            <div className="space-y-2">
              {problem.fixes.map((fix, idx) => (
                <button
                  key={idx}
                  onClick={() => handleFix(problem.id, fix.correct)}
                  className={`w-full p-3 rounded-lg transition-all text-left ${
                    solved[problem.id] === fix.correct
                      ? fix.correct
                        ? "bg-green-500/20 border border-green-500/50"
                        : "bg-red-500/20 border border-red-500/50"
                      : "bg-slate-500/20 border border-border hover:border-primary/50"
                  }`}
                >
                  <div className="text-sm font-semibold">{fix.text}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {solved[problem.id] === fix.correct &&
                      (fix.correct ? "✓ Correct!" : "❌ This makes it worse!")}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Results */}
        {allSolved && (
          <div
            className={`p-3 rounded-lg text-center ${
              correct === 3
                ? "bg-green-500/20 border border-green-500/50"
                : "bg-orange-500/20 border border-orange-500/50"
            }`}
          >
            <div className="text-2xl font-bold text-primary">{correct}/3</div>
            <div className="text-sm font-semibold text-foreground">
              {correct === 3
                ? "✓ Great fixer! You can help your family! 🎉"
                : "⚠️ Keep learning — you'll get better!"}
            </div>
          </div>
        )}

        <div className="text-xs text-center text-muted-foreground bg-slate-800/50 border border-slate-700/50 p-2 rounded backdrop-blur-sm">
          Practical skills solve real household problems
        </div>
      </div>
    </ActiveLearningModule>
  );
}

export function VillageSkillsActiveLearning() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 font-heading font-semibold">Active Learning</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Learn practical village and life skills through hands-on activities!
        </p>
      </div>
      <WaterUsagePlanner />
      <FarmTaskSequencer />
      <HouseholdFixIt />
    </div>
  );
}
