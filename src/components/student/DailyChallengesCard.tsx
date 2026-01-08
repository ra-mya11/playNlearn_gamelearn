import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import { GameBadge } from "@/components/ui/game-badge";
import { useDailyChallenges } from "@/hooks/use-daily-challenges";
import { useSoundEffects } from "@/hooks/use-sound-effects";
import { 
  CalendarDays, 
  Target, 
  Gift, 
  CheckCircle2, 
  Loader2,
  Flame 
} from "lucide-react";

export function DailyChallengesCard() {
  const { 
    challenges, 
    isLoading, 
    completedCount, 
    claimableCount,
    totalCount,
    initializeChallenges,
    claimReward,
    isClaiming,
  } = useDailyChallenges();
  
  const { playCoins, playSuccess } = useSoundEffects();

  // Initialize challenges on mount
  useEffect(() => {
    initializeChallenges();
  }, [initializeChallenges]);

  const handleClaim = (userChallengeId: string) => {
    playCoins();
    claimReward(userChallengeId);
  };

  if (isLoading) {
    return (
      <Card className="glass-card border border-border p-4">
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-accent" />
          Daily Challenges
        </h3>
        <GameBadge variant="accent" size="sm">
          <Flame className="h-3 w-3 mr-1" />
          {completedCount}/{totalCount}
        </GameBadge>
      </div>

      {/* Challenges List */}
      <div className="space-y-3">
        {challenges.map((challenge) => (
          <Card 
            key={challenge.id} 
            className={`glass-card border p-4 transition-all ${
              challenge.is_completed 
                ? challenge.is_claimed 
                  ? "border-secondary/30 bg-secondary/5" 
                  : "border-accent/50 bg-accent/10"
                : "border-border"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {challenge.is_completed ? (
                    <CheckCircle2 className="h-4 w-4 text-secondary" />
                  ) : (
                    <Target className="h-4 w-4 text-primary" />
                  )}
                  <p className="font-medium text-foreground text-sm">
                    {challenge.title}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {challenge.description}
                </p>
                
                {/* Progress Bar */}
                <div className="flex items-center gap-2">
                  <AnimatedProgress
                    value={(challenge.progress / challenge.requirement_value) * 100}
                    variant={challenge.is_completed ? "success" : "default"}
                    className="flex-1 h-2"
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {challenge.progress}/{challenge.requirement_value}
                  </span>
                </div>
              </div>

              {/* Reward/Claim Section */}
              <div className="text-right shrink-0">
                {challenge.is_completed && !challenge.is_claimed ? (
                  <Button
                    size="sm"
                    variant="default"
                    className="bg-accent hover:bg-accent/90"
                    onClick={() => challenge.user_challenge_id && handleClaim(challenge.user_challenge_id)}
                    disabled={isClaiming}
                  >
                    {isClaiming ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <>
                        <Gift className="h-3 w-3 mr-1" />
                        Claim
                      </>
                    )}
                  </Button>
                ) : challenge.is_claimed ? (
                  <span className="text-xs text-secondary font-medium">
                    ✓ Claimed
                  </span>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    <span className="text-accent font-semibold">+{challenge.playcoins_reward} 🪙</span>
                    <br />
                    <span className="text-primary font-semibold">+{challenge.xp_reward} XP</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {claimableCount > 0 && (
        <p className="text-center text-sm text-accent font-medium animate-pulse">
          🎁 You have {claimableCount} reward{claimableCount > 1 ? 's' : ''} to claim!
        </p>
      )}
    </div>
  );
}
