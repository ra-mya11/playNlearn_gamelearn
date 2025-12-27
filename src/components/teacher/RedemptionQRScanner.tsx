/**
 * TEACHER DASHBOARD - REDEMPTION QR SCANNER
 * Allows teachers to scan and verify student reward redemptions
 * Simple offline-capable interface for village settings
 */

import { useState, useEffect } from "react";
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
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RewardVerificationCard } from "./RewardVerificationCard";
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  XCircle,
  QrCode,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { validateRedemptionQR } from "@/lib/qr-utils";
import { useSoundEffects } from "@/hooks/use-sound-effects";
import type { RedemptionData } from "@/lib/qr-utils";

interface ScannedRedemption {
  id: string;
  studentId: string;
  productId: string;
  redemptionCode: string;
  token: string;
  timestamp: number;
  expiry: number;
  studentName?: string;
  productName?: string;
  productImage?: string;
  eduCoinsUsed?: number;
}

interface RedemptionQRScannerProps {
  open: boolean;
  onClose: () => void;
  onVerify?: (redemptionCode: string, approved: boolean, reason?: string) => Promise<void>;
}

type ScannerStep = "scan" | "review" | "result";
type ActionResult = "verified" | "rejected" | null;

export function RedemptionQRScanner({
  open,
  onClose,
  onVerify,
}: RedemptionQRScannerProps) {
  const { t } = useTranslation();
  const { playQRRedemption } = useSoundEffects();
  const [step, setStep] = useState<ScannerStep>("scan");
  const [scannedData, setScannedData] = useState<ScannedRedemption | null>(null);
  const [actionResult, setActionResult] = useState<ActionResult>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResultAnimation, setShowResultAnimation] = useState(false);

  const handleScan = (qrString: string) => {
    const validation = validateRedemptionQR(qrString);

    if (!validation.valid) {
      toast.error(
        validation.error ||
          t("teacher.invalidQRCode", { defaultValue: "Invalid QR code" })
      );
      return;
    }

    // Extract scanned data
    const data = validation.data as ScannedRedemption;
    setScannedData(data);
    setStep("review");
  };

  const handleVerify = async (approved: boolean) => {
    if (!scannedData) return;

    setIsProcessing(true);

    try {
      // Call parent verification handler if provided
      await onVerify?.(
        scannedData.redemptionCode,
        approved,
        approved ? undefined : rejectionReason
      );

      setActionResult(approved ? "verified" : "rejected");
      setStep("result");

      // Play success sound and show animation
      if (approved) {
        setTimeout(() => {
          setShowResultAnimation(true);
          playQRRedemption?.();
        }, 100);
      }
    } catch (error) {
      toast.error(
        t("teacher.verificationFailed", {
          defaultValue: "Verification failed. Please try again.",
        })
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setStep("scan");
    setScannedData(null);
    setActionResult(null);
    setRejectionReason("");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleManualInput = (code: string) => {
    // Allow manual entry of redemption code for offline scenarios
    handleScan(code);
  };

  const handleCopyCode = () => {
    if (scannedData?.redemptionCode) {
      navigator.clipboard.writeText(scannedData.redemptionCode);
      toast.success(
        t("teacher.codeCopied", { defaultValue: "Code copied!" })
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === "scan" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                {t("teacher.scanRewardQR", {
                  defaultValue: "Scan Student Reward QR",
                })}
              </DialogTitle>
              <DialogDescription>
                {t("teacher.scanInstructions", {
                  defaultValue:
                    "Scan the student's QR code or enter the redemption code manually",
                })}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Scan Button (In real app, would open camera) */}
              <Button
                variant="outline"
                className="w-full gap-2 py-6"
                onClick={() => {
                  // In production, would use device camera API
                  // For now, show demo functionality
                  toast.info(
                    t("teacher.cameraNotAvailable", {
                      defaultValue:
                        "Camera scanning would be available on mobile",
                    })
                  );
                }}
              >
                <Camera className="h-5 w-5" />
                {t("teacher.openCamera", { defaultValue: "Open Camera" })}
              </Button>

              {/* Manual Input Fallback */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card px-2 text-muted-foreground">
                    {t("common.or", { defaultValue: "Or" })}
                  </span>
                </div>
              </div>

              {/* Manual Redemption Code Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("teacher.manualCode", {
                    defaultValue: "Enter Redemption Code",
                  })}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="EDU-ABC-1234"
                    maxLength={15}
                    className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm placeholder-muted-foreground focus:border-primary focus:outline-none"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        const code = (e.target as HTMLInputElement).value;
                        if (code.trim()) {
                          handleManualInput(code);
                          (e.target as HTMLInputElement).value = "";
                        }
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={(e) => {
                      const input = (
                        e.currentTarget.parentElement?.querySelector("input")
                      ) as HTMLInputElement;
                      if (input?.value.trim()) {
                        handleManualInput(input.value);
                        input.value = "";
                      }
                    }}
                  >
                    {t("common.scan", { defaultValue: "Scan" })}
                  </Button>
                </div>
              </div>

              {/* Demo hint */}
              <div className="rounded-lg border border-accent/20 bg-accent/5 p-3 text-xs text-muted-foreground">
                <p className="font-medium mb-1">Demo Hint:</p>
                <p>Enter any code in format "EDU-XXX-XXXX" to test verification</p>
              </div>
            </div>
          </>
        )}

        {step === "review" && scannedData && (
          <>
            <DialogHeader>
              <DialogTitle>
                {t("teacher.verifyRedemption", {
                  defaultValue: "Verify Redemption",
                })}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {/* Reward Verification Card */}
              <RewardVerificationCard
                studentName={scannedData.studentName || "Student"}
                productName={scannedData.productName || "Reward"}
                productImage={scannedData.productImage}
                eduCoinsUsed={scannedData.eduCoinsUsed || 0}
                redemptionCode={scannedData.redemptionCode}
                isExpired={scannedData.expiry < Date.now()}
                showAnimation={false}
              />

              {/* Rejection Reason (if needed) */}
              {scannedData.expiry >= Date.now() && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("teacher.rejectionReason", {
                      defaultValue: "Rejection Reason (if rejecting)",
                    })}
                  </label>
                  <Textarea
                    placeholder={t("teacher.rejectionReasonPlaceholder", {
                      defaultValue:
                        "Only fill this if you're rejecting the redemption. Be supportive and constructive.",
                    })}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="min-h-24 resize-none"
                  />
                </div>
              )}
            </div>

            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep("scan")}
                disabled={isProcessing}
              >
                {t("common.cancel", { defaultValue: "Cancel" })}
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleVerify(false)}
                disabled={
                  isProcessing || scannedData.expiry < Date.now()
                }
              >
                {isProcessing ? "..." : t("teacher.reject", { defaultValue: "Reject" })}
              </Button>
              <Button
                onClick={() => handleVerify(true)}
                disabled={
                  isProcessing || scannedData.expiry < Date.now()
                }
                className="bg-secondary hover:bg-secondary/90"
              >
                {isProcessing ? "..." : t("teacher.verify", { defaultValue: "Verify & Hand Over" })}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "result" && (
          <>
            <DialogHeader>
              <DialogTitle>
                {actionResult === "verified"
                  ? t("teacher.verificationSuccess", {
                      defaultValue: "Reward Verified!",
                    })
                  : t("teacher.rejectionConfirmed", {
                      defaultValue: "Redemption Declined",
                    })}
              </DialogTitle>
            </DialogHeader>

            <div className={`flex flex-col items-center gap-4 py-8 ${showResultAnimation ? "animate-success-pulse" : ""}`}>
              {actionResult === "verified" ? (
                <>
                  <div className={`rounded-full p-6 transition-all ${
                    showResultAnimation
                      ? "bg-secondary/20 scale-100"
                      : "bg-secondary/10 scale-95"
                  }`}>
                    <CheckCircle2
                      className={`h-16 w-16 text-secondary transition-all ${
                        showResultAnimation ? "animate-bounce" : ""
                      }`}
                    />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="font-heading text-2xl font-bold text-foreground">
                      {t("teacher.rewardHandedOver", {
                        defaultValue: "Reward Given!",
                      })}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {scannedData?.studentName || "Student"} can now collect their reward
                    </p>
                    <code className="block font-mono text-xs text-primary mt-2">
                      {scannedData?.redemptionCode}
                    </code>
                  </div>

                  {/* Success feedback */}
                  <div className="w-full rounded-lg bg-secondary/10 border border-secondary/20 p-4 text-center">
                    <p className="text-sm text-secondary font-medium">
                      ✓ {t("teacher.offlineTransaction", {
                        defaultValue: "This transaction has been saved offline",
                      })}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-full bg-destructive/10 p-6">
                    <XCircle className="h-16 w-16 text-destructive" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="font-heading text-2xl font-bold text-foreground">
                      {t("teacher.redemptionDeclined", {
                        defaultValue: "Redemption Declined",
                      })}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {scannedData?.studentName || "Student"} has been notified
                    </p>
                  </div>

                  {/* Rejection reason shown */}
                  {rejectionReason && (
                    <div className="w-full rounded-lg bg-destructive/5 border border-destructive/20 p-4">
                      <p className="text-xs font-semibold text-destructive/70 mb-2">
                        {t("teacher.reasonGiven", { defaultValue: "Reason" })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {rejectionReason}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            <DialogFooter>
              <Button
                onClick={handleReset}
                className={`w-full ${
                  actionResult === "verified"
                    ? "bg-secondary hover:bg-secondary/90"
                    : "bg-primary hover:bg-primary/90"
                }`}
              >
                {t("teacher.scanAnother", {
                  defaultValue: "Scan Another QR",
                })}
              </Button>
            </DialogFooter>

            <style>{`
              @keyframes success-pulse {
                0% {
                  opacity: 0;
                  transform: scale(0.95);
                }
                100% {
                  opacity: 1;
                  transform: scale(1);
                }
              }

              .animate-success-pulse {
                animation: success-pulse 0.6s ease-out;
              }

              @media (prefers-reduced-motion: reduce) {
                .animate-success-pulse {
                  animation: none;
                  opacity: 1;
                }
              }
            `}</style>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
