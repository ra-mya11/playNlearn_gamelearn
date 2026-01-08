import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FractionLevel {
  targetNumerator: number;
  targetDenominator: number;
  availablePieces: Array<{ numerator: number; denominator: number }>;
  equivalents: Array<{ numerator: number; denominator: number }>;
}

export function FractionForge({ onClose }: { onClose: () => void }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedPieces, setSelectedPieces] = useState<Array<{ numerator: number; denominator: number }>>([]);
  const [won, setWon] = useState(false);
  const [draggedFrom, setDraggedFrom] = useState<number | null>(null);

  const levels: FractionLevel[] = [
    {
      targetNumerator: 1,
      targetDenominator: 2,
      availablePieces: [
        { numerator: 1, denominator: 2 },
        { numerator: 1, denominator: 4 },
        { numerator: 1, denominator: 3 },
      ],
      equivalents: [],
    },
    {
      targetNumerator: 3,
      targetDenominator: 4,
      availablePieces: [
        { numerator: 1, denominator: 4 },
        { numerator: 2, denominator: 4 },
        { numerator: 1, denominator: 2 },
      ],
      equivalents: [{ numerator: 6, denominator: 8 }],
    },
    {
      targetNumerator: 2,
      targetDenominator: 3,
      availablePieces: [
        { numerator: 1, denominator: 3 },
        { numerator: 1, denominator: 3 },
        { numerator: 1, denominator: 6 },
      ],
      equivalents: [{ numerator: 4, denominator: 6 }],
    },
    {
      targetNumerator: 3,
      targetDenominator: 8,
      availablePieces: [
        { numerator: 1, denominator: 8 },
        { numerator: 1, denominator: 8 },
        { numerator: 1, denominator: 8 },
        { numerator: 1, denominator: 4 },
      ],
      equivalents: [],
    },
  ];

  const level = levels[currentLevel];

  useEffect(() => {
    if (gameStarted && currentLevel < levels.length) {
      setSelectedPieces([]);
      setWon(false);
    }
  }, [currentLevel, gameStarted]);

  const totalSelected =
    selectedPieces.length > 0
      ? selectedPieces[0].denominator
        ? selectedPieces.reduce((sum, p) => {
            const normalized = (p.numerator * level.targetDenominator) / (p.denominator * level.targetDenominator);
            return sum + normalized;
          }, 0)
        : 0
      : 0;

  const getNumeratorSum = () => {
    if (selectedPieces.length === 0) return 0;
    const denom = level.targetDenominator;
    let num = 0;
    selectedPieces.forEach((p) => {
      num += (p.numerator * denom) / p.denominator;
    });
    return num;
  };

  const checkWin = (pieces: Array<{ numerator: number; denominator: number }>) => {
    if (pieces.length === 0) return false;

    let totalNum = 0;
    let commonDenom = level.targetDenominator;

    pieces.forEach((p) => {
      const factor = commonDenom / p.denominator;
      totalNum += p.numerator * factor;
    });

    return totalNum === level.targetNumerator && commonDenom === level.targetDenominator;
  };

  const handleAddPiece = (piece: { numerator: number; denominator: number }) => {
    const newPieces = [...selectedPieces, piece];
    setSelectedPieces(newPieces);

    if (checkWin(newPieces)) {
      setWon(true);
    }
  };

  const handleRemovePiece = (index: number) => {
    setSelectedPieces(selectedPieces.filter((_, i) => i !== index));
  };

  const resetLevel = () => {
    setSelectedPieces([]);
    setWon(false);
  };

  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(currentLevel + 1);
      setScore(score + 25);
    } else {
      setGameStarted(false);
    }
  };

  if (!gameStarted) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Fraction Forge 🧩</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-semibold">📘 What You Will Discover</h3>
              <p className="text-sm text-muted-foreground">
                Fractions are parts of the same whole that can be combined.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🎯 What You Need To Do</h3>
              <p className="text-sm text-muted-foreground">
                Drag fraction pieces to fill the target shape perfectly.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🏆 What Success Looks Like</h3>
              <p className="text-sm text-muted-foreground">
                The shape is completely filled with no gaps or overlaps.
              </p>
            </div>
            <Button onClick={() => setGameStarted(true)} className="w-full">
              Start Game
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const numeratorSum = getNumeratorSum();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fraction Forge 🧩 - Level {currentLevel + 1}/{levels.length}</DialogTitle>
          <div className="flex gap-4 mt-4">
            <div>Score: <span className="font-bold text-primary">{score}</span></div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Target Fraction */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg p-6">
            <p className="text-center text-sm font-semibold mb-4">Target Fraction</p>
            <div className="flex justify-center items-center gap-4">
              <div className="text-center">
                <div className="text-5xl font-bold text-green-600">{level.targetNumerator}</div>
                <div className="border-t-2 border-green-600 w-16 my-2"></div>
                <div className="text-5xl font-bold text-green-600">{level.targetDenominator}</div>
              </div>

              {/* Visual Circle Representation */}
              <div className="relative w-24 h-24 rounded-full border-4 border-green-600 bg-white dark:bg-slate-800">
                <svg className="absolute inset-0 w-full h-full">
                  {Array.from({ length: level.targetDenominator }).map((_, i) => {
                    const angle = (i / level.targetDenominator) * 360;
                    return (
                      <line
                        key={`line-${i}`}
                        x1="50%"
                        y1="50%"
                        x2={`${50 + 48 * Math.cos((angle - 90) * (Math.PI / 180))}%`}
                        y2={`${50 + 48 * Math.sin((angle - 90) * (Math.PI / 180))}%`}
                        stroke="currentColor"
                        className="text-green-600"
                        strokeWidth="2"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-green-600">{level.targetNumerator}/{level.targetDenominator}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Pieces */}
          {selectedPieces.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
              <p className="text-sm font-semibold mb-3">Selected Pieces</p>
              <div className="flex flex-wrap gap-2">
                {selectedPieces.map((piece, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRemovePiece(idx)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold transition"
                  >
                    {piece.numerator}/{piece.denominator} ✕
                  </button>
                ))}
              </div>
              <p className="text-sm mt-3">
                Current: <span className="font-bold">{numeratorSum}/{level.targetDenominator}</span>
              </p>
            </div>
          )}

          {/* Available Pieces */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">Available Pieces (Click to Add)</p>
            <div className="grid grid-cols-3 gap-3">
              {level.availablePieces.map((piece, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAddPiece(piece)}
                  className="p-4 bg-gradient-to-br from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white rounded-lg transition hover:scale-105"
                >
                  <div className="text-3xl font-bold">{piece.numerator}</div>
                  <div className="border-t border-white my-1"></div>
                  <div className="text-3xl font-bold">{piece.denominator}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Success */}
          {won && (
            <div className="bg-green-100 dark:bg-green-900 rounded-lg p-4 text-center">
              <p className="text-3xl mb-2">🎉</p>
              <p className="font-bold text-lg text-green-800 dark:text-green-200">Perfect Fit!</p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                You combined fractions perfectly!
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            {!won && (
              <Button onClick={resetLevel} variant="outline" className="flex-1">
                Reset
              </Button>
            )}
            {won && (
              <Button
                onClick={nextLevel}
                className="w-full"
                size="lg"
              >
                {currentLevel < levels.length - 1 ? "Next Level" : "Finish Game"}
              </Button>
            )}
          </div>

          {/* Concept Strip */}
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">
            💡 "Fractions are parts of the same whole."
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
