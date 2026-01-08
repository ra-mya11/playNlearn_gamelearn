import { useState, useEffect } from "react";
import { AppLayout } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Copy, Plus, BookOpen } from "lucide-react";

interface ClassData {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  createdAt: string;
  studentCount: number;
}

export default function TeacherClassManagementPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [newClassName, setNewClassName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = () => {
    try {
      const storedClasses = JSON.parse(localStorage.getItem('teacherClasses') || '[]');
      const teacherId = user?.id || 'teacher_001';
      const myClasses = storedClasses.filter((cls: ClassData) => cls.teacherId === teacherId);
      setClasses(myClasses);
    } catch (error) {
      console.error('Error loading classes:', error);
      setClasses([]);
    }
  };

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
      const newClass: ClassData = {
        id: `class_${Date.now()}`,
        name: newClassName.trim(),
        code: generateClassCode(),
        teacherId: teacherId,
        createdAt: new Date().toISOString(),
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

  const copyClassCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Class code copied to clipboard!');
  };

  return (
    <AppLayout role="teacher" title="Class Management">
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="slide-up">
          <h2 className="font-heading text-2xl font-bold mb-2">My Classes</h2>
          <p className="text-muted-foreground">Create and manage your classes</p>
        </div>

        {/* Create New Class */}
        <Card className="p-4 slide-up" style={{ animationDelay: "100ms" }}>
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
        <div className="space-y-4 slide-up" style={{ animationDelay: "200ms" }}>
          {classes.length > 0 ? (
            classes.map((classData, index) => (
              <Card key={classData.id} className="p-4" style={{ animationDelay: `${250 + index * 50}ms` }}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{classData.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {classData.studentCount} students
                      </span>
                      <span>Created: {new Date(classData.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Class Code</p>
                      <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-lg">
                        <span className="font-mono font-bold text-primary text-lg">{classData.code}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyClassCode(classData.code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">No classes yet</h3>
              <p className="text-muted-foreground">Create your first class to get started</p>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}