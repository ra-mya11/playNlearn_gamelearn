import { AppLayout } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  MapPin, 
  School, 
  Calendar,
  Flame,
  Trophy,
  Settings,
  Bell,
  Moon,
  Globe,
  Shield,
  LogOut,
  ChevronRight,
  Edit2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import mascotWelcome from "@/assets/mascot-welcome.png";
import { useStreak } from "@/hooks/use-streak";
import { useAchievements } from "@/hooks/use-achievements";

export default function ProfilePage() {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const { currentStreak, longestStreak } = useStreak();
  const { unlockedCount } = useAchievements();

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/role-selection");
  };

  const userStats = {
    level: 8,
    streak: currentStreak || 0,
    badges: unlockedCount || 0,
    tasksCompleted: 45,
    gamesPlayed: 28
  };

  const settingsItems = [
    { icon: Bell, label: "Notifications", toggle: true, enabled: true },
    { icon: Moon, label: "Dark Mode", toggle: true, enabled: true },
    { icon: Globe, label: "Language", value: "English" },
    { icon: Shield, label: "Privacy", chevron: true },
  ];

  return (
    <AppLayout role="student" playCoins={1250} title="Profile">
      <div className="px-4 py-6 pb-24">
        {/* Profile Header */}
        <div className="mb-6 slide-up">
          <div className="glass-card rounded-2xl p-5 border border-border">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <User className="h-10 w-10 text-primary-foreground" />
                </div>
                <button 
                  onClick={() => navigate("/student/profile/settings")}
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-secondary flex items-center justify-center border-2 border-background"
                >
                  <Edit2 className="h-4 w-4 text-secondary-foreground" />
                </button>
              </div>
              <div className="flex-1">
                <h2 className="font-heading text-xl font-bold text-foreground">
                  {profile?.full_name || "Student"}
                </h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  <span>{profile?.village || "Not set"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                  <School className="h-4 w-4" />
                  <span>{profile?.grade || "Grade"} • {profile?.school || "School"}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Trophy className="h-4 w-4 text-accent" />
                  <span className="font-heading font-bold text-foreground">{userStats.level}</span>
                </div>
                <p className="text-xs text-muted-foreground">Level</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Flame className="h-4 w-4 text-destructive" />
                  <span className="font-heading font-bold text-foreground">{userStats.streak}</span>
                </div>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-heading font-bold text-foreground">{userStats.tasksCompleted}</span>
                </div>
                <p className="text-xs text-muted-foreground">Tasks Done</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mascot Message */}
        <div className="mb-6 slide-up" style={{ animationDelay: "50ms" }}>
          <Card className="glass-card border border-border p-4 flex items-center gap-4">
            <img src={mascotWelcome} alt="Mascot" className="w-16 h-16 object-contain" />
            <div>
              <p className="font-heading font-semibold text-foreground">
                Keep going, {profile?.full_name?.split(' ')[0] || "learner"}!
              </p>
              <p className="text-sm text-muted-foreground">
                You're doing great! {longestStreak - currentStreak} more days to beat your record.
              </p>
            </div>
          </Card>
        </div>

        {/* Achievements Summary */}
        <div className="mb-6 slide-up" style={{ animationDelay: "100ms" }}>
          <h3 className="font-heading font-semibold text-foreground mb-3 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-accent" />
            Achievements
          </h3>
          <Card className="glass-card border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-heading text-2xl font-bold text-foreground">{userStats.badges}</p>
                <p className="text-sm text-muted-foreground">Badges Earned</p>
              </div>
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((_, i) => (
                  <div 
                    key={i}
                    className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background flex items-center justify-center"
                  >
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                ))}
                {userStats.badges > 4 && (
                  <div className="h-10 w-10 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <span className="text-xs font-bold text-muted-foreground">+{userStats.badges - 4}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Edit Profile Button */}
        <div className="mb-6 slide-up" style={{ animationDelay: "125ms" }}>
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => navigate("/student/profile/settings")}
          >
            <span className="flex items-center gap-2">
              <Edit2 className="h-4 w-4" />
              Edit Profile
            </span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Settings */}
        <div className="mb-6 slide-up" style={{ animationDelay: "150ms" }}>
          <h3 className="font-heading font-semibold text-foreground mb-3 flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            Settings
          </h3>
          <Card className="glass-card border border-border divide-y divide-border">
            {settingsItems.map((item, index) => (
              <div key={item.label} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">{item.label}</span>
                </div>
                {item.toggle ? (
                  <Switch defaultChecked={item.enabled} />
                ) : item.value ? (
                  <span className="text-sm text-muted-foreground">{item.value}</span>
                ) : item.chevron ? (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                ) : null}
              </div>
            ))}
          </Card>
        </div>

        {/* Logout Button */}
        <div className="slide-up" style={{ animationDelay: "200ms" }}>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
