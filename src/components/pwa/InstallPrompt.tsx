import { usePWA } from "@/hooks/use-pwa";
import { Button } from "@/components/ui/button";
import { Download, X, Smartphone } from "lucide-react";
import { useState, useEffect } from "react";

export function InstallPrompt() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [dismissed, setDismissed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Show prompt after a delay if installable
    if (isInstallable && !isInstalled && !dismissed) {
      const timer = setTimeout(() => setShowPrompt(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, dismissed]);

  if (!showPrompt || dismissed) return null;

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowPrompt(false);
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <div className="rounded-xl border border-primary/30 bg-card p-4 shadow-lg shadow-primary/10">
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Smartphone className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading font-semibold">Install PlayNlearn</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add to home screen for offline access and the best experience!
            </p>
            <Button
              onClick={handleInstall}
              className="mt-3 gap-2"
              size="sm"
            >
              <Download className="h-4 w-4" />
              Install App
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
