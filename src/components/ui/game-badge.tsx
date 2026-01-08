import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const gameBadgeVariants = cva(
  "inline-flex items-center justify-center rounded-full font-heading font-medium transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-badge/20 text-badge border border-badge/30",
        primary: "bg-primary/20 text-primary border border-primary/30",
        secondary: "bg-secondary/20 text-secondary border border-secondary/30",
        accent: "bg-accent/20 text-accent border border-accent/30",
        outline: "border-2 border-badge text-badge bg-transparent",
        locked: "bg-muted/50 text-muted-foreground border border-muted",
      },
      size: {
        sm: "h-5 min-w-5 px-2 text-xs",
        md: "h-6 min-w-6 px-2.5 text-sm",
        lg: "h-8 min-w-8 px-3 text-base",
        xl: "h-10 min-w-10 px-4 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface GameBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameBadgeVariants> {
  icon?: React.ReactNode;
  pulse?: boolean;
}

const GameBadge = React.forwardRef<HTMLDivElement, GameBadgeProps>(
  ({ className, variant, size, icon, pulse, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          gameBadgeVariants({ variant, size }),
          pulse && "pulse-glow",
          className
        )}
        {...props}
      >
        {icon && <span className="mr-1">{icon}</span>}
        {children}
      </div>
    );
  }
);

GameBadge.displayName = "GameBadge";

export { GameBadge, gameBadgeVariants };
