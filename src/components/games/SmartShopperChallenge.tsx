import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface ShopItem {
  id: string;
  name: string;
  price: number;
  emoji: string;
  type: "need" | "want";
}

interface Round {
  id: number;
  items: ShopItem[];
}

const rounds: Round[] = [
  {
    id: 1,
    items: [
      { id: "shoes", name: "School Shoes", price: 400, emoji: "👞", type: "need" },
      { id: "sneakers", name: "Fancy Sneakers", price: 800, emoji: "👟", type: "want" },
      { id: "pen", name: "Ballpoint Pen", price: 10, emoji: "🖊️", type: "need" },
      { id: "game", name: "Video Game", price: 2000, emoji: "🎮", type: "want" },
    ],
  },
  {
    id: 2,
    items: [
      { id: "notebook", name: "School Notebook", price: 30, emoji: "📓", type: "need" },
      { id: "fancy-notebook", name: "Designer Notebook", price: 150, emoji: "✨", type: "want" },
      { id: "lunch", name: "Lunch Box", price: 150, emoji: "🍱", type: "need" },
      { id: "candy", name: "Candy Pack", price: 100, emoji: "🍬", type: "want" },
    ],
  },
  {
    id: 3,
    items: [
      { id: "headset", name: "Audio Headset", price: 500, emoji: "🎧", type: "want" },
      { id: "water-bottle", name: "Water Bottle", price: 200, emoji: "💧", type: "need" },
      { id: "backpack", name: "School Backpack", price: 600, emoji: "🎒", type: "need" },
      { id: "bag-decor", name: "Bag Accessories", price: 300, emoji: "✨", type: "want" },
    ],
  },
];

interface GameState {
  budget: number;
  currentRound: number;
  selectedItems: string[];
  score: number;
  needsCount: number;
  wantsCount: number;
  gameStatus: "playing" | "won" | "lost";
}

export function SmartShopperChallenge({ onComplete }: { onComplete: (score: number) => void }) {
  const [gameState, setGameState] = useState<GameState>({
    budget: 2000,
    currentRound: 0,
    selectedItems: [],
    score: 0,
    needsCount: 0,
    wantsCount: 0,
    gameStatus: "playing",
  });

  const [feedback, setFeedback] = useState<string>("");
  const currentRound = rounds[gameState.currentRound];
  const currentItems = currentRound?.items || [];
  const totalSpending = currentItems
    .filter((item) => gameState.selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.price, 0);
  const remaining = gameState.budget - totalSpending;

  const handleSelectItem = (item: ShopItem) => {
    const newSelected = gameState.selectedItems.includes(item.id)
      ? gameState.selectedItems.filter((id) => id !== item.id)
      : [...gameState.selectedItems, item.id];

    const newSpending = currentItems
      .filter((i) => newSelected.includes(i.id))
      .reduce((sum, i) => sum + i.price, 0);

    if (newSpending <= gameState.budget) {
      setGameState({
        ...gameState,
        selectedItems: newSelected,
      });

      // Visual feedback
      const selectedItem = currentItems.find((i) => i.id === item.id)!;
      if (newSelected.includes(item.id)) {
        setFeedback(`✅ Added ${selectedItem.name}`);
      } else {
        setFeedback(`❌ Removed ${selectedItem.name}`);
      }
      setTimeout(() => setFeedback(""), 1500);
    } else {
      setFeedback("💰 Not enough budget!");
      setTimeout(() => setFeedback(""), 1500);
    }
  };

  const handleFinishRound = () => {
    if (gameState.selectedItems.length === 0) {
      setFeedback("⚠️ Select at least one item!");
      return;
    }

    const selectedItemDetails = currentItems.filter((item) =>
      gameState.selectedItems.includes(item.id)
    );

    const selectedNeeds = selectedItemDetails.filter((item) => item.type === "need").length;
    const selectedWants = selectedItemDetails.filter((item) => item.type === "want").length;

    // Score calculation: more needs, fewer wants = higher score
    let roundScore = 0;
    if (selectedNeeds > selectedWants) {
      roundScore = 100;
      setFeedback("🎉 Great choice! You picked more needs than wants!");
    } else if (selectedNeeds === selectedWants) {
      roundScore = 70;
      setFeedback("⭐ Good balance, but prioritize needs!");
    } else {
      roundScore = 40;
      setFeedback("⚠️ Too many wants! Focus on what you need!");
    }

    setTimeout(() => setFeedback(""), 2000);

    const newRoundNum = gameState.currentRound + 1;
    const newScore = gameState.score + roundScore;

    if (newRoundNum >= rounds.length) {
      // Game complete
      setTimeout(() => {
        setGameState({
          ...gameState,
          gameStatus: "won",
          score: newScore,
        });
        onComplete(newScore);
      }, 2000);
    } else {
      // Next round
      setGameState({
        ...gameState,
        currentRound: newRoundNum,
        selectedItems: [],
        score: newScore,
        needsCount: gameState.needsCount + selectedNeeds,
        wantsCount: gameState.wantsCount + selectedWants,
      });
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-yellow-50 to-orange-50 p-8 gap-6 overflow-y-auto">
      {/* Header */}
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600 font-semibold">Round {gameState.currentRound + 1}/3</p>
            <p className="text-2xl font-bold text-orange-700">🏪 Market Scene</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Budget</p>
            <p className="text-3xl font-bold text-green-600">₹{gameState.budget}</p>
          </div>
        </div>

        {/* Budget Bar */}
        <div className="w-full bg-gray-200 rounded-lg h-4 overflow-hidden">
          <div
            className={`h-full transition-all ${remaining >= 0 ? "bg-green-500" : "bg-red-500"}`}
            style={{ width: `${Math.max(0, (remaining / gameState.budget) * 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Spent: ₹{totalSpending}</span>
          <span>Remaining: ₹{remaining}</span>
        </div>
      </div>

      {/* Shopping Items Grid */}
      <div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-3">
        {currentItems.map((item) => {
          const isSelected = gameState.selectedItems.includes(item.id);
          const isNeed = item.type === "need";

          return (
            <button
              key={item.id}
              onClick={() => handleSelectItem(item)}
              className={`p-4 rounded-lg border-2 transition-all font-semibold text-center ${
                isSelected
                  ? isNeed
                    ? "bg-green-200 border-green-500"
                    : "bg-yellow-200 border-yellow-500"
                  : isNeed
                  ? "bg-green-100 border-green-300"
                  : "bg-yellow-100 border-yellow-300"
              }`}
            >
              <div className="text-4xl mb-2">{item.emoji}</div>
              <p className="text-xs font-bold mb-1">{item.name}</p>
              <p className="text-sm font-bold text-gray-700">₹{item.price}</p>
              <p className={`text-xs mt-1 font-semibold ${isNeed ? "text-green-700" : "text-orange-700"}`}>
                {isNeed ? "NEED" : "WANT"}
              </p>
              {isSelected && (
                <div className="mt-2">
                  <CheckCircle2 className="h-5 w-5 mx-auto text-green-600" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="bg-white rounded-lg p-3 border-2 border-orange-400 text-center font-semibold text-orange-800">
          {feedback}
        </div>
      )}

      {/* Shopping Stats */}
      <div className="w-full max-w-4xl grid grid-cols-2 gap-3">
        <Card className="bg-green-100 border-2 border-green-400 p-4 text-center">
          <p className="text-sm text-green-700 font-semibold">Needs Selected</p>
          <p className="text-3xl font-bold text-green-700">
            {gameState.selectedItems.filter((id) => currentItems.find((i) => i.id === id && i.type === "need")).length}
          </p>
        </Card>
        <Card className="bg-yellow-100 border-2 border-yellow-400 p-4 text-center">
          <p className="text-sm text-yellow-700 font-semibold">Wants Selected</p>
          <p className="text-3xl font-bold text-yellow-700">
            {gameState.selectedItems.filter((id) => currentItems.find((i) => i.id === id && i.type === "want")).length}
          </p>
        </Card>
      </div>

      {/* Button */}
      <Button
        onClick={handleFinishRound}
        className="w-full max-w-4xl bg-orange-600 hover:bg-orange-700 text-lg py-6"
      >
        ✓ Checkout (Round {gameState.currentRound + 1})
      </Button>

      {/* Game Complete */}
      {gameState.gameStatus === "won" && (
        <Card className="w-full max-w-4xl bg-green-100 border-2 border-green-400 p-6 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
          <h3 className="font-heading text-xl font-bold text-green-800">🎉 Shopping Complete!</h3>
          <p className="text-green-700 mt-2">You learned to balance needs and wants!</p>
        </Card>
      )}
    </div>
  );
}
