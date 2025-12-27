import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  QrCode,
  ClipboardCheck,
  BarChart3,
  TreePine,
  Users,
  AlertCircle,
  Gift,
  Zap,
  ChevronRight,
  Bell,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { GameBadge } from "@/components/ui/game-badge";

interface DashboardStats {
  studentsActive: number;
  pendingTasks: number;
  pendingRewards: number;
  villageImpact: number;
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [stats, setStats] = useState<DashboardStats>({
    studentsActive: 24,
    pendingTasks: 12,
    pendingRewards: 8,
    villageImpact: 156,
  });

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const teacherName = profile?.full_name?.split(" ")[0] || "Teacher";
  const villageName = profile?.metadata?.village_name || "Your Village";
  const schoolName = profile?.metadata?.school_name || "School";

  const primaryActions = [
    {
      id: "scan-qr",
      icon: QrCode,
      label: t("teacher.scanQR", { defaultValue: "Scan QR" }),
      description: t("teacher.scanQRDesc", { defaultValue: "Verify reward redemptions" }),
      color: "from-primary to-primary/80",
      onClick: () => navigate("/teacher/scan-qr"),
    },
    {
      id: "verify-tasks",
      icon: ClipboardCheck,
      label: t("teacher.verifyTasks", { defaultValue: "Verify Tasks" }),
      description: t("teacher.verifyTasksDesc", { defaultValue: "Review student submissions" }),
      color: "from-accent to-accent/80",
      onClick: () => navigate("/teacher/tasks/verification"),
    },
    {
      id: "student-progress",
      icon: BarChart3,
      label: t("teacher.studentProgress", { defaultValue: "Student Progress" }),
      description: t("teacher.studentProgressDesc", { defaultValue: "Monitor learning" }),
      color: "from-secondary to-secondary/80",
      onClick: () => navigate("/teacher/student-progress"),
    },
    {
      id: "village-impact",
      icon: TreePine,
      label: t("teacher.villageImpact", { defaultValue: "Village Impact" }),
      description: t("teacher.villageImpactDesc", { defaultValue: "Community growth" }),
      color: "from-badge to-badge/80",
      onClick: () => navigate("/teacher/village-impact"),
    },
  ];

  const recentActivity = [
    {
      student: "Priya Sharma",
      action: t("teacher.completedPhysics", { defaultValue: "completed Physics lesson" }),
      time: "5 min ago",
      icon: Zap,
    },
    {
      student: "Amit Kumar",
      action: t("teacher.submittedVillage", { defaultValue: "submitted village task" }),
      time: "15 min ago",
      icon: TreePine,
    },
    {
      student: "Ravi Patel",
      action: t("teacher.earnedCoins", { defaultValue: "earned 50 PlayCoins" }),
      time: "1 hour ago",
      icon: Gift,
    },
  ];

  return (
    <AppLayout role="teacher" title={t("teacher.dashboard", { defaultValue: "Dashboard" })}>
      <div className="px-4 py-6 space-y-6">
        {/* Welcome Section with Village Info */}
        <div className="space-y-2 slide-up">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-3xl font-bold text-foreground">
                {t("teacher.goodMorning", { defaultValue: "Good morning" })}, {teacherName}! 👋
              </h2>
              <p className="mt-1 text-muted-foreground">
                {schoolName} • {villageName} 🌾
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <div className="flex items-center gap-1 rounded-full bg-secondary/10 px-3 py-1 text-xs text-secondary">
                  <Wifi className="h-3 w-3" />
                  <span>{t("teacher.online", { defaultValue: "Online" })}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-1 text-xs text-destructive">
                  <WifiOff className="h-3 w-3" />
                  <span>{t("teacher.offline", { defaultValue: "Offline" })}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hero Card - Today's Overview */}
        <div className="slide-up space-y-4" style={{ animationDelay: "50ms" }}>
          <div className="glass-card rounded-2xl border border-border/50 p-6 backdrop-blur-xl overflow-hidden relative">
            {/* Gradient background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {t("teacher.todayOverview", { defaultValue: "Today's Overview" })}
                </p>
                <p className="text-xs text-muted-foreground italic">
                  {t(
                    "teacher.guidingMessage",
                    {
                      defaultValue: "Your guidance is shaping young minds today.",
                    }
                  )}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-heading font-bold text-foreground">
                      {stats.studentsActive}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("teacher.studentsActive", { defaultValue: "Students Active Today" })}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl p-4 border border-accent/20">
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardCheck className="h-5 w-5 text-accent" />
                    <span className="text-2xl font-heading font-bold text-foreground">
                      {stats.pendingTasks}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("teacher.tasksPending", { defaultValue: "Tasks Pending Verification" })}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl p-4 border border-secondary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="h-5 w-5 text-secondary" />
                    <span className="text-2xl font-heading font-bold text-foreground">
                      {stats.pendingRewards}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("teacher.rewardsPending", { defaultValue: "Rewards Pending Collection" })}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-badge/10 to-badge/5 rounded-xl p-4 border border-badge/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TreePine className="h-5 w-5 text-badge" />
                    <span className="text-2xl font-heading font-bold text-foreground">
                      {stats.villageImpact}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("teacher.villageImpactSummary", { defaultValue: "Village Learning Impact" })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="slide-up space-y-3" style={{ animationDelay: "100ms" }}>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t("teacher.quickActions", { defaultValue: "Quick Actions" })}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {primaryActions.map((action) => (
              <button
                key={action.id}
                onClick={action.onClick}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm transition-all duration-300 hover:border-border hover:bg-card/80 hover:shadow-lg"
              >
                {/* Gradient background on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-start gap-3">
                  <div className={`rounded-xl bg-gradient-to-br ${action.color} p-3 text-white`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-heading font-semibold text-foreground text-sm">
                      {action.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Pending Verifications Alert Card */}
        {stats.pendingTasks > 0 && (
          <Link
            to="/teacher/tasks/verification"
            className="slide-up flex items-center justify-between rounded-xl border-2 border-accent/30 bg-accent/5 p-4 transition-all hover:border-accent/50 hover:bg-accent/10"
            style={{ animationDelay: "150ms" }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                <AlertCircle className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-heading font-semibold text-foreground">
                  {stats.pendingTasks} {t("teacher.tasksPendingVerification", {
                    defaultValue: "Tasks Pending Verification",
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("teacher.reviewSubmissions", { defaultValue: "Review student submissions" })}
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        )}

        {/* Recent Activity Section */}
        <div className="slide-up space-y-3" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center justify-between px-1">
            <h3 className="font-heading font-semibold text-foreground">
              {t("teacher.recentActivity", { defaultValue: "Recent Activity" })}
            </h3>
            <GameBadge
              variant="primary"
              size="sm"
              icon={<Bell className="h-3 w-3" />}
            >
              {t("teacher.live", { defaultValue: "Live" })}
            </GameBadge>
          </div>
          <div className="space-y-2">
            {recentActivity.map((activity, index) => {
              const IconComponent = activity.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg bg-muted/30 p-3 border border-border/30 backdrop-blur-sm"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <IconComponent className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium text-foreground">{activity.student}</span>{" "}
                      <span className="text-muted-foreground">{activity.action}</span>
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Learning Support Message */}
        <div
          className="slide-up rounded-xl border border-secondary/20 bg-secondary/5 p-4 text-center backdrop-blur-sm"
          style={{ animationDelay: "250ms" }}
        >
          <p className="text-sm text-muted-foreground">
            {t("teacher.supportMessage", {
              defaultValue: "Remember: Your role is to mentor and guide, not to judge. Every submission is an opportunity to encourage learning.",
            })}
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
