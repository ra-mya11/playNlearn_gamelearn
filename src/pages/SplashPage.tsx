import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const mascotSplashUrl = "https://cdn.builder.io/api/v1/image/assets%2Fecf135b7255f45f9a20859de9b268e89%2Fe861748ec30043b7b6fa82c11f179416";

export default function SplashPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    const redirect = setTimeout(() => {
      navigate("/role-selection");
    }, 2500);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background to-background pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-accent/10 blur-[80px]" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Container with Glow Effect */}
        <div className="mb-8 slide-up relative">
          <style>{`
            @keyframes logo-glow {
              0%, 100% {
                box-shadow: 0 0 30px rgba(149, 96, 240, 0.3), 0 0 60px rgba(149, 96, 240, 0.15);
              }
              50% {
                box-shadow: 0 0 50px rgba(149, 96, 240, 0.5), 0 0 80px rgba(149, 96, 240, 0.25);
              }
            }
            .logo-container {
              animation: logo-glow 3s ease-in-out infinite;
            }
          `}</style>
          <div className="logo-container rounded-3xl p-6 backdrop-blur-xl border border-primary/20">
            <img
              src={mascotSplashUrl}
              alt="PlayNlearn Guide"
              className="w-56 h-51 object-contain drop-shadow-2xl"
              style={{ height: "204px", width: "224px" }}
            />
          </div>
        </div>

        {/* Logo and App Name */}
        <div className="mb-6 flex flex-col items-center slide-up" style={{ animationDelay: "100ms" }}>
          <h1 className="font-display text-5xl gradient-text mb-3">PlayNlearn</h1>
          <p className="text-muted-foreground text-center text-sm max-w-xs">
            Education That Transforms Villages
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 slide-up" style={{ animationDelay: "200ms" }}>
          <div className="h-2 overflow-hidden rounded-full bg-muted/50 backdrop-blur-sm">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Loading your adventure...
          </p>
        </div>
      </div>

      {/* Version Info */}
      <div className="absolute bottom-6 text-xs text-muted-foreground">
        Version 1.0.0
      </div>
    </div>
  );
}
