/**
 * QR GENERATION ANIMATED
 * Premium 5-second animation flow with step-by-step checklist
 * Shows progress of: Reserving → Locking → Creating → Verifying
 */

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { useSoundEffects } from "@/hooks/use-sound-effects";
import { PremiumSyncRingLoader } from "./PremiumSyncRingLoader";

interface Step {
  label: string;
  translationKey: string;
  startTime: number;
  endTime: number;
}

interface QRGenerationAnimatedProps {
  isOpen: boolean;
  onComplete: () => void;
}

const STEPS: Step[] = [
  {
    label: "Reserving EduCoins",
    translationKey: "redemption.animation.reserving",
    startTime: 0.5,
    endTime: 1.5,
  },
  {
    label: "Locking product",
    translationKey: "redemption.animation.locking",
    startTime: 1.5,
    endTime: 2.5,
  },
  {
    label: "Creating offline QR",
    translationKey: "redemption.animation.creating",
    startTime: 2.5,
    endTime: 3.5,
  },
  {
    label: "Preparing verification",
    translationKey: "redemption.animation.preparing",
    startTime: 3.5,
    endTime: 4.5,
  },
];

const ANIMATION_DURATION = 5000; // 5 seconds

export function QRGenerationAnimated({
  isOpen,
  onComplete,
}: QRGenerationAnimatedProps) {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number>(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const { playQRRedemption } = useSoundEffects();

  useEffect(() => {
    if (!isOpen) return;

    setProgress(0);
    setCompletedSteps(0);
    setShowSuccess(false);

    const startTime = Date.now();

    const animationFrame = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const percentage = (elapsed / ANIMATION_DURATION) * 100;

      setProgress(Math.min(percentage, 100));

      // Update completed steps based on time
      let completed = 0;
      for (let i = 0; i < STEPS.length; i++) {
        if (elapsed >= STEPS[i].startTime * 1000) {
          completed = i + 1;
        }
      }
      setCompletedSteps(completed);

      // Show success at 80% progress
      if (percentage >= 80) {
        setShowSuccess(true);
      }

      // Complete animation
      if (elapsed >= ANIMATION_DURATION) {
        setProgress(100);
        setCompletedSteps(STEPS.length);
        setShowSuccess(true);

        // Play success sound only once at the very end
        setTimeout(() => {
          playQRRedemption?.();
          // Wait for sound, then trigger complete
          setTimeout(() => {
            onComplete();
          }, 300);
        }, 200);

        clearInterval(animationFrame);
      }
    }, 30);

    return () => clearInterval(animationFrame);
  }, [isOpen, onComplete, playQRRedemption]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-gradient-to-br from-background via-background to-primary/10 backdrop-blur-md flex items-center justify-center">
      {/* Animated Background Decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-40 pointer-events-none" />
      <div className="absolute bottom-32 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 opacity-40 pointer-events-none" />

      {/* Center Card */}
      <div className="relative w-full max-w-md px-4">
        <div className="rounded-3xl bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl border-2 border-primary/20 p-8 shadow-2xl shadow-primary/30">
          {/* Loading Icon - Premium Sync Ring Loader */}
          <div className="flex justify-center mb-8">
            <PremiumSyncRingLoader isLoading={!showSuccess} showSuccess={showSuccess} />
          </div>

          {/* Title */}
          <h2 className="text-center font-heading text-2xl font-bold text-foreground mb-2">
            {t("redemption.generatingQR", { defaultValue: "Generating QR Code" })}
          </h2>

          <p className="text-center text-sm text-muted-foreground mb-8">
            {t("redemption.preparingReward", {
              defaultValue: "Preparing your reward...",
            })}
          </p>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="w-full h-2 rounded-full bg-muted/30 overflow-hidden">
              <div
                className={`h-full transition-all duration-200 ${
                  showSuccess
                    ? "bg-gradient-to-r from-secondary to-secondary/80 w-full"
                    : "bg-gradient-to-r from-primary to-primary/80"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Steps Checklist */}
          <div className="space-y-3 mb-8">
            {STEPS.map((step, index) => (
              <div
                key={step.translationKey}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                  index < completedSteps
                    ? "bg-secondary/10 translate-x-0 opacity-100"
                    : index === completedSteps
                      ? "bg-primary/5 translate-x-0 opacity-100 animate-pulse"
                      : "bg-muted/5 -translate-x-2 opacity-60"
                }`}
              >
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    index < completedSteps
                      ? "bg-secondary text-white"
                      : index === completedSteps
                        ? "border-2 border-primary bg-primary/10"
                        : "border-2 border-muted bg-transparent"
                  }`}
                >
                  {index < completedSteps ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        index === completedSteps ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>

                <span
                  className={`text-sm font-medium transition-all ${
                    index <= completedSteps
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {t(step.translationKey, { defaultValue: step.label })}
                </span>
              </div>
            ))}
          </div>

          {/* Progress Text */}
          <div className="text-center text-xs text-muted-foreground">
            {Math.round(progress)}% {t("common.complete", { defaultValue: "Complete" })}
          </div>
        </div>
      </div>
    </div>
  );
}
