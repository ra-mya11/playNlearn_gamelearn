import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GraduationCap, BookOpen, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageSelector } from "@/components/LanguageSelector";
import { LanguageSwitchButton } from "@/components/LanguageSwitchButton";
import mascotWelcome from "@/assets/mascot-welcome.png";

type Role = "student" | "teacher" | "parent";

interface RoleOption {
  role: Role;
  icon: typeof GraduationCap;
  title: string;
  description: string;
  gradient: string;
  iconColor: string;
}

const getStaticRoles = (): RoleOption[] => [
  {
    role: "student",
    icon: GraduationCap,
    title: "Student",
    description: "Learn, play & earn",
    gradient: "from-primary to-primary/60",
    iconColor: "text-primary-foreground",
  },
  {
    role: "teacher",
    icon: BookOpen,
    title: "Teacher",
    description: "Guide & monitor",
    gradient: "from-accent to-accent/60",
    iconColor: "text-accent-foreground",
  },
  {
    role: "parent",
    icon: Users,
    title: "Parent",
    description: "Track progress",
    gradient: "from-badge to-badge/60",
    iconColor: "text-badge-foreground",
  },
];

export default function RoleSelectionPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLanguageSelectorOpen, setIsLanguageSelectorOpen] = useState(false);
  const roles = getStaticRoles();

  const handleRoleSelect = (role: Role) => {
    navigate(`/login/${role}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-20 -left-20 w-64 h-64 rounded-full bg-primary/10 blur-[100px]" />
      <div className="absolute bottom-40 -right-20 w-64 h-64 rounded-full bg-accent/10 blur-[100px]" />

      {/* Language Switch Button */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitchButton
          onClick={() => setIsLanguageSelectorOpen(true)}
        />
      </div>

      {/* Language Selector Modal */}
      <LanguageSelector
        isOpen={isLanguageSelectorOpen}
        onClose={() => setIsLanguageSelectorOpen(false)}
      />

      {/* Header */}
      <div className="pt-16 pb-4 px-6 text-center relative z-10">
        <h1 className="font-display text-3xl gradient-text mb-2 slide-up">{t('common.welcome')}</h1>
        <p className="text-muted-foreground text-sm slide-up" style={{ animationDelay: "50ms" }}>
          {t('common.chooseRole')}
        </p>
      </div>

      {/* Mascot */}
      <div className="flex justify-center py-4 relative z-10 slide-up" style={{ animationDelay: "100ms" }}>
        <div className="float">
          <img 
            src={mascotWelcome} 
            alt="PlayNlearn Guide" 
            className="w-48 h-48 object-contain drop-shadow-xl"
          />
        </div>
      </div>

      {/* Role Cards */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-12 relative z-10">
        <div className="space-y-4">
          {roles.map((option, index) => {
            const translatedTitle = t(`common.${option.role}`);
            const translatedDescription = t(`common.${option.role === 'student' ? 'learnPlayEarn' : option.role === 'teacher' ? 'guideMonitor' : 'trackProgress'}`);
            return (
              <button
                key={option.role}
                onClick={() => handleRoleSelect(option.role)}
                className={cn(
                  "w-full flex items-center gap-4 rounded-2xl p-4 transition-all duration-300 touch-scale",
                  "glass-card border border-border hover:border-primary/50",
                  "slide-up"
                )}
                style={{ animationDelay: `${150 + index * 75}ms` }}
              >
                <div
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-xl",
                    "bg-gradient-to-br shadow-lg",
                    option.gradient
                  )}
                >
                  <option.icon className={cn("h-7 w-7", option.iconColor)} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-heading text-lg font-semibold text-foreground">
                    {translatedTitle}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {translatedDescription}
                  </p>
                </div>
                <div className="text-muted-foreground">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="pb-6 text-center">
        <p className="text-xs text-muted-foreground">
          {t('common.educationTransformsVillages')}
        </p>
      </div>
    </div>
  );
}
