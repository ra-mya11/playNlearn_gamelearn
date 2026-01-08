import { AppLayout } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function TeacherClassDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentClass, setCurrentClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", email: "" });

  useEffect(() => {
    if (id && user?.id) {
      loadClassData();
    }
  }, [id, user?.id]);

  const loadClassData = async () => {
    try {
      // Load class from localStorage
      const teacherId = user?.id || 'teacher_001';
      const storedClasses = JSON.parse(localStorage.getItem('teacherClasses') || '[]');
      const classData = storedClasses.find(cls => cls.id === id && cls.teacherId === teacherId);
      
      if (!classData) {
        console.error('Class not found');
        setCurrentClass(null);
      } else {
        setCurrentClass(classData);
      }

      // Load enrolled students from classEnrollments
      const classEnrollments = JSON.parse(localStorage.getItem('classEnrollments') || '{}');
      const enrolledStudents = classEnrollments[id] || [];
      console.log('Enrolled students for class:', id, enrolledStudents);
      setStudents(enrolledStudents);
    } catch (error) {
      console.error('Error loading class data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async () => {
    if (!newStudent.name.trim()) {
      toast.error("Please enter student name");
      return;
    }

    try {
      const studentId = `student_${Date.now()}`;
      
      const student = {
        id: studentId,
        name: newStudent.name.trim(),
        email: newStudent.email.trim(),
        progress: Math.floor(Math.random() * 100), // Random progress for demo
        coins: Math.floor(Math.random() * 200),
        lastActive: 'Just added',
        avatar: newStudent.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      };

      // Save to localStorage for now
      const savedStudents = JSON.parse(localStorage.getItem('classStudents') || '{}');
      const updatedStudents = {
        ...savedStudents,
        [id]: [...(savedStudents[id] || []), student]
      };
      localStorage.setItem('classStudents', JSON.stringify(updatedStudents));

      setStudents([...students, student]);
      setNewStudent({ name: "", email: "" });
      setShowAddStudent(false);
      toast.success(`${student.name} added to class!`);
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Failed to add student. Please try again.');
    }
  };

  if (loading) {
    return (
      <AppLayout role="teacher" title="Loading...">
        <div className="px-4 py-6">
          <p>Loading class details...</p>
        </div>
      </AppLayout>
    );
  }

  if (!currentClass) {
    return (
      <AppLayout role="teacher" title="Class Not Found">
        <div className="px-4 py-6">
          <div className="text-center py-8">
            <Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-xl mb-2">Class Not Found</h3>
            <p className="text-muted-foreground mb-6">The class you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/teacher/classes')}>
              Back to Classes
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout role="teacher" title={currentClass.name}>
      <div className="px-4 py-6">
        <div className="mb-4">
          <h2 className="font-heading text-2xl font-bold">{currentClass.name}</h2>
          <p className="text-muted-foreground">Class Code: {currentClass.code} • Created: {new Date(currentClass.created_at).toLocaleDateString()}</p>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">Enrolled Students ({students.length})</h3>
          <p className="text-sm text-muted-foreground">Students join this class using the class code: <span className="font-mono font-bold text-primary">{currentClass.code}</span></p>
          {students.length > 0 ? (
            students.map((student) => (
              <div key={student.studentId} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-heading font-bold text-primary text-sm">
                  {student.studentName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{student.studentName}</p>
                  <p className="text-sm text-muted-foreground">{student.studentEmail}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>{student.progress || 0}% progress</span>
                    <span>•</span>
                    <span>Joined: {new Date(student.joinedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No Students Yet</h3>
              <p className="text-muted-foreground">Students will appear here when they join using the class code: <span className="font-mono font-bold text-primary">{currentClass.code}</span></p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}