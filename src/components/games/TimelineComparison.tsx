import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Timeline {
  day: number;
  saveBalance: number;
  spendBalance: number;
}

export function TimelineComparison() {
  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const generateTimeline = () => {
    setShowComparison(false);
    setIsAnimating(true);
    const newTimelines: Timeline[] = [];

    for (let day = 0; day <= 30; day++) {
      newTimelines.push({
        day,
        saveBalance: day * 10, // Save ₹10 daily
        spendBalance: Math.max(0, 300 - day * 10), // Start with ₹300, spend ₹10 daily
      });
    }

    // Animate the progression
    let currentDay = 0;
    const interval = setInterval(() => {
      currentDay++;
      setTimelines(newTimelines.slice(0, currentDay));
      if (currentDay > 30) {
        clearInterval(interval);
        setIsAnimating(false);
        setShowComparison(true);
      }
    }, 50);
  };

  const maxBalance = 300;
  const finalSaveBalance = 30 * 10;
  const finalSpendBalance = 0;

  const getYPosition = (balance: number, index: number): number => {
    const heightPercent = (balance / maxBalance) * 100;
    return Math.max(5, Math.min(95, heightPercent));
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 via-accent/5 to-background p-6 gap-8">
      {/* Title */}
      <div className="w-full max-w-3xl text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">📊 Saving vs Spending Timeline</h2>
        <p className="text-muted-foreground">
          Watch how a small daily choice compounds over 30 days
        </p>
      </div>

      {/* Timeline Visualization */}
      <div className="w-full max-w-3xl">
        {timelines.length > 0 ? (
          <div className="space-y-6">
            {/* Chart Area */}
            <div className="bg-card/50 rounded-lg p-6 border border-border">
              <div className="flex items-end justify-between gap-1" style={{ height: "300px" }}>
                {timelines.map((point, index) => (
                  <div
                    key={point.day}
                    className="flex-1 flex flex-col items-center gap-1"
                    style={{ minWidth: "12px" }}
                  >
                    {/* Save Bar (Green) */}
                    <div
                      className="w-full bg-gradient-to-t from-secondary to-secondary/70 rounded-t transition-all duration-300 hover:opacity-100 opacity-90 relative group"
                      style={{
                        height: `${getYPosition(point.saveBalance, index)}%`,
                      }}
                    >
                      <div className="hidden group-hover:flex absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                        ₹{point.saveBalance}
                      </div>
                    </div>

                    {/* Spend Bar (Red) */}
                    <div
                      className="w-full bg-gradient-to-t from-destructive to-destructive/70 rounded-t transition-all duration-300 hover:opacity-100 opacity-90 relative group"
                      style={{
                        height: `${getYPosition(point.spendBalance, index)}%`,
                      }}
                    >
                      <div className="hidden group-hover:flex absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                        ₹{Math.round(point.spendBalance)}
                      </div>
                    </div>

                    {/* Day marker every 5 days */}
                    {point.day % 5 === 0 && (
                      <div className="text-xs text-muted-foreground mt-2">D{point.day}</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex gap-4 justify-center mt-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-secondary" />
                  <span className="text-muted-foreground">Saves ₹10 daily</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <span className="text-muted-foreground">Spends ₹10 daily</span>
                </div>
              </div>
            </div>

            {/* Comparison Results */}
            {showComparison && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4">
                {/* Saver */}
                <Card className="glass-card border border-secondary/30 bg-secondary/10 p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">💚</div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">The Saver</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        Started with: ₹0
                      </p>
                      <div className="text-2xl font-bold text-secondary flex items-center gap-2">
                        <TrendingUp className="w-6 h-6" />
                        ₹{finalSaveBalance}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        ✨ Created wealth through consistency!
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Spender */}
                <Card className="glass-card border border-destructive/30 bg-destructive/10 p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">💔</div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">The Spender</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        Started with: ₹300
                      </p>
                      <div className="text-2xl font-bold text-destructive flex items-center gap-2">
                        <TrendingDown className="w-6 h-6" />
                        ₹{finalSpendBalance}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        💨 Money gone, nothing to show for it
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Learning Insight */}
            {showComparison && (
              <Card className="glass-card border border-primary/30 bg-primary/10 p-4 animate-in fade-in">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💡</div>
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-2">
                      The Power of Small Daily Decisions
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Both started differently, but 30 days of ₹10 created a ₹300 difference! This is how wealth builds—not through big wins, but through small, consistent choices. Your decisions compound every single day.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-6 py-12">
            <div className="text-6xl">⏱️</div>
            <p className="text-muted-foreground text-center">
              Click the button to see 30 days of saving vs spending unfold
            </p>
          </div>
        )}
      </div>

      {/* Action Button */}
      <Button
        onClick={generateTimeline}
        disabled={isAnimating || showComparison}
        size="lg"
        className="bg-gradient-to-r from-primary to-accent"
      >
        {isAnimating ? "Simulating..." : showComparison ? "Run Again" : "▶ Run 30-Day Simulation"}
      </Button>
    </div>
  );
}
