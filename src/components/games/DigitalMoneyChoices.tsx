import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Clock, Shield, Zap } from "lucide-react";

interface Scenario {
  id: string;
  name: string;
  amount: number;
  location: string;
  emoji: string;
  correctMethod: "cash" | "upi" | "card";
  explanation: string;
}

const scenarios: Scenario[] = [
  {
    id: "street-vendor",
    name: "Street Vendor (Juice Stand)",
    amount: 50,
    location: "Outside school",
    emoji: "🧃",
    correctMethod: "cash",
    explanation: "Small amount, quick purchase. Cash is fastest and no fees!",
  },
  {
    id: "supermarket",
    name: "Supermarket Shopping",
    amount: 2000,
    location: "City Mall",
    emoji: "🛒",
    correctMethod: "card",
    explanation: "Large amount, safe environment. Card is secure & leaves a record!",
  },
  {
    id: "online-game",
    name: "In-App Game Purchase",
    amount: 300,
    location: "Your Phone",
    emoji: "🎮",
    correctMethod: "upi",
    explanation: "Online purchase, moderate amount. UPI is instant & secure!",
  },
  {
    id: "bus-ticket",
    name: "Bus Ticket",
    amount: 20,
    location: "Bus Stop",
    emoji: "🚌",
    correctMethod: "cash",
    explanation: "Very small amount. Cash is the simplest way!",
  },
  {
    id: "cinema",
    name: "Movie Tickets & Snacks",
    amount: 800,
    location: "Cinema Hall",
    emoji: "🎬",
    correctMethod: "card",
    explanation: "Moderate amount, established venue. Card is safe and traceable!",
  },
];

interface PaymentMethod {
  id: "cash" | "upi" | "card";
  name: string;
  icon: string;
  speed: "instant" | "fast" | "slow";
  safety: "medium" | "high" | "low";
  fees: number;
  pros: string[];
  cons: string[];
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "cash",
    name: "Cash",
    icon: "💵",
    speed: "instant",
    safety: "medium",
    fees: 0,
    pros: ["No fees", "Instant", "Works everywhere"],
    cons: ["Loss risk", "No record", "Can't make change"],
  },
  {
    id: "upi",
    name: "UPI (Digital)",
    icon: "📱",
    speed: "fast",
    safety: "high",
    fees: 0,
    pros: ["Instant", "Secure", "Online-friendly"],
    cons: ["Need network", "Phone dependency", "Can't be used offline"],
  },
  {
    id: "card",
    name: "Debit Card",
    icon: "💳",
    speed: "fast",
    safety: "high",
    fees: 2,
    pros: ["Safe", "Recorded", "Large purchases"],
    cons: ["Slow sometimes", "Fees possible", "Cards can be lost"],
  },
];

export function DigitalMoneyChoices({ onComplete }: { onComplete: (score: number) => void }) {
  const [currentScene, setCurrentScene] = useState(0);
  const [selected, setSelected] = useState<"cash" | "upi" | "card" | null>(null);
  const [feedback, setFeedback] = useState<{ type: "correct" | "wrong"; message: string } | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const scenario = scenarios[currentScene];

  const handleSelectMethod = (method: "cash" | "upi" | "card") => {
    setSelected(method);

    if (method === scenario.correctMethod) {
      setFeedback({
        type: "correct",
        message: `✅ Perfect! ${scenario.explanation}`,
      });
      setScore(score + 20);
    } else {
      const correct = paymentMethods.find((m) => m.id === scenario.correctMethod);
      setFeedback({
        type: "wrong",
        message: `❌ Not ideal. Better choice: ${correct?.name}. ${scenario.explanation}`,
      });
    }
  };

  const handleNextScene = () => {
    if (currentScene === scenarios.length - 1) {
      setCompleted(true);
    } else {
      setCurrentScene(currentScene + 1);
      setSelected(null);
      setFeedback(null);
    }
  };

  if (completed) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background p-6 gap-6">
        <Card className="glass-card border border-secondary/30 bg-secondary/10 p-8 max-w-lg">
          <div className="flex flex-col items-center text-center">
            <CheckCircle2 className="w-12 h-12 text-secondary mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">🎉 Payment Expert!</h2>
            <p className="text-muted-foreground mb-4">
              You know when to use cash, UPI, and cards. Smart payment choices make you secure!
            </p>
            <div className="text-4xl font-bold text-primary mb-4">Score: {score}</div>
            <Button onClick={() => onComplete(score)} className="w-full bg-secondary" size="lg">
              Finish
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-primary/5 to-background p-6 gap-6 overflow-auto">
      <div className="max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">{scenario.emoji}</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{scenario.name}</h2>
          <p className="text-muted-foreground mb-1">Amount: ₹{scenario.amount}</p>
          <p className="text-sm text-muted-foreground">Location: {scenario.location}</p>
          <div className="mt-4 text-sm text-muted-foreground">
            Scenario {currentScene + 1} of {scenarios.length}
          </div>
        </div>

        {/* Progress */}
        <div className="w-full h-2 bg-card rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
            style={{ width: `${((currentScene + 1) / scenarios.length) * 100}%` }}
          />
        </div>

        {/* Payment Method Cards */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          {paymentMethods.map((method) => {
            const isSelected = selected === method.id;
            const isCorrect = method.id === scenario.correctMethod;
            const speedIcon = method.speed === "instant" ? "⚡" : method.speed === "fast" ? "🚀" : "🐢";
            const safetyIcon = method.safety === "high" ? "🛡️" : method.safety === "medium" ? "⚠️" : "🔓";

            return (
              <button
                key={method.id}
                onClick={() => !selected && handleSelectMethod(method.id)}
                disabled={!!selected}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? isCorrect
                      ? "border-secondary bg-secondary/10"
                      : "border-destructive bg-destructive/10"
                    : "border-border bg-card hover:border-primary/50 hover:scale-102"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-3xl">{method.icon}</div>
                    <h3 className="font-semibold text-foreground mt-1">{method.name}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground mb-1">Fee</div>
                    <div className="font-bold text-foreground">{method.fees}%</div>
                  </div>
                </div>

                {/* Speed & Safety */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  <div className="flex items-center gap-1">
                    {speedIcon}
                    <span className="text-muted-foreground capitalize">{method.speed}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {safetyIcon}
                    <span className="text-muted-foreground capitalize">{method.safety}</span>
                  </div>
                </div>

                {/* Pros & Cons */}
                <div className="text-xs space-y-1">
                  <div className="text-green-600">
                    {method.pros.map((pro, i) => (
                      <div key={i}>✓ {pro}</div>
                    ))}
                  </div>
                  <div className="text-orange-600">
                    {method.cons.map((con, i) => (
                      <div key={i}>✗ {con}</div>
                    ))}
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs font-semibold text-foreground">
                      {isCorrect ? "✅ Best choice!" : "❌ Not the best for this"}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {feedback && (
          <Card
            className={`p-4 mb-6 border-2 ${
              feedback.type === "correct"
                ? "border-secondary/50 bg-secondary/10"
                : "border-destructive/50 bg-destructive/10"
            }`}
          >
            <p className="text-sm text-foreground">{feedback.message}</p>
          </Card>
        )}

        {/* Next Button */}
        {selected && (
          <Button onClick={handleNextScene} size="lg" className="w-full bg-primary">
            {currentScene === scenarios.length - 1 ? "See Your Score →" : "Next Scenario →"}
          </Button>
        )}

        {/* Score */}
        <div className="text-center mt-6 p-3 bg-primary/20 rounded-lg">
          <p className="text-xs text-muted-foreground">Current Score</p>
          <p className="text-2xl font-bold text-primary">{score} points</p>
        </div>
      </div>
    </div>
  );
}
