import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface BankAccount {
  balance: number;
  monthsPassed: number;
  interestEarned: number;
  depositsMade: number;
  withdrawalsMade: number;
  lastAction: string;
}

export function BankingBasicsSimulator({ onComplete }: { onComplete: (score: number) => void }) {
  const [account, setAccount] = useState<BankAccount>({
    balance: 0,
    monthsPassed: 0,
    interestEarned: 0,
    depositsMade: 0,
    withdrawalsMade: 0,
    lastAction: "",
  });

  const [depositAmount, setDepositAmount] = useState("500");
  const [message, setMessage] = useState<string>("");
  const [gamePhase, setGamePhase] = useState<"setup" | "playing" | "reviewing">("setup");
  const [initialDeposit, setInitialDeposit] = useState(false);

  const monthlyInterestRate = 0.05; // 5% annual = ~0.42% monthly
  const monthlyInterest = (account.balance * monthlyInterestRate) / 12;

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (amount <= 0) {
      setMessage("⚠️ Enter a valid amount!");
      return;
    }

    const newBalance = account.balance + amount;
    setAccount({
      ...account,
      balance: newBalance,
      depositsMade: account.depositsMade + 1,
      lastAction: `Deposited ₹${amount}`,
    });

    setMessage(`✅ Deposited ₹${amount}`);
    setTimeout(() => setMessage(""), 1500);

    if (!initialDeposit) {
      setInitialDeposit(true);
      setGamePhase("playing");
    }
  };

  const handleWithdraw = () => {
    const amount = parseFloat(depositAmount);
    if (amount <= 0) {
      setMessage("⚠️ Enter a valid amount!");
      return;
    }

    if (amount > account.balance) {
      setMessage("❌ Insufficient balance!");
      return;
    }

    const newBalance = account.balance - amount;
    setAccount({
      ...account,
      balance: newBalance,
      withdrawalsMade: account.withdrawalsMade + 1,
      lastAction: `Withdrew ₹${amount}`,
    });

    setMessage(`❌ Withdrew ₹${amount} (Interest stopped!)`);
    setTimeout(() => setMessage(""), 1500);
  };

  const handlePassMonth = () => {
    const newMonths = account.monthsPassed + 1;
    const interest = (account.balance * monthlyInterestRate) / 12;
    const newBalance = account.balance + interest;
    const newTotalInterest = account.interestEarned + interest;

    setAccount({
      balance: newBalance,
      monthsPassed: newMonths,
      interestEarned: newTotalInterest,
      depositsMade: account.depositsMade,
      withdrawalsMade: account.withdrawalsMade,
      lastAction: `⏰ Month ${newMonths}: Interest added ₹${interest.toFixed(2)}`,
    });

    setMessage(
      `💰 You earned ₹${interest.toFixed(2)} in interest!`
    );
    setTimeout(() => setMessage(""), 1500);

    if (newMonths >= 12) {
      setGamePhase("reviewing");
      setTimeout(() => {
        const score = calculateScore(newTotalInterest);
        onComplete(score);
      }, 2000);
    }
  };

  const calculateScore = (finalInterest: number): number => {
    // Score based on interest earned and deposits consistency
    const baseScore = Math.min(100, (finalInterest / 500) * 100);
    const depositBonus = Math.min(30, account.depositsMade * 5);
    const withdrawalPenalty = Math.min(30, account.withdrawalsMade * 10);

    return Math.max(30, baseScore + depositBonus - withdrawalPenalty);
  };

  const graphHeight = Math.min(200, (account.balance / 10000) * 200);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-50 p-8 gap-6 overflow-y-auto">
      {/* Title */}
      <div className="w-full max-w-4xl text-center">
        <h2 className="text-3xl font-bold text-blue-700 mb-2">🏦 Banking Basics Simulator</h2>
        <p className="text-gray-600">Deposit, wait, and watch your money grow!</p>
      </div>

      {/* Account Balance Display */}
      <Card className="w-full max-w-4xl bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-400 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-700 font-semibold">Account Balance</p>
            <p className="text-4xl font-bold text-blue-900">₹{account.balance.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-indigo-700 font-semibold">Interest Earned</p>
            <p className="text-3xl font-bold text-green-600">₹{account.interestEarned.toFixed(2)}</p>
          </div>
        </div>
      </Card>

      {/* Growth Graph */}
      {gamePhase !== "setup" && (
        <Card className="w-full max-w-4xl bg-white border-2 border-indigo-300 p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Money Growth Visualization</p>
          <div className="flex items-end justify-between h-32 gap-1">
            {[...Array(12)].map((_, i) => {
              const progress = (i + 1) / 12;
              const projectedHeight = (graphHeight * progress) / Math.max(1, account.monthsPassed || 1);
              return (
                <div
                  key={i}
                  className={`flex-1 ${
                    i < account.monthsPassed ? "bg-green-500" : "bg-gray-300"
                  } rounded-t transition-all`}
                  style={{ height: `${Math.min(projectedHeight, 128)}px` }}
                />
              );
            })}
          </div>
          <p className="text-xs text-gray-600 mt-2 text-center">Months: 0 - 12</p>
        </Card>
      )}

      {/* Month & Stats */}
      <div className="w-full max-w-4xl grid grid-cols-3 gap-3">
        <Card className="bg-blue-100 border-2 border-blue-400 p-3 text-center">
          <p className="text-xs text-blue-700 font-semibold">Time Elapsed</p>
          <p className="text-2xl font-bold text-blue-900">{account.monthsPassed}/12 Mo</p>
        </Card>

        <Card className="bg-green-100 border-2 border-green-400 p-3 text-center">
          <p className="text-xs text-green-700 font-semibold">Deposits</p>
          <p className="text-2xl font-bold text-green-900">{account.depositsMade}</p>
        </Card>

        <Card className="bg-red-100 border-2 border-red-400 p-3 text-center">
          <p className="text-xs text-red-700 font-semibold">Withdrawals</p>
          <p className="text-2xl font-bold text-red-900">{account.withdrawalsMade}</p>
        </Card>
      </div>

      {/* Last Action */}
      {account.lastAction && (
        <Card className="w-full max-w-4xl bg-yellow-100 border-2 border-yellow-400 p-3 text-center">
          <p className="font-semibold text-yellow-900">{account.lastAction}</p>
        </Card>
      )}

      {/* Message */}
      {message && (
        <div className="bg-white rounded-lg p-3 border-2 border-blue-400 text-center font-semibold text-blue-800">
          {message}
        </div>
      )}

      {/* Controls */}
      {gamePhase === "setup" && (
        <Card className="w-full max-w-4xl bg-blue-50 border-2 border-blue-300 p-4">
          <p className="font-semibold text-blue-900 mb-3">Start with your first deposit:</p>
          <div className="flex gap-2 mb-3">
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="flex-1 px-3 py-2 border-2 border-blue-300 rounded-lg"
              min="0"
            />
            <Button
              onClick={handleDeposit}
              className="bg-blue-600 hover:bg-blue-700 px-6"
            >
              Deposit
            </Button>
          </div>
          <p className="text-xs text-gray-600">💡 Higher deposits = more interest!</p>
        </Card>
      )}

      {gamePhase === "playing" && (
        <Card className="w-full max-w-4xl bg-white border-2 border-indigo-400 p-4 space-y-3">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Amount (₹)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg"
                min="0"
              />
              <Button
                onClick={handleDeposit}
                className="bg-green-600 hover:bg-green-700"
              >
                Deposit
              </Button>
              <Button
                onClick={handleWithdraw}
                variant="outline"
                className="border-2"
              >
                Withdraw
              </Button>
            </div>
          </div>

          <p className="text-xs text-gray-600 bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
            ⏰ Each month: Balance grows by {((monthlyInterestRate / 12) * 100).toFixed(2)}% in interest
          </p>

          <Button
            onClick={handlePassMonth}
            disabled={account.monthsPassed >= 12}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg py-6"
          >
            ➜ Next Month (⏰ {account.monthsPassed}/12)
          </Button>
        </Card>
      )}

      {/* Game Complete */}
      {gamePhase === "reviewing" && (
        <Card className="w-full max-w-4xl bg-green-100 border-2 border-green-400 p-6 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
          <h3 className="font-heading text-xl font-bold text-green-800">🎉 Year Complete!</h3>
          <p className="text-green-700 mt-2">
            Final Balance: ₹{account.balance.toFixed(2)}
          </p>
          <p className="text-green-600 text-sm mt-1">
            Interest earned: ₹{account.interestEarned.toFixed(2)}
          </p>
        </Card>
      )}
    </div>
  );
}
