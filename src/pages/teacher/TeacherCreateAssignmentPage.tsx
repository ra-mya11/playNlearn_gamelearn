import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, BookOpen, Clock, Coins, Star, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { setupAssignmentsTable } from "@/utils/setupDatabase";

export default function TeacherCreateAssignmentPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    dueDate: "",
    classId: ""
  });

  useEffect(() => {
    loadTeacherClasses();
  }, []);

  const loadTeacherClasses = () => {
    try {
      const teacherId = user?.id || 'teacher_001';
      const storedClasses = JSON.parse(localStorage.getItem('teacherClasses') || '[]');
      const myClasses = storedClasses.filter((cls: any) => cls.teacherId === teacherId);
      setClasses(myClasses);
    } catch (error) {
      console.error('Error loading classes:', error);
      setClasses([]);
    }
  };

  const subjects = [
    { value: "mathematics", label: "Mathematics" },
    { value: "physics", label: "Physics" },
    { value: "chemistry", label: "Chemistry" },
    { value: "biology", label: "Biology" },
    { value: "technology", label: "Technology" },
    { value: "finance", label: "Finance" },
    { value: "entrepreneurship", label: "Entrepreneurship" },
    { value: "village-skills", label: "Village Skills" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.subject || !formData.classId) {
      toast.error("Please fill in all required fields including class selection");
      return;
    }

    if (!user?.id) {
      toast.error("You must be logged in to create an assignment");
      return;
    }

    setIsLoading(true);

    try {
      console.log('=== TEACHER ASSIGNMENT CREATION DEBUG ===');
      console.log('Form data:', formData);
      
      // Create assignment object with class ID
      const assignment = {
        id: `assignment_${Date.now()}`,
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        due_date: formData.dueDate || null,
        teacher_id: user?.id || 'teacher_001',
        class_id: formData.classId,
        is_active: true,
        created_at: new Date().toISOString()
      };
      
      console.log('New assignment to save:', assignment);
      
      // Save to localStorage with class-specific key
      const storageKey = `class_assignments_${formData.classId}`;
      const assignments = JSON.parse(localStorage.getItem(storageKey) || '[]');
      assignments.push(assignment);
      localStorage.setItem(storageKey, JSON.stringify(assignments));
      
      console.log('Assignment saved to localStorage:', assignment);
      console.log('All assignments for class:', assignments);
      
      toast.success("Assignment created successfully!");
      navigate("/teacher/classes");
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error(`Failed to create assignment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout role="teacher" title="Create New Assignment">
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="slide-up space-y-2">
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Create New Assignment
          </h2>
          <p className="text-muted-foreground">
            Create engaging assignments for your students
          </p>
        </div>

        {/* Form */}
        <Card className="slide-up p-6" style={{ animationDelay: "50ms" }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Basic Information
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="classId">Select Class *</Label>
                  <Select value={formData.classId} onValueChange={(value) => setFormData({...formData, classId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls: any) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {cls.name} ({cls.code})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {classes.length === 0 && (
                    <p className="text-sm text-muted-foreground">No classes found. Create a class first.</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Assignment Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter assignment title"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Select value={formData.subject} onValueChange={(value) => setFormData({...formData, subject: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.value} value={subject.value}>
                          {subject.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe what students need to do"
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date (Optional)</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                <Plus className="h-4 w-4 mr-2" />
                {isLoading ? "Creating..." : "Create Assignment"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/teacher/classes")}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}