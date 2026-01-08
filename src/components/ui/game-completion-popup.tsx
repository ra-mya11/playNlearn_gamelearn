import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

export interface GameCompletionPopupProps {
  isOpen: boolean;
  onPlayAgain: () => void;
  onExitFullscreen?: () => void;
  onBackToGames: () => void;
  learningOutcome: string;
  isFullscreen?: boolean;
}

export function GameCompletionPopup({
  isOpen,
  onPlayAgain,
  onExitFullscreen,
  onBackToGames,
  learningOutcome,
  isFullscreen = false,
}: GameCompletionPopupProps) {
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleExitFullscreenClick = () => {
    if (isFullscreen) {
      setShowExitConfirm(true);
    } else {
      onBackToGames();
    }
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    if (onExitFullscreen) {
      onExitFullscreen();
    }
    onBackToGames();
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
  };

  if (showExitConfirm) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[400px] glass-card border-border text-center">
          <DialogHeader>
            <DialogTitle>Exit Fullscreen?</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Would you like to exit fullscreen mode and return to Gamified Learning?
            </p>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              onClick={handleCancelExit}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmExit}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Yes, Exit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[450px] glass-card border-border text-center">
        <DialogHeader>
          <DialogTitle className="hidden">Congratulations!</DialogTitle>
        </DialogHeader>

        {/* Celebration Emoji Animation */}
        <div className="mb-4 text-6xl animate-bounce">🎉</div>

        <div className="space-y-4">
          <h2 className="font-heading text-3xl font-bold text-foreground">
            You Did It!
          </h2>

          <p className="text-lg text-muted-foreground">
            {learningOutcome}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-3">
          <Button
            onClick={onPlayAgain}
            className="bg-primary hover:bg-primary/90"
          >
            🔄 Play Again
          </Button>

          <Button
            variant="outline"
            onClick={handleExitFullscreenClick}
          >
            {isFullscreen ? "⛶ Exit Fullscreen" : "⬅️ Back to Biology Games"}
          </Button>

          {!isFullscreen && (
            <Button
              variant="ghost"
              onClick={onBackToGames}
              className="text-xs"
            >
              or navigate back
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
