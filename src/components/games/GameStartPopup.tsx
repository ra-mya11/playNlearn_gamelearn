import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface GameStartPopupProps {
  title: string;
  discover: string;
  challenge: string;
  success: string;
  onStart: () => void;
  onCancel: () => void;
}

export function GameStartPopup({
  title,
  discover,
  challenge,
  success,
  onStart,
  onCancel,
}: GameStartPopupProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-3xl border border-border bg-gradient-to-br from-background to-muted/20 p-8 max-w-md w-full shadow-2xl animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Title */}
        <h2 className="font-heading text-2xl font-bold text-foreground mb-6 pr-8">
          🎮 {title}
        </h2>

        {/* Content */}
        <div className="space-y-5 mb-8">
          {/* What You Will Discover */}
          <div>
            <h3 className="flex items-center gap-2 font-heading font-semibold text-foreground mb-2">
              <span className="text-lg">📘</span>
              What You Will Discover
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{discover}</p>
          </div>

          {/* What You Need To Do */}
          <div>
            <h3 className="flex items-center gap-2 font-heading font-semibold text-foreground mb-2">
              <span className="text-lg">🎯</span>
              What You Need To Do
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{challenge}</p>
          </div>

          {/* What Success Looks Like */}
          <div>
            <h3 className="flex items-center gap-2 font-heading font-semibold text-foreground mb-2">
              <span className="text-lg">🏆</span>
              What Success Looks Like
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{success}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={onCancel}
            variant="outline"
            className="w-full"
          >
            ❌ Go Back
          </Button>
          <Button
            onClick={onStart}
            className="w-full bg-secondary hover:bg-secondary/90"
          >
            ▶ Start Game
          </Button>
        </div>
      </div>
    </div>
  );
}
