import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { usePWA } from "@/hooks/use-pwa";
import {
  Menu,
  HelpCircle,
  Settings,
  LogOut,
  WifiOff,
  Wifi,
  Users,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";

interface HamburgerMenuProps {
  userName?: string;
  userRole?: "student" | "teacher" | "parent";
}

export function HamburgerMenu({
  userName = "User",
  userRole = "student",
}: HamburgerMenuProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { isOnline, isInstallable, installApp } = usePWA();

  const handleLogout = async () => {
    setOpen(false);
    await signOut();
    toast.success("Logged out successfully");
    navigate("/role-selection");
  };

  const handleInstall = async () => {
    await installApp();
    setOpen(false);
  };

  const menuItems = [
    { icon: HelpCircle, label: "Help & Tutorials", path: "/help" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="border-b border-border p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <span className="font-display text-lg text-primary">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 text-left">
              <SheetTitle className="font-heading text-lg">{userName}</SheetTitle>
              <p className="text-sm capitalize text-muted-foreground">{userRole}</p>
            </div>
          </div>
        </SheetHeader>

        <div className="flex flex-col p-4">
          {/* Connection Status */}
          <div
            className={cn(
              "mb-4 flex items-center gap-2 rounded-lg px-4 py-3",
              isOnline ? "bg-secondary/10 text-secondary" : "bg-destructive/10 text-destructive"
            )}
          >
            {isOnline ? (
              <>
                <Wifi className="h-4 w-4" />
                <span className="text-sm font-medium">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4" />
                <span className="text-sm font-medium">Offline Mode</span>
              </>
            )}
          </div>

          {/* Install App */}
          {isInstallable && (
            <button
              onClick={handleInstall}
              className="mb-2 flex items-center gap-3 rounded-lg bg-primary/10 px-4 py-3 text-primary transition-colors hover:bg-primary/20"
            >
              <Download className="h-5 w-5" />
              <span className="font-medium">Install App</span>
            </button>
          )}

          {/* Role Switching - only show if not logged in */}
          {!user && (
            <Link
              to="/role-selection"
              onClick={() => setOpen(false)}
              className="mb-2 flex items-center gap-3 rounded-lg px-4 py-3 text-foreground transition-colors hover:bg-muted"
            >
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Switch Role</span>
            </Link>
          )}

          {/* Menu Items */}
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-foreground transition-colors hover:bg-muted"
            >
              <item.icon className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}

          <div className="my-4 border-t border-border" />

          {/* Logout */}
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          ) : (
            <Link
              to="/role-selection"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-primary transition-colors hover:bg-primary/10"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Sign In</span>
            </Link>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
