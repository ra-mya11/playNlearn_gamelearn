import { AppLayout } from "@/components/navigation";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import { GameBadge } from "@/components/ui/game-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  Clock,
  Award,
  BookOpen,
  Target,
  Calendar,
} from "lucide-react";

const subjectDetails = [
  { 
    name: "Physics", 
    progress: 65, 
    grade: "B+", 
    lessonsCompleted: 12, 
    totalLessons: 18,
    timeSpent: "4.5h",
    lastActive: "2 hours ago"
  },
  { 
    name: "Chemistry", 
    progress: 45, 
    grade: "C", 
    lessonsCompleted: 8, 
    totalLessons: 20,
    timeSpent: "3.2h",
    lastActive: "1 day ago"
  },
  { 
    name: "Mathematics", 
    progress: 80, 
    grade: "A", 
    lessonsCompleted: 16, 
    totalLessons: 20,
    timeSpent: "6.8h",
    lastActive: "30 min ago"
  },
  { 
    name: "Biology", 
    progress: 30, 
    grade: "C-", 
    lessonsCompleted: 5, 
    totalLessons: 16,
    timeSpent: "2.1h",
    lastActive: "3 days ago"
  },
  { 
    name: "Technology", 
    progress: 72, 
    grade: "B", 
    lessonsCompleted: 11, 
    totalLessons: 15,
    timeSpent: "5.5h",
    lastActive: "5 hours ago"
  },
];

const weeklyActivity = [
  { day: "Mon", hours: 1.5 },
  { day: "Tue", hours: 2.0 },
  { day: "Wed", hours: 0.5 },
  { day: "Thu", hours: 2.5 },
  { day: "Fri", hours: 1.8 },
  { day: "Sat", hours: 0.2 },
  { day: "Sun", hours: 0 },
];

const achievements = [
  { title: "Physics Master", date: "Dec 18", icon: "⚡" },
  { title: "7 Day Streak", date: "Dec 15", icon: "🔥" },
  { title: "Village Helper", date: "Dec 12", icon: "🏘️" },
  { title: "Math Wizard", date: "Dec 10", icon: "🧮" },
];

const skillAreas = [
  { skill: "Problem Solving", level: 72 },
  { skill: "Critical Thinking", level: 65 },
  { skill: "Time Management", level: 45 },
  { skill: "Collaboration", level: 80 },
];

export default function ParentChildProgressPage() {
  const totalTime = weeklyActivity.reduce((sum, day) => sum + day.hours, 0);
  const maxHours = Math.max(...weeklyActivity.map(d => d.hours));

  return (
    <AppLayout role="parent" title="Child Progress">
      <div className="px-4 py-6">
        {/* Header */}
        <div className="mb-6 slide-up">
          <h2 className="font-heading text-2xl font-bold">Rahul's Progress</h2>
          <p className="text-muted-foreground">Detailed learning analytics</p>
        </div>

        {/* Overview Stats */}
        <div className="mb-6 grid grid-cols-3 gap-3 slide-up" style={{ animationDelay: "100ms" }}>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <TrendingUp className="mx-auto mb-1 h-5 w-5 text-secondary" />
            <p className="font-heading text-lg font-bold">72%</p>
            <p className="text-xs text-muted-foreground">Overall</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <Clock className="mx-auto mb-1 h-5 w-5 text-primary" />
            <p className="font-heading text-lg font-bold">{totalTime.toFixed(1)}h</p>
            <p className="text-xs text-muted-foreground">This Week</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <Award className="mx-auto mb-1 h-5 w-5 text-accent" />
            <p className="font-heading text-lg font-bold">12</p>
            <p className="text-xs text-muted-foreground">Badges</p>
          </div>
        </div>

        <Tabs defaultValue="subjects" className="slide-up" style={{ animationDelay: "150ms" }}>
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="subjects" className="flex-1">Subjects</TabsTrigger>
            <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
            <TabsTrigger value="skills" className="flex-1">Skills</TabsTrigger>
          </TabsList>

          <TabsContent value="subjects" className="space-y-3">
            {subjectDetails.map((subject) => (
              <div
                key={subject.name}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h4 className="font-heading font-semibold">{subject.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {subject.lessonsCompleted}/{subject.totalLessons} lessons
                    </p>
                  </div>
                  <GameBadge 
                    variant={subject.progress >= 70 ? "secondary" : subject.progress >= 50 ? "accent" : "outline"} 
                    size="sm"
                  >
                    {subject.grade}
                  </GameBadge>
                </div>

                <AnimatedProgress value={subject.progress} className="mb-3" />

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {subject.timeSpent}
                  </span>
                  <span>Last active: {subject.lastActive}</span>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="activity">
            {/* Weekly Chart */}
            <div className="mb-6 rounded-xl border border-border bg-card p-4">
              <h4 className="mb-4 font-heading font-semibold">Weekly Activity</h4>
              <div className="flex items-end justify-between gap-2 h-[120px]">
                {weeklyActivity.map((day) => (
                  <div key={day.day} className="flex flex-1 flex-col items-center gap-1">
                    <div 
                      className="w-full rounded-t bg-primary transition-all"
                      style={{ 
                        height: `${maxHours > 0 ? (day.hours / maxHours) * 100 : 0}%`,
                        minHeight: day.hours > 0 ? '8px' : '0'
                      }}
                    />
                    <span className="text-xs text-muted-foreground">{day.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h4 className="mb-3 font-heading font-semibold">Recent Achievements</h4>
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg bg-muted/50 p-3"
                  >
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium">{achievement.title}</p>
                      <p className="text-xs text-muted-foreground">{achievement.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="skills">
            <div className="rounded-xl border border-border bg-card p-4">
              <h4 className="mb-4 font-heading font-semibold">Skill Development</h4>
              <div className="space-y-4">
                {skillAreas.map((skill) => (
                  <div key={skill.skill}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{skill.skill}</span>
                      <span className="font-medium">{skill.level}%</span>
                    </div>
                    <AnimatedProgress 
                      value={skill.level} 
                      variant={skill.level >= 70 ? "success" : "default"}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <Target className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-heading font-semibold">Areas for Improvement</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Time management skills need attention. Consider encouraging regular study schedules.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
