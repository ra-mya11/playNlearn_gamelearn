import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

interface AnimatedProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number;
  variant?: "default" | "success" | "accent";
  showLabel?: boolean;
  animated?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
};

const variantClasses = {
  default: "bg-primary",
  success: "bg-secondary",
  accent: "bg-accent",
};

const AnimatedProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  AnimatedProgressProps
>(({ className, value = 0, variant = "default", showLabel = false, animated = true, size = "md", ...props }, ref) => (
  <div className="relative w-full">
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative w-full overflow-hidden rounded-full bg-muted/50",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full rounded-full transition-all duration-500 ease-out",
          variantClasses[variant],
          animated && "progress-fill"
        )}
        style={{ width: `${value}%` }}
      />
      {/* Shine effect */}
      {value > 0 && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full"
          style={{ 
            width: `${value}%`,
            animation: animated ? "shimmer 2s infinite" : "none"
          }}
        />
      )}
    </ProgressPrimitive.Root>
    {showLabel && (
      <span className="absolute right-0 -top-6 text-sm font-medium text-foreground">
        {Math.round(value)}%
      </span>
    )}
  </div>
));

AnimatedProgress.displayName = "AnimatedProgress";

export { AnimatedProgress };
