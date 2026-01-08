import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface BusinessState {
  capital: number;
  inventory: number;
  sellPrice: number;
  daysSold: number;
  totalProfit: number;
  dayProfit: number;
  gameStatus: "setup" | "playing" | "won" | "lost";
  gameMessage: string;
}

export function MiniBusinessTycoon({ onComplete }: { onComplete: (score: number) => void }) {
  const [business, setBusiness] = useState<BusinessState>({
    capital: 1000,
    inventory: 0,
    sellPrice: 0,
    daysSold: 0,
    totalProfit: 0,
    dayProfit: 0,
    gameStatus: "setup",
    gameMessage: "",
  });

  const costPerUnit = 30; // Cost to make each item
  const daysNeeded = 7;

  const handleBuyInventory = () => {
    if (business.inventory > 0) {
      setBusiness({
        ...business,
        gameMessage: "⚠️ Sell your current inventory first!",
      });
      setTimeout(() => setBusiness({ ...business, gameMessage: "" }), 2000);
      return;
    }

    const maxUnits = Math.floor(business.capital / costPerUnit);
    if (maxUnits <= 0) {
      setBusiness({
        ...business,
        gameStatus: "lost",
        gameMessage: "❌ Not enough capital to buy inventory!",
      });
      return;
    }

    const unitsToMake = maxUnits;
    const cost = unitsToMake * costPerUnit;

    setBusiness({
      ...business,
      capital: business.capital - cost,
      inventory: unitsToMake,
      gameStatus: "playing",
      gameMessage: `✅ Created ${unitsToMake} items! Now set your selling price.`,
    });

    setTimeout(() => setBusiness((prev) => ({ ...prev, gameMessage: "" })), 2000);
  };

  const handleSetPrice = (newPrice: number) => {
    if (newPrice < costPerUnit) {
      setBusiness({
        ...business,
        gameMessage: "⚠️ Price must be higher than cost!",
      });
      return;
    }

    setBusiness({
      ...business,
      sellPrice: newPrice,
      gameMessage: `💰 Set price to ₹${newPrice} per item`,
    });

    setTimeout(() => setBusiness((prev) => ({ ...prev, gameMessage: "" })), 1500);
  };

  const handleSellDay = () => {
    if (business.sellPrice === 0) {
      setBusiness({
        ...business,
        gameMessage: "⚠️ Set a selling price first!",
      });
      return;
    }

    if (business.inventory === 0) {
      setBusiness({
        ...business,
        gameMessage: "⚠️ Make inventory first!",
      });
      return;
    }

    // Simulate customer demand based on price
    let soldUnits = 0;
    if (business.sellPrice < costPerUnit + 20) {
      soldUnits = Math.min(15, business.inventory);
    } else if (business.sellPrice < costPerUnit + 50) {
      soldUnits = Math.min(10, business.inventory);
    } else if (business.sellPrice < costPerUnit + 100) {
      soldUnits = Math.min(5, business.inventory);
    } else {
      soldUnits = Math.min(2, business.inventory);
    }

    const dayRevenue = soldUnits * business.sellPrice;
    const dayProfit = dayRevenue - (soldUnits * costPerUnit);
    const newInventory = business.inventory - soldUnits;
    const newTotalProfit = business.totalProfit + dayProfit;
    const newDays = business.daysSold + 1;

    setBusiness({
      ...business,
      inventory: newInventory,
      capital: business.capital + dayRevenue,
      dayProfit: dayProfit,
      totalProfit: newTotalProfit,
      daysSold: newDays,
      gameMessage: `📈 Sold ${soldUnits} items! Profit: ₹${dayProfit}`,
    });

    setTimeout(() => {
      if (newDays >= daysNeeded) {
        const finalScore = Math.min(100, (newTotalProfit / 500) * 100);
        setBusiness((prev) => ({
          ...prev,
          gameStatus: "won",
        }));
        setTimeout(() => onComplete(finalScore), 1000);
      } else {
        setBusiness((prev) => ({ ...prev, gameMessage: "" }));
      }
    }, 1500);
  };

  const profitMargin =
    business.sellPrice > 0 ? ((business.sellPrice - costPerUnit) / business.sellPrice * 100).toFixed(1) : 0;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-red-50 p-8 gap-6 overflow-y-auto">
      {/* Title */}
      <div className="w-full max-w-4xl text-center mb-4">
        <h2 className="text-3xl font-bold text-orange-700 mb-2">🧾 Mini Business Tycoon</h2>
        <p className="text-gray-600">Buy materials, set prices, serve customers!</p>
      </div>

      {/* Business Overview */}
      <div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-blue-100 border-2 border-blue-400 p-3 text-center">
          <p className="text-xs text-blue-700 font-semibold">Capital</p>
          <p className="text-2xl font-bold text-blue-900">₹{business.capital.toFixed(0)}</p>
        </Card>

        <Card className="bg-purple-100 border-2 border-purple-400 p-3 text-center">
          <p className="text-xs text-purple-700 font-semibold">Inventory</p>
          <p className="text-2xl font-bold text-purple-900">{business.inventory} items</p>
        </Card>

        <Card className="bg-green-100 border-2 border-green-400 p-3 text-center">
          <p className="text-xs text-green-700 font-semibold">Total Profit</p>
          <p className="text-2xl font-bold text-green-900">₹{business.totalProfit.toFixed(0)}</p>
        </Card>

        <Card className="bg-yellow-100 border-2 border-yellow-400 p-3 text-center">
          <p className="text-xs text-yellow-700 font-semibold">Days</p>
          <p className="text-2xl font-bold text-yellow-900">{business.daysSold}/{daysNeeded}</p>
        </Card>
      </div>

      {/* Business Setup & Operation */}
      {business.gameStatus === "setup" && (
        <Card className="w-full max-w-4xl bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-orange-400 p-6">
          <h3 className="font-heading font-bold text-lg text-orange-900 mb-3">📦 Start Your Lemonade Stall</h3>
          <p className="text-sm text-orange-800 mb-4">
            You have ₹{business.capital} to start. Each glass costs ₹{costPerUnit} to make.
          </p>
          <p className="text-sm text-orange-700 mb-4">
            You can make {Math.floor(business.capital / costPerUnit)} glasses maximum.
          </p>
          <Button
            onClick={handleBuyInventory}
            className="w-full bg-orange-600 hover:bg-orange-700 text-lg py-6"
          >
            🏭 Buy Materials & Make Products
          </Button>
        </Card>
      )}

      {business.gameStatus === "playing" && (
        <div className="w-full max-w-4xl space-y-4">
          {/* Price Setting */}
          <Card className="bg-white border-2 border-purple-400 p-4">
            <p className="font-heading font-bold text-purple-900 mb-3">💰 Set Selling Price</p>
            <p className="text-sm text-gray-600 mb-3">
              Cost per item: ₹{costPerUnit} | Current price: ₹{business.sellPrice || "Not set"}
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {[40, 50, 60, 80, 100, 120].map((price) => (
                <Button
                  key={price}
                  onClick={() => handleSetPrice(price)}
                  variant={business.sellPrice === price ? "default" : "outline"}
                  size="sm"
                  className="bg-purple-100 border-purple-400 text-purple-900 hover:bg-purple-200"
                >
                  ₹{price}
                </Button>
              ))}
            </div>
            {business.sellPrice > 0 && (
              <div className="text-sm text-gray-600">
                <p>
                  Profit per item: ₹{business.sellPrice - costPerUnit} ({profitMargin}% margin)
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  💡 Lower prices = more customers | Higher prices = more profit per item
                </p>
              </div>
            )}
          </Card>

          {/* Daily Sales */}
          <Card className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 p-4">
            <p className="font-heading font-bold text-orange-900 mb-2">📊 Day {business.daysSold + 1}</p>
            {business.dayProfit > 0 && (
              <div className="mb-3 p-3 bg-green-100 rounded border-l-4 border-green-500">
                <p className="text-sm text-green-800">
                  Yesterday's profit: ₹{business.dayProfit} 📈
                </p>
              </div>
            )}
            <Button
              onClick={handleSellDay}
              disabled={business.sellPrice === 0 || business.inventory === 0}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-lg py-6"
            >
              🚀 Serve Customers Today
            </Button>
          </Card>
        </div>
      )}

      {/* Message Display */}
      {business.gameMessage && (
        <Card className="w-full max-w-4xl bg-white border-2 border-blue-400 p-4 text-center font-semibold text-blue-800">
          {business.gameMessage}
        </Card>
      )}

      {/* Game Complete */}
      {business.gameStatus === "won" && (
        <Card className="w-full max-w-4xl bg-green-100 border-2 border-green-400 p-6 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
          <h3 className="font-heading text-xl font-bold text-green-800">🎉 Business Success!</h3>
          <p className="text-green-700 mt-2">
            Total Profit: ₹{business.totalProfit.toFixed(0)}
          </p>
          <p className="text-green-600 text-sm mt-1">
            You learned to balance price and profit!
          </p>
        </Card>
      )}

      {business.gameStatus === "lost" && (
        <Card className="w-full max-w-4xl bg-red-100 border-2 border-red-400 p-6 text-center">
          <p className="text-red-800 font-bold text-lg">💔 Business Failed</p>
          <p className="text-red-700 mt-2">Not enough capital. Try again!</p>
        </Card>
      )}
    </div>
  );
}
