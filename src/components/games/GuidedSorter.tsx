import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";

interface Item {
  id: string;
  name: string;
  emoji: string;
  type: "need" | "want";
  explanation: string;
}

export function GuidedSorter() {
  const [items, setItems] = useState<Item[]>([
    {
      id: "1",
      name: "School Books",
      emoji: "📚",
      type: "need",
      explanation: "You need education to grow and learn",
    },
    {
      id: "2",
      name: "Video Game",
      emoji: "🎮",
      type: "want",
      explanation: "Fun to have, but not essential for living",
    },
    {
      id: "3",
      name: "Healthy Food",
      emoji: "🥗",
      type: "need",
      explanation: "Food keeps you healthy and energized",
    },
    {
      id: "4",
      name: "Movie Tickets",
      emoji: "🎬",
      type: "want",
      explanation: "Entertainment, but not a necessity",
    },
    {
      id: "5",
      name: "Winter Jacket",
      emoji: "🧥",
      type: "need",
      explanation: "Protection from weather is essential",
    },
    {
      id: "6",
      name: "Trendy Shoes",
      emoji: "👟",
      type: "want",
      explanation: "Nice to have, but basic shoes work too",
    },
    {
      id: "7",
      name: "Medicine",
      emoji: "💊",
      type: "need",
      explanation: "Health is the most important",
    },
    {
      id: "8",
      name: "Candy & Snacks",
      emoji: "🍬",
      type: "want",
      explanation: "Tasty but not required for survival",
    },
  ]);

  const [sorted, setSorted] = useState<{
    needs: Item[];
    wants: Item[];
  }>({
    needs: [],
    wants: [],
  });

  const [draggedItem, setDraggedItem] = useState<Item | null>(null);
  const [completedMessage, setCompletedMessage] = useState("");

  const handleDragStart = (item: Item) => {
    setDraggedItem(item);
  };

  const handleDropNeed = (item: Item) => {
    if (!sorted.needs.find((i) => i.id === item.id)) {
      setSorted({
        ...sorted,
        needs: [...sorted.needs, item],
      });
      setItems(items.filter((i) => i.id !== item.id));
      setCompletedMessage(
        item.type === "need"
          ? "✅ Correct! That's definitely a need!"
          : "❌ Think again... is that really essential?"
      );
      setTimeout(() => setCompletedMessage(""), 2000);
    }
  };

  const handleDropWant = (item: Item) => {
    if (!sorted.wants.find((i) => i.id === item.id)) {
      setSorted({
        ...sorted,
        wants: [...sorted.wants, item],
      });
      setItems(items.filter((i) => i.id !== item.id));
      setCompletedMessage(
        item.type === "want"
          ? "✅ Right! That's a nice-to-have!"
          : "❌ Hmm... don't you really need that?"
      );
      setTimeout(() => setCompletedMessage(""), 2000);
    }
  };

  const handleUndoLast = () => {
    if (sorted.needs.length > 0) {
      const lastNeed = sorted.needs[sorted.needs.length - 1];
      setItems([...items, lastNeed]);
      setSorted({
        ...sorted,
        needs: sorted.needs.slice(0, -1),
      });
    } else if (sorted.wants.length > 0) {
      const lastWant = sorted.wants[sorted.wants.length - 1];
      setItems([...items, lastWant]);
      setSorted({
        ...sorted,
        wants: sorted.wants.slice(0, -1),
      });
    }
  };

  const progress = (sorted.needs.length + sorted.wants.length) / 8;
  const allSorted = items.length === 0;

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-primary/5 via-accent/5 to-background p-6 gap-6">
      {/* Title */}
      <div className="w-full max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-foreground mb-2">🛒 Need vs Want Sorter</h2>
        <p className="text-muted-foreground text-sm">
          Drag items into "Must Have" or "Nice to Have" buckets. There's no perfect answer—think about what you truly need to live!
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-muted-foreground">Progress</span>
          <span className="text-xs font-semibold text-accent">{Math.round(progress * 100)}%</span>
        </div>
        <div className="w-full h-2 bg-card rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Main Game Area */}
      <div className="w-full max-w-4xl mx-auto grid grid-cols-3 gap-4 flex-1">
        {/* Items to Sort */}
        <div className="col-span-1">
          <div className="mb-3">
            <h3 className="font-semibold text-foreground text-sm">Items to Sort</h3>
            <p className="text-xs text-muted-foreground">Drag them to buckets →</p>
          </div>
          <div className="space-y-2 min-h-[300px] bg-card/50 rounded-lg p-3 border border-border">
            {items.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item)}
                className="p-3 bg-card border border-border rounded-lg cursor-move hover:shadow-md hover:scale-105 transition-all active:opacity-50"
              >
                <div className="text-lg">{item.emoji}</div>
                <div className="text-sm font-semibold text-foreground">{item.name}</div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="h-full flex items-center justify-center">
                <span className="text-xs text-muted-foreground">All sorted! 🎉</span>
              </div>
            )}
          </div>
        </div>

        {/* Drop Zones */}
        <div className="col-span-2 space-y-4">
          {/* Needs Bucket */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedItem) handleDropNeed(draggedItem);
            }}
            className="p-4 bg-gradient-to-br from-red-500/10 to-red-500/5 border-2 border-dashed border-red-400/50 rounded-lg min-h-[160px] hover:border-red-500 hover:bg-red-500/15 transition-all"
          >
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="text-2xl">❤️</span>
              Must Have (Needs)
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {sorted.needs.map((item) => (
                <div
                  key={item.id}
                  className="p-2 bg-red-500/20 border border-red-400 rounded-lg text-center"
                >
                  <div className="text-lg">{item.emoji}</div>
                  <div className="text-xs text-foreground font-semibold">{item.name}</div>
                  <p className="text-xs text-muted-foreground mt-1 leading-tight">
                    {item.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Wants Bucket */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedItem) handleDropWant(draggedItem);
            }}
            className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-2 border-dashed border-orange-400/50 rounded-lg min-h-[160px] hover:border-orange-500 hover:bg-orange-500/15 transition-all"
          >
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="text-2xl">✨</span>
              Nice to Have (Wants)
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {sorted.wants.map((item) => (
                <div
                  key={item.id}
                  className="p-2 bg-orange-500/20 border border-orange-400 rounded-lg text-center"
                >
                  <div className="text-lg">{item.emoji}</div>
                  <div className="text-xs text-foreground font-semibold">{item.name}</div>
                  <p className="text-xs text-muted-foreground mt-1 leading-tight">
                    {item.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Messages and Actions */}
      <div className="w-full max-w-4xl mx-auto">
        {completedMessage && (
          <div className="mb-3 p-3 bg-primary/20 border border-primary/50 rounded-lg text-sm text-foreground text-center animate-in fade-in">
            {completedMessage}
          </div>
        )}

        {allSorted && (
          <Card className="glass-card border border-secondary/30 p-4 bg-secondary/10 mb-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-secondary mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Great Sorting!</p>
                <p className="text-sm text-muted-foreground">
                  You sorted {sorted.needs.length} needs and {sorted.wants.length} wants. This skill helps you spend money wisely!
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="flex gap-2">
          {(sorted.needs.length > 0 || sorted.wants.length > 0) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndoLast}
              className="flex-1"
            >
              ↶ Undo Last
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setItems([...sorted.needs, ...sorted.wants]);
              setSorted({ needs: [], wants: [] });
              setCompletedMessage("");
            }}
            className="flex-1"
          >
            🔄 Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
