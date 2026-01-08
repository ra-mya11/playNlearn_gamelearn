import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function TeacherCreateClassPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    grade: "",
    section: "",
    academicYear: "2024-25"
  });

  const grades = [
    { value: "6", label: "Grade 6" },
    { value: "7", label: "Grade 7" },
    { value: "8", label: "Grade 8" },
    { value: "9", label: "Grade 9" },
    { value: "10", label: "Grade 10" }
  ];

  const sections = [
    { value: "A", label: "Section A" },
    { value: "B", label: "Section B" },
    { value: "C", label: "Section C" },
    { value: "D", label: "Section D" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.grade) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!user?.id) {
      toast.error("You must be logged in to create a class");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('classes')
        .insert({
          name: formData.name,
          grade: formData.grade,
          section: formData.section || null,
          academic_year: formData.academicYear,
          teacher_id: user.id,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Class created successfully!");
      navigate("/teacher/classes");
    } catch (error) {
      console.error('Error creating class:', error);
      toast.error("Failed to create class. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout role="teacher" title="Create New Class">
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="slide-up space-y-2">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/teacher/classes")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Classes
            </Button>
          </div>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Create New Class
          </h2>
          <p className="text-muted-foreground">
            Add a new class to manage your students
          </p>
        </div>

        {/* Form */}
        <Card className="slide-up p-6" style={{ animationDelay: "50ms" }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Class Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Grade 8 - Section A"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade *</Label>
                  <Select value={formData.grade} onValueChange={(value) => setFormData({...formData, grade: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade.value} value={grade.value}>
                          {grade.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="section">Section</Label>
                  <Select value={formData.section} onValueChange={(value) => setFormData({...formData, section: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((section) => (
                        <SelectItem key={section.value} value={section.value}>
                          {section.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year</Label>
                <Select value={formData.academicYear} onValueChange={(value) => setFormData({...formData, academicYear: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-25">2024-25</SelectItem>
                    <SelectItem value="2025-26">2025-26</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                <Plus className="h-4 w-4 mr-2" />
                {isLoading ? "Creating..." : "Create Class"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/teacher/classes")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}