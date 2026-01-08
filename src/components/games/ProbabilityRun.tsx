import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Path {
  name: string;
  riskLevel: "low" | "medium" | "high";
  successRate: number;
  distance: number;
  emoji: string;
}

export function ProbabilityRun({ onClose }: { onClose: () => void }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [totalWins, setTotalWins] = useState(0);
  const [totalRuns, setTotalRuns] = useState(0);
  const [selectedPath, setSelectedPath] = useState<number | null>(null);
  const [result, setResult] = useState<"none" | "success" | "failure">("none");
  const [pathsAnalysis, setPathsAnalysis] = useState<{ [key: number]: { wins: number; runs: number } }>({
    0: { wins: 0, runs: 0 },
    1: { wins: 0, runs: 0 },
    2: { wins: 0, runs: 0 },
  });

  const paths: Path[] = [
    { name: "Safe Road", riskLevel: "low", successRate: 0.85, distance: 8, emoji: "🛣️" },
    { name: "Forest Trail", riskLevel: "medium", successRate: 0.6, distance: 5, emoji: "🌲" },
    { name: "Mountain Peak", riskLevel: "high", successRate: 0.35, distance: 3, emoji: "⛰️" },
  ];

  const handleChoosePath = (index: number) => {
    if (result !== "none") return;

    setSelectedPath(index);
    const path = paths[index];
    const success = Math.random() < path.successRate;

    setResult(success ? "success" : "failure");

    if (success) {
      setScore(score + (100 - path.distance * 5));
      setTotalWins(totalWins + 1);
    }

    setTotalRuns(totalRuns + 1);
    setPathsAnalysis({
      ...pathsAnalysis,
      [index]: {
        wins: pathsAnalysis[index].wins + (success ? 1 : 0),
        runs: pathsAnalysis[index].runs + 1,
      },
    });
  };

  const nextRound = () => {
    if (round < 5) {
      setRound(round + 1);
      setSelectedPath(null);
      setResult("none");
    } else {
      setGameStarted(false);
    }
  };

  if (!gameStarted) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Probability Run 🏃</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-semibold">📘 What You Will Discover</h3>
              <p className="text-sm text-muted-foreground">
                How chance affects outcomes and how patterns emerge over time.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🎯 What You Need To Do</h3>
              <p className="text-sm text-muted-foreground">
                Choose wisely between safe and risky paths to reach the finish.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🏆 What Success Looks Like</h3>
              <p className="text-sm text-muted-foreground">
                Win more often by choosing the path with the best probability.
              </p>
            </div>
            <Button onClick={() => setGameStarted(true)} className="w-full">
              Start Game
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Probability Run 🏃 - Round {round}/5</DialogTitle>
          <div className="flex gap-4 mt-4">
            <div>Score: <span className="font-bold text-primary">{score}</span></div>
            <div>Wins: <span className="font-bold">{totalWins}/{totalRuns}</span></div>
            {totalRuns > 0 && (
              <div>Win Rate: <span className="font-bold">{Math.round((totalWins / totalRuns) * 100)}%</span></div>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Challenge Text */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-lg p-4 text-center">
            <p className="text-sm font-semibold">Choose your path to reach the finish! 🏁</p>
          </div>

          {/* Path Options */}
          <div className="space-y-3">
            {paths.map((path, idx) => {
              const pathStats = pathsAnalysis[idx];
              const winRate = pathStats.runs > 0 ? Math.round((pathStats.wins / pathStats.runs) * 100) : "?";

              return (
                <button
                  key={idx}
                  onClick={() => handleChoosePath(idx)}
                  disabled={result !== "none"}
                  className={`w-full p-4 rounded-lg border-2 transition ${
                    selectedPath === idx
                      ? "border-primary bg-primary/10"
                      : "border-slate-200 dark:border-slate-700 hover:border-primary/50"
                  } ${result !== "none" ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Emoji */}
                    <div className="text-5xl">{path.emoji}</div>

                    {/* Info */}
                    <div className="flex-1 text-left">
                      <p className="font-bold text-lg">{path.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Distance: {path.distance} steps | Risk: {path.riskLevel}
                      </p>
                      <p className="text-xs mt-1">
                        Success Chance: <span className="font-bold">{Math.round(path.successRate * 100)}%</span>
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="text-right bg-white dark:bg-slate-800 rounded p-3 min-w-24">
                      <p className="text-xs text-muted-foreground">Your Record</p>
                      <p className="font-bold text-lg">
                        {pathStats.wins}/{pathStats.runs}
                      </p>
                      <p className="text-xs font-semibold">{winRate}%</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Result */}
          {result !== "none" && (
            <div className={`p-6 rounded-lg text-center ${
              result === "success"
                ? "bg-green-100 dark:bg-green-900"
                : "bg-red-100 dark:bg-red-900"
            }`}>
              {result === "success" ? (
                <div className="text-green-800 dark:text-green-200">
                  <p className="text-5xl mb-2">🎉</p>
                  <p className="font-bold text-xl">You made it to the finish!</p>
                  <p className="text-sm mt-2">
                    The {paths[selectedPath!].name} worked out this time!
                  </p>
                  {selectedPath === 0 && (
                    <p className="text-xs mt-2 italic">Safe roads work more often.</p>
                  )}
                </div>
              ) : (
                <div className="text-red-800 dark:text-red-200">
                  <p className="text-5xl mb-2">😞</p>
                  <p className="font-bold text-xl">You didn't make it this time!</p>
                  <p className="text-sm mt-2">
                    The {paths[selectedPath!].name} didn't work out this time.
                  </p>
                  <p className="text-xs mt-2 italic">
                    But luck evens out over many tries. Safer paths win more often overall.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Next Round */}
          {result !== "none" && (
            <Button
              onClick={nextRound}
              className="w-full"
              size="lg"
            >
              {round < 5 ? "Next Round" : "See Final Results"}
            </Button>
          )}

          {/* Path Analytics */}
          {totalRuns > 0 && (
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
              <p className="text-sm font-semibold mb-3">📊 Path Performance (All Rounds)</p>
              <div className="space-y-2">
                {paths.map((path, idx) => {
                  const stats = pathsAnalysis[idx];
                  const rate = stats.runs > 0 ? (stats.wins / stats.runs) * 100 : 0;
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-2xl">{path.emoji}</span>
                      <div className="flex-1">
                        <p className="text-xs font-semibold">{path.name}</p>
                        <div className="w-full h-2 bg-slate-300 dark:bg-slate-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all"
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-bold">{Math.round(rate)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Concept Strip */}
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">
            💡 "Chance matters over many tries."
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
