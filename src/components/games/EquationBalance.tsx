import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface EquationLevel {
  leftBlocks: number[];
  rightBlocks: number[];
  variable: number;
  minMoves: number;
}

export function EquationBalance({ onClose }: { onClose: () => void }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [leftBlocks, setLeftBlocks] = useState<number[]>([]);
  const [rightBlocks, setRightBlocks] = useState<number[]>([]);
  const [variableValue, setVariableValue] = useState(0);
  const [feedback, setFeedback] = useState<"none" | "balanced" | "unbalanced">("none");
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const levels: EquationLevel[] = [
    { leftBlocks: [5, 3, 2], rightBlocks: [4, 3], variable: 3, minMoves: 2 },
    { leftBlocks: [8, 2], rightBlocks: [7, 1, 1], variable: 2, minMoves: 2 },
    { leftBlocks: [10, 2, 3], rightBlocks: [5, 4], variable: 6, minMoves: 3 },
    { leftBlocks: [12, 3], rightBlocks: [9, 2, 1], variable: 4, minMoves: 2 },
    { leftBlocks: [15, 5, 2], rightBlocks: [8, 6], variable: 8, minMoves: 3 },
  ];

  useEffect(() => {
    if (gameStarted && currentLevel < levels.length) {
      const level = levels[currentLevel];
      setLeftBlocks([...level.leftBlocks, -99]); // -99 represents the variable
      setRightBlocks(level.rightBlocks);
      setVariableValue(level.variable);
      setFeedback("none");
      setMoves(0);
      setWon(false);
    }
  }, [currentLevel, gameStarted]);

  const leftSum = leftBlocks.reduce((sum, b) => (b === -99 ? sum + variableValue : sum + b), 0);
  const rightSum = rightBlocks.reduce((sum, b) => sum + b, 0);
  const isBalanced = leftSum === rightSum;

  const handleRemoveLeft = (index: number) => {
    const newLeft = leftBlocks.filter((_, i) => i !== index);
    setLeftBlocks(newLeft);
    setMoves(moves + 1);
    
    const newLeftSum = newLeft.reduce((sum, b) => (b === -99 ? sum + variableValue : sum + b), 0);
    if (newLeftSum === rightSum) {
      setFeedback("balanced");
      setWon(true);
    } else {
      setFeedback("unbalanced");
    }
  };

  const handleRemoveRight = (index: number) => {
    const newRight = rightBlocks.filter((_, i) => i !== index);
    setRightBlocks(newRight);
    setMoves(moves + 1);
    
    const newRightSum = newRight.reduce((sum, b) => sum + b, 0);
    if (leftSum === newRightSum) {
      setFeedback("balanced");
      setWon(true);
    } else {
      setFeedback("unbalanced");
    }
  };

  const handleRemoveBoth = (leftIndex: number, rightIndex: number) => {
    const newLeft = leftBlocks.filter((_, i) => i !== leftIndex);
    const newRight = rightBlocks.filter((_, i) => i !== rightIndex);
    setLeftBlocks(newLeft);
    setRightBlocks(newRight);
    setMoves(moves + 1);
    
    const newLeftSum = newLeft.reduce((sum, b) => (b === -99 ? sum + variableValue : sum + b), 0);
    const newRightSum = newRight.reduce((sum, b) => sum + b, 0);
    if (newLeftSum === newRightSum && newLeft.some(b => b === -99) && newLeft.length === 1) {
      setFeedback("balanced");
      setWon(true);
    } else if (newLeftSum === newRightSum) {
      setFeedback("balanced");
    } else {
      setFeedback("unbalanced");
    }
  };

  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(currentLevel + 1);
      setScore(score + 20);
    } else {
      setGameStarted(false);
    }
  };

  const resetLevel = () => {
    const level = levels[currentLevel];
    setLeftBlocks([...level.leftBlocks, -99]);
    setRightBlocks(level.rightBlocks);
    setFeedback("none");
    setMoves(0);
    setWon(false);
  };

  if (!gameStarted) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Equation Balance ⚖️</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-semibold">📘 What You Will Discover</h3>
              <p className="text-sm text-muted-foreground">
                How equations stay balanced when you do the same thing to both sides.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🎯 What You Need To Do</h3>
              <p className="text-sm text-muted-foreground">
                Remove blocks from both sides equally to isolate the mystery box.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🏆 What Success Looks Like</h3>
              <p className="text-sm text-muted-foreground">
                The scale stays level and the mystery box stands alone on one side.
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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Equation Balance ⚖️ - Level {currentLevel + 1}/{levels.length}</DialogTitle>
          <div className="flex gap-4 mt-4">
            <div>Score: <span className="font-bold text-primary">{score}</span></div>
            <div>Moves: <span className="font-bold">{moves}</span></div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Balance Scale */}
          <div className="bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg p-8">
            <div className="text-center mb-4">
              <p className="text-sm font-semibold">Remove equal blocks from both sides</p>
            </div>

            <div className="flex justify-center items-end gap-12">
              {/* Left Side */}
              <div className="space-y-3">
                <div className="space-y-2">
                  {leftBlocks.map((block, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleRemoveLeft(idx)}
                      className="block w-16 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded hover:from-orange-500 hover:to-orange-700 transition flex items-center justify-center text-white font-bold text-lg cursor-pointer hover:scale-105"
                      title="Click to remove this block"
                    >
                      {block === -99 ? "?" : block}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scale Indicator */}
              <div className="flex flex-col items-center">
                <div className={`text-4xl transition ${isBalanced ? "text-green-600" : "text-red-600"}`}>
                  ⚖️
                </div>
                <p className={`text-sm font-bold mt-2 ${isBalanced ? "text-green-600" : "text-red-600"}`}>
                  {isBalanced ? "BALANCED" : "UNBALANCED"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  L: {leftSum} | R: {rightSum}
                </p>
              </div>

              {/* Right Side */}
              <div className="space-y-3">
                <div className="space-y-2">
                  {rightBlocks.map((block, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleRemoveRight(idx)}
                      className="block w-16 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded hover:from-purple-500 hover:to-purple-700 transition flex items-center justify-center text-white font-bold text-lg cursor-pointer hover:scale-105"
                      title="Click to remove this block"
                    >
                      {block}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          {!won && (
            <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-4">
              <p className="text-sm mb-3">💡 <strong>Strategy:</strong> Remove equal blocks from both sides to keep the scale balanced.</p>
              <p className="text-sm text-muted-foreground">Your goal: Isolate the mystery box (?) on one side alone.</p>
            </div>
          )}

          {/* Success State */}
          {won && (
            <div className="bg-green-100 dark:bg-green-900 rounded-lg p-4 text-center">
              <p className="text-3xl mb-2">🎉</p>
              <p className="font-bold text-lg text-green-800 dark:text-green-200">Perfectly Balanced!</p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Mystery box isolated! The scale stays level.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!won && (
              <Button onClick={resetLevel} variant="outline" className="flex-1">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Level
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
            💡 "Whatever you do to one side, do to the other."
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
