import { useState } from "react";
import { AppLayout } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, 
  MapPin, 
  School, 
  Phone,
  Camera,
  ArrowLeft,
  Save,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function ProfileSettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    village: profile?.village || "",
    school: profile?.school || "",
    grade: profile?.grade || "",
    phone: profile?.phone || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          village: formData.village,
          school: formData.school,
          grade: formData.grade,
          phone: formData.phone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success("Profile updated successfully!");
      navigate("/student/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const avatarOptions = [
    { id: 1, color: "from-primary to-primary/60" },
    { id: 2, color: "from-secondary to-secondary/60" },
    { id: 3, color: "from-accent to-accent/60" },
    { id: 4, color: "from-purple-500 to-purple-400" },
    { id: 5, color: "from-pink-500 to-pink-400" },
    { id: 6, color: "from-cyan-500 to-cyan-400" },
  ];

  const [selectedAvatar, setSelectedAvatar] = useState(0);

  return (
    <AppLayout role="student" title="Edit Profile">
      <div className="px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/student/profile")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-heading text-xl font-bold text-foreground">Edit Profile</h1>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Avatar Selection */}
          <Card className="glass-card border border-border p-5 mb-6">
            <Label className="text-sm font-medium mb-3 block">Choose Avatar</Label>
            <div className="flex justify-center mb-4">
              <div className={`h-24 w-24 rounded-full bg-gradient-to-br ${avatarOptions[selectedAvatar].color} flex items-center justify-center`}>
                <User className="h-12 w-12 text-primary-foreground" />
              </div>
            </div>
            <div className="flex justify-center gap-3">
              {avatarOptions.map((avatar, index) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setSelectedAvatar(index)}
                  className={`h-12 w-12 rounded-full bg-gradient-to-br ${avatar.color} flex items-center justify-center transition-all ${
                    selectedAvatar === index 
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110" 
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <User className="h-6 w-6 text-white" />
                </button>
              ))}
            </div>
          </Card>

          {/* Form Fields */}
          <Card className="glass-card border border-border p-5 mb-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Full Name
              </Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="village" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Village
              </Label>
              <Input
                id="village"
                name="village"
                value={formData.village}
                onChange={handleChange}
                placeholder="Enter your village name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="school" className="flex items-center gap-2">
                <School className="h-4 w-4 text-muted-foreground" />
                School
              </Label>
              <Input
                id="school"
                name="school"
                value={formData.school}
                onChange={handleChange}
                placeholder="Enter your school name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade" className="flex items-center gap-2">
                <School className="h-4 w-4 text-muted-foreground" />
                Grade
              </Label>
              <Input
                id="grade"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                placeholder="e.g., Grade 8"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number (optional)"
              />
            </div>
          </Card>

          {/* Save Button */}
          <Button 
            type="submit" 
            className="w-full gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
