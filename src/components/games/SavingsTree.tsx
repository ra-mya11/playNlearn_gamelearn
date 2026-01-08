import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface DayState {
  day: number;
  saved: boolean;
  totalSavings: number;
  consecutiveDays: number;
  treeHealth: number;
  leafCount: number;
}

const treeStages = ["🌱", "🌿", "🌾", "🌳", "🌲"];

export function SavingsTree({ onComplete }: { onComplete: (score: number) => void }) {
  const [gameState, setGameState] = useState<DayState>({
    day: 1,
    saved: false,
    totalSavings: 0,
    consecutiveDays: 0,
    treeHealth: 20,
    leafCount: 1,
  });

  const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const dailySavingAmount = 100;
  const requiredConsecutiveDays = 30;
  const treeStage = Math.min(Math.floor((gameState.treeHealth / 100) * 5), 4);

  const handleSaveToday = () => {
    const newConsecutive = gameState.consecutiveDays + 1;
    const newHealth = Math.min(gameState.treeHealth + 10, 100);
    const newLeaves = newConsecutive;

    setGameState({
      day: gameState.day + 1,
      saved: true,
      totalSavings: gameState.totalSavings + dailySavingAmount,
      consecutiveDays: newConsecutive,
      treeHealth: newHealth,
      leafCount: newLeaves,
    });

    setMessage(`✅ Day ${gameState.day}: You saved ₹${dailySavingAmount}! Streak: ${newConsecutive} days`);

    // Check win condition
    if (newConsecutive >= requiredConsecutiveDays) {
      setWon(true);
      setMessage(`🎉 Congratulations! You saved consistently for ${newConsecutive} days!`);
    }

    setTimeout(() => setMessage(""), 2000);
  };

  const handleSkipToday = () => {
    const newHealth = Math.max(gameState.treeHealth - 15, 0);

    setGameState({
      day: gameState.day + 1,
      saved: false,
      totalSavings: gameState.totalSavings,
      consecutiveDays: 0,
      treeHealth: newHealth,
      leafCount: 1,
    });

    setMessage(`💔 Day ${gameState.day}: You skipped saving. Your streak is broken! Leaves fall...`);

    // Check lose condition
    if (newHealth <= 0) {
      setGameOver(true);
      setMessage(`💀 Your tree died! You need consistency, not big amounts.`);
    }

    setTimeout(() => setMessage(""), 2000);
  };

  if (won) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background p-6 gap-6">
        <Card className="glass-card border border-secondary/30 bg-secondary/10 p-8 max-w-lg">
          <div className="flex flex-col items-center text-center">
            <div className="text-6xl mb-4">🌲</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">🎉 Fully Grown Tree!</h2>
            <p className="text-muted-foreground mb-4">
              You proved that consistency beats intensity! {requiredConsecutiveDays} days of ₹{dailySavingAmount} daily = ₹{gameState.totalSavings}
            </p>
            <div className="text-4xl font-bold text-secondary mb-4">₹{gameState.totalSavings}</div>
            <Button
              onClick={() => onComplete(100)}
              className="w-full bg-secondary"
              size="lg"
            >
              Finish & Celebrate
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background p-6 gap-6">
        <Card className="glass-card border border-destructive/30 bg-destructive/10 p-8 max-w-lg">
          <div className="flex flex-col items-center text-center">
            <div className="text-6xl mb-4">🥀</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Game Over</h2>
            <p className="text-muted-foreground mb-4">
              Your tree died because you missed too many days. Remember: small daily habits beat big one-time efforts!
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="w-full bg-primary"
              size="lg"
            >
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const progress = (gameState.consecutiveDays / requiredConsecutiveDays) * 100;
  const remainingDays = Math.max(0, requiredConsecutiveDays - gameState.consecutiveDays);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-50/50 via-green-50/50 to-yellow-50/50 p-6 gap-8">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">🌳 Savings Tree</h2>
        <p className="text-muted-foreground">Consistency grows trees, not size of deposits!</p>
      </div>

      {/* Big Tree Visualization */}
      <div className="flex flex-col items-center gap-4">
        <div className="text-9xl animate-bounce" key={treeStage}>
          {treeStages[treeStage]}
        </div>

        {/* Stats */}
        <Card className="glass-card border border-primary/30 p-4 w-full max-w-sm">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Tree Health</p>
              <p className="text-xl font-bold text-primary">{gameState.treeHealth}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Streak</p>
              <p className="text-xl font-bold text-secondary">{gameState.consecutiveDays} days</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Saved</p>
              <p className="text-xl font-bold text-accent">₹{gameState.totalSavings}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Progress to Goal */}
      <div className="w-full max-w-sm space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Progress to Goal</span>
          <span className="text-primary font-semibold">{gameState.consecutiveDays}/{requiredConsecutiveDays}</span>
        </div>
        <div className="w-full h-3 bg-card rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-secondary to-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-3 rounded-lg text-sm text-center ${
          message.includes("✅")
            ? "bg-secondary/20 border border-secondary/50 text-foreground"
            : "bg-destructive/20 border border-destructive/50 text-foreground"
        }`}>
          {message}
        </div>
      )}

      {/* Day Counter */}
      <div className="text-center p-4 bg-card/50 rounded-lg w-full max-w-sm border border-border">
        <p className="text-xs text-muted-foreground mb-1">Current Day</p>
        <p className="text-3xl font-bold text-foreground">{gameState.day}</p>
        {remainingDays > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Need {remainingDays} more consecutive days to win
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-sm grid grid-cols-2 gap-3">
        <Button
          onClick={handleSaveToday}
          size="lg"
          className="bg-gradient-to-r from-secondary to-green-500"
        >
          💚 Save Today
        </Button>
        <Button
          onClick={handleSkipToday}
          variant="outline"
          size="lg"
          className="border-destructive/50"
        >
          ⏭️ Skip
        </Button>
      </div>

      {/* Learning Point */}
      <Card className="glass-card border border-primary/30 bg-primary/10 p-4 w-full max-w-sm">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">The Rule of Consistency</p>
            <p className="text-xs text-muted-foreground">
              ₹100 every day for 30 days = ₹3,000. But ₹3,000 all at once and then stopping = ₹0 growth. Discipline beats intensity!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
