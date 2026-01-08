import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface DayState {
  day: number;
  saved: boolean;
  plantHealth: number;
  totalSavings: number;
}

export function SavingsGrower({ onComplete }: { onComplete: (score: number) => void }) {
  const [gameState, setGameState] = useState<DayState>({
    day: 1,
    saved: false,
    plantHealth: 100,
    totalSavings: 0,
  });

  const [message, setMessage] = useState<string>("");
  const [consecutiveDay, setConsecutiveDay] = useState(0);
  const daysNeeded = 15;

  const plantStage = Math.floor((gameState.plantHealth / 100) * 4);

  const plantEmojis = {
    0: "🥀",
    1: "🌱",
    2: "🌿",
    3: "🌾",
    4: "🌳",
  };

  const handleSaveToday = () => {
    const newHealth = Math.min(gameState.plantHealth + 15, 100);
    const newSavings = gameState.totalSavings + 100;

    setGameState({
      day: gameState.day + 1,
      saved: true,
      plantHealth: newHealth,
      totalSavings: newSavings,
    });

    setConsecutiveDay(consecutiveDay + 1);
    setMessage("💚 You saved today! Plant is happy!");
    setTimeout(() => setMessage(""), 2000);

    // Check win condition
    if (consecutiveDay + 1 >= daysNeeded) {
      setTimeout(() => {
        onComplete(100);
      }, 1000);
    }
  };

  const handleSkipToday = () => {
    const newHealth = Math.max(gameState.plantHealth - 10, 0);

    setGameState({
      day: gameState.day + 1,
      saved: false,
      plantHealth: newHealth,
      totalSavings: gameState.totalSavings,
    });

    setConsecutiveDay(0);
    setMessage("💔 Plant is wilting... Remember consistency!");
    setTimeout(() => setMessage(""), 2000);

    // Game over if plant dies
    if (newHealth <= 0) {
      setTimeout(() => {
        onComplete(30);
      }, 1500);
    }
  };

  const daysLeft = Math.max(0, daysNeeded - consecutiveDay);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 via-green-50 to-yellow-50 p-8 gap-6">
      {/* Title & Progress */}
      <div className="w-full max-w-4xl text-center">
        <h2 className="text-3xl font-bold text-green-700 mb-2">🌱 Savings Grower</h2>
        <p className="text-gray-600">Save a little every day to grow your plant!</p>
      </div>

      {/* Plant Display */}
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="text-9xl animate-bounce">
          {plantEmojis[Math.min(plantStage, 4) as keyof typeof plantEmojis]}
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 font-semibold">Plant Health</p>
          <div className="w-48 h-4 bg-gray-200 rounded-full overflow-hidden mt-1">
            <div
              className={`h-full transition-all ${
                gameState.plantHealth > 60
                  ? "bg-green-500"
                  : gameState.plantHealth > 30
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${gameState.plantHealth}%` }}
            />
          </div>
          <p className="text-lg font-bold text-green-700 mt-2">{gameState.plantHealth.toFixed(0)}%</p>
        </div>
      </div>

      {/* Progress Stats */}
      <div className="w-full max-w-4xl grid grid-cols-3 gap-3">
        <Card className="bg-blue-100 border-2 border-blue-400 p-4 text-center">
          <p className="text-sm text-blue-700 font-semibold">Current Day</p>
          <p className="text-3xl font-bold text-blue-700">{gameState.day}</p>
        </Card>

        <Card className="bg-green-100 border-2 border-green-400 p-4 text-center">
          <p className="text-sm text-green-700 font-semibold">Consecutive Days</p>
          <p className="text-3xl font-bold text-green-700">{consecutiveDay}</p>
        </Card>

        <Card className="bg-yellow-100 border-2 border-yellow-400 p-4 text-center">
          <p className="text-sm text-yellow-700 font-semibold">Total Savings</p>
          <p className="text-2xl font-bold text-yellow-700">₹{gameState.totalSavings}</p>
        </Card>
      </div>

      {/* Goal Progress */}
      <div className="w-full max-w-4xl bg-white rounded-lg border-2 border-green-400 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-gray-700">Goal: {daysNeeded} Consecutive Days</span>
          <span className="font-bold text-green-700">
            {consecutiveDay}/{daysNeeded}
          </span>
        </div>
        <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all"
            style={{ width: `${(consecutiveDay / daysNeeded) * 100}%` }}
          />
        </div>
        {daysLeft > 0 && (
          <p className="text-sm text-gray-600 mt-2">
            💡 Keep saving for {daysLeft} more days to win!
          </p>
        )}
      </div>

      {/* Day Info */}
      <Card className="w-full max-w-4xl bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-purple-400 p-4">
        <p className="font-heading font-bold text-lg text-purple-900 mb-2">Day {gameState.day} Decision</p>
        <p className="text-purple-800 text-sm mb-4">
          {consecutiveDay > 0
            ? `Great job! You've saved for ${consecutiveDay} day${consecutiveDay > 1 ? "s" : ""}. Will you save again today?`
            : "Start your savings journey! Save ₹100 today."}
        </p>

        {gameState.plantHealth <= 0 ? (
          <div className="bg-red-100 border-2 border-red-400 rounded-lg p-3 text-center">
            <p className="text-red-800 font-bold">💀 Plant has wilted...</p>
            <p className="text-sm text-red-700">Consistency matters! Try again.</p>
          </div>
        ) : null}
      </Card>

      {/* Feedback Message */}
      {message && (
        <div className="bg-white rounded-lg p-3 border-2 border-green-400 text-center font-semibold text-green-800">
          {message}
        </div>
      )}

      {/* Action Buttons */}
      {gameState.plantHealth > 0 && (
        <div className="w-full max-w-4xl flex gap-3">
          <Button
            onClick={handleSaveToday}
            className="flex-1 bg-green-600 hover:bg-green-700 text-lg py-6"
          >
            💚 Save ₹100 Today
          </Button>
          <Button
            onClick={handleSkipToday}
            variant="outline"
            className="flex-1 text-lg py-6"
          >
            ⏭️ Skip Today
          </Button>
        </div>
      )}

      {/* Game Complete */}
      {consecutiveDay >= daysNeeded && (
        <Card className="w-full max-w-4xl bg-green-100 border-2 border-green-400 p-6 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
          <h3 className="font-heading text-xl font-bold text-green-800">🎉 You Won!</h3>
          <p className="text-green-700 mt-2">
            Your plant grew to ₹{gameState.totalSavings} through consistent saving!
          </p>
        </Card>
      )}

      {gameState.plantHealth <= 0 && (
        <Card className="w-full max-w-4xl bg-red-100 border-2 border-red-400 p-6 text-center">
          <p className="text-red-800 font-bold text-lg">🌫️ Game Over</p>
          <p className="text-red-700 mt-2">Your plant couldn't survive. Try a new game!</p>
        </Card>
      )}
    </div>
  );
}
