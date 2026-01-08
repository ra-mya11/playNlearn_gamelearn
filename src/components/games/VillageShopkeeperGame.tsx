import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Smile, Frown, RotateCcw, X } from "lucide-react";

interface ShopItem {
  id: number;
  name: string;
  price: number;
  emoji: string;
}

interface Customer {
  money: number;
  items: number[];
}

export function VillageShopkeeperGame({ onClose }: { onClose: () => void }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [basket, setBasket] = useState<number[]>([]);
  const [cashGiven, setCashGiven] = useState<number | null>(null);
  const [changeGiven, setChangeGiven] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"none" | "correct" | "wrong">("none");
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [shopTrust, setShopTrust] = useState(100);

  const shopItems: ShopItem[] = [
    { id: 1, name: "Rice (5kg)", price: 250, emoji: "🍚" },
    { id: 2, name: "Soap", price: 30, emoji: "🧼" },
    { id: 3, name: "Notebook", price: 40, emoji: "📓" },
    { id: 4, name: "Oil (1L)", price: 180, emoji: "🫒" },
    { id: 5, name: "Salt", price: 20, emoji: "🧂" },
  ];

  const customers: Customer[] = [
    { money: 500, items: [1] }, // Customer buys rice with 500
    { money: 100, items: [2, 3] }, // Customer buys soap + notebook with 100
    { money: 300, items: [4, 5] }, // Customer buys oil + salt with 300
  ];

  const [currentCustomer, setCurrentCustomer] = useState<Customer>(customers[0]);

  const basketTotal = basket.reduce((sum, itemId) => {
    const item = shopItems.find((i) => i.id === itemId);
    return sum + (item?.price || 0);
  }, 0);

  const handleAddToBasket = (itemId: number) => {
    if (basketTotal + shopItems.find((i) => i.id === itemId)!.price <= currentCustomer.money) {
      setBasket([...basket, itemId]);
    }
  };

  const handleRemoveFromBasket = (index: number) => {
    setBasket(basket.filter((_, i) => i !== index));
  };

  const handleGiveCash = (amount: number) => {
    setCashGiven(amount);
  };

  const handleGiveChange = (change: number) => {
    const correctChange = currentCustomer.money - basketTotal;
    
    if (change === correctChange) {
      setFeedback("correct");
      setScore(score + 10);
      setShopTrust(Math.min(100, shopTrust + 5));
    } else {
      setFeedback("wrong");
      setShopTrust(Math.max(0, shopTrust - 15));
    }
    
    setChangeGiven(change);
  };

  const nextRound = () => {
    if (round < customers.length) {
      setRound(round + 1);
      setBasket([]);
      setCashGiven(null);
      setChangeGiven(null);
      setFeedback("none");
      setCurrentCustomer(customers[round]);
    } else {
      // Game complete
      setGameStarted(false);
    }
  };

  if (!gameStarted) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Village Shopkeeper 🏪</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-semibold">📘 What You Will Discover</h3>
              <p className="text-sm text-muted-foreground">
                How maths helps you run a shop and handle money confidently.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🎯 What You Need To Do</h3>
              <p className="text-sm text-muted-foreground">
                Sell items, calculate totals, and give correct change to customers.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🏆 What Success Looks Like</h3>
              <p className="text-sm text-muted-foreground">
                Happy customers, correct balance, and earned EduCoins.
              </p>
            </div>
            <Button onClick={() => setGameStarted(true)} className="w-full">
              Start Game
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Village Shopkeeper 🏪 - Round {round}/3</DialogTitle>
          <div className="flex gap-4 mt-4">
            <div>Score: <span className="font-bold">{score}</span></div>
            <div>Shop Trust: <span className={`font-bold ${shopTrust > 60 ? 'text-green-600' : 'text-orange-600'}`}>{shopTrust}%</span></div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Shop Scene */}
          <div className="bg-yellow-50 dark:bg-yellow-950 rounded-lg p-4">
            <p className="text-sm font-semibold mb-3">📦 Shop Items</p>
            <div className="grid grid-cols-3 gap-2">
              {shopItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleAddToBasket(item.id)}
                  className="p-3 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 hover:border-primary transition"
                >
                  <div className="text-2xl">{item.emoji}</div>
                  <div className="text-xs font-semibold mt-1">{item.name}</div>
                  <div className="text-sm font-bold text-primary">₹{item.price}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Customer & Basket */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
              <p className="text-sm font-semibold mb-3">👤 Customer</p>
              <div className="text-4xl mb-2">😊</div>
              <p className="text-sm">Customer has: <span className="font-bold">₹{currentCustomer.money}</span></p>
              {feedback === "correct" && (
                <div className="text-green-600 mt-2 flex items-center gap-1">
                  <Smile className="h-4 w-4" />
                  <span className="text-sm">Happy!</span>
                </div>
              )}
              {feedback === "wrong" && (
                <div className="text-orange-600 mt-2 flex items-center gap-1">
                  <Frown className="h-4 w-4" />
                  <span className="text-sm">Confused!</span>
                </div>
              )}
            </div>

            <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4">
              <p className="text-sm font-semibold mb-3">🛒 Your Basket</p>
              {basket.length === 0 ? (
                <p className="text-sm text-muted-foreground">Select items to sell</p>
              ) : (
                <div className="space-y-1 mb-2">
                  {basket.map((itemId, idx) => {
                    const item = shopItems.find((i) => i.id === itemId);
                    return (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span>{item?.emoji} {item?.name}</span>
                        <button onClick={() => handleRemoveFromBasket(idx)} className="text-xs text-red-500">
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="border-t pt-2 mt-2">
                <p className="text-sm font-bold">Total: ₹{basketTotal}</p>
              </div>
            </div>
          </div>

          {/* Money Exchange */}
          {basketTotal > 0 && changeGiven === null && (
            <div className="bg-purple-50 dark:bg-purple-950 rounded-lg p-4">
              <p className="text-sm font-semibold mb-3">💰 Money Transaction</p>
              <div className="space-y-2">
                <p className="text-sm">Customer gives you: <span className="font-bold">₹{currentCustomer.money}</span></p>
                <p className="text-sm">Customer needs to buy: <span className="font-bold">₹{basketTotal}</span></p>
                <p className="text-sm text-accent">You should return change of: <span className="font-bold">₹{currentCustomer.money - basketTotal}</span></p>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-4">
                {[currentCustomer.money - basketTotal - 50, currentCustomer.money - basketTotal, currentCustomer.money - basketTotal + 20, currentCustomer.money - basketTotal + 50].map((amount) => (
                  <Button
                    key={amount}
                    variant={amount === currentCustomer.money - basketTotal ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleGiveChange(Math.max(0, amount))}
                  >
                    ₹{Math.max(0, amount)}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Feedback */}
          {feedback !== "none" && (
            <div className={`p-4 rounded-lg text-center ${
              feedback === "correct"
                ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                : "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200"
            }`}>
              {feedback === "correct" ? (
                <div>
                  <p className="font-bold">✓ Correct Change!</p>
                  <p className="text-sm">Customer is happy with the transaction.</p>
                </div>
              ) : (
                <div>
                  <p className="font-bold">✗ Wrong Amount</p>
                  <p className="text-sm">Customer expected ₹{currentCustomer.money - basketTotal}</p>
                </div>
              )}
              {round < customers.length && <Button onClick={nextRound} className="mt-3 w-full">Next Customer</Button>}
              {round === customers.length && feedback === "correct" && (
                <Button onClick={onClose} className="mt-3 w-full">Finish Game</Button>
              )}
            </div>
          )}

          {/* Concept Strip */}
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">
            💡 "Money works only when numbers balance."
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
