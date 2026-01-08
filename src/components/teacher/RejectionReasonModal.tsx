/**
 * REJECTION REASON MODAL
 * Non-punitive, supportive rejection dialog for task verification
 * Guides teachers to give constructive, encouraging feedback
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { AlertCircle, Lightbulb, CheckCircle2 } from "lucide-react";

interface RejectionReasonModalProps {
  taskTitle: string;
  studentName: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  isLoading?: boolean;
}

export function RejectionReasonModal({
  taskTitle,
  studentName,
  open,
  onClose,
  onSubmit,
  isLoading = false,
}: RejectionReasonModalProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(
    null
  );

  const suggestions = [
    {
      id: "clarity",
      label: t("teacher.claritySuggestion", {
        defaultValue: "Please provide a clearer explanation",
      }),
      template: t("teacher.clarityTemplate", {
        defaultValue:
          "Your submission shows effort, but the explanation could be clearer. Try to add more detail about your understanding.",
      }),
    },
    {
      id: "evidence",
      label: t("teacher.evidenceSuggestion", {
        defaultValue: "Need more evidence of learning",
      }),
      template: t("teacher.evidenceTemplate", {
        defaultValue:
          "Good start! However, the submission doesn't fully show your understanding of the concept. Can you provide more details?",
      }),
    },
    {
      id: "photo",
      label: t("teacher.photoSuggestion", {
        defaultValue: "Photo is not clear enough",
      }),
      template: t("teacher.photoTemplate", {
        defaultValue:
          "The photo is a bit blurry or hard to see. Could you take a clearer picture and submit again?",
      }),
    },
    {
      id: "complete",
      label: t("teacher.completeSuggestion", {
        defaultValue: "Task not fully completed",
      }),
      template: t("teacher.completeTemplate", {
        defaultValue:
          "You're on the right track! However, you haven't completed all parts of the task. Please revisit the instructions and try again.",
      }),
    },
    {
      id: "custom",
      label: t("teacher.customReason", { defaultValue: "Write custom feedback" }),
      template: "",
    },
  ];

  const handleSelectSuggestion = (template: string) => {
    if (template) {
      setReason(template);
    } else {
      setReason("");
    }
  };

  const handleSubmit = () => {
    if (reason.trim()) {
      onSubmit(reason);
      setReason("");
      setSelectedSuggestion(null);
    }
  };

  const handleClose = () => {
    setReason("");
    setSelectedSuggestion(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {t("teacher.provideFeedback", { defaultValue: "Provide Supportive Feedback" })}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {t("teacher.feedbackGuide", {
              defaultValue:
                "Help {{studentName}} improve by giving constructive, encouraging feedback on their \"{{taskTitle}}\" submission.",
              defaultValue_backup: "Help the student improve with constructive feedback.",
            }).replace("{{studentName}}", studentName).replace("{{taskTitle}}", taskTitle)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Guidance Box */}
          <Card className="border-secondary/30 bg-secondary/5 p-4 backdrop-blur-sm">
            <div className="flex gap-3">
              <Lightbulb className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-secondary mb-1">
                  {t("teacher.feedbackTip", {
                    defaultValue: "Tips for Good Feedback",
                  })}
                </p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>✓ {t("teacher.tip1", { defaultValue: "Be specific about what can improve" })}</li>
                  <li>✓ {t("teacher.tip2", { defaultValue: "Acknowledge their effort" })}</li>
                  <li>✓ {t("teacher.tip3", { defaultValue: "Suggest how to try again" })}</li>
                  <li>✗ {t("teacher.avoidTip", { defaultValue: "Avoid words like \"wrong\" or \"bad\"" })}</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Quick Suggestion Buttons */}
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {t("teacher.quickSuggestions", {
                defaultValue: "Or choose a suggestion to customize",
              })}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => {
                    setSelectedSuggestion(suggestion.id);
                    handleSelectSuggestion(suggestion.template);
                  }}
                  className={`text-left p-3 rounded-lg border-2 transition-all ${
                    selectedSuggestion === suggestion.id
                      ? "border-secondary bg-secondary/10"
                      : "border-border/50 bg-card/40 hover:border-secondary/30"
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">
                    {suggestion.label}
                  </p>
                  {suggestion.template && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {suggestion.template}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Text Area */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("teacher.yourFeedback", { defaultValue: "Your Feedback" })}
            </label>
            <Textarea
              placeholder={t("teacher.feedbackPlaceholder", {
                defaultValue:
                  "Write supportive, constructive feedback that encourages the student to improve...",
              })}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-28 resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {reason.length > 0 && `${reason.length} characters`}
            </p>
          </div>

          {/* Preview */}
          {reason && (
            <Card className="border-primary/30 bg-primary/5 p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary/70 mb-2">
                {t("teacher.previewFeedback", { defaultValue: "How it will appear to student" })}
              </p>
              <p className="text-sm text-foreground">{reason}</p>
            </Card>
          )}

          {/* Support Message */}
          <div className="rounded-lg border border-accent/20 bg-accent/5 p-3 flex gap-2">
            <AlertCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              {t("teacher.feedbackMessage", {
                defaultValue:
                  "Remember: Your feedback is a chance to encourage and guide learning, not to judge or discourage.",
              })}
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            {t("common.cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason.trim() || isLoading}
            className="bg-secondary hover:bg-secondary/90"
          >
            {isLoading ? "..." : t("teacher.submitFeedback", { defaultValue: "Submit Feedback" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
