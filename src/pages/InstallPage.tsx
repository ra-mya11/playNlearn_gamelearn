import { usePWA } from "@/hooks/use-pwa";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Zap, 
  CheckCircle,
  Share,
  PlusSquare,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";

export default function InstallPage() {
  const { isInstallable, isInstalled, installApp, isOnline } = usePWA();

  const handleInstall = async () => {
    await installApp();
  };

  const features = [
    { icon: WifiOff, title: "Works Offline", description: "Learn without internet" },
    { icon: Zap, title: "Lightning Fast", description: "Instant loading times" },
    { icon: Smartphone, title: "Native Feel", description: "Just like a real app" },
  ];

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="safe-area-top bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link to="/splash" className="p-2 -ml-2">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-heading text-lg font-semibold">Install App</h1>
        </div>
      </div>

      <div className="px-4 py-8">
        {/* App Icon */}
        <div className="mb-8 flex flex-col items-center text-center slide-up">
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/30">
            <span className="font-display text-4xl text-white">P</span>
          </div>
          <h2 className="font-heading text-2xl font-bold">PlayNlearn</h2>
          <p className="mt-1 text-muted-foreground">Learn, Earn, Transform</p>
        </div>

        {/* Status */}
        <div className="mb-8 slide-up" style={{ animationDelay: "100ms" }}>
          {isInstalled ? (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-secondary/10 p-4 text-secondary">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">App is installed!</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-muted p-4">
              <span className={`h-2 w-2 rounded-full ${isOnline ? "bg-secondary" : "bg-destructive"}`} />
              <span className="text-sm text-muted-foreground">
                {isOnline ? "Ready to install" : "Offline - connect to install"}
              </span>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mb-8 grid grid-cols-3 gap-3 slide-up" style={{ animationDelay: "150ms" }}>
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-center rounded-xl border border-border bg-card p-4 text-center"
            >
              <feature.icon className="mb-2 h-6 w-6 text-primary" />
              <p className="text-sm font-medium">{feature.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Install Section */}
        <div className="slide-up" style={{ animationDelay: "200ms" }}>
          {isInstalled ? (
            <div className="text-center">
              <p className="mb-4 text-muted-foreground">
                You're all set! Open the app from your home screen.
              </p>
              <Link to="/splash">
                <Button className="w-full">
                  Continue to App
                </Button>
              </Link>
            </div>
          ) : isInstallable ? (
            <Button onClick={handleInstall} className="w-full gap-2" size="lg">
              <Download className="h-5 w-5" />
              Install PlayNlearn
            </Button>
          ) : isIOS ? (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 font-heading font-semibold">Install on iPhone/iPad</h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    1
                  </div>
                  <div className="flex-1">
                    <p>Tap the Share button</p>
                    <Share className="mt-1 h-5 w-5" />
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    2
                  </div>
                  <div className="flex-1">
                    <p>Select "Add to Home Screen"</p>
                    <PlusSquare className="mt-1 h-5 w-5" />
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    3
                  </div>
                  <p className="flex-1">Tap "Add" to install</p>
                </li>
              </ol>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <p className="text-muted-foreground">
                Open this page in Chrome or Safari to install the app.
              </p>
            </div>
          )}
        </div>

        {/* Skip Link */}
        {!isInstalled && (
          <div className="mt-6 text-center slide-up" style={{ animationDelay: "250ms" }}>
            <Link to="/splash" className="text-sm text-muted-foreground hover:text-foreground">
              Continue without installing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
