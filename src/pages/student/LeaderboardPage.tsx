import { AppLayout } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GameBadge } from "@/components/ui/game-badge";
import { Trophy, Medal, Star, Sparkles, Crown, TrendingUp } from "lucide-react";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { useAuth } from "@/contexts/AuthContext";
import { usePlayCoins } from "@/hooks/use-playcoins";

export default function LeaderboardPage() {
  const { leaderboard, userRank, isLoading } = useLeaderboard(20);
  const { user } = useAuth();
  const { wallet } = usePlayCoins();

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-muted-foreground font-bold">#{rank}</span>;
  };

  const getRankBackground = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/50";
    if (rank === 2) return "bg-gradient-to-r from-gray-400/20 to-slate-400/20 border-gray-400/50";
    if (rank === 3) return "bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-600/50";
    return "glass-card";
  };

  return (
    <AppLayout role="student" playCoins={wallet?.balance || 0} title="Leaderboard">
      <div className="px-4 py-6 pb-24">
        {/* Header */}
        <div className="text-center mb-6 slide-up">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-heading text-2xl font-bold">Village Champions</h2>
          <p className="text-muted-foreground text-sm">Top learners in our community</p>
        </div>

        {/* User's Rank Card */}
        {userRank && (
          <Card className="glass-card border border-primary/30 p-4 mb-6 slide-up" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Rank</p>
                  <p className="font-heading text-xl font-bold">#{userRank}</p>
                </div>
              </div>
              <GameBadge variant="accent">
                <Star className="h-3 w-3 mr-1" />
                Keep Learning!
              </GameBadge>
            </div>
          </Card>
        )}

        {/* Leaderboard List */}
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="glass-card p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-24 mb-1" />
                    <div className="h-3 bg-muted rounded w-16" />
                  </div>
                </div>
              </Card>
            ))
          ) : leaderboard.length === 0 ? (
            <Card className="glass-card p-8 text-center">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No rankings yet. Start learning to be the first!</p>
            </Card>
          ) : (
            leaderboard.map((entry, index) => {
              const rank = index + 1;
              const isCurrentUser = entry.user_id === user?.id;

              return (
                <Card 
                  key={entry.user_id}
                  className={`p-4 transition-all slide-up ${getRankBackground(rank)} ${
                    isCurrentUser ? "ring-2 ring-primary" : ""
                  }`}
                  style={{ animationDelay: `${(index + 2) * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank */}
                    <div className="w-8 flex items-center justify-center">
                      {getRankIcon(rank)}
                    </div>

                    {/* Avatar */}
                    <Avatar className="h-10 w-10 border-2 border-primary/30">
                      <AvatarFallback className="bg-primary/20 text-primary font-bold">
                        {entry.profile?.full_name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-heading font-bold truncate">
                        {entry.profile?.full_name || "Anonymous"}
                        {isCurrentUser && <span className="text-primary ml-1">(You)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {entry.profile?.village || entry.profile?.school || "Village Learner"}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-primary">
                        <Star className="h-4 w-4" />
                        <span className="font-heading font-bold">{entry.total_xp}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Level {entry.current_level}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 inline mr-1" />
            Complete more games to climb the ranks!
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
