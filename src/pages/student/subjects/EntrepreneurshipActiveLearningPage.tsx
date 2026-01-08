import { AppLayout } from "@/components/navigation";
import { EntrepreneurshipActiveLearning } from "@/components/active-learning/EntrepreneurshipActiveLearning";
import { Button } from "@/components/ui/button";
import { Lightbulb, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EntrepreneurshipActiveLearningPage() {
  const navigate = useNavigate();

  return (
    <AppLayout role="student" playCoins={1250} title="Entrepreneurship - Active Learning">
      <div className="px-4 py-6 pb-24">
        {/* Header */}
        <div className="mb-6 slide-up">
          <div className="glass-card rounded-2xl p-5 border border-border bg-gradient-to-br from-badge/20 to-badge/5">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-2xl bg-badge/30 flex items-center justify-center">
                <Lightbulb className="h-8 w-8 text-badge" />
              </div>
              <div className="flex-1">
                <h2 className="font-heading text-2xl font-bold text-foreground">
                  Interactive Modules
                </h2>
                <p className="text-sm text-muted-foreground">
                  Learn business thinking through solving real problems!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Learning Content */}
        <div className="mb-6 slide-up" style={{ animationDelay: "100ms" }}>
          <EntrepreneurshipActiveLearning />
        </div>

        {/* Back Button */}
        <div className="slide-up" style={{ animationDelay: "200ms" }}>
          <Button
            variant="outline"
            onClick={() => navigate("/learn/entrepreneurship/levels")}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Modules List
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
