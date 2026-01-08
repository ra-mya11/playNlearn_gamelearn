import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";

interface DragItem {
  id: string;
  content: string;
  category: string;
}

interface DropZone {
  id: string;
  title: string;
  acceptCategory: string;
  items: DragItem[];
}

interface DragDropGameProps {
  items: DragItem[];
  zones: DropZone[];
  onComplete: (score: number, maxScore: number) => void;
}

export function DragDropGame({ items, zones, onComplete }: DragDropGameProps) {
  const [availableItems, setAvailableItems] = useState<DragItem[]>(items);
  const [dropZones, setDropZones] = useState<DropZone[]>(zones);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: number; incorrect: number } | null>(null);

  const handleDragStart = (item: DragItem) => {
    setDraggedItem(item);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDrop = useCallback((zoneId: string) => {
    if (!draggedItem) return;

    const zone = dropZones.find(z => z.id === zoneId);
    if (!zone) return;

    // Add item to zone
    setDropZones(prev => prev.map(z => 
      z.id === zoneId 
        ? { ...z, items: [...z.items, draggedItem] }
        : z
    ));

    // Remove from available
    setAvailableItems(prev => prev.filter(i => i.id !== draggedItem.id));
    setDraggedItem(null);
  }, [draggedItem, dropZones]);

  const removeFromZone = (zoneId: string, itemId: string) => {
    const zone = dropZones.find(z => z.id === zoneId);
    const item = zone?.items.find(i => i.id === itemId);
    
    if (item) {
      setDropZones(prev => prev.map(z =>
        z.id === zoneId
          ? { ...z, items: z.items.filter(i => i.id !== itemId) }
          : z
      ));
      setAvailableItems(prev => [...prev, item]);
    }
  };

  const checkAnswers = () => {
    let correct = 0;
    let incorrect = 0;

    dropZones.forEach(zone => {
      zone.items.forEach(item => {
        if (item.category === zone.acceptCategory) {
          correct++;
        } else {
          incorrect++;
        }
      });
    });

    setFeedback({ correct, incorrect });
    setIsComplete(true);
    onComplete(correct, items.length);
  };

  const resetGame = () => {
    setAvailableItems(items);
    setDropZones(zones);
    setDraggedItem(null);
    setIsComplete(false);
    setFeedback(null);
  };

  const allItemsPlaced = availableItems.length === 0;

  return (
    <div className="space-y-6">
      {/* Available Items */}
      <Card className="glass-card border border-primary/30 p-4">
        <h4 className="font-heading text-sm font-medium text-muted-foreground mb-3">
          Drag items to correct category:
        </h4>
        <div className="flex flex-wrap gap-2 min-h-[60px]">
          {availableItems.map(item => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item)}
              onDragEnd={handleDragEnd}
              onTouchStart={() => handleDragStart(item)}
              onClick={() => handleDragStart(item)}
              className={`px-4 py-2 rounded-lg bg-primary/20 border border-primary/40 
                text-foreground font-medium cursor-grab active:cursor-grabbing
                hover:bg-primary/30 transition-all ${
                  draggedItem?.id === item.id ? "opacity-50 scale-95" : ""
                }`}
            >
              {item.content}
            </div>
          ))}
          {availableItems.length === 0 && !isComplete && (
            <p className="text-muted-foreground text-sm">All items placed! Check your answers.</p>
          )}
        </div>
      </Card>

      {/* Drop Zones */}
      <div className="grid grid-cols-2 gap-3">
        {dropZones.map(zone => (
          <Card
            key={zone.id}
            className={`p-4 min-h-[150px] transition-all ${
              draggedItem 
                ? "border-2 border-dashed border-primary/50 bg-primary/5" 
                : "glass-card border border-muted"
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(zone.id)}
            onClick={() => draggedItem && handleDrop(zone.id)}
          >
            <h5 className="font-heading text-sm font-bold text-center mb-3 text-primary">
              {zone.title}
            </h5>
            <div className="space-y-2">
              {zone.items.map(item => {
                const isCorrect = isComplete && item.category === zone.acceptCategory;
                const isIncorrect = isComplete && item.category !== zone.acceptCategory;
                
                return (
                  <div
                    key={item.id}
                    onClick={() => !isComplete && removeFromZone(zone.id, item.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2
                      ${isCorrect ? "bg-secondary/20 border border-secondary text-secondary" : ""}
                      ${isIncorrect ? "bg-destructive/20 border border-destructive text-destructive" : ""}
                      ${!isComplete ? "bg-muted cursor-pointer hover:bg-muted/80" : ""}
                    `}
                  >
                    {item.content}
                    {isCorrect && <CheckCircle2 className="h-4 w-4 ml-auto" />}
                    {isIncorrect && <XCircle className="h-4 w-4 ml-auto" />}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {/* Feedback */}
      {feedback && (
        <Card className="glass-card border border-primary/30 p-4 text-center">
          <div className="flex items-center justify-center gap-4">
            <div className="text-secondary">
              <CheckCircle2 className="h-6 w-6 mx-auto mb-1" />
              <span className="font-bold">{feedback.correct} Correct</span>
            </div>
            {feedback.incorrect > 0 && (
              <div className="text-destructive">
                <XCircle className="h-6 w-6 mx-auto mb-1" />
                <span className="font-bold">{feedback.incorrect} Incorrect</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!isComplete && allItemsPlaced && (
          <Button onClick={checkAnswers} className="flex-1 bg-primary">
            Check Answers
          </Button>
        )}
        {isComplete && (
          <Button onClick={resetGame} variant="outline" className="flex-1">
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
