import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

export interface ConceptIntroPopupProps {
  isOpen: boolean;
  onStart: () => void;
  conceptName: string;
  whatYouWillUnderstand: string;
  gameSteps: string[];
  successMeaning: string;
  icon?: React.ReactNode;
  onGoBack?: () => void;
}

export function ConceptIntroPopup({
  isOpen,
  onStart,
  conceptName,
  whatYouWillUnderstand,
  gameSteps,
  successMeaning,
  icon,
  onGoBack,
}: ConceptIntroPopupProps) {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      navigate("/student/biology");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px] glass-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {icon && <span className="text-2xl">{icon}</span>}
            <span>{conceptName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* What You Will Understand */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">📘</span>
              <h4 className="font-semibold text-foreground">What You Will Understand</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed ml-7">
              {whatYouWillUnderstand}
            </p>
          </div>

          {/* How This Game Works */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎮</span>
              <h4 className="font-semibold text-foreground">How This Game Works</h4>
            </div>
            <div className="ml-7 space-y-2">
              {gameSteps.map((step, index) => (
                <div key={index} className="flex gap-3">
                  <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-sm text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* What Success Means */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏆</span>
              <h4 className="font-semibold text-foreground">What Success Means</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed ml-7">
              {successMeaning}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            onClick={handleGoBack}
            className="flex-1"
          >
            ⬅️ Go Back
          </Button>
          <Button
            onClick={onStart}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            ▶️ Start Game
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
