import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Coins, 
  Trophy, 
  Target, 
  Zap,
  BookOpen,
  CheckCircle,
  ArrowRight,
  X
} from "lucide-react";
import mascotWelcome from "@/assets/mascot-welcome.png";

interface OnboardingTutorialProps {
  onComplete: () => void;
  userName?: string;
}

const tutorialSteps = [
  {
    title: "Welcome to PlayNlearn!",
    description: "Learn, play, and earn rewards! Let me show you how this works.",
    mascot: mascotWelcome,
    icon: BookOpen,
    highlights: [
      "Complete games to learn new things",
      "Earn PlayCoins for every achievement",
      "Help your family with real rewards"
    ]
  },
  {
    title: "Earn PlayCoins",
    description: "PlayCoins are your rewards for learning. Here's how to earn them:",
    mascot: "https://cdn.builder.io/api/v1/image/assets%2F26374430d3c34c4eadae85eb80eba2ae%2F7b69fc846875436083b07103af88292e",
    icon: Coins,
    highlights: [
      "Complete learning games",
      "Finish daily & weekly challenges",
      "Submit village tasks",
      "Unlock achievements"
    ]
  },
  {
    title: "Complete Challenges",
    description: "Every day and week, new challenges await you!",
    mascot: "https://cdn.builder.io/api/v1/image/assets%2F26374430d3c34c4eadae85eb80eba2ae%2Feeaf5a8028f04cc38d7d33129c23421d",
    icon: Target,
    highlights: [
      "Daily challenges reset every midnight",
      "Weekly challenges reset on Monday",
      "Bigger rewards for weekly challenges!",
      "Check your dashboard for active challenges"
    ]
  },
  {
    title: "Level Up & Unlock",
    description: "As you learn, you'll grow stronger!",
    mascot: "https://cdn.builder.io/api/v1/image/assets%2Fecf135b7255f45f9a20859de9b268e89%2F44a15236cf944ababd813c3f49ac4904",
    icon: Trophy,
    highlights: [
      "Gain XP from completing activities",
      "Unlock new games and subjects",
      "Earn badges for special achievements",
      "Climb the leaderboard in your village"
    ]
  },
  {
    title: "You're Ready!",
    description: "Time to start your learning adventure!",
    mascot: "https://cdn.builder.io/api/v1/image/assets%2F26374430d3c34c4eadae85eb80eba2ae%2F89caab3762e640cbbd3ce45731cd7ddd",
    icon: Zap,
    highlights: [
      "Start with any subject you like",
      "Complete your first daily challenge",
      "Earn your first 50 PlayCoins today!"
    ]
  }
];

export function OnboardingTutorial({ onComplete, userName }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsVisible(false);
    // Store in localStorage that onboarding is complete
    localStorage.setItem("onboarding_complete", "true");
    setTimeout(onComplete, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm animate-fade-in">
      <Card className="relative mx-4 max-w-md w-full p-6 border-2 border-primary/20 shadow-2xl">
        {/* Skip button */}
        <button 
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep 
                  ? "w-8 bg-primary" 
                  : index < currentStep 
                    ? "w-2 bg-primary/50" 
                    : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Mascot */}
        <div className="flex justify-center mb-4">
          <img
            src={step.mascot}
            alt="Mascot"
            className="h-32 w-32 object-contain animate-bounce-in ml-1 sm:ml-0"
            key={currentStep}
          />
        </div>

        {/* Icon and Title */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-3">
            <step.icon className="h-8 w-8 text-primary" style={{ color: "rgb(149, 96, 240)" }} />
          </div>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            {currentStep === 0 && userName
              ? <>Welcome,{" "}<span style={{ color: "rgb(248, 231, 28)" }}>{userName}!</span></>
              : step.title}
          </h2>
          <p className="text-muted-foreground mt-2">{step.description}</p>
        </div>

        {/* Highlights */}
        <ul className="space-y-2 mb-6">
          {step.highlights.map((highlight, index) => (
            <li 
              key={index}
              className="flex items-center gap-3 text-sm text-foreground animate-slide-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CheckCircle className="h-4 w-4 text-secondary shrink-0" />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>

        {/* Navigation */}
        <div className="flex gap-3">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="flex-1"
            >
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            className="flex-1 gap-2"
          >
            {isLastStep ? "Let's Go!" : "Next"}
            {!isLastStep && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </Card>
    </div>
  );
}
