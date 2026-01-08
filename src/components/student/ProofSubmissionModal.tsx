/**
 * PROOF SUBMISSION MODAL
 * Handles photo, text, and auto proof submission flows
 * Multi-step workflow with validation and preview
 */

import { useState, useRef } from "react";
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
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Camera, FileText, CheckCircle2, Upload, X } from "lucide-react";
import type { ProofPolicy, ProofType, TaskDefinition } from "@/integrations/supabase/tasks.types";

interface ProofSubmissionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (proofType: ProofType, data: any) => Promise<void>;
  taskDefinition: TaskDefinition;
  isLoading?: boolean;
}

type SubmissionStep = "select_type" | "upload" | "review" | "confirm";

interface SubmissionState {
  step: SubmissionStep;
  selectedProofType?: ProofType;
  photoFile?: File;
  photoPreview?: string;
  textContent?: string;
  validationErrors: string[];
  uploadProgress: number;
  isSubmitting: boolean;
}

export function ProofSubmissionModal({
  open,
  onClose,
  onSubmit,
  taskDefinition,
  isLoading = false,
}: ProofSubmissionModalProps) {
  const [state, setState] = useState<SubmissionState>({
    step: "select_type",
    validationErrors: [],
    uploadProgress: 0,
    isSubmitting: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const policy = taskDefinition.proofPolicy;

  // =========================================================================
  // STEP 1: SELECT PROOF TYPE
  // =========================================================================

  const handleSelectProofType = (proofType: ProofType) => {
    setState((prev) => ({
      ...prev,
      selectedProofType: proofType,
      step: "upload",
      validationErrors: [],
    }));
  };

  // =========================================================================
  // STEP 2: UPLOAD/INPUT PROOF
  // =========================================================================

  const handlePhotoSelect = async (file: File) => {
    const errors: string[] = [];

    // Validate file size
    if (policy.maxFileSize && file.size > policy.maxFileSize) {
      errors.push(`File size must be less than ${policy.maxFileSize / 1024 / 1024}MB`);
    }

    // Validate file type
    if (policy.acceptedFileTypes && !policy.acceptedFileTypes.includes(file.type)) {
      errors.push("Invalid file type. Please upload a JPEG, PNG, or WebP image.");
    }

    if (errors.length > 0) {
      setState((prev) => ({
        ...prev,
        validationErrors: errors,
      }));
      return;
    }

    // Generate preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setState((prev) => ({
        ...prev,
        photoFile: file,
        photoPreview: e.target?.result as string,
        step: "review",
        validationErrors: [],
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleTextChange = (text: string) => {
    const errors: string[] = [];
    const wordCount = text.trim().split(/\s+/).filter((w) => w.length > 0).length;

    if (policy.minTextLength && wordCount < policy.minTextLength) {
      errors.push(`Minimum ${policy.minTextLength} words required (${wordCount} so far)`);
    }

    if (policy.maxTextLength && wordCount > policy.maxTextLength) {
      errors.push(`Maximum ${policy.maxTextLength} words allowed (${wordCount} entered)`);
    }

    setState((prev) => ({
      ...prev,
      textContent: text,
      validationErrors: errors,
    }));
  };

  // =========================================================================
  // STEP 3: REVIEW
  // =========================================================================

  const handleReviewSubmit = async () => {
    setState((prev) => ({
      ...prev,
      step: "confirm",
      isSubmitting: true,
    }));

    try {
      const proofData =
        state.selectedProofType === "photo"
          ? {
              photo: {
                file: state.photoFile,
                preview: state.photoPreview,
              },
            }
          : state.selectedProofType === "text"
            ? {
                text: {
                  content: state.textContent,
                },
              }
            : {};

      await onSubmit(state.selectedProofType || "none", proofData);

      // Show success state then close
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        step: "review",
        isSubmitting: false,
        validationErrors: [
          error instanceof Error ? error.message : "Failed to submit proof",
        ],
      }));
    }
  };

  const handleClose = () => {
    setState({
      step: "select_type",
      validationErrors: [],
      uploadProgress: 0,
      isSubmitting: false,
    });
    onClose();
  };

  // =========================================================================
  // UI RENDERING
  // =========================================================================

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Submit Your Proof</DialogTitle>
          <DialogDescription>
            Show us what you accomplished! Choose a proof method below.
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicators */}
        <div className="flex gap-1 my-4">
          {(["select_type", "upload", "review", "confirm"] as const).map((step, idx) => (
            <div
              key={step}
              className={`h-1 flex-1 rounded-full transition-all ${
                state.step === step || (state.step === "confirm" && step === "review")
                  ? "bg-primary"
                  : state.validationErrors.length === 0 &&
                      (["select_type", "upload", "review", "confirm"].indexOf(state.step) >
                      ["select_type", "upload", "review", "confirm"].indexOf(step))
                    ? "bg-primary/30"
                    : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* STEP 1: SELECT PROOF TYPE */}
        {state.step === "select_type" && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">How would you like to submit?</p>

            {policy.type !== "none" && policy.type !== "auto" && (
              <>
                {(policy.type === "photo" || policy.type === "none") && (
                  <button
                    onClick={() => handleSelectProofType("photo")}
                    className="w-full glass-card border border-border p-4 rounded-lg text-left hover:border-primary/50 hover:bg-primary/5 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20">
                        <Camera className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">Upload a photo</p>
                        <p className="text-xs text-muted-foreground">Show your work visually</p>
                      </div>
                    </div>
                  </button>
                )}

                {(policy.type === "text" || policy.type === "none") && (
                  <button
                    onClick={() => handleSelectProofType("text")}
                    className="w-full glass-card border border-border p-4 rounded-lg text-left hover:border-primary/50 hover:bg-primary/5 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20">
                        <FileText className="h-5 w-5 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">Write a reflection</p>
                        <p className="text-xs text-muted-foreground">Explain what you learned</p>
                      </div>
                    </div>
                  </button>
                )}
              </>
            )}

            {policy.type === "auto" && (
              <div className="glass-card border border-border p-4 rounded-lg text-center">
                <CheckCircle2 className="h-8 w-8 text-secondary mx-auto mb-2" />
                <p className="font-medium text-foreground mb-1">Auto-verified task</p>
                <p className="text-sm text-muted-foreground">This task is automatically tracked</p>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: UPLOAD */}
        {state.step === "upload" && state.selectedProofType === "photo" && (
          <div className="space-y-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={policy.acceptedFileTypes?.join(",") || "image/*"}
                onChange={(e) => e.target.files?.[0] && handlePhotoSelect(e.target.files[0])}
                className="hidden"
              />
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2 group-hover:text-primary" />
              <p className="font-medium text-foreground mb-1">Click to upload a photo</p>
              <p className="text-xs text-muted-foreground">
                or drag and drop
                {policy.maxFileSize && ` (Max ${policy.maxFileSize / 1024 / 1024}MB)`}
              </p>
            </div>

            {state.validationErrors.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                {state.validationErrors.map((error, idx) => (
                  <p key={idx} className="text-xs text-destructive flex items-start gap-2 mb-1">
                    <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                    {error}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {state.step === "upload" && state.selectedProofType === "text" && (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Your reflection
              </label>
              <Textarea
                placeholder="Share what you learned and how you felt about this task..."
                value={state.textContent || ""}
                onChange={(e) => handleTextChange(e.target.value)}
                className="min-h-[120px] resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  {policy.minTextLength && `Minimum ${policy.minTextLength} words`}
                  {policy.minTextLength && policy.maxTextLength && " · "}
                  {policy.maxTextLength && `Maximum ${policy.maxTextLength} words`}
                </p>
                <Badge variant="outline" className="text-xs">
                  {(state.textContent || "").split(/\s+/).filter((w) => w.length > 0).length} words
                </Badge>
              </div>
            </div>

            {state.validationErrors.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                {state.validationErrors.map((error, idx) => (
                  <p key={idx} className="text-xs text-destructive flex items-start gap-2">
                    <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                    {error}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: REVIEW */}
        {state.step === "review" && state.selectedProofType === "photo" && state.photoPreview && (
          <div className="space-y-3">
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
              <img src={state.photoPreview} alt="Proof preview" className="w-full h-full object-cover" />
            </div>
            <p className="text-sm text-muted-foreground">
              Make sure the photo clearly shows your work. You can add a caption below if needed.
            </p>
            <input
              type="text"
              placeholder="Optional: Add a caption to your photo"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
            />
          </div>
        )}

        {state.step === "review" && state.selectedProofType === "text" && state.textContent && (
          <div className="space-y-3">
            <div className="glass-card border border-border p-4 rounded-lg max-h-[200px] overflow-y-auto">
              <p className="text-sm text-foreground whitespace-pre-wrap">{state.textContent}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Review your reflection above. Make sure it clearly explains what you learned.
            </p>
          </div>
        )}

        {/* STEP 4: SUCCESS */}
        {state.step === "confirm" && state.isSubmitting && (
          <div className="py-8 text-center space-y-3">
            <div className="animate-spin h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full mx-auto" />
            <p className="text-sm font-medium text-foreground">Submitting your proof...</p>
          </div>
        )}

        {state.step === "confirm" && !state.isSubmitting && (
          <div className="py-8 text-center space-y-3 animate-scale-in">
            <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Proof submitted!</p>
              <p className="text-sm text-muted-foreground">
                {policy.reviewType === "auto" ? "Your task is now complete!" : "Waiting for review..."}
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2">
          {state.step !== "confirm" && (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}

          {(state.step === "upload" || state.step === "review") && (
            <Button
              onClick={() =>
                state.step === "upload"
                  ? setState((prev) => ({ ...prev, step: "review" }))
                  : handleReviewSubmit()
              }
              disabled={
                state.validationErrors.length > 0 ||
                (state.selectedProofType === "photo" && !state.photoPreview) ||
                (state.selectedProofType === "text" && !state.textContent)
              }
              className="flex-1"
            >
              {state.step === "upload" ? "Review" : "Submit Proof"}
            </Button>
          )}

          {state.step === "select_type" && (
            <Button onClick={() => setState((prev) => ({ ...prev, step: "upload" }))} disabled>
              Next
            </Button>
          )}

          {state.step === "confirm" && (
            <Button onClick={handleClose} className="flex-1">
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
