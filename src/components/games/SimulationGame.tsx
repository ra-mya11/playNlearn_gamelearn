import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import { 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Lightbulb,
  Target
} from "lucide-react";

interface SimulationStep {
  id: string;
  scenario: string;
  question: string;
  options: {
    id: string;
    text: string;
    impact: number; // -1 to 1, where 1 is best
    feedback: string;
  }[];
}

interface SimulationGameProps {
  title: string;
  description: string;
  steps: SimulationStep[];
  successThreshold: number; // Score needed to pass (0-100)
  onComplete: (score: number, maxScore: number) => void;
}

export function SimulationGame({ 
  title, 
  description, 
  steps, 
  successThreshold = 60,
  onComplete 
}: SimulationGameProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(50); // Start at 50%
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [history, setHistory] = useState<{ step: string; choice: string; impact: number }[]>([]);

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleOptionSelect = (optionId: string) => {
    if (showFeedback) return;
    setSelectedOption(optionId);
  };

  const handleConfirm = () => {
    if (!selectedOption) return;

    const option = step.options.find(o => o.id === selectedOption);
    if (!option) return;

    // Update score
    const newScore = Math.max(0, Math.min(100, score + option.impact * 20));
    setScore(newScore);
    
    // Add to history
    setHistory(prev => [...prev, { 
      step: step.scenario, 
      choice: option.text, 
      impact: option.impact 
    }]);

    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      setIsComplete(true);
      const maxScore = steps.length;
      const playerScore = Math.round((score / 100) * maxScore);
      onComplete(playerScore, maxScore);
    }
  };

  const getScoreColor = () => {
    if (score >= 70) return "text-secondary";
    if (score >= 40) return "text-accent";
    return "text-destructive";
  };

  const getScoreLabel = () => {
    if (score >= 70) return "Excellent!";
    if (score >= 50) return "Good";
    if (score >= 30) return "Needs Improvement";
    return "Critical";
  };

  if (isComplete) {
    const passed = score >= successThreshold;
    
    return (
      <div className="space-y-6 text-center">
        <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${
          passed ? "bg-secondary/20" : "bg-destructive/20"
        }`}>
          {passed ? (
            <CheckCircle2 className="h-10 w-10 text-secondary" />
          ) : (
            <AlertTriangle className="h-10 w-10 text-destructive" />
          )}
        </div>

        <div>
          <h3 className="font-heading text-2xl font-bold">
            {passed ? "Simulation Complete!" : "Try Again"}
          </h3>
          <p className="text-muted-foreground mt-1">
            {passed 
              ? "Great decision making throughout the simulation!" 
              : "Review your choices and try again."}
          </p>
        </div>

        <Card className="glass-card border border-primary/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Final Score</span>
            <span className={`font-heading text-2xl font-bold ${getScoreColor()}`}>
              {Math.round(score)}%
            </span>
          </div>
          <AnimatedProgress 
            value={score} 
            variant={score >= 70 ? "success" : score >= 40 ? "accent" : "default"} 
          />
        </Card>

        {/* Decision History */}
        <Card className="glass-card p-4 text-left">
          <h4 className="font-heading text-sm font-medium mb-3">Your Decisions:</h4>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {history.map((item, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  item.impact > 0 ? "bg-secondary/20 text-secondary" : 
                  item.impact < 0 ? "bg-destructive/20 text-destructive" : "bg-muted"
                }`}>
                  {index + 1}
                </div>
                <span className="text-muted-foreground">{item.choice}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-muted-foreground">Step {currentStep + 1} of {steps.length}</span>
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          <span className={`font-bold ${getScoreColor()}`}>{Math.round(score)}%</span>
        </div>
      </div>
      <AnimatedProgress value={progress} variant="default" />

      {/* Scenario */}
      <Card className="glass-card border border-primary/30 p-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <Lightbulb className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-foreground">{step.scenario}</h4>
            <p className="text-sm text-muted-foreground mt-1">{step.question}</p>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2">
          {step.options.map(option => {
            const isSelected = selectedOption === option.id;
            const showImpact = showFeedback && isSelected;

            return (
              <Button
                key={option.id}
                variant="outline"
                onClick={() => handleOptionSelect(option.id)}
                className={`w-full justify-start text-left h-auto p-3 transition-all
                  ${isSelected && !showFeedback ? "ring-2 ring-primary border-primary" : ""}
                  ${showImpact && option.impact > 0 ? "bg-secondary/20 border-secondary" : ""}
                  ${showImpact && option.impact < 0 ? "bg-destructive/20 border-destructive" : ""}
                  ${showImpact && option.impact === 0 ? "bg-accent/20 border-accent" : ""}
                  ${showFeedback && !isSelected ? "opacity-50" : ""}
                `}
                disabled={showFeedback}
              >
                <span className="font-medium">{option.text}</span>
              </Button>
            );
          })}
        </div>

        {/* Feedback */}
        {showFeedback && selectedOption && (
          <Card className={`mt-4 p-3 ${
            step.options.find(o => o.id === selectedOption)?.impact! > 0 
              ? "bg-secondary/10 border-secondary" 
              : step.options.find(o => o.id === selectedOption)?.impact! < 0
              ? "bg-destructive/10 border-destructive"
              : "bg-accent/10 border-accent"
          }`}>
            <p className="text-sm">
              {step.options.find(o => o.id === selectedOption)?.feedback}
            </p>
          </Card>
        )}
      </Card>

      {/* Actions */}
      {!showFeedback ? (
        <Button 
          onClick={handleConfirm} 
          className="w-full bg-primary"
          disabled={!selectedOption}
        >
          Confirm Decision
        </Button>
      ) : (
        <Button onClick={handleNext} className="w-full bg-primary">
          {currentStep < steps.length - 1 ? "Continue" : "See Results"}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      )}
    </div>
  );
}
