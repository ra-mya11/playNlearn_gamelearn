import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import {
  BookOpen,
  Clock,
  Coins,
  TrendingUp,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { usePlayCoins } from "@/hooks/use-playcoins";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function TasksPage() {
  const { t } = useTranslation();
  const { wallet } = usePlayCoins();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [submittedAssignments, setSubmittedAssignments] = useState(new Set());
  const [submissionStatuses, setSubmissionStatuses] = useState(new Map());

  const [joinedClasses, setJoinedClasses] = useState([]);
  const [classCode, setClassCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const joinClass = async () => {
    if (!classCode.trim()) {
      toast.error('Please enter a class code');
      return;
    }

    setIsJoining(true);
    try {
      const allTeacherClasses = JSON.parse(localStorage.getItem('teacherClasses') || '[]');
      const targetClass = allTeacherClasses.find((cls) => cls.code.toUpperCase() === classCode.toUpperCase());

      if (!targetClass) {
        toast.error('Invalid class code. Please check and try again.');
        setIsJoining(false);
        return;
      }

      const alreadyJoined = joinedClasses.some(cls => cls.code === targetClass.code);
      if (alreadyJoined) {
        toast.error('You have already joined this class');
        setIsJoining(false);
        return;
      }

      const studentId = user?.id || 'student_001';
      const studentName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';
      const studentEmail = user?.email || 'student@example.com';
      
      const joinedClass = {
        id: targetClass.id,
        name: targetClass.name,
        code: targetClass.code,
        teacherId: targetClass.teacherId,
        joinedAt: new Date().toISOString()
      };

      const updatedClasses = [...joinedClasses, joinedClass];
      localStorage.setItem(`studentClasses_${studentId}`, JSON.stringify(updatedClasses));

      // Add student to class enrollment list
      const classEnrollments = JSON.parse(localStorage.getItem('classEnrollments') || '{}');
      console.log('Before adding student - classEnrollments:', classEnrollments);
      
      if (!classEnrollments[targetClass.id]) {
        classEnrollments[targetClass.id] = [];
      }
      
      const studentData = {
        studentId: studentId,
        studentName: studentName,
        studentEmail: studentEmail,
        joinedAt: new Date().toISOString(),
        progress: 0
      };
      
      classEnrollments[targetClass.id].push(studentData);
      console.log('After adding student - classEnrollments:', classEnrollments);
      console.log('Student data added:', studentData);
      
      localStorage.setItem('classEnrollments', JSON.stringify(classEnrollments));
      console.log('Saved to localStorage - classEnrollments key');

      targetClass.studentCount = (targetClass.studentCount || 0) + 1;
      localStorage.setItem('teacherClasses', JSON.stringify(allTeacherClasses));

      setJoinedClasses(updatedClasses);
      setClassCode("");
      toast.success(`Successfully joined "${targetClass.name}"!`);
      loadAssignments();
    } catch (error) {
      console.error('Error joining class:', error);
      toast.error('Failed to join class');
    } finally {
      setIsJoining(false);
    }
  };

  const leaveClass = async (classId, className) => {
    try {
      const studentId = user?.id || 'student_001';
      
      const updatedClasses = joinedClasses.filter(cls => cls.id !== classId);
      localStorage.setItem(`studentClasses_${studentId}`, JSON.stringify(updatedClasses));
      
      const classEnrollments = JSON.parse(localStorage.getItem('classEnrollments') || '{}');
      if (classEnrollments[classId]) {
        classEnrollments[classId] = classEnrollments[classId].filter(
          student => student.studentId !== studentId
        );
        localStorage.setItem('classEnrollments', JSON.stringify(classEnrollments));
      }
      
      const allTeacherClasses = JSON.parse(localStorage.getItem('teacherClasses') || '[]');
      const targetClass = allTeacherClasses.find(cls => cls.id === classId);
      if (targetClass) {
        targetClass.studentCount = Math.max(0, (targetClass.studentCount || 1) - 1);
        localStorage.setItem('teacherClasses', JSON.stringify(allTeacherClasses));
      }
      
      setJoinedClasses(updatedClasses);
      toast.success(`Left "${className}" successfully`);
      loadAssignments();
    } catch (error) {
      console.error('Error leaving class:', error);
      toast.error('Failed to leave class');
    }
  };

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

  useEffect(() => {
    loadJoinedClasses();
    loadAssignments();

    // Listen for storage changes (cross-tab communication)
    const handleStorageChange = (event: StorageEvent) => {
      console.log('Storage event received:', event.key, event.newValue);
      if (event.key === 'playnlearn_assignments') {
        console.log('Assignments storage changed, reloading...');
        loadAssignments();
      }
    };

    // Listen for custom events (same-tab communication)
    const handleCustomEvent = (event: any) => {
      console.log('Custom assignment event received:', event.detail);
      loadAssignments();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('assignmentCreated', handleCustomEvent);

    // Auto-refresh assignments when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page became visible, refreshing assignments...');
        loadAssignments();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also refresh every 5 seconds
    const interval = setInterval(() => {
      console.log('Auto-refresh triggered');
      loadAssignments();
    }, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('assignmentCreated', handleCustomEvent);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  const loadAssignments = async () => {
    try {
      console.log('Loading assignments from joined classes...');
      
      // Get student's joined classes
      const studentId = user?.id || 'student_001';
      const joinedClasses = JSON.parse(localStorage.getItem(`studentClasses_${studentId}`) || '[]');
      console.log('Student joined classes:', joinedClasses);
      
      if (joinedClasses.length === 0) {
        console.log('No classes joined');
        setAssignments([]);
        setLoadingAssignments(false);
        return;
      }
      
      // Load assignments from all joined classes
      let allAssignments: any[] = [];
      joinedClasses.forEach((cls: any) => {
        const classAssignments = JSON.parse(localStorage.getItem(`class_assignments_${cls.id}`) || '[]');
        console.log(`Assignments for class ${cls.name}:`, classAssignments);
        // Add class info to each assignment
        const assignmentsWithClassInfo = classAssignments.map((assignment: any) => ({
          ...assignment,
          className: cls.name,
          classCode: cls.code
        }));
        allAssignments = [...allAssignments, ...assignmentsWithClassInfo];
      });
      
      console.log('All assignments from joined classes:', allAssignments);
      setAssignments(allAssignments);
      
      // Load submissions from localStorage only - filter by current student
      const submissions = JSON.parse(localStorage.getItem('taskSubmissions') || '[]');
      const currentStudentName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';
      
      // Filter submissions to only show current student's submissions
      const mySubmissions = submissions.filter((sub: any) => sub.studentName === currentStudentName);
      console.log('All submissions:', submissions.length);
      console.log('My submissions:', mySubmissions.length, 'for student:', currentStudentName);
      
      const submittedIds = new Set(mySubmissions.map((sub: any) => sub.assignmentId));
      const statusMap = new Map();
      mySubmissions.forEach((sub: any) => {
        statusMap.set(sub.assignmentId, sub.status);
      });
      
      console.log('My submitted assignment IDs:', Array.from(submittedIds));
      console.log('My status map:', Array.from(statusMap.entries()));
      
      setSubmittedAssignments(submittedIds);
      setSubmissionStatuses(statusMap);
    } catch (error) {
      console.error('Error loading assignments:', error);
      setAssignments([]);
    } finally {
      setLoadingAssignments(false);
    }
  };

  return (
    <AppLayout role="student" playCoins={wallet?.balance || 0} title="Tasks">
      <div className="px-4 py-6 pb-24 space-y-6">
        {/* Join Class Section */}
        <div className="slide-up space-y-4" style={{ animationDelay: "50ms" }}>
          <Card className="glass-card border border-border p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Join a Class
            </h3>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Enter class code (e.g., ABC123)"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && joinClass()}
                maxLength={6}
              />
              <Button onClick={joinClass} disabled={isJoining}>
                {isJoining ? 'Joining...' : 'Join'}
              </Button>
            </div>
            {joinedClasses.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Joined Classes:</p>
                <div className="flex flex-wrap gap-2">
                  {joinedClasses.map((cls) => (
                    <div key={cls.id} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                      <Users className="h-3 w-3" />
                      <span>{cls.name} ({cls.code})</span>
                      <button
                        onClick={() => leaveClass(cls.id, cls.name)}
                        className="ml-1 hover:bg-red-100 rounded p-0.5"
                        title="Leave class"
                      >
                        <X className="h-3 w-3 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* HEADER */}
        <div className="slide-up space-y-4">
          <div className="glass-card rounded-2xl p-5 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-2xl font-bold text-foreground">Your Tasks</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Complete assignments from your teachers to earn rewards
            </p>
          </div>
        </div>



        {/* ASSIGNMENTS FROM TEACHERS */}
        <div className="slide-up space-y-3" style={{ animationDelay: "75ms" }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground px-1">Teacher Assignments</p>
            <Button onClick={() => {
              console.log('=== REFRESH ASSIGNMENTS DEBUG ===');
              console.log('Raw localStorage assignments:', localStorage.getItem('playnlearn_assignments'));
              const stored = localStorage.getItem('playnlearn_assignments');
              if (stored) {
                const parsed = JSON.parse(stored);
                console.log('Parsed assignments:', parsed);
                console.log('Number of assignments:', parsed.length);
                parsed.forEach((a: any, i: number) => {
                  console.log(`Assignment ${i}:`, {
                    id: a.id,
                    title: a.title,
                    is_active: a.is_active,
                    created_at: a.created_at
                  });
                });
              }
              loadAssignments();
              toast.success('Assignments refreshed!');
            }} variant="outline" size="sm">
              Refresh
            </Button>
          </div>
          <div className="space-y-3">
            {loadingAssignments ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading assignments...</p>
              </div>
            ) : assignments.length > 0 ? (
              assignments.map((assignment: any, index: number) => (
                <Card key={assignment.id} className="glass-card border border-border p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-heading font-semibold text-foreground">{assignment.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{assignment.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {assignment.subject}
                          </span>
                          <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded">
                            {assignment.className} ({assignment.classCode})
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            30 min
                          </span>
                          {assignment.due_date && (
                            <span className="text-xs text-muted-foreground">
                              Due: {new Date(assignment.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-sm font-semibold text-accent">
                          <Coins className="h-4 w-4" />
                          50
                        </div>
                        <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                          <TrendingUp className="h-4 w-4" />
                          100 XP
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Display */}
                    {submittedAssignments.has(assignment.id) && (
                      <div className="mb-3">
                        {submissionStatuses.get(assignment.id) === 'approved' && (
                          <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded">
                            <span className="text-sm font-medium">✓ Approved by Teacher</span>
                          </div>
                        )}
                        {submissionStatuses.get(assignment.id) === 'rejected' && (
                          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded">
                            <span className="text-sm font-medium">✗ Rejected by Teacher - You can resubmit</span>
                          </div>
                        )}
                        {submissionStatuses.get(assignment.id) === 'pending' && (
                          <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 p-2 rounded">
                            <span className="text-sm font-medium">⏳ Pending Review</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Due Date Warning */}
                    {assignment.due_date && new Date(assignment.due_date) < new Date() && !submittedAssignments.has(assignment.id) && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded">
                          <span className="text-sm font-medium">⚠️ Assignment Overdue - Submission Closed</span>
                        </div>
                      </div>
                    )}
                    <Button 
                      className="w-full" 
                      size="sm"
                      variant={submittedAssignments.has(assignment.id) && submissionStatuses.get(assignment.id) !== 'rejected' ? "secondary" : "default"}
                      disabled={submittedAssignments.has(assignment.id) && submissionStatuses.get(assignment.id) !== 'rejected' || (assignment.due_date && new Date(assignment.due_date) < new Date() && !submittedAssignments.has(assignment.id))}
                      onClick={() => {
                        // Check if assignment is overdue
                        if (assignment.due_date && new Date(assignment.due_date) < new Date() && !submittedAssignments.has(assignment.id)) {
                          toast.error('Assignment is overdue. Submission is no longer allowed.');
                          return;
                        }
                        
                        if (submittedAssignments.has(assignment.id) && submissionStatuses.get(assignment.id) !== 'rejected') return;
                        
                        const studentName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';
                        const submission = {
                          id: `submission_${Date.now()}`,
                          assignmentId: assignment.id,
                          studentName: studentName,
                          submittedAt: new Date().toISOString(),
                          status: 'pending',
                          screenshot: null
                        };
                        
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*,application/pdf';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            console.log('File selected:', file.name, file.type, file.size);
                            
                            // Check file size (max 10MB)
                            if (file.size > 10 * 1024 * 1024) {
                              toast.error('File size must be less than 10MB');
                              return;
                            }
                            
                            const reader = new FileReader();
                            reader.onload = async () => {
                              console.log('File read complete, data URL starts with:', (reader.result as string).substring(0, 50));
                              submission.screenshot = reader.result as string;
                              
                              try {
                                // Check current localStorage usage
                                const currentUsage = JSON.stringify(localStorage).length;
                                const fileSize = (reader.result as string).length;
                                console.log('Current localStorage usage:', currentUsage, 'bytes');
                                console.log('File size in base64:', fileSize, 'bytes');
                                console.log('Total would be:', currentUsage + fileSize, 'bytes');
                                
                                // Store all files directly
                                const submissions = JSON.parse(localStorage.getItem('taskSubmissions') || '[]');
                                submissions.push(submission);
                                localStorage.setItem('taskSubmissions', JSON.stringify(submissions));
                                
                                setSubmittedAssignments(prev => new Set([...prev, assignment.id]));
                                setSubmissionStatuses(prev => new Map([...prev, [assignment.id, 'pending']]));
                                
                                const fileType = file.type.includes('pdf') ? 'PDF' : 'Screenshot';
                                toast.success(`${fileType} uploaded successfully! Your teacher will review it.`);
                              } catch (error) {
                                console.error('Storage error:', error);
                                if (error.name === 'QuotaExceededError') {
                                  toast.error('Storage full. Please clear browser data or use "Clear Submissions" button in teacher panel.');
                                } else {
                                  toast.error('Error saving submission. Please try again.');
                                }
                              }
                            };
                            reader.onerror = () => {
                              console.error('Error reading file:', reader.error);
                              toast.error('Error reading file');
                            };
                            reader.readAsDataURL(file);
                          }
                        };
                        input.click();
                      }}
                    >
                      {submittedAssignments.has(assignment.id) 
                        ? submissionStatuses.get(assignment.id) === 'approved' 
                          ? '✓ Approved' 
                          : submissionStatuses.get(assignment.id) === 'rejected'
                            ? 'Resubmit File'
                            : '✓ Submitted'
                        : assignment.due_date && new Date(assignment.due_date) < new Date()
                          ? '⚠️ Overdue'
                          : 'Upload File (Image/PDF)'
                      }
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="glass-card border border-border rounded-lg p-6 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-medium text-foreground mb-1">No assignments yet</p>
                <p className="text-sm text-muted-foreground">Your teachers haven't created any assignments yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
