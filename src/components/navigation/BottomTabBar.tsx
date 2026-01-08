import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { BookOpen, ClipboardList, Coins, BarChart3, User } from "lucide-react";
import { NotificationBadge } from "./NotificationBadge";
import { useNotificationBadges } from "@/hooks/use-notification-badges";

interface BottomTabBarProps {
  role?: "student" | "teacher" | "parent";
}

const studentTabs = [
  { icon: BookOpen, label: "Learn", path: "/student/dashboard", badgeKey: null },
  { icon: ClipboardList, label: "Tasks", path: "/student/tasks", badgeKey: null },
  { icon: Coins, label: "Rewards", path: "/student/playcoins/wallet", badgeKey: "rewards" as const },
  { icon: BarChart3, label: "Progress", path: "/student/achievements", badgeKey: "progress" as const },
  { icon: User, label: "Profile", path: "/student/profile", badgeKey: null },
];

const teacherTabs = [
  { icon: BookOpen, label: "Dashboard", path: "/teacher/dashboard", badgeKey: null },
  { icon: ClipboardList, label: "Classes", path: "/teacher/classes", badgeKey: null },
  { icon: BarChart3, label: "Analytics", path: "/teacher/analytics", badgeKey: null },
  { icon: ClipboardList, label: "Tasks", path: "/teacher/tasks/verification", badgeKey: null },
  { icon: User, label: "Profile", path: "/teacher/profile", badgeKey: null },
];

const parentTabs = [
  { icon: BookOpen, label: "Dashboard", path: "/parent/dashboard", badgeKey: null },
  { icon: BarChart3, label: "Progress", path: "/parent/child/progress", badgeKey: null },
  { icon: ClipboardList, label: "Tasks", path: "/parent/family/tasks", badgeKey: null },
  { icon: Coins, label: "Rewards", path: "/parent/rewards/history", badgeKey: null },
  { icon: User, label: "Profile", path: "/parent/profile", badgeKey: null },
];

const tabsByRole = {
  student: studentTabs,
  teacher: teacherTabs,
  parent: parentTabs,
};

export function BottomTabBar({ role = "student" }: BottomTabBarProps) {
  const tabs = tabsByRole[role];
  const { totalProgressBadges, totalRewardsBadges } = useNotificationBadges();

  const getBadgeCount = (badgeKey: "rewards" | "progress" | null) => {
    if (!badgeKey) return 0;
    if (badgeKey === "rewards") return totalRewardsBadges;
    if (badgeKey === "progress") return totalProgressBadges;
    return 0;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border glass-card safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className="flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-2 transition-colors"
            activeClassName="text-primary"
          >
            {({ isActive }: { isActive: boolean }) => (
              <>
                <div
                  className={cn(
                    "relative rounded-xl p-2 transition-all duration-200",
                    isActive ? "bg-primary/20" : "bg-transparent"
                  )}
                >
                  <tab.icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <NotificationBadge count={getBadgeCount(tab.badgeKey)} />
                </div>
                <span
                  className={cn(
                    "text-xs font-medium transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
