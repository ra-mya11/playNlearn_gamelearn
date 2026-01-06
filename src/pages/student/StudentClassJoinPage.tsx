import { useState, useEffect } from "react";
import { AppLayout } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Users, BookOpen, UserPlus, Check } from "lucide-react";

interface JoinedClass {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  joinedAt: string;
}

export default function StudentClassJoinPage() {
  const { user } = useAuth();
  const [joinedClasses, setJoinedClasses] = useState<JoinedClass[]>([]);
  const [classCode, setClassCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    loadJoinedClasses();
  }, []);

  const loadJoinedClasses = () => {
    try {
      const studentId = user?.id || 'student_001';
      const storedClasses = JSON.parse(localStorage.getItem(`studentClasses_${studentId}`) || '[]');
      setJoinedClasses(storedClasses);
    } catch (error) {
      console.error('Error loading joined classes:', error);
      setJoinedClasses([]);
    }
  };

  const joinClass = async () => {
    if (!classCode.trim()) {
      toast.error('Please enter a class code');
      return;
    }

    setIsJoining(true);
    try {
      // Find the class in teacher classes
      const allTeacherClasses = JSON.parse(localStorage.getItem('teacherClasses') || '[]');
      const targetClass = allTeacherClasses.find((cls: any) => cls.code.toUpperCase() === classCode.toUpperCase());

      if (!targetClass) {
        toast.error('Invalid class code. Please check and try again.');
        setIsJoining(false);
        return;
      }

      // Check if already joined
      const alreadyJoined = joinedClasses.some(cls => cls.code === targetClass.code);
      if (alreadyJoined) {
        toast.error('You have already joined this class');
        setIsJoining(false);
        return;
      }

      // Add student to class
      const studentId = user?.id || 'student_001';
      const studentName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';
      
      const joinedClass: JoinedClass = {
        id: targetClass.id,
        name: targetClass.name,
        code: targetClass.code,
        teacherId: targetClass.teacherId,
        joinedAt: new Date().toISOString()
      };

      // Save to student's joined classes
      const updatedClasses = [...joinedClasses, joinedClass];
      localStorage.setItem(`studentClasses_${studentId}`, JSON.stringify(updatedClasses));

      // Update student count in teacher's class
      targetClass.studentCount = (targetClass.studentCount || 0) + 1;
      localStorage.setItem('teacherClasses', JSON.stringify(allTeacherClasses));

      setJoinedClasses(updatedClasses);
      setClassCode("");
      toast.success(`Successfully joined "${targetClass.name}"!`);
    } catch (error) {
      console.error('Error joining class:', error);
      toast.error('Failed to join class');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <AppLayout role="student" title="My Classes">
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="slide-up">
          <h2 className="font-heading text-2xl font-bold mb-2">My Classes</h2>
          <p className="text-muted-foreground">Join classes using class codes from your teachers</p>
        </div>

        {/* Join New Class */}
        <Card className="p-4 slide-up" style={{ animationDelay: "100ms" }}>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Join a Class
          </h3>
          <div className="flex gap-2">
            <Input
              placeholder="Enter class code (e.g., ABC123)"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && joinClass()}
              maxLength={6}
            />
            <Button onClick={joinClass} disabled={isJoining}>
              {isJoining ? 'Joining...' : 'Join Class'}
            </Button>
          </div>
        </Card>

        {/* Joined Classes */}
        <div className="space-y-4 slide-up" style={{ animationDelay: "200ms" }}>
          <h3 className="font-semibold">Joined Classes</h3>
          {joinedClasses.length > 0 ? (
            joinedClasses.map((classData, index) => (
              <Card key={classData.id} className="p-4" style={{ animationDelay: `${250 + index * 50}ms` }}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{classData.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Class Code: {classData.code}
                      </span>
                      <span>Joined: {new Date(classData.joinedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="h-5 w-5" />
                    <span className="font-medium">Joined</span>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">No classes joined yet</h3>
              <p className="text-muted-foreground">Ask your teacher for a class code to get started</p>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}