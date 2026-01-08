import { useState } from "react";
import { AppLayout } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GameBadge } from "@/components/ui/game-badge";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import { 
  ArrowLeft, 
  Calculator,
  CheckCircle,
  XCircle,
  ArrowRight,
  Lightbulb,
  HelpCircle,
  Store,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface MathProblem {
  id: number;
  scenario: string;
  question: string;
  answer: number;
  hint: string;
  icon: typeof Store;
}

const problems: MathProblem[] = [
  {
    id: 1,
    scenario: "Ram's Shop",
    question: "Ram sells 15 kg of rice at ₹45 per kg. How much money does he earn?",
    answer: 675,
    hint: "Multiply the quantity by the price per kg",
    icon: Store,
  },
  {
    id: 2,
    scenario: "Vegetable Market",
    question: "Sita bought vegetables for ₹120 and paid with a ₹200 note. How much change should she get?",
    answer: 80,
    hint: "Subtract the cost from the amount paid",
    icon: Store,
  },
  {
    id: 3,
    scenario: "Milk Collection",
    question: "A farmer collects 25 liters of milk per day. How many liters in a week?",
    answer: 175,
    hint: "There are 7 days in a week",
    icon: Store,
  },
  {
    id: 4,
    scenario: "School Supplies",
    question: "A notebook costs ₹35. How much for 8 notebooks?",
    answer: 280,
    hint: "Multiply the cost by the number of notebooks",
    icon: Store,
  },
  {
    id: 5,
    scenario: "Sharing Equally",
    question: "192 mangoes are shared equally among 12 families. How many does each family get?",
    answer: 16,
    hint: "Divide the total by the number of families",
    icon: Store,
  },
];

export default function MathMissions() {
  const navigate = useNavigate();
  const [currentProblem, setCurrentProblem] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [solvedProblems, setSolvedProblems] = useState<number[]>([]);
  const [showTutorial, setShowTutorial] = useState(true);

  const problem = problems[currentProblem];

  const checkAnswer = () => {
    const numAnswer = parseInt(userAnswer, 10);
    if (numAnswer === problem.answer) {
      setIsCorrect(true);
      if (!solvedProblems.includes(problem.id)) {
        setScore(score + 20);
        setSolvedProblems([...solvedProblems, problem.id]);
      }
      toast({ title: "✅ Correct!", description: "+20 points" });
    } else {
      setIsCorrect(false);
      toast({ title: "❌ Not quite right", description: "Try again or use the hint!" });
    }
  };

  const nextProblem = () => {
    if (currentProblem < problems.length - 1) {
      setCurrentProblem(currentProblem + 1);
      setUserAnswer("");
      setIsCorrect(null);
      setShowHint(false);
    }
  };

  const prevProblem = () => {
    if (currentProblem > 0) {
      setCurrentProblem(currentProblem - 1);
      setUserAnswer("");
      setIsCorrect(null);
      setShowHint(false);
    }
  };

  const progress = (solvedProblems.length / problems.length) * 100;

  return (
    <AppLayout role="student" playCoins={1250} title="Market Math">
      <div className="px-4 py-6">
        {/* Header */}
        <div className="mb-4 slide-up">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2"
            onClick={() => navigate("/student/mathematics")}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Tutorial */}
        {showTutorial && (
          <div className="mb-4 rounded-xl border border-primary/30 bg-primary/10 p-4 slide-up">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Real-World Math Problems</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Help village shopkeepers solve everyday math problems!
                </p>
                <Button size="sm" onClick={() => setShowTutorial(false)}>
                  Let's Start!
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mb-4 grid grid-cols-2 gap-3 slide-up" style={{ animationDelay: "50ms" }}>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <Calculator className="mx-auto mb-1 h-5 w-5 text-badge" />
            <p className="font-heading text-lg font-bold">{score}</p>
            <p className="text-xs text-muted-foreground">Points</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <CheckCircle className="mx-auto mb-1 h-5 w-5 text-secondary" />
            <p className="font-heading text-lg font-bold">{solvedProblems.length}/{problems.length}</p>
            <p className="text-xs text-muted-foreground">Solved</p>
          </div>
        </div>

        {/* Problem Card */}
        <div className="mb-4 rounded-xl border border-border bg-card p-4 slide-up" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-full bg-badge/20 p-2">
              <problem.icon className="h-5 w-5 text-badge" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Problem {currentProblem + 1} of {problems.length}</p>
              <h4 className="font-heading font-semibold">{problem.scenario}</h4>
            </div>
            {solvedProblems.includes(problem.id) && (
              <CheckCircle className="ml-auto h-5 w-5 text-secondary" />
            )}
          </div>

          <div className="rounded-lg bg-muted/50 p-4 mb-4">
            <p className="text-lg">{problem.question}</p>
          </div>

          {/* Answer Input */}
          <div className="flex gap-3 mb-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
              <Input
                type="number"
                placeholder="Your answer"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className={cn(
                  "pl-8",
                  isCorrect === true && "border-secondary bg-secondary/10",
                  isCorrect === false && "border-destructive bg-destructive/10"
                )}
              />
            </div>
            <Button onClick={checkAnswer}>Check</Button>
          </div>

          {/* Feedback */}
          {isCorrect !== null && (
            <div className={cn(
              "flex items-center gap-2 rounded-lg p-3",
              isCorrect ? "bg-secondary/20 text-secondary" : "bg-destructive/20 text-destructive"
            )}>
              {isCorrect ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span>Correct! Well done!</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5" />
                  <span>Not quite. Try again!</span>
                </>
              )}
            </div>
          )}

          {/* Hint */}
          {!isCorrect && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => setShowHint(!showHint)}
            >
              <Lightbulb className="mr-1 h-4 w-4 text-accent" />
              {showHint ? "Hide Hint" : "Show Hint"}
            </Button>
          )}
          {showHint && (
            <div className="mt-2 rounded-lg bg-accent/10 p-3">
              <p className="text-sm">💡 {problem.hint}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mb-4 flex justify-between slide-up" style={{ animationDelay: "150ms" }}>
          <Button
            variant="outline"
            onClick={prevProblem}
            disabled={currentProblem === 0}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <Button
            onClick={nextProblem}
            disabled={currentProblem === problems.length - 1}
          >
            Next
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {/* Progress */}
        <div className="rounded-xl border border-border bg-card p-4 slide-up" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-heading font-semibold">Mission Progress</h4>
            <GameBadge variant="accent" size="sm">
              +100 🪙
            </GameBadge>
          </div>
          <AnimatedProgress value={progress} variant="success" />
          <p className="mt-2 text-sm text-muted-foreground">
            {progress === 100 
              ? "🎉 All problems solved! Mission complete!"
              : `Solve all problems to complete the mission`}
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
