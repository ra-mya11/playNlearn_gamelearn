import { AppLayout } from "@/components/navigation";
import { GameBadge } from "@/components/ui/game-badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  X,
  Image,
  ChevronRight,
  Clock,
  Eye,
  BookOpen,
  Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";

interface TaskSubmission {
  id: string;
  assignmentId: string;
  studentName: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  screenshot: string | null;
  assignmentTitle?: string;
}

export default function TeacherTaskVerificationPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState<TaskSubmission | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadSubmissions();
    loadAssignments();
  }, []);

  const handleDeleteAssignment = (assignmentId: string) => {
    try {
      const storageKey = 'playnlearn_assignments';
      const storedAssignments = localStorage.getItem(storageKey);
      if (storedAssignments) {
        const parsed = JSON.parse(storedAssignments);
        const updatedAssignments = parsed.filter((a: any) => a.id !== assignmentId);
        localStorage.setItem(storageKey, JSON.stringify(updatedAssignments));
        setAssignments(updatedAssignments);
        toast.success('Assignment deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to delete assignment');
    }
  };

  const loadAssignments = () => {
    try {
      // Load assignments from teacher's classes only
      const teacherId = user?.id || 'teacher_001';
      const teacherClasses = JSON.parse(localStorage.getItem('teacherClasses') || '[]');
      const myClasses = teacherClasses.filter((cls) => cls.teacherId === teacherId);
      
      console.log('Loading assignments for teacher classes:', myClasses);
      
      let allAssignments = [];
      myClasses.forEach((cls) => {
        const classAssignments = JSON.parse(localStorage.getItem(`class_assignments_${cls.id}`) || '[]');
        console.log(`Assignments for class ${cls.name}:`, classAssignments);
        // Add class info to assignments
        const assignmentsWithClassInfo = classAssignments.map(assignment => ({
          ...assignment,
          className: cls.name,
          classCode: cls.code
        }));
        allAssignments = [...allAssignments, ...assignmentsWithClassInfo];
      });
      
      console.log('All teacher assignments loaded:', allAssignments);
      setAssignments(allAssignments);
    } catch (error) {
      console.error('Error loading assignments:', error);
      setAssignments([]);
    }
  };

  const loadSubmissions = async () => {
    console.log('Raw taskSubmissions localStorage:', localStorage.getItem('taskSubmissions'));
    const savedSubmissions = JSON.parse(localStorage.getItem('taskSubmissions') || '[]');
    
    // Get teacher's classes to filter relevant submissions
    const teacherId = user?.id || 'teacher_001';
    const teacherClasses = JSON.parse(localStorage.getItem('teacherClasses') || '[]');
    const myClasses = teacherClasses.filter((cls) => cls.teacherId === teacherId);
    const myClassIds = myClasses.map(cls => cls.id);
    
    console.log('Teacher classes:', myClasses);
    console.log('My class IDs:', myClassIds);
    
    // Load assignments from teacher's classes to get assignment titles
    let allAssignments = [];
    myClasses.forEach((cls) => {
      const classAssignments = JSON.parse(localStorage.getItem(`class_assignments_${cls.id}`) || '[]');
      allAssignments = [...allAssignments, ...classAssignments.map(a => ({...a, className: cls.name, classCode: cls.code}))]
    });
    
    console.log('All teacher assignments:', allAssignments);
    
    // Filter submissions for teacher's assignments only
    const teacherSubmissions = savedSubmissions.filter(sub => 
      allAssignments.some(assignment => assignment.id === sub.assignmentId)
    );
    
    console.log('Filtered teacher submissions:', teacherSubmissions);
    
    // Add assignment titles and class info
    const submissionsWithTitles = teacherSubmissions.map((sub) => {
      const assignment = allAssignments.find((a) => a.id === sub.assignmentId);
      return {
        ...sub,
        assignmentTitle: assignment?.title || 'Unknown Assignment',
        className: assignment?.className || 'Unknown Class',
        classCode: assignment?.classCode || 'N/A'
      };
    });
    
    console.log('Submissions with titles and class info:', submissionsWithTitles);
    setSubmissions(submissionsWithTitles);
  };

  const handleApprove = async (submissionId: string) => {
    setIsProcessing(true);
    try {
      const updatedSubmissions = submissions.map(sub => 
        sub.id === submissionId ? { ...sub, status: 'approved' as const } : sub
      );
      setSubmissions(updatedSubmissions);
      localStorage.setItem('taskSubmissions', JSON.stringify(updatedSubmissions));
      toast.success("Task approved! Student will be notified.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (submissionId: string) => {
    setIsProcessing(true);
    try {
      const updatedSubmissions = submissions.map(sub => 
        sub.id === submissionId ? { ...sub, status: 'rejected' as const } : sub
      );
      setSubmissions(updatedSubmissions);
      localStorage.setItem('taskSubmissions', JSON.stringify(updatedSubmissions));
      toast.success("Task rejected. Student will be notified.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewImage = async (submission: TaskSubmission) => {
    console.log('handleViewImage called with:', submission.id, submission.screenshot);
    
    // If screenshot is stored separately, try to find it in localStorage with a different key
    if (submission.screenshot === 'stored_in_indexeddb') {
      console.log('Looking for large file in localStorage with key:', `large_file_${submission.id}`);
      
      // Debug: List all localStorage keys
      console.log('All localStorage keys:', Object.keys(localStorage));
      
      // Try to find the file stored with a separate key
      const largeFileKey = `large_file_${submission.id}`;
      const storedFile = localStorage.getItem(largeFileKey);
      
      console.log('Stored file found:', !!storedFile);
      if (storedFile) {
        console.log('File size:', storedFile.length);
      }
      
      if (storedFile) {
        console.log('Found large file in localStorage');
        setSelectedSubmission({...submission, screenshot: storedFile});
        setShowImageModal(true);
      } else {
        console.log('Large file not found, checking all keys with large_file prefix');
        const allKeys = Object.keys(localStorage);
        const largeFileKeys = allKeys.filter(key => key.startsWith('large_file_'));
        console.log('Found large file keys:', largeFileKeys);
        
        // Show modal with error message
        setSelectedSubmission({
          ...submission, 
          screenshot: null
        });
        setShowImageModal(true);
        toast.error('Large file not found. Please ask student to resubmit.');
      }
    } else {
      console.log('Using direct screenshot, opening modal');
      setSelectedSubmission(submission);
      setShowImageModal(true);
    }
  };

  const pendingSubmissions = submissions.filter(sub => sub.status === 'pending');
  const reviewedSubmissions = submissions.filter(sub => sub.status !== 'pending');

  return (
    <AppLayout role="teacher" title={t("teacher.taskVerification", { defaultValue: "Task Verification" })}>
      <div className="px-4 py-6">
        {/* Image Modal */}
        {selectedSubmission && showImageModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{selectedSubmission.assignmentTitle}</h3>
                    <p className="text-sm text-muted-foreground">by {selectedSubmission.studentName}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowImageModal(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                {selectedSubmission.screenshot && (
                  selectedSubmission.screenshot.startsWith('data:application/pdf') ? (
                    <div className="text-center">
                      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                        <div className="text-center">
                          <span className="text-6xl">📄</span>
                          <p className="text-lg text-gray-600 mt-2">PDF Document</p>
                          <p className="text-sm text-gray-500">Cannot preview PDF in browser</p>
                        </div>
                      </div>
                      <a 
                        href={selectedSubmission.screenshot} 
                        download={`submission_${selectedSubmission.id}.pdf`}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Download PDF
                      </a>
                    </div>
                  ) : (
                    <img 
                      src={selectedSubmission.screenshot} 
                      alt="Student submission" 
                      className="w-full h-auto rounded-lg"
                      onError={(e) => {
                        console.error('Modal image failed to load:', selectedSubmission.screenshot?.substring(0, 50));
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )
                )}
                <div className="flex gap-2 mt-4">
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      handleApprove(selectedSubmission.id);
                      setShowImageModal(false);
                    }}
                    disabled={isProcessing}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={() => {
                      handleReject(selectedSubmission.id);
                      setShowImageModal(false);
                    }}
                    disabled={isProcessing}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6 slide-up">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-2xl font-bold">
                {t("teacher.taskVerification", { defaultValue: "Task Verification" })}
              </h2>
              <p className="text-muted-foreground">
                {t("teacher.reviewSubmissions", { defaultValue: "Review student submissions" })}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => {
                localStorage.removeItem('taskSubmissions');
                setSubmissions([]);
                toast.success('All submissions cleared!');
              }} variant="destructive" size="sm">
                Clear Submissions
              </Button>
              <Button onClick={() => {
                const storageKey = 'playnlearn_assignments';
                localStorage.removeItem(storageKey);
                setAssignments([]);
                toast.success('All assignments cleared!');
              }} variant="destructive" size="sm">
                Clear Assignments
              </Button>
              <Button onClick={() => { console.log('Refresh clicked'); loadSubmissions(); loadAssignments(); }} variant="outline">
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-4 gap-3 slide-up" style={{ animationDelay: "100ms" }}>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="font-heading text-2xl font-bold text-primary">{assignments.length}</p>
            <p className="text-xs text-muted-foreground">Assigned</p>
          </div>
          <div className="rounded-xl border-2 border-accent/30 bg-accent/10 p-3 text-center">
            <p className="font-heading text-2xl font-bold text-accent">{pendingSubmissions.length}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="font-heading text-2xl font-bold text-secondary">{reviewedSubmissions.filter(s => s.status === 'approved').length}</p>
            <p className="text-xs text-muted-foreground">Approved</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="font-heading text-2xl font-bold text-destructive">{reviewedSubmissions.filter(s => s.status === 'rejected').length}</p>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="assigned" className="slide-up" style={{ animationDelay: "150ms" }}>
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="assigned" className="flex-1">
              Assigned ({assignments.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex-1">
              Pending ({pendingSubmissions.length})
            </TabsTrigger>
            <TabsTrigger value="reviewed" className="flex-1">
              Reviewed ({reviewedSubmissions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assigned" className="space-y-4">
            {assignments.map((assignment: any) => (
              <div
                key={assignment.id}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{assignment.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{assignment.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {assignment.subject}
                      </span>
                      <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded">
                        {assignment.className} ({assignment.classCode})
                      </span>
                      {assignment.due_date && (
                        <span className="text-xs text-muted-foreground">
                          Due: {new Date(assignment.due_date).toLocaleDateString()}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        Created: {new Date(assignment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <GameBadge variant="primary" size="sm">
                      Active
                    </GameBadge>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteAssignment(assignment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {assignments.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <BookOpen className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                <p className="font-heading font-semibold">No assignments yet</p>
                <p className="text-sm text-muted-foreground">
                  Create your first assignment for students
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="rounded-xl border border-border bg-card p-4"
              >
                {/* Header */}
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-heading font-bold text-primary text-sm">
                      {submission.studentName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium">{submission.studentName}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(submission.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <GameBadge variant="primary" size="sm">
                    Assignment
                  </GameBadge>
                </div>

                {/* Task Info */}
                <div className="mb-3">
                  <p className="font-medium">{submission.assignmentTitle}</p>
                  <p className="text-sm text-muted-foreground">File submission (Image or PDF)</p>
                  <p className="text-xs text-primary bg-primary/10 px-2 py-1 rounded inline-block mt-1">
                    {submission.className} ({submission.classCode})
                  </p>
                </div>

                {/* File Preview */}
                {submission.screenshot && submission.screenshot !== 'stored_in_indexeddb' ? (
                  <div className="mb-4">
                    {submission.screenshot.startsWith('data:application/pdf') ? (
                      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer border" onClick={() => handleViewImage(submission)}>
                        <div className="text-center">
                          <span className="text-2xl">📄</span>
                          <p className="text-sm text-gray-600 mt-1">PDF Document</p>
                          <p className="text-xs text-gray-500">Click to view</p>
                        </div>
                      </div>
                    ) : (
                      <img 
                        src={submission.screenshot} 
                        alt="Student submission preview" 
                        className="w-full h-32 object-cover rounded-lg cursor-pointer"
                        onClick={() => handleViewImage(submission)}
                        onError={(e) => {
                          console.error('Image failed to load:', submission.screenshot?.substring(0, 50));
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                ) : submission.screenshot === 'stored_in_indexeddb' ? (
                  <div className="mb-4">
                    <div className="w-full h-32 bg-blue-100 rounded-lg flex items-center justify-center cursor-pointer border" onClick={() => handleViewImage(submission)}>
                      <div className="text-center">
                        <span className="text-2xl">💾</span>
                        <p className="text-sm text-blue-600 mt-1">Large File Stored</p>
                        <p className="text-xs text-blue-500">Click to view</p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleViewImage(submission)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {submission.screenshot === 'stored_in_indexeddb' ? 'View Large File' : 
                     submission.screenshot?.startsWith('data:application/pdf') ? 'View PDF' : 'View Full Image'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleReject(submission.id)}
                    disabled={isProcessing}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    className="bg-secondary hover:bg-secondary/90"
                    onClick={() => handleApprove(submission.id)}
                    disabled={isProcessing}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {pendingSubmissions.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <Check className="mx-auto mb-2 h-12 w-12 text-secondary" />
                <p className="font-heading font-semibold">All caught up!</p>
                <p className="text-sm text-muted-foreground">
                  No pending submissions to review
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviewed" className="space-y-3">
            {reviewedSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium">{submission.studentName}</p>
                    <p className="text-sm text-muted-foreground">{submission.assignmentTitle}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <GameBadge
                      variant={submission.status === "approved" ? "secondary" : "outline"}
                      size="sm"
                    >
                      {submission.status}
                    </GameBadge>
                  </div>
                </div>
                {/* Screenshot Preview for Reviewed */}
                {submission.screenshot ? (
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-1">Screenshot (Base64 length: {submission.screenshot.length})</p>
                    <img 
                      src={submission.screenshot} 
                      alt="Student submission preview" 
                      className="w-full h-32 object-cover rounded-lg cursor-pointer border"
                      onClick={() => handleViewImage(submission)}
                      onError={(e) => {
                        console.error('Reviewed image failed to load:', submission.screenshot?.substring(0, 50));
                        e.currentTarget.style.display = 'none';
                      }}
                      onLoad={() => console.log('Image loaded successfully')}
                    />
                  </div>
                ) : (
                  <div className="mb-3 p-4 border border-dashed rounded-lg text-center text-muted-foreground">
                    No screenshot available
                  </div>
                )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewImage(submission)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {submission.screenshot?.startsWith('data:application/pdf') ? 'View PDF' : 'View Full Image'}
                  </Button>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}