import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Wallet, Heart, Zap, PiggyBank } from "lucide-react";

interface MoneyFlow {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  explanation: string;
  isActive: boolean;
}

export function MoneyFlowVisualizer() {
  const [activeFlow, setActiveFlow] = useState<string | null>(null);

  const flows: MoneyFlow[] = [
    {
      id: "income",
      label: "Income",
      icon: Wallet,
      color: "text-green-500",
      bgColor: "bg-green-500/20",
      explanation: "Money coming in from work, allowance, or gifts",
      isActive: false,
    },
    {
      id: "needs",
      label: "Needs",
      icon: Heart,
      color: "text-red-500",
      bgColor: "bg-red-500/20",
      explanation: "Essential expenses: food, shelter, education",
      isActive: false,
    },
    {
      id: "wants",
      label: "Wants",
      icon: Zap,
      color: "text-orange-500",
      bgColor: "bg-orange-500/20",
      explanation: "Nice-to-have items: games, treats, entertainment",
      isActive: false,
    },
    {
      id: "savings",
      label: "Savings",
      icon: PiggyBank,
      color: "text-primary",
      bgColor: "bg-primary/20",
      explanation: "Money saved for future goals and emergencies",
      isActive: false,
    },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 via-accent/5 to-background p-6 gap-8">
      {/* Title */}
      <div className="w-full max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">💰 Money Flow Explorer</h2>
        <p className="text-muted-foreground">
          Money always flows somewhere — tap each flow to learn where your money goes
        </p>
      </div>

      {/* Center Wallet Illustration */}
      <div className="relative w-32 h-32 mx-auto mb-4">
        <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
          <Wallet className="w-16 h-16 text-primary-foreground" />
        </div>

        {/* Animated coins */}
        <div className="absolute top-0 left-0 w-6 h-6 rounded-full bg-yellow-400 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-yellow-300 animate-bounce" />
      </div>

      {/* Money Flow Buttons */}
      <div className="w-full max-w-2xl grid grid-cols-2 gap-4">
        {flows.map((flow) => {
          const Icon = flow.icon;
          const isActive = activeFlow === flow.id;

          return (
            <button
              key={flow.id}
              onClick={() => setActiveFlow(isActive ? null : flow.id)}
              className={`relative p-4 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                isActive
                  ? `${flow.bgColor} border-2 border-${flow.color.split("-")[1]}-500`
                  : "bg-card border border-border hover:border-primary/50"
              }`}
            >
              <div className={`flex items-center gap-2 mb-2 ${flow.color}`}>
                <Icon className="w-5 h-5" />
                <span className="font-semibold text-foreground text-sm">{flow.label}</span>
              </div>

              {isActive && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground leading-relaxed text-left">
                    {flow.explanation}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Learning Insight */}
      {activeFlow ? (
        <Card className="w-full max-w-2xl glass-card border border-primary/30 p-4 bg-primary/10 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">Key Learning:</p>
              <p className="text-sm text-muted-foreground">
                Control where your money flows, control your future. Every rupee you earn must flow somewhere—the choice of where is yours!
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="text-center text-muted-foreground text-sm">
          👉 Tap each flow to understand where money goes
        </div>
      )}
    </div>
  );
}
