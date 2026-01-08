import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface Product {
  id: string;
  seller: string;
  price: number;
  quantity: number;
  quality: string;
  hiddenCost?: number;
  emoji: string;
}

interface Scene {
  id: string;
  product: string;
  emoji: string;
  goal: string;
  products: Product[];
}

const scenes: Scene[] = [
  {
    id: "oil",
    product: "Cooking Oil",
    emoji: "🫶",
    goal: "Need to buy 1 liter of oil",
    products: [
      { id: "a", seller: "Street Vendor", price: 400, quantity: 1, quality: "Basic", emoji: "🏪" },
      { id: "b", seller: "Supermarket", price: 900, quantity: 2.5, quality: "Good", emoji: "🏬" },
      { id: "c", seller: "Discount Store", price: 350, quantity: 0.8, quality: "Low", hiddenCost: 100, emoji: "🛒" },
    ],
  },
  {
    id: "rice",
    product: "Rice",
    emoji: "🍚",
    goal: "Need to buy 5kg of rice",
    products: [
      { id: "a", seller: "Local Shop", price: 300, quantity: 1, quality: "Good", emoji: "🏪" },
      { id: "b", seller: "Wholesale", price: 1200, quantity: 5, quality: "Best", emoji: "📦" },
      { id: "c", seller: "Supermarket", price: 1500, quantity: 5, quality: "Premium", emoji: "🏬" },
    ],
  },
  {
    id: "milk",
    product: "Milk (Dairy)",
    emoji: "🥛",
    goal: "Need 1 liter of milk daily for a week",
    products: [
      { id: "a", seller: "Dairy Farm", price: 60, quantity: 1, quality: "Fresh", emoji: "🚜" },
      { id: "b", seller: "Supermarket (Packaged)", price: 65, quantity: 1, quality: "Packaged", emoji: "🏬" },
      { id: "c", seller: "Convenience Store", price: 80, quantity: 1, quality: "Premium", emoji: "🏪" },
    ],
  },
];

export function MarketPriceNegotiator({ onComplete }: { onComplete: (score: number) => void }) {
  const [currentScene, setCurrentScene] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "correct" | "wrong"; message: string } | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const scene = scenes[currentScene];
  const correctChoice = scene.products.reduce((best, product) => {
    const bestValue = best.price / best.quantity;
    const productValue = product.price / product.quantity;
    return productValue < bestValue || (productValue === bestValue && product.quality > best.quality) ? product : best;
  });

  const handleSelectProduct = (product: Product) => {
    setSelected(product.id);

    const productValue = product.price / product.quantity;
    const correctValue = correctChoice.price / correctChoice.quantity;

    if (product.id === correctChoice.id) {
      setFeedback({
        type: "correct",
        message: `✅ Perfect! ₹${product.price}/${product.quantity}L = ₹${(productValue).toFixed(0)}/L is the best value!`,
      });
      setScore(score + 25);
    } else {
      const wasted = Math.abs(productValue - correctValue) * correctChoice.quantity;
      setFeedback({
        type: "wrong",
        message: `❌ This costs ₹${(productValue).toFixed(0)}/L. Better choice: ₹${(correctValue).toFixed(0)}/L (saves ₹${Math.round(wasted)})`,
      });
    }
  };

  const handleNextScene = () => {
    if (currentScene === scenes.length - 1) {
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
            <h2 className="text-2xl font-bold text-foreground mb-2">🎉 Amazing Shopper!</h2>
            <p className="text-muted-foreground mb-4">
              You compared prices wisely and saved money in all 3 scenarios!
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
          <div className="text-5xl mb-3">{scene.emoji}</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{scene.product} Shopping</h2>
          <p className="text-muted-foreground">{scene.goal}</p>
          <div className="mt-4 text-sm text-muted-foreground">
            Scene {currentScene + 1} of {scenes.length}
          </div>
        </div>

        {/* Progress */}
        <div className="w-full h-2 bg-card rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
            style={{ width: `${((currentScene + 1) / scenes.length) * 100}%` }}
          />
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          {scene.products.map((product) => {
            const pricePerUnit = product.price / product.quantity;
            const isSelected = selected === product.id;
            const isCorrect = product.id === correctChoice.id;

            return (
              <button
                key={product.id}
                onClick={() => !selected && handleSelectProduct(product)}
                disabled={!!selected}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? isCorrect
                      ? "border-secondary bg-secondary/10"
                      : "border-destructive bg-destructive/10"
                    : "border-border bg-card hover:border-primary/50 hover:scale-102"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-2xl">{product.emoji}</div>
                    <h3 className="font-semibold text-foreground">{product.seller}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">{product.quality}</div>
                    <div className="text-xl font-bold text-accent">₹{product.price}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                  <div>
                    <p className="text-muted-foreground">Quantity</p>
                    <p className="font-semibold text-foreground">{product.quantity}L</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Price/Unit</p>
                    <p className="font-semibold text-foreground">₹{pricePerUnit.toFixed(0)}</p>
                  </div>
                  {product.hiddenCost && (
                    <div>
                      <p className="text-muted-foreground">Hidden Cost</p>
                      <p className="font-semibold text-destructive">+₹{product.hiddenCost}</p>
                    </div>
                  )}
                </div>

                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs font-semibold text-foreground">
                      {isCorrect ? "✅ Best value!" : "❌ Not the best deal"}
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
            {currentScene === scenes.length - 1 ? "See Your Score →" : "Next Shopping Scene →"}
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
