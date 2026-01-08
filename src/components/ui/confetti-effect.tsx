import { useEffect, useState } from "react";

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  color: string;
  size: number;
}

interface ConfettiEffectProps {
  trigger: boolean;
  duration?: number;
}

const CONFETTI_COLORS = [
  "hsl(217, 91%, 60%)",   // primary blue
  "hsl(142, 76%, 36%)",   // secondary green
  "hsl(38, 92%, 50%)",    // accent gold
  "hsl(262, 83%, 58%)",   // purple
  "hsl(0, 84%, 60%)",     // red
  "hsl(180, 70%, 50%)",   // cyan
];

export function ConfettiEffect({ trigger, duration = 3000 }: ConfettiEffectProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true);
      
      // Generate confetti pieces
      const newPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 6 + Math.random() * 8,
      }));
      
      setPieces(newPieces);
      
      // Clean up after animation
      const timer = setTimeout(() => {
        setPieces([]);
        setIsActive(false);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [trigger, duration, isActive]);

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${piece.left}%`,
            top: -20,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}
