import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/navigation/AppLayout";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Toggle } from "@/components/ui/toggle";
import {
  Globe,
  Bell,
  Volume2,
  Palette,
  Database,
  Lock,
  ChevronRight,
  Info,
  Wifi,
  WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePWA } from "@/hooks/use-pwa";

interface SettingItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  action: React.ReactNode;
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isOnline } = usePWA();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isLanguageSelectorOpen, setIsLanguageSelectorOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "error">(
    "synced"
  );

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sound_enabled");
    if (saved !== null) {
      setSoundEnabled(JSON.parse(saved));
    }
  }, []);

  // Save sound setting to localStorage
  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem("sound_enabled", JSON.stringify(enabled));
  };

  const handleLanguageClick = () => {
    setIsLanguageSelectorOpen(true);
  };

  const handleSync = async () => {
    setSyncStatus("syncing");
    // Simulate sync
    setTimeout(() => {
      setSyncStatus("synced");
    }, 2000);
  };

  const settings: SettingItem[] = [
    {
      id: "language",
      icon: <Globe className="h-6 w-6 text-secondary" />,
      title: t("common.language") || "Language",
      description: `Currently: ${i18n.language.toUpperCase()}`,
      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={handleLanguageClick}
          className="flex items-center gap-1"
        >
          {i18n.language.toUpperCase()}
          <ChevronRight className="h-4 w-4" />
        </Button>
      ),
    },
    {
      id: "notifications",
      icon: <Bell className="h-6 w-6 text-primary" />,
      title: "Notifications",
      description: "Receive updates about your learning progress",
      action: (
        <Toggle
          pressed={notificationsEnabled}
          onPressedChange={setNotificationsEnabled}
          className="bg-primary/10 hover:bg-primary/20"
        >
          {notificationsEnabled ? "On" : "Off"}
        </Toggle>
      ),
    },
    {
      id: "sound",
      icon: <Volume2 className="h-6 w-6 text-accent" />,
      title: "Sound Effects",
      description: "Enable audio feedback during games and interactions",
      action: (
        <Toggle
          pressed={soundEnabled}
          onPressedChange={handleSoundToggle}
          className="bg-accent/10 hover:bg-accent/20"
        >
          {soundEnabled ? "On" : "Off"}
        </Toggle>
      ),
    },
    {
      id: "theme",
      icon: <Palette className="h-6 w-6 text-badge" />,
      title: "Theme",
      description: "Coming soon - Choose your preferred theme",
      action: (
        <button
          disabled
          className="px-4 py-2 rounded-lg bg-muted/50 text-muted-foreground text-sm font-medium cursor-not-allowed opacity-50"
        >
          Future
        </button>
      ),
    },
    {
      id: "sync",
      icon: isOnline ? (
        <Wifi className="h-6 w-6 text-secondary" />
      ) : (
        <WifiOff className="h-6 w-6 text-destructive" />
      ),
      title: "Data Sync",
      description: isOnline
        ? "Your data is synced with the server"
        : "Offline - Will sync when online",
      action: (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full",
              syncStatus === "synced"
                ? "bg-secondary/20 text-secondary"
                : syncStatus === "syncing"
                  ? "bg-primary/20 text-primary"
                  : "bg-destructive/20 text-destructive"
            )}
          >
            {syncStatus === "syncing" && (
              <div className="h-2 w-2 rounded-full bg-current animate-pulse" />
            )}
            {syncStatus === "synced" ? "Synced" : syncStatus === "syncing" ? "Syncing..." : "Error"}
          </span>
          {isOnline && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSync}
              disabled={syncStatus === "syncing"}
            >
              Sync
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AppLayout
      role="student"
      title="Settings"
      showTabBar
      showBreadcrumb
      className="space-y-8"
    >
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 px-4 py-6 pb-28 relative overflow-hidden">
        {/* Animated Background Decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-40" />
        <div className="absolute bottom-32 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 opacity-40" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="font-heading text-3xl font-bold text-foreground">
              Settings
            </h1>
            <p className="text-muted-foreground">
              Customize your learning experience
            </p>
          </div>

          {/* Settings Groups */}
          <div className="space-y-6">
            {/* Appearance & Learning Settings */}
            <div className="space-y-3">
              <h2 className="font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Preferences
              </h2>
              <div className="space-y-3">
                {settings
                  .filter((item) =>
                    [
                      "language",
                      "notifications",
                      "sound",
                      "theme",
                    ].includes(item.id)
                  )
                  .map((setting) => (
                    <div
                      key={setting.id}
                      className="glass-card rounded-xl border border-border/50 p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-shrink-0">{setting.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-heading font-semibold text-foreground">
                            {setting.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {setting.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">{setting.action}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Data & System Settings */}
            <div className="space-y-3">
              <h2 className="font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Data & System
              </h2>
              <div className="space-y-3">
                {settings
                  .filter((item) => ["sync"].includes(item.id))
                  .map((setting) => (
                    <div
                      key={setting.id}
                      className="glass-card rounded-xl border border-border/50 p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-shrink-0">{setting.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-heading font-semibold text-foreground">
                            {setting.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {setting.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">{setting.action}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Privacy & Legal */}
            <div className="space-y-3">
              <h2 className="font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Privacy & Legal
              </h2>
              <div className="space-y-3">
                <div className="glass-card rounded-xl border border-border/50 p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <Lock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-heading font-semibold text-foreground">
                        Privacy Policy
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Learn how we collect, use, and protect your data
                      </p>
                      <button className="text-sm text-primary hover:underline font-medium">
                        Read Full Policy →
                      </button>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-xl border border-border/50 p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-heading font-semibold text-foreground">
                        Terms of Service
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Understand the rules and conditions of using PlayNLearn
                      </p>
                      <button className="text-sm text-secondary hover:underline font-medium">
                        Read Terms →
                      </button>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-xl border border-border/50 p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <Database className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-heading font-semibold text-foreground">
                        Data Management
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        View, download, or delete your personal data
                      </p>
                      <button className="text-sm text-accent hover:underline font-medium">
                        Manage Data →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="glass-card rounded-xl border border-border/50 p-6 text-center space-y-2">
              <h3 className="font-heading font-semibold text-foreground">
                PlayNLearn
              </h3>
              <p className="text-sm text-muted-foreground">Version 1.0.0</p>
              <p className="text-xs text-muted-foreground mt-4">
                © 2024 PlayNLearn. All rights reserved.
              </p>
            </div>
          </div>

          {/* Close Button */}
          <div className="pt-4">
            <Button
              onClick={() => navigate("/student/dashboard")}
              variant="outline"
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Language Selector Modal */}
      <LanguageSelector
        isOpen={isLanguageSelectorOpen}
        onClose={() => setIsLanguageSelectorOpen(false)}
      />
    </AppLayout>
  );
}
