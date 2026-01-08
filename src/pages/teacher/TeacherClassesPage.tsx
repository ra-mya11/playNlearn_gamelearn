import { AppLayout } from "@/components/navigation";
import { GameCard } from "@/components/ui/game-card";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import { GameBadge } from "@/components/ui/game-badge";
import { Users, TrendingUp, Plus, Copy, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// No default classes - start completely empty

export default function TeacherClassesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newClassName, setNewClassName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadClasses();
    
    // Listen for storage changes to refresh when students join
    const handleStorageChange = (event) => {
      if (event.key === 'classEnrollments' || event.key === 'teacherClasses') {
        console.log('Storage changed, reloading classes');
        loadClasses();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      loadClasses();
    }, 5000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const generateClassCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createClass = async () => {
    if (!newClassName.trim()) {
      toast.error('Please enter a class name');
      return;
    }

    setIsCreating(true);
    try {
      const teacherId = user?.id || 'teacher_001';
      const newClass = {
        id: `class_${Date.now()}`,
        name: newClassName.trim(),
        code: generateClassCode(),
        teacherId: teacherId,
        created_at: new Date().toISOString(),
        studentCount: 0
      };

      const storedClasses = JSON.parse(localStorage.getItem('teacherClasses') || '[]');
      storedClasses.push(newClass);
      localStorage.setItem('teacherClasses', JSON.stringify(storedClasses));

      setClasses(prev => [...prev, newClass]);
      setNewClassName("");
      toast.success(`Class "${newClass.name}" created with code: ${newClass.code}`);
    } catch (error) {
      console.error('Error creating class:', error);
      toast.error('Failed to create class');
    } finally {
      setIsCreating(false);
    }
  };

  const copyClassCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Class code copied to clipboard!');
  };

  const deleteClass = (classId) => {
    try {
      const teacherId = user?.id || 'teacher_001';
      const storedClasses = JSON.parse(localStorage.getItem('teacherClasses') || '[]');
      const updatedClasses = storedClasses.filter(cls => cls.id !== classId);
      localStorage.setItem('teacherClasses', JSON.stringify(updatedClasses));
      
      // Also remove from enrollments
      const classEnrollments = JSON.parse(localStorage.getItem('classEnrollments') || '{}');
      delete classEnrollments[classId];
      localStorage.setItem('classEnrollments', JSON.stringify(classEnrollments));
      
      setClasses(prev => prev.filter(cls => cls.id !== classId));
      toast.success('Class deleted successfully');
    } catch (error) {
      console.error('Error deleting class:', error);
      toast.error('Failed to delete class');
    }
  };

  const loadClasses = async () => {
    try {
      const teacherId = user?.id || 'teacher_001';
      const storedClasses = JSON.parse(localStorage.getItem('teacherClasses') || '[]');
      const myClasses = storedClasses.filter((cls) => cls.teacherId === teacherId);
      console.log('Teacher classes loaded:', myClasses);
      
      // Debug: Check class enrollments
      const classEnrollments = JSON.parse(localStorage.getItem('classEnrollments') || '{}');
      console.log('Class enrollments:', classEnrollments);
      
      setClasses(myClasses);
    } catch (error) {
      console.error('Error loading classes:', error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate class-specific data from localStorage
  const getClassData = (cls) => {
    const classEnrollments = JSON.parse(localStorage.getItem('classEnrollments') || '{}');
    const enrolledStudents = classEnrollments[cls.id] || [];
    
    const studentCount = enrolledStudents.length;
    const avgProgress = studentCount > 0 
      ? Math.round(enrolledStudents.reduce((sum, student) => sum + (student.progress || 0), 0) / studentCount)
      : 0;
    
    const topPerformer = enrolledStudents.length > 0
      ? enrolledStudents.reduce((top, student) => 
          (student.progress || 0) > (top.progress || 0) ? student : top
        ).studentName
      : "No students yet";

    return { studentCount, avgProgress, topPerformer, enrolledStudents };
  };

  return (
    <AppLayout role="teacher" title="My Classes">
      <div className="px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between slide-up">
          <div>
            <h2 className="font-heading text-2xl font-bold">My Classes</h2>
            <p className="text-muted-foreground">Manage your students</p>
          </div>
          <Button onClick={loadClasses} variant="outline" size="sm">
            Refresh
          </Button>
        </div>

        {/* Create New Class */}
        <Card className="p-4 mb-6 slide-up" style={{ animationDelay: "50ms" }}>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Class
          </h3>
          <div className="flex gap-2">
            <Input
              placeholder="Enter class name (e.g., Grade 10 Mathematics)"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createClass()}
            />
            <Button onClick={createClass} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Class'}
            </Button>
          </div>
        </Card>

        {/* Classes List */}
        <div className="space-y-4 slide-up" style={{ animationDelay: "100ms" }}>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading classes...</p>
            </div>
          ) : classes.length > 0 ? (
            classes.map((cls: any) => {
              const classData = getClassData(cls);
              return (
                <div
                  key={cls.id}
                  className="block rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                  onClick={() => navigate(`/teacher/class/${cls.id}`)}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-heading font-semibold">{cls.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {classData.studentCount} students • Created: {new Date(cls.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Class Code</p>
                        <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-lg">
                          <span className="font-mono font-bold text-primary text-lg">{cls.code}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyClassCode(cls.code)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteClass(cls.id);
                        }}
                        title="Delete Class"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg Progress</span>
                      <span className="font-medium">{classData.avgProgress}%</span>
                    </div>
                    <AnimatedProgress value={classData.avgProgress} />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Top performer:</span>
                    <span className="font-medium text-secondary">{classData.topPerformer}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-xl mb-2">No Classes Yet</h3>
              <p className="text-muted-foreground mb-6">Create your first class to start managing students</p>
              <Button onClick={() => navigate('/teacher/classes/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Class
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
