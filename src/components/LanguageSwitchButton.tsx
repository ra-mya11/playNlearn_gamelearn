/**
 * LANGUAGE SWITCH BUTTON
 * Clear, intuitive button showing globe icon + current language code
 * Makes it obvious to users that this changes the language
 * Child-friendly, accessible, 44px+ tap area
 */

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

interface LanguageSwitchButtonProps {
  onClick: () => void;
  className?: string;
}

const languageCodeMap: Record<string, string> = {
  en: "EN",
  hi: "हिंदी",
  ta: "தமிழ்",
  te: "తెలుగు",
  ka: "ಕನ್ನಡ",
  ml: "മലയാളം",
  mr: "मराठी",
  bn: "বাংলা",
  gu: "ગુજરાતી",
  od: "ଓଡିଆ",
  ur: "اردو",
};

export function LanguageSwitchButton({
  onClick,
  className = "",
}: LanguageSwitchButtonProps) {
  const { i18n } = useTranslation();
  const [showPulse, setShowPulse] = useState(false);

  // Show pulse animation on first app launch
  useEffect(() => {
    const hasInteracted = localStorage.getItem("language_switch_interacted");
    if (!hasInteracted) {
      setShowPulse(true);
      // Auto-remove pulse after 3 seconds
      const timer = setTimeout(() => setShowPulse(false), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClick = () => {
    localStorage.setItem("language_switch_interacted", "true");
    setShowPulse(false);
    onClick();
  };

  const currentLanguageCode =
    languageCodeMap[i18n.language] || i18n.language.toUpperCase();

  return (
    <div className="relative">
      {/* Pulse animation - draws attention on first launch */}
      {showPulse && (
        <div
          className="absolute inset-0 rounded-full bg-primary/20 animate-pulse"
          style={{
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          }}
        />
      )}

      <button
        onClick={handleClick}
        className={`
          relative group
          flex items-center justify-center gap-1.5
          px-3 py-2.5 min-h-[44px] min-w-[44px]
          rounded-full
          glass-card border border-border/50
          hover:border-primary/50 hover:bg-primary/5
          transition-all duration-300
          touch-scale
          ${className}
        `}
        title="Change Language"
        aria-label="Change app language"
      >
        {/* Globe Icon */}
        <Globe className="h-5 w-5 text-primary flex-shrink-0" />

        {/* Language Code */}
        <span className="text-xs font-heading font-bold text-foreground hidden sm:inline">
          {currentLanguageCode}
        </span>

        {/* Tooltip on hover */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-foreground text-background text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Change Language
        </div>
      </button>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.5;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          button {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
