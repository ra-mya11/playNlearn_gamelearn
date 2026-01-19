import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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
  GraduationCap,
  Users,
  Heart,
  Loader2
} from "lucide-react";
import { z } from "zod";


const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const roleConfig = {
  student: {
    title: "Student Login",
    icon: GraduationCap,
    color: "text-primary",
    bgColor: "bg-primary/20",
  },
  teacher: {
    title: "Teacher Login",
    icon: Users,
    color: "text-accent",
    bgColor: "bg-accent/20",
  },
  parent: {
    title: "Parent Login",
    icon: Heart,
    color: "text-badge",
    bgColor: "bg-badge/20",
  },
};

export default function AuthPage() {
  const { role: roleParam } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const role = (roleParam as keyof typeof roleConfig) || "student";
  const config = roleConfig[role] || roleConfig.student;
  const RoleIcon = config.icon;

  const validateForm = () => {
    try {
      loginSchema.parse({ email, password });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: { email?: string; password?: string } = {};
        err.errors.forEach((error) => {
          if (error.path[0] === "email") fieldErrors.email = error.message;
          if (error.path[0] === "password") fieldErrors.password = error.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password. Please try again.");
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Please check your email and click the confirmation link before logging in. Check your spam folder if you don't see it.", {
            duration: 8000,
            action: {
              label: "Resend Email",
              onClick: async () => {
                const { error: resendError } = await supabase.auth.resend({
                  type: 'signup',
                  email: email
                });
                if (resendError) {
                  toast.error("Failed to resend confirmation email.");
                } else {
                  toast.success("Confirmation email sent! Check your inbox.");
                }
              }
            }
          });
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Welcome back!");
        navigate(`/${role}/dashboard`);
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 -left-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-40 -right-20 w-64 h-64 rounded-full bg-badge/5 blur-3xl" />
      </div>

      {/* Header */}
      <div className="safe-area-top glass-card border-b border-border relative z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link to="/role-selection" className="p-2 -ml-2">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <h1 className="font-heading text-lg font-semibold text-foreground">
            {t(`common.${role}Login`)}
          </h1>
        </div>
      </div>

      <div className="px-6 py-8 relative z-10">
        {/* Home Dashboard Card */}
        <div className="glass-card rounded-2xl p-5 mb-8 border border-border slide-up">
          <div className="flex items-start gap-4">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F26374430d3c34c4eadae85eb80eba2ae%2F5ddc7d8a69464ff2a905b47d5be216cf"
              alt="Mascot waving"
              className="w-24 h-24 object-contain"
            />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-3">{t('common.homeDashboard')}</p>
              <p className="text-lg font-heading text-foreground">
                {t('common.backAdventurer')}
              </p>
              <p className="text-muted-foreground text-sm">
                {t('common.readyForAdventure')}
              </p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="glass-card rounded-2xl p-6 border border-border slide-up" style={{ animationDelay: "100ms" }}>
          <div className="space-y-1 mb-6">
            <Label htmlFor="email" className="text-muted-foreground text-sm">{t('common.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('common.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`bg-muted/50 border-border ${errors.email ? "border-destructive" : ""}`}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-1 mb-6">
            <Label htmlFor="password" className="text-muted-foreground text-sm">{t('common.password')}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t('common.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`bg-muted/50 border-border pr-10 ${errors.password ? "border-destructive" : ""}`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-heading" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.signingIn')}
                </>
              ) : (
                t('common.logIn')
              )}
            </Button>
          </form>

          <p className="text-center text-muted-foreground text-sm mt-4">
            {t('common.dontHaveAccount')}{" "}
            <Link
              to={`/register/${role}`}
              className="font-medium text-primary hover:underline"
            >
              {t('common.signUp')}
            </Link>
          </p>
        </div>

        {/* Back to role selection */}
        <div className="mt-6 text-center slide-up" style={{ animationDelay: "200ms" }}>
          <Link
            to="/role-selection"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {t('common.chooseDifferentRole')}
          </Link>
        </div>
      </div>
    </div>
  );
}
