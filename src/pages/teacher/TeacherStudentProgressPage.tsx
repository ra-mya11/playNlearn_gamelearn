/**
 * TEACHER STUDENT PROGRESS PAGE
 * Card-based student progress monitoring
 * Shows learning streaks, subject progress, strengths and support needed
 */

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/navigation";
import { StudentCard } from "@/components/teacher/StudentCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  TrendingUp,
  Target,
  AlertCircle,
  BookOpen,
  Gift,
  Zap,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Student {
  id: string;
  name: string;
  avatar: string;
  class: string;
  learningStreak: number;
  lastActive: string;
  subjects: {
    name: string;
    progress: number;
    color: string;
  }[];
  strengthAreas: string[];
  supportNeeded: string[];
  completedTasks: number;
  earnedCoins: number;
}

export default function TeacherStudentProgressPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "streak" | "progress">("name");

  useEffect(() => {
    if (user?.id) {
      loadStudentData();
    }
  }, [user?.id]);

  const loadStudentData = async () => {
    try {
      // Get teacher's classes from localStorage
      const teacherId = user?.id || 'teacher_001';
      const teacherClasses = JSON.parse(localStorage.getItem('teacherClasses') || '[]');
      const myClasses = teacherClasses.filter((cls) => cls.teacherId === teacherId);
      
      // Get class enrollments
      const classEnrollments = JSON.parse(localStorage.getItem('classEnrollments') || '{}');
      
      // Define subjects (same as in assignment creation)
      const subjects = [
        { value: "mathematics", label: "Mathematics", color: "bg-primary" },
        { value: "physics", label: "Physics", color: "bg-secondary" },
        { value: "chemistry", label: "Chemistry", color: "bg-accent" },
        { value: "biology", label: "Biology", color: "bg-badge" },
        { value: "technology", label: "Technology", color: "bg-primary" },
        { value: "finance", label: "Finance", color: "bg-secondary" },
        { value: "entrepreneurship", label: "Entrepreneurship", color: "bg-accent" },
        { value: "village-skills", label: "Village Skills", color: "bg-badge" }
      ];
      
      const allStudents: Student[] = [];
      const uniqueStudents = new Map();

      myClasses.forEach(cls => {
        const enrolledStudents = classEnrollments[cls.id] || [];
        
        enrolledStudents.forEach((student: any) => {
          const studentKey = `${student.studentName}-${student.studentEmail}`;
          
          // Only add unique students
          if (!uniqueStudents.has(studentKey)) {
            const progress = student.progress || 0;
            const studentData: Student = {
              id: student.studentId || `student_${Date.now()}_${Math.random()}`,
              name: student.studentName,
              avatar: student.studentName.charAt(0).toUpperCase(),
              class: cls.name,
              learningStreak: Math.floor(progress / 10),
              lastActive: new Date(student.joinedAt).toLocaleDateString() === new Date().toLocaleDateString() ? 'Today' : new Date(student.joinedAt).toLocaleDateString(),
              subjects: subjects.map((subject, index) => ({
                name: subject.label,
                progress: Math.max(0, progress - (index * 5)), // Vary progress slightly per subject
                color: subject.color,
              })),
              strengthAreas: progress > 70 ? ["Strong performance", "Consistent effort"] : progress > 40 ? ["Developing skills"] : [],
              supportNeeded: progress < 50 ? ["Additional practice", "Concept reinforcement"] : [],
              completedTasks: Math.floor(progress / 5),
              earnedCoins: Math.floor(progress * 2),
            };
            
            uniqueStudents.set(studentKey, studentData);
            allStudents.push(studentData);
          }
        });
      });

      setStudents(allStudents);
    } catch (error) {
      console.error('Error loading student data:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  const sortedStudents = [...students].sort((a, b) => {
    switch (sortBy) {
      case "streak":
        return b.learningStreak - a.learningStreak;
      case "progress":
        const avgA = a.subjects.reduce((sum, s) => sum + s.progress, 0) / a.subjects.length;
        const avgB = b.subjects.reduce((sum, s) => sum + s.progress, 0) / b.subjects.length;
        return avgB - avgA;
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const needsSupport = students.filter((s) => {
    const avg = s.subjects.reduce((sum, sub) => sum + sub.progress, 0) / s.subjects.length;
    return avg < 60;
  });

  return (
    <AppLayout role="teacher" title={t("teacher.studentProgress", { defaultValue: "Student Progress" })}>
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="slide-up space-y-2">
          <h2 className="font-heading text-2xl font-bold text-foreground">
            {t("teacher.studentProgress", { defaultValue: "Student Progress" })}
          </h2>
          <p className="text-muted-foreground">
            {t("teacher.monitorLearning", {
              defaultValue: "Monitor learning and provide support where needed",
            })}
          </p>
        </div>

        {/* Overview Stats */}
        <div className="slide-up grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ animationDelay: "50ms" }}>
          <Card className="border-border/50 bg-card/40 p-4 backdrop-blur-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  {t("teacher.totalStudents", { defaultValue: "Total Students" })}
                </p>
                <p className="text-3xl font-heading font-bold text-foreground">
                  {students.length}
                </p>
              </div>
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
          </Card>

          <Card className="border-border/50 bg-card/40 p-4 backdrop-blur-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  {t("teacher.needsSupport", { defaultValue: "Need Support" })}
                </p>
                <p className="text-3xl font-heading font-bold text-destructive">
                  {needsSupport.length}
                </p>
              </div>
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
          </Card>
        </div>

        {/* Sort Buttons */}
        <div className="slide-up flex gap-2" style={{ animationDelay: "100ms" }}>
          {[
            { value: "name", label: t("teacher.byName", { defaultValue: "By Name" }) },
            { value: "streak", label: t("teacher.byStreak", { defaultValue: "By Streak" }) },
            { value: "progress", label: t("teacher.byProgress", { defaultValue: "By Progress" }) },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value as typeof sortBy)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                sortBy === option.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Students Grid */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading student data...</p>
          </div>
        ) : students.length > 0 ? (
          <div
            className="slide-up grid grid-cols-1 md:grid-cols-2 gap-4"
            style={{ animationDelay: "150ms" }}
          >
            {sortedStudents.map((student) => (
              <StudentCard
                key={student.id}
                {...student}
                onClick={() => handleViewStudent(student)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-xl mb-2">No Students Found</h3>
            <p className="text-muted-foreground mb-6">Add students to your classes to see their progress here.</p>
          </div>
        )}

        {/* Detail Modal */}
        {selectedStudent && (
          <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 font-heading font-bold text-primary text-lg">
                      {selectedStudent.avatar}
                    </div>
                    <div>
                      <DialogTitle className="text-2xl">
                        {selectedStudent.name}
                      </DialogTitle>
                      <DialogDescription className="text-sm">
                        {selectedStudent.class}
                      </DialogDescription>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="progress" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="progress">
                    {t("teacher.progress", { defaultValue: "Progress" })}
                  </TabsTrigger>
                  <TabsTrigger value="strengths">
                    {t("teacher.strengths", { defaultValue: "Strengths" })}
                  </TabsTrigger>
                  <TabsTrigger value="support">
                    {t("teacher.support", { defaultValue: "Support" })}
                  </TabsTrigger>
                  <TabsTrigger value="activity">
                    {t("teacher.activity", { defaultValue: "Activity" })}
                  </TabsTrigger>
                </TabsList>

                {/* Progress Tab */}
                <TabsContent value="progress" className="space-y-4">
                  <div className="space-y-3">
                    {selectedStudent.subjects.map((subject) => (
                      <div key={subject.name} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{subject.name}</span>
                          <span className="font-bold text-primary">
                            {subject.progress}%
                          </span>
                        </div>
                        <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${subject.color}`}
                            style={{ width: `${subject.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Strengths Tab */}
                <TabsContent value="strengths" className="space-y-3">
                  {selectedStudent.strengthAreas.length > 0 ? (
                    selectedStudent.strengthAreas.map((area, index) => (
                      <Card
                        key={index}
                        className="border-secondary/30 bg-secondary/5 p-4 backdrop-blur-sm flex items-start gap-3"
                      >
                        <Zap className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">{area}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t("teacher.studentShows", {
                              defaultValue: "Student demonstrates strong skills here",
                            })}
                          </p>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      {t("teacher.noStrengths", {
                        defaultValue: "Continue encouraging all areas",
                      })}
                    </p>
                  )}
                </TabsContent>

                {/* Support Needed Tab */}
                <TabsContent value="support" className="space-y-3">
                  {selectedStudent.supportNeeded.length > 0 ? (
                    selectedStudent.supportNeeded.map((area, index) => (
                      <Card
                        key={index}
                        className="border-accent/30 bg-accent/5 p-4 backdrop-blur-sm flex items-start gap-3"
                      >
                        <AlertCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">{area}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t("teacher.provideSupportHint", {
                              defaultValue: "Consider providing extra support in this area",
                            })}
                          </p>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <p className="text-secondary text-sm font-medium">
                      ✓ {t("teacher.noSupportNeeded", {
                        defaultValue: "Student is progressing well in all areas",
                      })}
                    </p>
                  )}
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="space-y-3">
                  <Card className="border-border/50 bg-card/40 p-4 backdrop-blur-sm">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {t("teacher.completedTasks", {
                            defaultValue: "Completed Tasks",
                          })}
                        </span>
                        <span className="text-2xl font-heading font-bold text-primary">
                          {selectedStudent.completedTasks}
                        </span>
                      </div>
                      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${Math.min(
                              (selectedStudent.completedTasks / 40) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </Card>

                  <Card className="border-border/50 bg-card/40 p-4 backdrop-blur-sm">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {t("teacher.earnedCoins", {
                            defaultValue: "Earned EduCoins",
                          })}
                        </span>
                        <span className="text-2xl font-heading font-bold text-accent">
                          {selectedStudent.earnedCoins}
                        </span>
                      </div>
                    </div>
                  </Card>

                  <Card className="border-border/50 bg-card/40 p-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {t("teacher.lastActive", { defaultValue: "Last Active" })}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {selectedStudent.lastActive}
                      </span>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppLayout>
  );
}
