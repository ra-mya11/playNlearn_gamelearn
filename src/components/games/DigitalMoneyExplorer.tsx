import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface Scenario {
  id: string;
  situation: string;
  purchase: string;
  price: number;
  emoji: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  pros: string[];
  cons: string[];
}

interface ScenarioState {
  scenario: Scenario;
  paymentMethod: string | null;
  simulationStep: "choosing" | "processing" | "result";
  resultMessage: string;
  score: number;
}

const scenarios: Scenario[] = [
  {
    id: "1",
    situation: "You need to buy books at school",
    purchase: "📚 School Books",
    price: 500,
    emoji: "🏫",
  },
  {
    id: "2",
    situation: "You want to buy snacks from a street vendor",
    purchase: "🍿 Snacks",
    price: 50,
    emoji: "🚗",
  },
  {
    id: "3",
    situation: "You're buying groceries at a supermarket",
    purchase: "🛒 Groceries",
    price: 2000,
    emoji: "🏬",
  },
  {
    id: "4",
    situation: "You need to book a cab ride",
    purchase: "🚗 Cab Ride",
    price: 300,
    emoji: "🚕",
  },
];

const paymentMethods: PaymentMethod[] = [
  {
    id: "cash",
    name: "💵 Cash",
    icon: "💵",
    pros: ["Accepted everywhere", "No internet needed", "See money visually"],
    cons: ["Easy to lose", "Need to carry coins", "Takes time to count"],
  },
  {
    id: "card",
    name: "🏦 Debit Card",
    icon: "🏦",
    pros: ["Safe & secure", "Digital record", "Rewards points"],
    cons: ["Need internet", "Can overspend easily", "Risk of fraud"],
  },
  {
    id: "mobile",
    name: "📱 Mobile Payment",
    icon: "📱",
    pros: ["Fast & easy", "Instant confirmation", "Track spending"],
    cons: ["Network needed", "Battery dependent", "App issues"],
  },
];

interface GameState {
  currentScenarioIndex: number;
  totalScore: number;
  completedScenarios: number;
  gameStatus: "playing" | "won";
}

export function DigitalMoneyExplorer({ onComplete }: { onComplete: (score: number) => void }) {
  const [gameState, setGameState] = useState<GameState>({
    currentScenarioIndex: 0,
    totalScore: 0,
    completedScenarios: 0,
    gameStatus: "playing",
  });

  const [scenarioState, setScenarioState] = useState<ScenarioState>({
    scenario: scenarios[0],
    paymentMethod: null,
    simulationStep: "choosing",
    resultMessage: "",
    score: 0,
  });

  const currentScenario = scenarios[gameState.currentScenarioIndex];

  const handleSelectPayment = (methodId: string) => {
    const method = paymentMethods.find((m) => m.id === methodId)!;
    setScenarioState({
      ...scenarioState,
      paymentMethod: methodId,
      simulationStep: "processing",
      resultMessage: `Processing payment with ${method.name}...`,
    });

    // Simulate transaction
    setTimeout(() => {
      let message = "";
      let points = 0;

      if (methodId === "cash" && currentScenario.price <= 100) {
        message = "✅ Cash works great for small purchases!";
        points = 100;
      } else if (methodId === "card" && currentScenario.price > 500) {
        message = "✅ Card is best for large purchases!";
        points = 100;
      } else if (methodId === "mobile" && currentScenario.price >= 100 && currentScenario.price <= 1000) {
        message = "✅ Mobile payment is quick & convenient!";
        points = 100;
      } else {
        message = "⚠️ This method works, but try another for better experience!";
        points = 60;
      }

      setScenarioState({
        ...scenarioState,
        paymentMethod: methodId,
        simulationStep: "result",
        resultMessage: message,
        score: points,
      });
    }, 2000);
  };

  const handleNextScenario = () => {
    const newIndex = gameState.currentScenarioIndex + 1;
    const newScore = gameState.totalScore + scenarioState.score;
    const newCompleted = gameState.completedScenarios + 1;

    if (newIndex >= scenarios.length) {
      setGameState({
        ...gameState,
        gameStatus: "won",
        totalScore: newScore,
        completedScenarios: newCompleted,
      });
      setTimeout(() => onComplete(newScore), 1000);
    } else {
      setGameState({
        currentScenarioIndex: newIndex,
        totalScore: newScore,
        completedScenarios: newCompleted,
        gameStatus: "playing",
      });

      setScenarioState({
        scenario: scenarios[newIndex],
        paymentMethod: null,
        simulationStep: "choosing",
        resultMessage: "",
        score: 0,
      });
    }
  };

  const bestMethod = paymentMethods.find((m) => {
    if (currentScenario.price <= 100) return m.id === "cash";
    if (currentScenario.price > 500) return m.id === "card";
    return m.id === "mobile";
  });

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-blue-50 p-8 gap-6 overflow-y-auto">
      {/* Title & Progress */}
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600 font-semibold">
              Scenario {gameState.completedScenarios + 1}/{scenarios.length}
            </p>
            <p className="text-3xl font-bold text-green-700">💳 Digital Money Explorer</p>
          </div>
          <div className="text-right bg-blue-100 border-2 border-blue-400 rounded-lg p-3">
            <p className="text-sm text-blue-700 font-semibold">Score</p>
            <p className="text-2xl font-bold text-blue-900">{gameState.totalScore}</p>
          </div>
        </div>
      </div>

      {/* Scenario Card */}
      <Card className="w-full max-w-4xl bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 p-6">
        <div className="text-center">
          <p className="text-5xl mb-3">{currentScenario.emoji}</p>
          <p className="text-sm text-gray-700 font-semibold mb-2">SCENARIO</p>
          <p className="text-xl font-bold text-gray-900 mb-4">{currentScenario.situation}</p>
          <div className="bg-white rounded-lg p-3 inline-block">
            <p className="text-sm text-gray-600">You want to buy</p>
            <p className="text-2xl font-bold text-orange-700">{currentScenario.purchase}</p>
            <p className="text-lg text-gray-700 mt-1">₹{currentScenario.price}</p>
          </div>
        </div>
      </Card>

      {/* Payment Methods */}
      {scenarioState.simulationStep === "choosing" && (
        <div className="w-full max-w-4xl">
          <p className="text-sm font-semibold text-gray-700 mb-3">Choose a payment method:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => handleSelectPayment(method.id)}
                className="p-4 rounded-lg border-2 border-gray-300 hover:border-green-500 transition-all text-left hover:bg-green-50"
              >
                <p className="text-3xl mb-2">{method.icon}</p>
                <p className="font-bold text-gray-900 mb-3">{method.name}</p>

                <div className="text-xs space-y-1">
                  <div className="bg-green-50 rounded p-1">
                    <p className="font-bold text-green-700">Pros:</p>
                    {method.pros.slice(0, 2).map((pro, i) => (
                      <p key={i} className="text-green-600">
                        ✓ {pro}
                      </p>
                    ))}
                  </div>
                  <div className="bg-red-50 rounded p-1">
                    <p className="font-bold text-red-700">Cons:</p>
                    {method.cons.slice(0, 1).map((con, i) => (
                      <p key={i} className="text-red-600">
                        ✗ {con}
                      </p>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Processing */}
      {scenarioState.simulationStep === "processing" && (
        <Card className="w-full max-w-4xl bg-blue-100 border-2 border-blue-400 p-6 text-center">
          <p className="text-lg font-semibold text-blue-900 animate-pulse">
            {scenarioState.resultMessage}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-3 w-3 rounded-full bg-blue-600 animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Result */}
      {scenarioState.simulationStep === "result" && (
        <div className="w-full max-w-4xl space-y-4">
          <Card className="bg-white border-2 border-green-400 p-4 text-center">
            <p className="text-lg font-bold text-green-800">{scenarioState.resultMessage}</p>
            <p className="text-2xl font-bold text-green-600 mt-2">+{scenarioState.score} points</p>
          </Card>

          {/* Best Practice */}
          <Card className="bg-blue-50 border-2 border-blue-400 p-4">
            <p className="font-semibold text-blue-900 mb-2">💡 Best Practice for this scenario:</p>
            <p className="text-sm text-blue-800">
              {currentScenario.price <= 100
                ? "💵 Cash is best for small purchases - immediate, no fees"
                : currentScenario.price > 500
                ? "🏦 Card is best for large purchases - safe & tracked"
                : "📱 Mobile payment is fast & convenient for medium purchases"}
            </p>
          </Card>

          <Button
            onClick={handleNextScenario}
            className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
          >
            {gameState.completedScenarios + 1 === scenarios.length
              ? "🏁 Finish Game"
              : "Next Scenario →"}
          </Button>
        </div>
      )}

      {/* Game Complete */}
      {gameState.gameStatus === "won" && (
        <Card className="w-full max-w-4xl bg-green-100 border-2 border-green-400 p-6 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
          <h3 className="font-heading text-xl font-bold text-green-800">🎉 Payment Expert!</h3>
          <p className="text-green-700 mt-2">
            You learned to choose the right payment method for each situation!
          </p>
          <p className="text-green-600 text-sm mt-1">Final Score: {gameState.totalScore}</p>
        </Card>
      )}
    </div>
  );
}
