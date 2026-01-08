import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  User,
  MapPin,
  GraduationCap,
  Users,
  Heart,
  School,
  Loader2,
  ChevronRight
} from "lucide-react";
import { z } from "zod";

const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().email("Please enter a valid email address").max(255, "Email is too long"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  village: z.string().optional(),
  grade: z.string().optional(),
  school: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const roleConfig = {
  student: {
    title: "Student Sign Up",
    icon: GraduationCap,
    color: "text-primary",
    bgColor: "bg-primary/10",
    showGrade: true,
    showSchool: true,
  },
  teacher: {
    title: "Teacher Sign Up",
    icon: Users,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    showGrade: false,
    showSchool: true,
  },
  parent: {
    title: "Parent Sign Up",
    icon: Heart,
    color: "text-badge",
    bgColor: "bg-badge/10",
    showGrade: false,
    showSchool: false,
  },
};

type Role = "student" | "teacher" | "parent";

export default function SignUpPage() {
  const { role: roleParam } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { signUp } = useAuth();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    village: "",
    grade: "",
    school: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const role = (roleParam as Role) || "student";
  const config = roleConfig[role] || roleConfig.student;
  const RoleIcon = config.icon;

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep = (stepNum: number) => {
    const stepErrors: Record<string, string> = {};

    if (stepNum === 1) {
      if (formData.fullName.length < 2) {
        stepErrors.fullName = "Name must be at least 2 characters";
      }
      if (!z.string().email().safeParse(formData.email).success) {
        stepErrors.email = "Please enter a valid email address";
      }
    }

    if (stepNum === 2) {
      if (formData.password.length < 6) {
        stepErrors.password = "Password must be at least 6 characters";
      }
      if (formData.password !== formData.confirmPassword) {
        stepErrors.confirmPassword = "Passwords don't match";
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(step)) return;

    setIsLoading(true);
    try {
      const { error } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        role: role,
        village: formData.village || undefined,
        grade: formData.grade || undefined,
        school: formData.school || undefined,
      });
      
      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("This email is already registered. Please sign in instead.");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Account created successfully!");
        navigate(`/${role}/dashboard`);
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="safe-area-top bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button 
            onClick={() => step > 1 ? handleBack() : navigate("/role-selection")} 
            className="p-2 -ml-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-heading text-lg font-semibold">{config.title}</h1>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Progress */}
        <div className="mb-6 flex items-center gap-2 slide-up">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="slide-up">
            <div className="mb-6 flex flex-col items-center text-center">
              <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${config.bgColor}`}>
                <RoleIcon className={`h-8 w-8 ${config.color}`} />
              </div>
              <h2 className="font-heading text-xl font-bold">Create Your Account</h2>
              <p className="mt-1 text-sm text-muted-foreground">Step 1 of 3: Basic information</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => updateFormData("fullName", e.target.value)}
                    className={`pl-10 ${errors.fullName ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <Button onClick={handleNext} className="w-full gap-2">
                Continue
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Password */}
        {step === 2 && (
          <div className="slide-up">
            <div className="mb-6 text-center">
              <h2 className="font-heading text-xl font-bold">Set Your Password</h2>
              <p className="mt-1 text-sm text-muted-foreground">Step 2 of 3: Secure your account</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => updateFormData("password", e.target.value)}
                    className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                    className={`pl-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>

              <Button onClick={handleNext} className="w-full gap-2">
                Continue
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Additional Info */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="slide-up">
            <div className="mb-6 text-center">
              <h2 className="font-heading text-xl font-bold">Almost Done!</h2>
              <p className="mt-1 text-sm text-muted-foreground">Step 3 of 3: Additional details (optional)</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="village">Village/Town</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="village"
                    placeholder="Enter your village or town"
                    value={formData.village}
                    onChange={(e) => updateFormData("village", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {config.showSchool && (
                <div className="space-y-2">
                  <Label htmlFor="school">School Name</Label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="school"
                      placeholder="Enter your school name"
                      value={formData.school}
                      onChange={(e) => updateFormData("school", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

              {config.showGrade && (
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade/Class</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="grade"
                      placeholder="e.g., Grade 8"
                      value={formData.grade}
                      onChange={(e) => updateFormData("grade", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link 
              to={`/login/${role}`} 
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
