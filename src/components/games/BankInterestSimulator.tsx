import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { CheckCircle2 } from "lucide-react";

interface BankState {
  month: number;
  balance: number;
  deposits: { month: number; amount: number }[];
  gamePhase: "depositing" | "growing" | "results";
}

const monthlyRate = 0.05 / 12; // 5% annual interest

export function BankInterestSimulator({ onComplete }: { onComplete: (score: number) => void }) {
  const [gameState, setGameState] = useState<BankState>({
    month: 0,
    balance: 0,
    deposits: [],
    gamePhase: "depositing",
  });

  const [depositAmount, setDepositAmount] = useState(1000);
  const [selectedMonthToWithdraw, setSelectedMonthToWithdraw] = useState<number | null>(null);
  const [withdrawnAmount, setWithdrawnAmount] = useState(0);
  const [message, setMessage] = useState("");

  const calculateBalance = (month: number, deposits: BankState["deposits"]): number => {
    let balance = 0;
    deposits.forEach((deposit) => {
      const monthsInBank = Math.max(0, month - deposit.month);
      balance += deposit.amount * Math.pow(1 + monthlyRate, monthsInBank);
    });
    return Math.round(balance * 100) / 100;
  };

  const handleDeposit = () => {
    if (depositAmount <= 0) {
      setMessage("❌ Enter an amount greater than 0");
      setTimeout(() => setMessage(""), 1500);
      return;
    }

    setGameState({
      ...gameState,
      deposits: [...gameState.deposits, { month: gameState.month, amount: depositAmount }],
      balance: calculateBalance(gameState.month, [...gameState.deposits, { month: gameState.month, amount: depositAmount }]),
    });

    setMessage(`✅ Deposited ₹${depositAmount}`);
    setTimeout(() => setMessage(""), 1500);
    setDepositAmount(1000);
  };

  const handleStartGrowing = () => {
    if (gameState.deposits.length === 0) {
      setMessage("❌ Make at least one deposit first!");
      setTimeout(() => setMessage(""), 1500);
      return;
    }
    setGameState({ ...gameState, gamePhase: "growing", month: 0 });
  };

  const handleTimeSliderChange = (newMonth: number) => {
    setGameState({
      ...gameState,
      month: newMonth,
      balance: calculateBalance(newMonth, gameState.deposits),
    });
    setSelectedMonthToWithdraw(null);
  };

  const handleWithdraw = (month: number) => {
    const balance = calculateBalance(month, gameState.deposits);
    setWithdrawnAmount(balance);
    setSelectedMonthToWithdraw(month);
    setGameState({ ...gameState, gamePhase: "results" });
  };

  const totalDeposited = gameState.deposits.reduce((sum, d) => sum + d.amount, 0);
  const interestEarned = withdrawnAmount - totalDeposited;
  const score = Math.round((interestEarned / totalDeposited) * 100);

  if (gameState.gamePhase === "depositing") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background p-6 gap-6 overflow-auto">
        <div className="max-w-2xl w-full">
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">🏦 Bank Interest Simulator</h2>
            <p className="text-muted-foreground">Deposit money and watch interest grow it!</p>
          </div>

          {/* Vault Visual */}
          <div className="flex justify-center mb-8">
            <div className="relative w-32 h-32 rounded-2xl bg-gradient-to-br from-primary/40 to-primary/20 border-4 border-primary/50 flex items-center justify-center">
              <div className="text-6xl">🏦</div>
              {gameState.deposits.length > 0 && (
                <div className="absolute bottom-2 right-2 text-xl font-bold text-accent">+{gameState.deposits.length}</div>
              )}
            </div>
          </div>

          {/* Deposits List */}
          {gameState.deposits.length > 0 && (
            <Card className="glass-card border border-primary/30 p-4 mb-6">
              <p className="text-sm font-semibold text-foreground mb-3">Your Deposits:</p>
              <div className="space-y-2">
                {gameState.deposits.map((deposit, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-card rounded text-sm">
                    <span className="text-muted-foreground">Deposit {idx + 1}</span>
                    <span className="font-semibold text-accent">₹{deposit.amount}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                <span className="font-semibold text-foreground">Total Deposited</span>
                <span className="text-lg font-bold text-primary">₹{totalDeposited}</span>
              </div>
            </Card>
          )}

          {/* Deposit Form */}
          <Card className="glass-card border border-border p-6 space-y-4">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Deposit Amount</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(parseInt(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 bg-card border border-border rounded text-foreground"
                  placeholder="Enter amount"
                  min="0"
                />
                <Button onClick={handleDeposit} className="bg-secondary">
                  Deposit ₹{depositAmount}
                </Button>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {[500, 1000, 5000].map((amt) => (
                <Button
                  key={amt}
                  variant="outline"
                  onClick={() => setDepositAmount(amt)}
                  className="text-sm"
                >
                  ₹{amt}
                </Button>
              ))}
            </div>
          </Card>

          {/* Message */}
          {message && (
            <div className="mt-4 p-3 bg-primary/20 border border-primary/50 rounded text-sm text-foreground">
              {message}
            </div>
          )}

          {/* Start Button */}
          {gameState.deposits.length > 0 && (
            <Button
              onClick={handleStartGrowing}
              size="lg"
              className="w-full mt-6 bg-gradient-to-r from-primary to-accent"
            >
              Let's Watch It Grow! →
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (gameState.gamePhase === "growing") {
    const currentBalance = gameState.balance;

    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background p-6 gap-6 overflow-auto">
        <div className="max-w-2xl w-full">
          {/* Title */}
          <h2 className="text-2xl font-bold text-foreground text-center mb-6">⏱️ Watch Your Money Grow</h2>

          {/* Vault with Coins */}
          <div className="flex justify-center mb-8">
            <div className="relative w-40 h-40 rounded-2xl bg-gradient-to-br from-primary/40 to-primary/20 border-4 border-primary/50 flex items-center justify-center overflow-hidden">
              <div className="flex flex-wrap gap-1 justify-center items-center p-4">
                {Array.from({ length: Math.min(Math.floor(currentBalance / 100), 12) }).map((_, i) => (
                  <div key={i} className="text-2xl animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                    🪙
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Current Balance */}
          <Card className="glass-card border border-primary/30 p-4 mb-6 text-center">
            <p className="text-xs text-muted-foreground mb-1">Current Balance</p>
            <p className="text-4xl font-bold text-primary">₹{currentBalance}</p>
            <p className="text-xs text-secondary mt-2">+₹{Math.round(currentBalance - totalDeposited)} interest earned</p>
          </Card>

          {/* Time Slider */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Time Passed</span>
              <span className="font-semibold text-primary">{gameState.month} months</span>
            </div>
            <Slider
              value={[gameState.month]}
              onValueChange={(value) => handleTimeSliderChange(value[0])}
              max={24}
              step={1}
              className="w-full"
            />
            <div className="grid grid-cols-5 gap-2 text-xs text-muted-foreground">
              {[0, 6, 12, 18, 24].map((m) => (
                <div key={m} className="text-center">{m}m</div>
              ))}
            </div>
          </div>

          {/* Key Insights */}
          <Card className="glass-card border border-secondary/30 bg-secondary/10 p-4 mb-6">
            <p className="text-sm text-foreground mb-2">
              {gameState.month === 0
                ? "💡 Start at month 0. Slide to see your money grow!"
                : gameState.month < 6
                  ? "💡 Early months show slow growth, but don't withdraw yet!"
                  : gameState.month < 12
                    ? "💡 Interest starts to add up! More time = more growth."
                    : "💡 The longer you wait, the more you earn!"}
            </p>
          </Card>

          {/* Withdrawal Option */}
          <Button
            onClick={() => handleWithdraw(gameState.month)}
            size="lg"
            className="w-full bg-accent"
          >
            Withdraw ₹{Math.round(currentBalance)} Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background p-6 gap-6">
      <Card className="glass-card border border-secondary/30 bg-secondary/10 p-8 max-w-lg">
        <div className="flex flex-col items-center text-center">
          <CheckCircle2 className="w-12 h-12 text-secondary mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">🎉 Great Timing!</h2>

          <div className="space-y-3 mb-6">
            <div>
              <p className="text-xs text-muted-foreground">Total Deposited</p>
              <p className="text-2xl font-bold text-foreground">₹{totalDeposited}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Interest Earned</p>
              <p className="text-2xl font-bold text-secondary">+₹{Math.round(interestEarned)}</p>
            </div>
            <div className="border-t border-border pt-3">
              <p className="text-xs text-muted-foreground">Final Balance</p>
              <p className="text-3xl font-bold text-accent">₹{Math.round(withdrawnAmount)}</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            You waited {selectedMonthToWithdraw} months and earned {score}% extra through interest!
          </p>

          <Button onClick={() => onComplete(score)} className="w-full bg-secondary" size="lg">
            Finish
          </Button>
        </div>
      </Card>
    </div>
  );
}
