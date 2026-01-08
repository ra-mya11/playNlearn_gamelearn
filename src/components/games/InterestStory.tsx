import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Building2, TrendingUp } from "lucide-react";

interface InterestStage {
  month: number;
  amount: number;
  coinCount: number;
  description: string;
}

export function InterestStory() {
  const [currentMonth, setCurrentMonth] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInsight, setShowInsight] = useState(false);

  const initialDeposit = 1000;
  const monthlyRate = 0.05 / 12; // 5% annual interest

  const stages: InterestStage[] = Array.from({ length: 13 }, (_, i) => {
    const amount = initialDeposit * Math.pow(1 + monthlyRate, i);
    return {
      month: i,
      amount: Math.round(amount * 100) / 100,
      coinCount: Math.round(amount / 100),
      description:
        i === 0
          ? "You deposit ₹1000 into your bank account"
          : `After ${i} month${i > 1 ? "s" : ""}, your money grows to ₹${Math.round(amount)}`,
    };
  });

  const playAnimation = () => {
    setCurrentMonth(0);
    setShowInsight(false);
    setIsPlaying(true);

    let currentStage = 0;
    const interval = setInterval(() => {
      currentStage++;
      if (currentStage <= stages.length - 1) {
        setCurrentMonth(currentStage);
      } else {
        clearInterval(interval);
        setIsPlaying(false);
        setShowInsight(true);
      }
    }, 400);
  };

  const totalGrowth = stages[currentMonth]?.amount - initialDeposit || 0;
  const stage = stages[currentMonth] || stages[0];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 via-accent/5 to-background p-6 gap-8">
      {/* Title */}
      <div className="w-full max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">🏦 How Banks Grow Your Money</h2>
        <p className="text-muted-foreground">
          Watch how interest makes your money multiply over time
        </p>
      </div>

      {/* Main Visualization */}
      <div className="w-full max-w-2xl space-y-6">
        {/* Bank Vault */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-40 h-40">
            {/* Vault Door */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/30 to-primary/10 border-4 border-primary/50 shadow-lg flex items-center justify-center">
              <Building2 className="w-20 h-20 text-primary opacity-30" />
            </div>

            {/* Coins Animation */}
            <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-2 p-4">
              {Array.from({ length: Math.min(stage.coinCount, 20) }).map((_, i) => (
                <div
                  key={i}
                  className="text-2xl animate-bounce"
                  style={{
                    animationDelay: `${i * 0.05}s`,
                  }}
                >
                  🪙
                </div>
              ))}
            </div>
          </div>

          {/* Time Indicator */}
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">
              {stage.month === 0 ? "Month 0" : `${stage.month} Month${stage.month > 1 ? "s" : ""}`}
            </div>
            <p className="text-muted-foreground text-sm">{stage.description}</p>
          </div>
        </div>

        {/* Balance Display */}
        <Card className="glass-card border border-primary/30 p-6 bg-primary/10">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Initial Deposit</p>
              <p className="text-2xl font-bold text-foreground">₹{initialDeposit}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Interest Earned</p>
              <p className="text-2xl font-bold text-secondary">+₹{Math.round(totalGrowth)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Current Balance</p>
              <p className="text-2xl font-bold text-accent flex items-center justify-center gap-1">
                <TrendingUp className="w-6 h-6" />
                ₹{stage.amount}
              </p>
            </div>
          </div>
        </Card>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Time Progress</span>
            <span className="text-primary font-semibold">{Math.round((currentMonth / 12) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-card rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
              style={{ width: `${(currentMonth / 12) * 100}%` }}
            />
          </div>
        </div>

        {/* Monthly Timeline */}
        <div className="bg-card/50 rounded-lg p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-3 font-semibold">12-Month Timeline</p>
          <div className="grid grid-cols-6 gap-2">
            {stages.map((s, index) => (
              <button
                key={s.month}
                onClick={() => {
                  setCurrentMonth(index);
                  setShowInsight(index === stages.length - 1);
                }}
                className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                  currentMonth >= index
                    ? "bg-primary text-primary-foreground border border-primary"
                    : "bg-muted text-muted-foreground border border-border hover:border-primary/50"
                }`}
              >
                M{s.month}
              </button>
            ))}
          </div>
        </div>

        {/* Insight Card */}
        {showInsight && (
          <Card className="glass-card border border-secondary/30 bg-secondary/10 p-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">
                  The Magic of Compound Growth
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  In just 12 months, your ₹1000 grew to ₹{Math.round(stages[12].amount)} through interest! The bank paid you ₹{Math.round(totalGrowth)} just for saving. Imagine if you left it for 10 years...
                </p>
                <p className="text-sm text-secondary font-semibold">
                  🎯 Key Learning: Money needs time to grow. Start saving early, and let time work for you!
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Action Button */}
      <Button
        onClick={playAnimation}
        disabled={isPlaying}
        size="lg"
        className="bg-gradient-to-r from-primary to-accent"
      >
        {isPlaying ? "Growing your money..." : "▶ Watch Your Money Grow"}
      </Button>
    </div>
  );
}
