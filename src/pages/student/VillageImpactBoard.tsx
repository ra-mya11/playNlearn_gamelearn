import { useState, useEffect } from "react";
import { AppLayout } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import { toast } from "sonner";
import {
  Flame,
  Home,
  BookOpen,
  Users,
  Star,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  Target,
  Zap,
  Award,
  ChevronRight,
  Info,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { useAuth } from "@/contexts/AuthContext";
import { usePlayCoins } from "@/hooks/use-playcoins";
import { useNavigate } from "react-router-dom";

interface ImpactContributor {
  user_id: string;
  profile?: {
    full_name: string;
    village?: string;
    school?: string;
  };
  total_xp?: number;
  current_level?: number;
  contribution_score?: number;
  day_streak?: number;
  village_tasks_completed?: number;
}

/**
 * Village Contribution Score (VCS) based on learning behaviors, not marks or ranks
 * Calculated from:
 * - 🔥 Learning consistency (day streak)
 * - 🏡 Family & village tasks completed
 * - 📚 Learning progress (subject levels)
 * - 🎯 Village challenges completed
 * - 🤝 Positive learning actions
 */
const calculateVCS = (contributor: ImpactContributor): number => {
  let score = 0;

  // Consistency bonus (day streak)
  const streak = contributor.day_streak || 0;
  score += streak * 2; // Each day = +2 VCS

  // Village tasks completion
  const villageTasks = contributor.village_tasks_completed || 0;
  score += villageTasks * 5; // Each task = +5 VCS

  // Learning progress (level-based)
  const level = contributor.current_level || 0;
  score += level * 3; // Each level = +3 VCS

  // Total XP as learning effort indicator
  const xp = contributor.total_xp || 0;
  score += Math.floor(xp / 100); // Every 100 XP = +1 VCS

  return Math.max(Math.floor(score), 0);
};

/**
 * Impact titles based on learning behaviors and contribution, NOT rank
 * Focus on: consistency, helping, learning, problem-solving
 */
const getImpactTitle = (contributor: ImpactContributor): string => {
  const streak = contributor.day_streak || 0;
  const villageTasks = contributor.village_tasks_completed || 0;
  const level = contributor.current_level || 0;
  const xp = contributor.total_xp || 0;

  // Consistency-focused
  if (streak >= 30) return "🔥 Consistency Champion";
  if (streak >= 14) return "🌱 Consistent Learner";

  // Community-focused
  if (villageTasks >= 10) return "🏡 Village Helper";
  if (villageTasks >= 5) return "🤝 Community Contributor";

  // Learning-focused
  if (xp >= 5000) return "📚 Knowledge Builder";
  if (level >= 3) return "📖 Subject Explorer";

  // Problem-solving
  return "🛠 Problem Solver";
};

const getAvatarColor = (index: number): string => {
  const colors = [
    "bg-gradient-to-br from-primary to-primary/60",
    "bg-gradient-to-br from-secondary to-secondary/60",
    "bg-gradient-to-br from-accent to-accent/60",
    "bg-gradient-to-br from-destructive to-destructive/60",
    "bg-gradient-to-br from-badge to-badge/60",
    "bg-gradient-to-br from-pink-500 to-pink-600",
  ];
  return colors[index % colors.length];
};

const getAvatarInitial = (name: string): string => {
  return name.split(" ")[0].charAt(0).toUpperCase() || "?";
};

/**
 * Anonymous learning actions to inspire without pressure
 * Shows what learners are doing, not who is winning
 */
interface AnonymousAction {
  id: string;
  action: string;
  tags: string[];
  tagEmojis: string[];
  inspiration: string;
  color: string;
}

const generateAnonymousActions = (): AnonymousAction[] => [
  {
    id: "1",
    action: "A learner completed 3 days in a row",
    tags: ["Consistency", "Foundation"],
    tagEmojis: ["🔥", "📚"],
    inspiration: "Small steps build strong habits.",
    color: "bg-blue-500/20",
  },
  {
    id: "2",
    action: "Someone helped with a village task today",
    tags: ["Village Skill", "Community"],
    tagEmojis: ["🏡", "🤝"],
    inspiration: "Learning that helps others matters.",
    color: "bg-green-500/20",
  },
  {
    id: "3",
    action: "A learner improved their Biology progress by 20%",
    tags: ["Biology", "Growth"],
    tagEmojis: ["🧬", "🌱"],
    inspiration: "Progress is personal.",
    color: "bg-emerald-500/20",
  },
  {
    id: "4",
    action: "A learner reached a 7-day learning streak",
    tags: ["Dedication", "Consistency"],
    tagEmojis: ["⚡", "📈"],
    inspiration: "Consistency unlocks potential.",
    color: "bg-orange-500/20",
  },
  {
    id: "5",
    action: "Someone completed a village challenge",
    tags: ["Teamwork", "Impact"],
    tagEmojis: ["🎯", "👥"],
    inspiration: "Together we solve bigger problems.",
    color: "bg-purple-500/20",
  },
];

export default function VillageImpactBoard() {
  const { leaderboard, isLoading } = useLeaderboard(15);
  const { user, profile } = useAuth();
  const { wallet } = usePlayCoins();
  const navigate = useNavigate();
  const [impactModeOn, setImpactModeOn] = useState(true);
  const [anonymousModeOn, setAnonymousModeOn] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
  }, []);

  // Village statistics (community-focused)
  const totalActiveLearners = Math.max(leaderboard.length, 0);
  const totalVillageXP = Math.max(leaderboard.reduce((sum, entry) => sum + (entry.total_xp || 0), 0), 0);
  const villageLevel = Math.max(Math.floor(totalVillageXP / 10000) + 1, 1);

  // Current user data
  const currentUserData = leaderboard.find((entry) => entry.user_id === user?.id) as ImpactContributor | undefined;
  const userStreak = Math.max(currentUserData?.day_streak || 0, 0);
  const userVillageTasks = Math.max(currentUserData?.village_tasks_completed || 0, 0);
  const userLevel = Math.max(currentUserData?.current_level || 0, 0);

  // Village Contribution Score (VCS) - behavior-based, not rank-based
  const userVCS = currentUserData ? calculateVCS(currentUserData) : 0;
  const vcsProgress = Math.min(Math.max((userVCS / 300) * 100, 0), 100);

  const anonymousActions = generateAnonymousActions();

  const handleStartLearning = () => {
    toast.success("Let's learn together! 📚", {
      description: "Opening village learning tasks",
    });
    navigate("/student/tasks?category=village");
  };

  const handleJoinChallenge = () => {
    if (!impactModeOn) {
      setImpactModeOn(true);
      toast.success("Impact Mode enabled! 🎉", {
        description: "Your learning will now contribute to village growth",
      });
    } else {
      toast.success("You're contributing to your village! 🌾", {
        description: "Your learning helps village growth",
      });
    }
  };

  return (
    <AppLayout role="student" playCoins={wallet?.balance || 0} title="Community Mission Hub">
      <div className="px-4 py-6 pb-24">
        {/* 1. VILLAGE IDENTITY CARD */}
        <div className={`mb-6 transition-all duration-700 ${isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <Card className="glass-card rounded-2xl p-5 border border-primary/30 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <Home className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="font-heading text-xl font-bold text-foreground">Your Village 🌾</h2>
                    <p className="text-sm text-muted-foreground">Learning together, growing stronger</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-background/50 rounded-xl p-3 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Active Learners This Week</p>
                  <p className="font-heading text-2xl font-bold text-primary">{totalActiveLearners}</p>
                </div>
                <div className="bg-background/50 rounded-xl p-3 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Village Level</p>
                  <p className="font-heading text-2xl font-bold text-accent">{villageLevel}</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Village Learning Activity</span>
                  <span>{(totalVillageXP / 1000).toFixed(1)}k learning units</span>
                </div>
                <AnimatedProgress value={Math.min(Math.max((totalVillageXP % 10000) / 100, 0), 100)} variant="default" className="h-2" />
              </div>
            </div>
          </Card>
        </div>

        {/* 2. IMPACT MODE CLARITY */}
        <div className={`mb-6 transition-all duration-700 ${isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "100ms" }}>
          <Card className={`rounded-2xl p-5 border-2 transition-all ${impactModeOn ? "border-accent/50 bg-gradient-to-br from-accent/10 to-accent/5" : "border-muted/30 bg-muted/5"}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`h-3 w-3 rounded-full transition-all ${impactModeOn ? "bg-accent pulse" : "bg-muted-foreground/30"}`} />
                  <h3 className="font-heading font-bold text-foreground">
                    {impactModeOn ? "Impact Mode ON 🌱" : "Impact Mode OFF"}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {impactModeOn
                    ? "Your learning contributes to village progress and community growth"
                    : "Turn on Impact Mode to see how your learning helps the village"}
                </p>
              </div>

              <Button variant={impactModeOn ? "default" : "outline"} size="sm" onClick={() => setImpactModeOn(!impactModeOn)} className="flex-shrink-0 gap-2">
                {impactModeOn ? (
                  <>
                    <Eye className="h-4 w-4" />
                    On
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Off
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* 3. YOUR VILLAGE CONTRIBUTION CARD */}
        {impactModeOn && (
          <div className={`mb-6 transition-all duration-700 ${isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "150ms" }}>
            <Card className="glass-card rounded-2xl p-6 border border-accent/40 bg-gradient-to-br from-accent/10 to-accent/5">
              <div className="flex items-start gap-4 mb-6">
                <Avatar className="h-14 w-14 border-2 border-accent/50 flex-shrink-0">
                  <AvatarFallback className="bg-accent/20 text-accent font-bold text-lg">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-bold text-foreground">{profile?.full_name || "You"}</h3>
                  <p className="text-sm text-accent font-semibold">Village Contribution</p>
                </div>
              </div>

              {/* Village Contribution Score (VCS) Progress */}
              <div className="mb-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">Contribution Score</p>
                    <p className="text-3xl font-bold text-accent">{userVCS}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Progress</p>
                    <p className="text-xl font-bold text-primary">{Math.floor(vcsProgress)}%</p>
                  </div>
                </div>
                <AnimatedProgress value={vcsProgress} variant="default" className="h-2.5" />
                <p className="text-xs text-muted-foreground mt-2">
                  Complete learning tasks and village activities to increase your contribution
                </p>
              </div>

              {/* Impact Breakdown - Based on VCS components */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Flame className="h-4 w-4 text-destructive" />
                    <span className="text-xs text-muted-foreground font-medium">Consistency</span>
                  </div>
                  <p className="font-bold text-foreground text-base">{userStreak} days</p>
                </div>
                <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Home className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground font-medium">Village Tasks</span>
                  </div>
                  <p className="font-bold text-foreground text-base">{userVillageTasks}</p>
                </div>
                <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                  <div className="flex items-center gap-1.5 mb-1">
                    <BookOpen className="h-4 w-4 text-secondary" />
                    <span className="text-xs text-muted-foreground font-medium">Learning Progress</span>
                  </div>
                  <p className="font-bold text-foreground text-base">{userLevel}</p>
                </div>
                <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Users className="h-4 w-4 text-accent" />
                    <span className="text-xs text-muted-foreground font-medium">Positive Actions</span>
                  </div>
                  <p className="font-bold text-foreground text-base">+{Math.max(Math.floor(userVCS / 20), 0)}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 4. ANONYMOUS INSPIRATION MODE TOGGLE & SECTION */}
        <div className={`mb-6 transition-all duration-700 ${isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "200ms" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-bold text-foreground">What Learners in Your Village Are Doing 🌾</h3>
            <Button variant="outline" size="sm" onClick={() => setAnonymousModeOn(!anonymousModeOn)} className="gap-2 text-xs">
              {anonymousModeOn ? (
                <>
                  <Eye className="h-3 w-3" />
                  Anonymous
                </>
              ) : (
                <>
                  <EyeOff className="h-3 w-3" />
                  Named
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Real learning. Real actions. No comparisons.</p>

          {anonymousModeOn ? (
            /* ANONYMOUS INSPIRATION CARDS */
            <div className="space-y-3">
              {anonymousActions.map((action, index) => (
                <Card key={action.id} className={`glass-card p-4 border border-border/50 transition-all duration-700 ${isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: `${250 + index * 50}ms` }}>
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-full ${action.color} flex items-center justify-center flex-shrink-0 border border-border/50`}>
                      <span className="text-lg">👤</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground mb-2">{action.action}</p>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {action.tags.map((tag, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-xs bg-background/50 border border-border/50 rounded-full px-2 py-1 text-muted-foreground">
                            {action.tagEmojis[i]} {tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground italic">{action.inspiration}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            /* NAMED IMPACT CONTRIBUTORS LIST */
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
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No contributors yet. Be the first to learn for your village!</p>
                </Card>
              ) : (
                leaderboard.map((entry, index) => {
                  const impactTitle = getImpactTitle(entry);
                  const vcs = calculateVCS(entry);
                  const isCurrentUser = entry.user_id === user?.id;

                  return (
                    <Card key={entry.user_id} className={`p-4 transition-all duration-700 ${isCurrentUser ? "ring-2 ring-accent border-accent/40 bg-accent/5" : "glass-card border border-border/50"} ${isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: `${300 + index * 50}ms` }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <Avatar className="h-10 w-10 border-2 border-primary/30 flex-shrink-0">
                            <AvatarFallback className={`${getAvatarColor(index)} text-white font-bold`}>
                              {getAvatarInitial(entry.profile?.full_name || "?")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-heading font-bold truncate text-foreground">
                              {entry.profile?.full_name || "Anonymous"}
                              {isCurrentUser && <span className="text-accent ml-1">(You)</span>}
                            </p>
                            <p className="text-xs text-muted-foreground mb-1.5 truncate">
                              {entry.profile?.village || entry.profile?.school || "Village Learner"}
                            </p>
                            <p className="text-sm font-semibold text-accent">{impactTitle}</p>
                          </div>
                        </div>

                        <div className="flex-shrink-0 text-right">
                          <div className="relative h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                              <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                              <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${Math.max((Math.max(vcs || 0, 0) / 100) * 125.6, 0)} 125.6`} className="text-primary transition-all duration-500" />
                            </svg>
                            <span className="absolute font-bold text-sm text-primary">{Math.min(Math.floor(vcs / 10), 99)}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* 5. VILLAGE CHALLENGE CARD - Purpose-Driven */}
        <div className={`mb-6 transition-all duration-700 ${isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "350ms" }}>
          <Card className="glass-card rounded-2xl p-5 border border-secondary/30">
            <div className="flex items-start gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <Target className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-foreground">This Week's Village Challenge</h4>
                <p className="text-sm text-muted-foreground">Improve math accuracy in your village by 10%</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Village Progress</span>
                  <span>6 of 10</span>
                </div>
                <AnimatedProgress value={60} variant="default" className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-background/50 rounded-lg p-2 border border-border/50">
                  <p className="text-xs text-muted-foreground">Contributing Learners</p>
                  <p className="font-bold text-foreground">{totalActiveLearners}</p>
                </div>
                <div className="bg-background/50 rounded-lg p-2 border border-border/50">
                  <p className="text-xs text-muted-foreground">Time Left</p>
                  <p className="font-bold text-foreground">3 days</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 6. WHY IT MATTERS - Educational Connection */}
        <div className={`mb-6 transition-all duration-700 ${isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "400ms" }}>
          <Card className="glass-card rounded-2xl p-6 border border-secondary/30 bg-gradient-to-br from-secondary/10 to-secondary/5">
            <div className="flex items-start gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Info className="h-5 w-5 text-secondary" />
              </div>
              <h4 className="font-heading font-bold text-foreground text-lg">Why Your Learning Matters 💡</h4>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-border/50">
                <span className="text-lg flex-shrink-0">📚</span>
                <div>
                  <p className="font-semibold text-foreground">More Learning</p>
                  <p className="text-xs text-muted-foreground">Every lesson strengthens your community's knowledge</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-border/50">
                <span className="text-lg flex-shrink-0">📈</span>
                <div>
                  <p className="font-semibold text-foreground">Higher Village Level</p>
                  <p className="text-xs text-muted-foreground">When village learns together, it grows stronger</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-border/50">
                <span className="text-lg flex-shrink-0">🎁</span>
                <div>
                  <p className="font-semibold text-foreground">Rewards for Everyone</p>
                  <p className="text-xs text-muted-foreground">Higher village levels unlock challenges and rewards for the whole community</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 7. ACTION SECTION */}
        <div className={`transition-all duration-700 ${isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "450ms" }}>
          <Card className="glass-card rounded-2xl p-6 border border-accent/30 bg-gradient-to-br from-accent/10 to-primary/5">
            <div className="text-center mb-5">
              <p className="font-heading text-lg font-bold text-foreground mb-1">Your learning helps your village grow 🌾</p>
              <p className="text-sm text-muted-foreground">Choose how you want to contribute today</p>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={handleStartLearning} size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold gap-2 h-12">
                <BookOpen className="h-5 w-5" />
                Start a Learning Task
                <ArrowRight className="h-5 w-5" />
              </Button>

              <Button onClick={handleJoinChallenge} variant="outline" size="lg" className="w-full border-accent/50 hover:border-accent text-foreground font-bold gap-2 h-12">
                <Target className="h-5 w-5" />
                Join Village Challenge
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              <CheckCircle2 className="h-3 w-3 inline mr-1" />
              {impactModeOn ? "Impact Mode is ON - your learning counts toward village growth!" : "Turn on Impact Mode above for your learning to count"}
            </p>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
    </AppLayout>
  );
}
