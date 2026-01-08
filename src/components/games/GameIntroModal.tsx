import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Play, ChevronRight } from "lucide-react";

export interface GameIntroConfig {
  conceptName: string;
  concept: string;
  whatYouLearn: string[];
  howToPlay: string[];
  outcome: string;
  gameIcon?: React.ElementType;
}

interface GameIntroModalProps {
  isOpen: boolean;
  config: GameIntroConfig;
  onStartGame: () => void;
  onGoBack: () => void;
}

export function GameIntroModal({
  isOpen,
  config,
  onStartGame,
  onGoBack,
}: GameIntroModalProps) {
  const GameIcon = config.gameIcon;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onGoBack()}>
      <DialogContent className="glass-card border-accent/30 max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl mx-4 p-8 shadow-2xl border-2">
        <DialogTitle className="sr-only">{config.conceptName}</DialogTitle>
        <DialogHeader className="text-center space-y-4 pb-6">
          {GameIcon && (
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-2xl bg-accent/20 flex items-center justify-center">
                <GameIcon className="h-10 w-10 text-accent" />
              </div>
            </div>
          )}
          <div>
            <h2 className="font-heading text-3xl font-bold text-foreground">
              {config.conceptName}
            </h2>
            <p className="text-sm text-accent font-semibold mt-2">
              Concept: {config.concept}
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* What You'll Learn */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="font-heading font-bold text-primary text-sm">1</span>
              </div>
              <h3 className="font-heading font-semibold text-foreground">What You'll Learn</h3>
            </div>
            <ul className="space-y-2 pl-10">
              {config.whatYouLearn.map((item, idx) => (
                <li
                  key={idx}
                  className="text-muted-foreground flex items-start gap-2"
                >
                  <span className="text-accent font-bold mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* How to Play */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center">
                <span className="font-heading font-bold text-secondary text-sm">2</span>
              </div>
              <h3 className="font-heading font-semibold text-foreground">How to Play</h3>
            </div>
            <ol className="space-y-2 pl-10">
              {config.howToPlay.map((step, idx) => (
                <li
                  key={idx}
                  className="text-muted-foreground flex items-start gap-2"
                >
                  <span className="text-secondary font-bold mt-1">{idx + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Outcome */}
          <div className="space-y-3 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg p-4 border border-accent/20">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-accent/30 flex items-center justify-center">
                <span className="font-heading font-bold text-accent text-sm">✓</span>
              </div>
              <h3 className="font-heading font-semibold text-foreground">What Success Looks Like</h3>
            </div>
            <p className="text-muted-foreground pl-10">{config.outcome}</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={onStartGame}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6 text-lg"
            >
              <Play className="h-5 w-5 mr-2" />
              Start Game
            </Button>
            <Button
              onClick={onGoBack}
              variant="outline"
              className="w-full py-6 text-lg"
            >
              <X className="h-5 w-5 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
