import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

const gameCardVariants = cva(
  "relative overflow-hidden rounded-2xl border-2 transition-all duration-300 glass-card",
  {
    variants: {
      variant: {
        default: "border-primary/30 hover:border-primary/60 hover:shadow-glow card-hover",
        primary: "border-primary/30 hover:border-primary hover:shadow-glow card-hover",
        secondary: "border-secondary/30 hover:border-secondary glow-secondary card-hover",
        accent: "border-accent/30 hover:border-accent glow-accent card-hover",
        badge: "border-badge/30 hover:border-badge card-hover",
        destructive: "border-destructive/30 hover:border-destructive card-hover",
        locked: "bg-muted/30 border-muted/50 cursor-not-allowed opacity-50",
      },
      size: {
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

const colorSchemeMap: Record<string, { icon: string; bg: string; progress: string }> = {
  primary: { icon: "text-primary", bg: "bg-primary/20", progress: "bg-primary" },
  secondary: { icon: "text-secondary", bg: "bg-secondary/20", progress: "bg-secondary" },
  accent: { icon: "text-accent", bg: "bg-accent/20", progress: "bg-accent" },
  badge: { icon: "text-badge", bg: "bg-badge/20", progress: "bg-badge" },
  destructive: { icon: "text-destructive", bg: "bg-destructive/20", progress: "bg-destructive" },
};

export interface GameCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameCardVariants> {
  icon?: LucideIcon;
  title?: string;
  subtitle?: string;
  progress?: number;
  locked?: boolean;
  colorScheme?: string;
}

const GameCard = React.forwardRef<HTMLDivElement, GameCardProps>(
  ({ className, variant, size, icon: Icon, title, subtitle, progress, locked, colorScheme = "primary", children, ...props }, ref) => {
    const cardVariant = locked ? "locked" : variant;
    const colors = colorSchemeMap[colorScheme] || colorSchemeMap.primary;
    
    return (
      <div
        ref={ref}
        className={cn(
          gameCardVariants({ variant: cardVariant, size }),
          !locked && "touch-scale cursor-pointer",
          className
        )}
        {...props}
      >
        {/* Background decoration */}
        {!locked && (
          <div className={cn(
            "absolute -right-4 -top-4 h-24 w-24 rounded-full blur-2xl opacity-30",
            colors.bg
          )} />
        )}
        
        <div className="relative z-10">
          {Icon && (
            <div className={cn(
              "mb-3 inline-flex items-center justify-center rounded-xl p-2.5",
              locked ? "bg-muted" : colors.bg
            )}>
              <Icon className={cn(
                "h-6 w-6",
                locked ? "text-muted-foreground" : colors.icon
              )} />
            </div>
          )}
          
          {title && (
            <h3 className={cn(
              "font-heading font-semibold text-foreground",
              size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : "text-base"
            )}>
              {title}
            </h3>
          )}
          
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
          
          {typeof progress === "number" && !locked && (
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className={cn("font-medium", colors.icon)}>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted/50">
                <div 
                  className={cn("h-full rounded-full transition-all duration-500", colors.progress)}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          
          {children}
        </div>

        {/* Lock overlay */}
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <div className="rounded-full bg-muted p-3">
              <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
        )}
      </div>
    );
  }
);

GameCard.displayName = "GameCard";

export { GameCard, gameCardVariants };
