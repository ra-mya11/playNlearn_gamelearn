import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";

interface BusinessState {
  day: number;
  cash: number;
  inventory: number;
  costPerUnit: number;
  sellingPrice: number;
  totalRevenue: number;
  totalCost: number;
  phase: "setup" | "operating" | "results";
}

export function MicroBusinessBuilder({ onComplete }: { onComplete: (score: number) => void }) {
  const [gameState, setGameState] = useState<BusinessState>({
    day: 1,
    cash: 1000,
    inventory: 0,
    costPerUnit: 30,
    sellingPrice: 50,
    totalRevenue: 0,
    totalCost: 0,
    phase: "setup",
  });

  const [inventoryInput, setInventoryInput] = useState(0);
  const [priceInput, setPriceInput] = useState(50);
  const [dayResults, setDayResults] = useState<{ day: number; customers: number; revenue: number; profit: number }[]>([]);
  const [message, setMessage] = useState("");

  const costPerUnit = 30;
  const costToBuy = (num: number) => num * costPerUnit;

  const handleBuyInventory = () => {
    if (inventoryInput <= 0) {
      setMessage("❌ Enter a quantity greater than 0");
      setTimeout(() => setMessage(""), 1500);
      return;
    }

    const cost = costToBuy(inventoryInput);
    if (gameState.cash < cost) {
      setMessage(`❌ You only have ₹${gameState.cash}, but this costs ₹${cost}`);
      setTimeout(() => setMessage(""), 1500);
      return;
    }

    setGameState({
      ...gameState,
      cash: gameState.cash - cost,
      inventory: gameState.inventory + inventoryInput,
      totalCost: gameState.totalCost + cost,
    });

    setMessage(`✅ Bought ${inventoryInput} units for ₹${cost}`);
    setTimeout(() => setMessage(""), 1500);
    setInventoryInput(0);
  };

  const handleRunBusiness = () => {
    if (gameState.inventory === 0) {
      setMessage("❌ You need to buy inventory first!");
      setTimeout(() => setMessage(""), 1500);
      return;
    }

    setGameState({ ...gameState, phase: "operating" });
    setPriceInput(gameState.sellingPrice);
  };

  const calculateCustomers = (price: number): number => {
    // Higher price = fewer customers
    // Lower price = more customers
    const baseDemand = 40;
    const priceEffect = (70 - price) / 10; // Adjust based on price range
    return Math.max(2, Math.floor(baseDemand + priceEffect));
  };

  const handleSetPrice = () => {
    if (priceInput <= costPerUnit) {
      setMessage("❌ Price must be higher than cost (₹30)!");
      setTimeout(() => setMessage(""), 1500);
      return;
    }

    setGameState({
      ...gameState,
      sellingPrice: priceInput,
    });

    setMessage("✅ Price set!");
    setTimeout(() => setMessage(""), 1500);
  };

  const handleOperateDay = () => {
    const customersToday = calculateCustomers(gameState.sellingPrice);
    const unitsSold = Math.min(customersToday, gameState.inventory);
    const revenueToday = unitsSold * gameState.sellingPrice;
    const profitToday = revenueToday - costToBuy(unitsSold);

    const newInventory = gameState.inventory - unitsSold;
    const newCash = gameState.cash + revenueToday;
    const newRevenue = gameState.totalRevenue + revenueToday;

    const result = {
      day: gameState.day,
      customers: customersToday,
      revenue: revenueToday,
      profit: profitToday,
    };

    if (gameState.day === 7) {
      setGameState({
        ...gameState,
        day: gameState.day + 1,
        cash: newCash,
        inventory: newInventory,
        totalRevenue: newRevenue,
        phase: "results",
      });
      setDayResults([...dayResults, result]);
    } else {
      setGameState({
        ...gameState,
        day: gameState.day + 1,
        cash: newCash,
        inventory: newInventory,
        totalRevenue: newRevenue,
      });
      setDayResults([...dayResults, result]);
    }
  };

  const profit = gameState.totalRevenue - gameState.totalCost;

  if (gameState.phase === "setup") {
    const inventoryCost = costToBuy(inventoryInput);
    const canAfford = gameState.cash >= inventoryCost;

    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background p-6 gap-6 overflow-auto">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">🛍️ Micro Business Builder</h2>
            <p className="text-muted-foreground">Run a juice stall for 7 days!</p>
          </div>

          {/* Shop Visual */}
          <div className="flex justify-center mb-8">
            <div className="relative w-32 h-32 rounded-xl bg-gradient-to-br from-orange-400/30 to-orange-400/10 border-4 border-orange-400/50 flex items-center justify-center">
              <div className="text-6xl">🧃</div>
            </div>
          </div>

          {/* Current Status */}
          <Card className="glass-card border border-primary/30 p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Your Cash</p>
                <p className="text-2xl font-bold text-accent">₹{gameState.cash}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cost per Unit</p>
                <p className="text-2xl font-bold text-destructive">₹{costPerUnit}</p>
              </div>
            </div>
          </Card>

          {/* Buy Inventory */}
          <Card className="glass-card border border-border p-6 space-y-4 mb-6">
            <h3 className="font-semibold text-foreground">Buy Inventory</h3>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">How many juice bottles?</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={inventoryInput}
                  onChange={(e) => setInventoryInput(parseInt(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 bg-card border border-border rounded text-foreground"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            {inventoryInput > 0 && (
              <div className="bg-card/50 rounded p-3 text-sm">
                <div className="flex justify-between mb-2">
                  <span>Cost for {inventoryInput} bottles:</span>
                  <span className={`font-bold ${canAfford ? "text-secondary" : "text-destructive"}`}>₹{inventoryCost}</span>
                </div>
                {canAfford ? (
                  <p className="text-xs text-secondary">✅ You can afford this</p>
                ) : (
                  <p className="text-xs text-destructive">❌ Not enough cash</p>
                )}
              </div>
            )}

            <Button
              onClick={handleBuyInventory}
              disabled={inventoryInput === 0 || !canAfford}
              className="w-full bg-secondary"
            >
              Buy {inventoryInput} Bottles for ₹{inventoryCost}
            </Button>
          </Card>

          {/* Message */}
          {message && (
            <div className="p-3 bg-primary/20 border border-primary/50 rounded text-sm text-foreground mb-6">
              {message}
            </div>
          )}

          {/* Current Inventory */}
          {gameState.inventory > 0 && (
            <Card className="glass-card border border-secondary/30 bg-secondary/10 p-4 mb-6">
              <p className="text-sm">📊 Inventory Ready: <span className="font-bold text-secondary">{gameState.inventory} bottles</span></p>
            </Card>
          )}

          {/* Start Button */}
          {gameState.inventory > 0 && (
            <Button
              onClick={handleRunBusiness}
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-accent"
            >
              Start Operating →
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (gameState.phase === "operating") {
    const customers = calculateCustomers(priceInput);
    const potentialRevenue = Math.min(customers, gameState.inventory) * priceInput;
    const potentialProfit = potentialRevenue - costToBuy(Math.min(customers, gameState.inventory));

    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background p-6 gap-6 overflow-auto">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">Day {gameState.day}/7</h2>
            <p className="text-muted-foreground">Set your price and run the day!</p>
          </div>

          {/* Price Setting */}
          <Card className="glass-card border border-border p-6 space-y-4 mb-6">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Price per Bottle (Cost: ₹30)
                </label>
                <input
                  type="number"
                  value={priceInput}
                  onChange={(e) => setPriceInput(parseInt(e.target.value) || costPerUnit)}
                  className="w-full px-3 py-2 bg-card border border-border rounded text-foreground text-lg"
                  min={costPerUnit + 1}
                />
              </div>

              {/* Price Preset Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[40, 50, 60, 70].map((price) => (
                  <Button
                    key={price}
                    variant={priceInput === price ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPriceInput(price)}
                    className="text-xs"
                  >
                    ₹{price}
                  </Button>
                ))}
              </div>

              <Button
                onClick={handleSetPrice}
                className="w-full bg-primary"
              >
                Set Price ₹{priceInput}
              </Button>
            </div>
          </Card>

          {/* Customer Prediction */}
          <Card className="glass-card border border-primary/30 bg-primary/10 p-4 mb-6">
            <h3 className="font-semibold text-foreground mb-3">Expected Today:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customers interested:</span>
                <span className="font-bold text-foreground">{customers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">You can sell:</span>
                <span className="font-bold text-foreground">{Math.min(customers, gameState.inventory)} bottles</span>
              </div>
              <div className="pt-2 border-t border-border flex justify-between">
                <span className="text-muted-foreground">Expected revenue:</span>
                <span className="font-bold text-accent">₹{potentialRevenue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expected profit:</span>
                <span className={`font-bold ${potentialProfit >= 0 ? "text-secondary" : "text-destructive"}`}>
                  {potentialProfit >= 0 ? "+" : ""}₹{potentialProfit}
                </span>
              </div>
            </div>
          </Card>

          {/* Run Day Button */}
          <Button
            onClick={handleOperateDay}
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-accent"
          >
            Run Day {gameState.day} →
          </Button>
        </div>
      </div>
    );
  }

  // Results Phase
  const totalProfit = dayResults.reduce((sum, day) => sum + day.profit, 0);
  const totalUnitsSold = dayResults.reduce((sum, day) => sum + Math.min(day.customers, gameState.inventory), 0);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background p-6 gap-6 overflow-auto">
      <div className="max-w-2xl w-full">
        <Card className="glass-card border border-secondary/30 bg-secondary/10 p-8">
          <div className="flex flex-col items-center text-center">
            <CheckCircle2 className="w-12 h-12 text-secondary mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {totalProfit > 0 ? "🎉 Business Success!" : "📊 Game Over"}
            </h2>

            <div className="space-y-3 mb-6 w-full">
              <div>
                <p className="text-xs text-muted-foreground">Total Cost (Inventory)</p>
                <p className="text-xl font-bold text-destructive">₹{gameState.totalCost}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Revenue (Sales)</p>
                <p className="text-xl font-bold text-accent">₹{gameState.totalRevenue}</p>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground">Net Profit</p>
                <p className={`text-3xl font-bold ${totalProfit >= 0 ? "text-secondary" : "text-destructive"}`}>
                  {totalProfit >= 0 ? "+" : ""}₹{totalProfit}
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              You sold {totalUnitsSold} bottles in 7 days. Remember: profit comes from smart pricing, not just volume!
            </p>

            <Button
              onClick={() => onComplete(Math.max(0, totalProfit))}
              className="w-full bg-secondary"
              size="lg"
            >
              Finish
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
