import { AppLayout } from "@/components/navigation";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import { GameBadge } from "@/components/ui/game-badge";
import {
  TrendingUp,
  Clock,
  Award,
  ChevronRight,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";

const childStats = [
  { label: "Weekly Progress", value: "72%", icon: TrendingUp, color: "text-secondary" },
  { label: "Time Spent", value: "8.5h", icon: Clock, color: "text-primary" },
  { label: "Achievements", value: 8, icon: Award, color: "text-badge" },
];

const subjectProgress = [
  { name: "Physics", progress: 65, grade: "B+" },
  { name: "Chemistry", progress: 45, grade: "C" },
  { name: "Mathematics", progress: 80, grade: "A" },
  { name: "Biology", progress: 30, grade: "C-" },
];

const familyTasks = [
  { title: "Help with evening cooking", status: "completed", coins: 30 },
  { title: "Check electrical safety", status: "pending", coins: 50 },
  { title: "Create family budget", status: "in_progress", coins: 40 },
];

export default function ParentDashboard() {
  return (
    <AppLayout role="parent" title="Dashboard">
      <div className="px-4 py-6">
        {/* Welcome */}
        <div className="mb-6 slide-up">
          <h2 className="font-heading text-2xl font-bold">
            Hello, <span className="text-badge">Mr. Kumar!</span>
          </h2>
          <p className="mt-1 text-muted-foreground">
            Rahul's learning progress
          </p>
        </div>

        {/* Child Stats */}
        <div className="mb-6 grid grid-cols-3 gap-3 slide-up" style={{ animationDelay: "100ms" }}>
          {childStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-3 text-center"
            >
              <div className="mb-1 flex justify-center">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="font-heading text-lg font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* PlayCoins Summary */}
        <div 
          className="mb-6 rounded-xl bg-gradient-to-r from-accent/20 to-accent/5 p-4 border border-accent/30 slide-up"
          style={{ animationDelay: "150ms" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Earned</p>
              <p className="font-display text-2xl text-accent">1,250 🪙</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Redeemed</p>
              <p className="font-heading text-lg font-bold">₹450</p>
            </div>
          </div>
        </div>

        {/* Subject Progress */}
        <div className="mb-6 slide-up" style={{ animationDelay: "200ms" }}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-heading font-semibold">Subject Progress</h3>
            <Link to="/parent/child/progress" className="text-sm text-primary">
              Details
            </Link>
          </div>
          <div className="space-y-3">
            {subjectProgress.map((subject) => (
              <div key={subject.name} className="rounded-xl border border-border bg-card p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">{subject.name}</span>
                  <GameBadge variant="outline" size="sm">
                    {subject.grade}
                  </GameBadge>
                </div>
                <AnimatedProgress value={subject.progress} variant="default" />
              </div>
            ))}
          </div>
        </div>

        {/* Family Tasks */}
        <div className="slide-up" style={{ animationDelay: "250ms" }}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-heading font-semibold">Family Tasks</h3>
            <Link to="/parent/family/tasks" className="text-sm text-primary">
              View All
            </Link>
          </div>
          <div className="space-y-2">
            {familyTasks.map((task, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      task.status === "completed"
                        ? "bg-secondary"
                        : task.status === "in_progress"
                        ? "bg-accent"
                        : "bg-muted-foreground"
                    }`}
                  />
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-xs capitalize text-muted-foreground">
                      {task.status.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-accent">
                  +{task.coins} 🪙
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
