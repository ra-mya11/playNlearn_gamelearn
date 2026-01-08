import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, AlertCircle, CheckCircle2, RotateCcw } from "lucide-react";

interface DailyExpense {
  id: string;
  name: string;
  amount: number;
  type: "mandatory" | "optional";
  icon: string;
}

interface GameState {
  currentDay: number;
  wallet: number;
  savings: number;
  expensesPaid: Record<string, boolean>;
  gameStatus: "playing" | "won" | "lost";
}

const dailyExpenses: Record<number, DailyExpense[]> = {
  1: [
    { id: "travel", name: "School Travel", amount: 50, type: "mandatory", icon: "🚌" },
    { id: "snack", name: "Snacks", amount: 30, type: "optional", icon: "🍪" },
  ],
  2: [
    { id: "travel", name: "School Travel", amount: 50, type: "mandatory", icon: "🚌" },
    { id: "toy", name: "Small Toy", amount: 40, type: "optional", icon: "🧸" },
  ],
  3: [
    { id: "travel", name: "School Travel", amount: 50, type: "mandatory", icon: "🚌" },
    { id: "book", name: "Comic Book", amount: 35, type: "optional", icon: "📚" },
  ],
};

export function PocketMoneyManager({ onComplete }: { onComplete: (score: number) => void }) {
  const [gameState, setGameState] = useState<GameState>({
    currentDay: 1,
    wallet: 500,
    savings: 0,
    expensesPaid: {},
    gameStatus: "playing",
  });

  const [draggedExpense, setDraggedExpense] = useState<DailyExpense | null>(null);
  const [message, setMessage] = useState<string>("");

  const todayExpenses = dailyExpenses[Math.min(gameState.currentDay, 3)] || dailyExpenses[3];
  const mandatoryExpenses = todayExpenses.filter((e) => e.type === "mandatory");
  const optionalExpenses = todayExpenses.filter((e) => e.type === "optional");

  const allMandatoryPaid = mandatoryExpenses.every(
    (e) => gameState.expensesPaid[`${gameState.currentDay}-${e.id}`]
  );

  const handlePayExpense = (expense: DailyExpense) => {
    if (gameState.wallet < expense.amount) {
      setMessage("❌ Not enough money!");
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    const newWallet = gameState.wallet - expense.amount;
    const newExpensesPaid = {
      ...gameState.expensesPaid,
      [`${gameState.currentDay}-${expense.id}`]: true,
    };

    // Check if all mandatory expenses are paid
    const allMandatory = mandatoryExpenses.every(
      (e) => newExpensesPaid[`${gameState.currentDay}-${e.id}`]
    );

    if (newWallet === 0 && !allMandatory) {
      setGameState({
        ...gameState,
        wallet: newWallet,
        expensesPaid: newExpensesPaid,
        gameStatus: "lost",
      });
      setMessage("💔 Wallet empty! You couldn't cover all needs.");
    } else {
      setMessage(`✅ Paid ${expense.amount} for ${expense.name}`);
      setTimeout(() => setMessage(""), 2000);

      setGameState({
        ...gameState,
        wallet: newWallet,
        expensesPaid: newExpensesPaid,
      });
    }
  };

  const handleAdvanceDay = () => {
    if (!allMandatoryPaid) {
      setMessage("⚠️ Pay mandatory expenses first!");
      return;
    }

    const newDay = gameState.currentDay + 1;
    
    if (newDay > 30) {
      // Game won
      const finalScore = gameState.wallet > 0 ? 100 : 50;
      setGameState({
        ...gameState,
        gameStatus: "won",
        currentDay: newDay,
      });
      setTimeout(() => onComplete(finalScore), 1000);
    } else {
      // Add remaining money to savings
      setGameState({
        ...gameState,
        currentDay: newDay,
        savings: gameState.savings + (gameState.wallet > 0 ? 100 : 0),
        expensesPaid: {},
      });
    }
  };

  const savingsJarFill = Math.min((gameState.currentDay / 30) * 100, 100);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-green-50 p-8 gap-6">
      {/* Wallet & Savings Display */}
      <div className="flex gap-8 w-full max-w-4xl">
        {/* Wallet */}
        <div className="flex-1 bg-white rounded-xl p-4 shadow-lg border-2 border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-6 w-6 text-blue-600" />
            <span className="font-heading font-semibold text-blue-900">Your Wallet</span>
          </div>
          <div className="text-4xl font-bold text-blue-600">₹{gameState.wallet}</div>
          <p className="text-sm text-blue-600 mt-1">Money to spend today</p>
        </div>

        {/* Savings Jar */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-24 h-32 bg-white rounded-b-2xl border-2 border-green-400 shadow-lg overflow-hidden">
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-400 to-green-300 transition-all duration-500"
              style={{ height: `${savingsJarFill}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl text-green-700 opacity-30">
              💚
            </div>
          </div>
          <div className="mt-2 text-center">
            <p className="text-sm font-semibold text-green-700">Savings Jar</p>
            <p className="text-xs text-green-600">{gameState.currentDay}/30 Days</p>
          </div>
        </div>
      </div>

      {/* Calendar Days */}
      <div className="w-full max-w-4xl">
        <p className="text-sm text-gray-600 mb-2">Progress through the month:</p>
        <div className="grid grid-cols-10 gap-1">
          {[...Array(30)].map((_, i) => (
            <div
              key={i + 1}
              className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold transition-all ${
                i + 1 === gameState.currentDay
                  ? "bg-blue-600 text-white scale-110"
                  : i + 1 < gameState.currentDay
                  ? "bg-green-400 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Daily Expenses */}
      <div className="w-full max-w-4xl">
        <div className="mb-2">
          <p className="text-sm font-semibold text-gray-700">
            Day {gameState.currentDay}: Choose how to spend your money
          </p>
        </div>

        {/* Mandatory Expenses */}
        <div className="mb-4">
          <p className="text-xs font-bold text-red-600 mb-2">🔴 MANDATORY (Must Pay)</p>
          <div className="grid grid-cols-2 gap-3">
            {mandatoryExpenses.map((expense) => (
              <button
                key={expense.id}
                onClick={() => handlePayExpense(expense)}
                disabled={gameState.expensesPaid[`${gameState.currentDay}-${expense.id}`]}
                className={`p-4 rounded-lg font-semibold transition-all cursor-pointer text-left ${
                  gameState.expensesPaid[`${gameState.currentDay}-${expense.id}`]
                    ? "bg-green-200 border-2 border-green-400"
                    : "bg-red-100 border-2 border-red-300 hover:bg-red-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{expense.icon}</span>
                  <div>
                    <p className="font-heading text-sm">{expense.name}</p>
                    <p className="text-xs text-gray-600">₹{expense.amount}</p>
                  </div>
                  {gameState.expensesPaid[`${gameState.currentDay}-${expense.id}`] && (
                    <CheckCircle2 className="h-5 w-5 text-green-600 ml-auto" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Optional Expenses */}
        <div>
          <p className="text-xs font-bold text-yellow-600 mb-2">⭐ OPTIONAL (Nice to Have)</p>
          <div className="grid grid-cols-2 gap-3">
            {optionalExpenses.map((expense) => (
              <button
                key={expense.id}
                onClick={() => handlePayExpense(expense)}
                disabled={gameState.expensesPaid[`${gameState.currentDay}-${expense.id}`]}
                className={`p-4 rounded-lg font-semibold transition-all cursor-pointer text-left ${
                  gameState.expensesPaid[`${gameState.currentDay}-${expense.id}`]
                    ? "bg-yellow-200 border-2 border-yellow-400"
                    : "bg-yellow-100 border-2 border-yellow-300 hover:bg-yellow-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{expense.icon}</span>
                  <div>
                    <p className="font-heading text-sm">{expense.name}</p>
                    <p className="text-xs text-gray-600">₹{expense.amount}</p>
                  </div>
                  {gameState.expensesPaid[`${gameState.currentDay}-${expense.id}`] && (
                    <CheckCircle2 className="h-5 w-5 text-yellow-600 ml-auto" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className="bg-white rounded-lg p-3 border-2 border-blue-400 text-center font-semibold text-blue-800">
          {message}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 w-full max-w-4xl">
        {gameState.gameStatus === "playing" && (
          <Button
            onClick={handleAdvanceDay}
            disabled={!allMandatoryPaid}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-lg py-6"
          >
            ➜ Next Day
          </Button>
        )}
      </div>

      {/* Game Over */}
      {gameState.gameStatus === "lost" && (
        <Card className="w-full max-w-4xl bg-red-100 border-2 border-red-400 p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-2" />
          <h3 className="font-heading text-xl font-bold text-red-800">Game Over!</h3>
          <p className="text-red-700 mt-2">Your wallet ran out. Remember: necessities come first!</p>
        </Card>
      )}

      {gameState.gameStatus === "won" && (
        <Card className="w-full max-w-4xl bg-green-100 border-2 border-green-400 p-6 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
          <h3 className="font-heading text-xl font-bold text-green-800">🎉 You Won!</h3>
          <p className="text-green-700 mt-2">
            You finished the month with ₹{gameState.wallet} in your wallet!
          </p>
        </Card>
      )}
    </div>
  );
}
