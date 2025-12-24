import { AppLayout } from "@/components/navigation";
import { VillageSkillsActiveLearning } from "@/components/active-learning/VillageSkillsActiveLearning";
import { Button } from "@/components/ui/button";
import { TreePine, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function VillageSkillsActiveLearningPage() {
  const navigate = useNavigate();

  return (
    <AppLayout role="student" playCoins={1250} title="Village Skills - Active Learning">
      <div className="px-4 py-6 pb-24">
        {/* Header */}
        <div className="mb-6 slide-up">
          <div className="glass-card rounded-2xl p-5 border border-border bg-gradient-to-br from-secondary/20 to-secondary/5">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-2xl bg-secondary/30 flex items-center justify-center">
                <TreePine className="h-8 w-8 text-secondary" />
              </div>
              <div className="flex-1">
                <h2 className="font-heading text-2xl font-bold text-foreground">
                  Interactive Modules
                </h2>
                <p className="text-sm text-muted-foreground">
                  Learn practical village and life skills through hands-on activities!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Learning Content */}
        <div className="mb-6 slide-up" style={{ animationDelay: "100ms" }}>
          <VillageSkillsActiveLearning />
        </div>

        {/* Back Button */}
        <div className="slide-up" style={{ animationDelay: "200ms" }}>
          <Button
            variant="outline"
            onClick={() => navigate("/learn/village-skills/levels")}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Game Levels
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
