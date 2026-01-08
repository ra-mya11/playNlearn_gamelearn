import { ReactNode } from "react";
import { HamburgerMenu } from "./HamburgerMenu";
import { BottomTabBar } from "./BottomTabBar";
import { AppBreadcrumb } from "./AppBreadcrumb";
import { WalletBalanceHeader } from "@/components/ui/wallet-balance-header";
import { LanguageSwitcherButton } from "@/components/ui/language-switcher-button";
import { DataSyncStatus } from "@/components/ui/data-sync-status";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
  role?: "student" | "teacher" | "parent";
  userName?: string;
  showHeader?: boolean;
  showTabBar?: boolean;
  showBreadcrumb?: boolean;
  playCoins?: number;
  title?: string;
  className?: string;
}

export function AppLayout({
  children,
  role: propRole,
  userName: propUserName,
  showHeader = true,
  showTabBar = true,
  showBreadcrumb = false,
  playCoins,
  title,
  className,
}: AppLayoutProps) {
  const { profile, role: authRole } = useAuth();
  const { balance } = useWallet();

  // Use auth context values if available, otherwise fall back to props
  const role = authRole || propRole || "student";
  const userName = profile?.full_name || propUserName || "User";
  // Use wallet context balance if available, otherwise fall back to prop
  const displayCoins = balance !== undefined ? balance : playCoins;

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 rounded-full bg-badge/5 blur-3xl" />
      </div>

      {/* Header */}
      {showHeader && (
        <header className="fixed left-0 right-0 top-0 z-50 border-b border-border glass-card safe-area-pt">
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <HamburgerMenu userName={userName} userRole={role} />
              {title && (
                <h1 className="font-heading text-lg font-semibold text-foreground">{title}</h1>
              )}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              {/* Language Switcher - Available for all roles */}
              <LanguageSwitcherButton />

              {/* Data Sync Status - Available for all roles */}
              <DataSyncStatus />

              {/* Wallet Balance for students */}
              {role === "student" && typeof displayCoins === "number" && (
                <WalletBalanceHeader balance={displayCoins} />
              )}
            </div>
          </div>

          {/* Breadcrumb */}
          {showBreadcrumb && (
            <div className="border-t border-border px-4 py-2">
              <AppBreadcrumb />
            </div>
          )}
        </header>
      )}

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 relative z-10",
          showHeader && "pt-14",
          showHeader && showBreadcrumb && "pt-24",
          showTabBar && "pb-20",
          "w-full max-w-7xl mx-auto md:px-8 transition-all duration-300",
          className
        )}
      >
        {children}
      </main>

      {/* Bottom Tab Bar */}
      {showTabBar && <BottomTabBar role={role} />}
    </div>
  );
}
