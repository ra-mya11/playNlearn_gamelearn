import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-5 h-5",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-2 border-muted/50" />
      {/* Spinning gradient ring */}
      <div
        className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin"
        style={{ animationDuration: "0.8s" }}
      />
      {/* Inner glow */}
      <div className="absolute inset-1 rounded-full bg-gradient-to-br from-primary/20 to-transparent animate-pulse" />
    </div>
  );
}
