import { AppLayout } from "@/components/navigation";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import { GameBadge } from "@/components/ui/game-badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Star, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface SubjectLayoutProps {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  xpEarned: number;
  children: ReactNode;
}

export function SubjectLayout({
  title,
  icon: Icon,
  iconColor,
  progress,
  totalLessons,
  completedLessons,
  xpEarned,
  children,
}: SubjectLayoutProps) {
  const navigate = useNavigate();

  return (
    <AppLayout role="student" userName="Rahul" playCoins={1250} title={title}>
      <div className="px-4 py-6">
        {/* Subject Header */}
        <div className="mb-6 slide-up">
          <Button
            variant="ghost"
            size="sm"
            className="mb-3 -ml-2"
            onClick={() => navigate("/student/subjects")}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Subjects
          </Button>

          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
            <div className={`rounded-xl bg-primary/10 p-3 ${iconColor}`}>
              <Icon className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h2 className="font-heading text-xl font-bold">{title}</h2>
              <div className="mt-2 flex items-center gap-2">
                <AnimatedProgress value={progress} className="flex-1" />
                <span className="text-sm font-medium">{progress}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-6 grid grid-cols-3 gap-3 slide-up" style={{ animationDelay: "100ms" }}>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <Trophy className="mx-auto mb-1 h-5 w-5 text-badge" />
            <p className="font-heading text-lg font-bold">{completedLessons}/{totalLessons}</p>
            <p className="text-xs text-muted-foreground">Lessons</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <Star className="mx-auto mb-1 h-5 w-5 text-accent" />
            <p className="font-heading text-lg font-bold">{xpEarned}</p>
            <p className="text-xs text-muted-foreground">XP Earned</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <Clock className="mx-auto mb-1 h-5 w-5 text-primary" />
            <p className="font-heading text-lg font-bold">4.2h</p>
            <p className="text-xs text-muted-foreground">Time Spent</p>
          </div>
        </div>

        {children}
      </div>
    </AppLayout>
  );
}
