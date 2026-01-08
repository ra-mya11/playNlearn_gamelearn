import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Shuffle } from "lucide-react";
import { useSoundEffects } from "@/hooks/use-sound-effects";

interface MatchPair {
  id: string;
  left: string;
  right: string;
}

interface MatchingGameProps {
  pairs: MatchPair[];
  onComplete: (score: number, maxScore: number) => void;
}

export function MatchingGame({ pairs, onComplete }: MatchingGameProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [incorrectPair, setIncorrectPair] = useState<{ left: string; right: string } | null>(null);
  const [shuffledRight, setShuffledRight] = useState<MatchPair[]>([]);
  const [attempts, setAttempts] = useState(0);
  const { playCorrect, playIncorrect, playClick } = useSoundEffects();

  useEffect(() => {
    setShuffledRight([...pairs].sort(() => Math.random() - 0.5));
  }, [pairs]);

  useEffect(() => {
    if (selectedLeft && selectedRight) {
      setAttempts(prev => prev + 1);
      
      const pair = pairs.find(p => p.id === selectedLeft);
      const rightPair = pairs.find(p => p.id === selectedRight);
      
      if (pair && rightPair && pair.id === rightPair.id) {
        playCorrect();
        setMatchedPairs(prev => new Set([...prev, pair.id]));
        setSelectedLeft(null);
        setSelectedRight(null);
      } else {
        playIncorrect();
        setIncorrectPair({ left: selectedLeft, right: selectedRight });
        setTimeout(() => {
          setIncorrectPair(null);
          setSelectedLeft(null);
          setSelectedRight(null);
        }, 800);
      }
    }
  }, [selectedLeft, selectedRight, pairs, playCorrect, playIncorrect]);

  useEffect(() => {
    if (matchedPairs.size === pairs.length) {
      const perfectScore = pairs.length;
      const score = Math.max(0, perfectScore - Math.floor((attempts - pairs.length) / 2));
      onComplete(score, perfectScore);
    }
  }, [matchedPairs, pairs.length, attempts, onComplete]);

  const handleLeftSelect = (id: string) => {
    if (matchedPairs.has(id)) return;
    playClick();
    setSelectedLeft(id);
  };

  const handleRightSelect = (id: string) => {
    if (matchedPairs.has(id)) return;
    playClick();
    setSelectedRight(id);
  };

  const shuffleCards = () => {
    setShuffledRight([...pairs].sort(() => Math.random() - 0.5));
    setMatchedPairs(new Set());
    setSelectedLeft(null);
    setSelectedRight(null);
    setAttempts(0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Match the pairs by tapping</p>
        <Button variant="ghost" size="sm" onClick={shuffleCards}>
          <Shuffle className="h-4 w-4 mr-1" />
          Shuffle
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Left Column */}
        <div className="space-y-2">
          {pairs.map(pair => {
            const isMatched = matchedPairs.has(pair.id);
            const isSelected = selectedLeft === pair.id;
            const isIncorrect = incorrectPair?.left === pair.id;

            return (
              <Card
                key={`left-${pair.id}`}
                onClick={() => !isMatched && handleLeftSelect(pair.id)}
                className={`p-3 text-center cursor-pointer transition-all
                  ${isMatched ? "bg-secondary/20 border-secondary" : "glass-card hover:border-primary/50"}
                  ${isSelected ? "ring-2 ring-primary border-primary" : ""}
                  ${isIncorrect ? "ring-2 ring-destructive border-destructive animate-shake" : ""}
                `}
              >
                <span className={`font-medium ${isMatched ? "text-secondary" : ""}`}>
                  {pair.left}
                </span>
                {isMatched && <CheckCircle2 className="h-4 w-4 text-secondary inline ml-2" />}
              </Card>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="space-y-2">
          {shuffledRight.map(pair => {
            const isMatched = matchedPairs.has(pair.id);
            const isSelected = selectedRight === pair.id;
            const isIncorrect = incorrectPair?.right === pair.id;

            return (
              <Card
                key={`right-${pair.id}`}
                onClick={() => !isMatched && handleRightSelect(pair.id)}
                className={`p-3 text-center cursor-pointer transition-all
                  ${isMatched ? "bg-secondary/20 border-secondary" : "glass-card hover:border-primary/50"}
                  ${isSelected ? "ring-2 ring-primary border-primary" : ""}
                  ${isIncorrect ? "ring-2 ring-destructive border-destructive animate-shake" : ""}
                `}
              >
                <span className={`font-medium ${isMatched ? "text-secondary" : ""}`}>
                  {pair.right}
                </span>
                {isMatched && <CheckCircle2 className="h-4 w-4 text-secondary inline ml-2" />}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Progress */}
      <Card className="glass-card border border-primary/30 p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Matched: {matchedPairs.size}/{pairs.length}
          </span>
          <span className="text-muted-foreground">
            Attempts: {attempts}
          </span>
        </div>
      </Card>
    </div>
  );
}
