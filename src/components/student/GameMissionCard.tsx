import { AnimatedProgress } from "@/components/ui/animated-progress";
import { GameBadge } from "@/components/ui/game-badge";
import { Button } from "@/components/ui/button";
import { Play, Lock, CheckCircle, Star } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameMissionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  reward: number;
  difficulty: "easy" | "medium" | "hard";
  status: "locked" | "available" | "in-progress" | "completed";
  progress?: number;
  onClick?: () => void;
}

const difficultyColors = {
  easy: "bg-secondary/20 text-secondary",
  medium: "bg-accent/20 text-accent",
  hard: "bg-destructive/20 text-destructive",
};

export function GameMissionCard({
  title,
  description,
  icon: Icon,
  reward,
  difficulty,
  status,
  progress = 0,
  onClick,
}: GameMissionCardProps) {
  const isLocked = status === "locked";
  const isCompleted = status === "completed";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card p-4 transition-all duration-300",
        isLocked && "opacity-60",
        !isLocked && !isCompleted && "hover:border-primary/50 hover:shadow-md cursor-pointer",
        isCompleted && "border-secondary/50 bg-secondary/5"
      )}
      onClick={!isLocked ? onClick : undefined}
    >
      {/* Status Indicator */}
      {isCompleted && (
        <div className="absolute right-2 top-2">
          <CheckCircle className="h-6 w-6 text-secondary" />
        </div>
      )}
      {isLocked && (
        <div className="absolute right-2 top-2">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>
      )}

      <div className="flex gap-4">
        <div className={cn(
          "flex h-14 w-14 items-center justify-center rounded-xl",
          isLocked ? "bg-muted" : "bg-primary/10"
        )}>
          <Icon className={cn(
            "h-7 w-7",
            isLocked ? "text-muted-foreground" : "text-primary"
          )} />
        </div>

        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h4 className="font-heading font-semibold">{title}</h4>
            <span className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
              difficultyColors[difficulty]
            )}>
              {difficulty}
            </span>
          </div>
          <p className="mb-2 text-sm text-muted-foreground line-clamp-2">{description}</p>

          {status === "in-progress" && (
            <div className="mb-2 flex items-center gap-2">
              <AnimatedProgress value={progress} className="flex-1" size="sm" />
              <span className="text-xs font-medium">{progress}%</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <GameBadge variant="accent" size="sm" icon={<Star className="h-3 w-3" />}>
              +{reward} 🪙
            </GameBadge>
            
            {!isLocked && !isCompleted && (
              <Button size="sm" variant="ghost" className="h-8">
                <Play className="mr-1 h-4 w-4" />
                {status === "in-progress" ? "Continue" : "Start"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
