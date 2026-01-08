import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BuildLevel {
  targetArea: number;
  maxPerimeter: number;
  gridSize: number;
  bonus: number;
}

export function GeometryBuilder({ onClose }: { onClose: () => void }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [grid, setGrid] = useState<boolean[][]>([]);
  const [won, setWon] = useState(false);

  const levels: BuildLevel[] = [
    { targetArea: 4, maxPerimeter: 20, gridSize: 6, bonus: 10 },
    { targetArea: 6, maxPerimeter: 20, gridSize: 6, bonus: 15 },
    { targetArea: 9, maxPerimeter: 20, gridSize: 7, bonus: 20 },
    { targetArea: 12, maxPerimeter: 24, gridSize: 7, bonus: 25 },
    { targetArea: 15, maxPerimeter: 28, gridSize: 8, bonus: 30 },
  ];

  const level = levels[currentLevel];

  useEffect(() => {
    if (gameStarted && currentLevel < levels.length) {
      setGrid(Array(level.gridSize).fill(null).map(() => Array(level.gridSize).fill(false)));
      setWon(false);
    }
  }, [currentLevel, gameStarted]);

  const calculateArea = () => {
    let area = 0;
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        if (grid[i][j]) area++;
      }
    }
    return area;
  };

  const calculatePerimeter = () => {
    let perimeter = 0;
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        if (grid[i][j]) {
          // Check all 4 sides
          if (i === 0 || !grid[i - 1][j]) perimeter++;
          if (i === grid.length - 1 || !grid[i + 1][j]) perimeter++;
          if (j === 0 || !grid[i][j - 1]) perimeter++;
          if (j === grid[i].length - 1 || !grid[i][j + 1]) perimeter++;
        }
      }
    }
    return perimeter;
  };

  const currentArea = calculateArea();
  const currentPerimeter = calculatePerimeter();
  const isGoalMet = currentArea === level.targetArea && currentPerimeter <= level.maxPerimeter;

  const handleToggleCell = (i: number, j: number) => {
    if (won) return;

    const newGrid = grid.map(row => [...row]);
    newGrid[i][j] = !newGrid[i][j];
    setGrid(newGrid);

    const newArea = calculateArea();
    const newPerim = calculatePerimeter();
    
    if (newArea === level.targetArea && newPerim <= level.maxPerimeter) {
      setWon(true);
      const baseScore = 20;
      const perimBonus = Math.max(0, (level.maxPerimeter - newPerim) * 2);
      setScore(score + baseScore + perimBonus);
    }
  };

  const resetLevel = () => {
    setGrid(Array(level.gridSize).fill(null).map(() => Array(level.gridSize).fill(false)));
    setWon(false);
  };

  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(currentLevel + 1);
    } else {
      setGameStarted(false);
    }
  };

  if (!gameStarted) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Geometry Builder 🏗️</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-semibold">📘 What You Will Discover</h3>
              <p className="text-sm text-muted-foreground">
                How area and perimeter work together in space.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🎯 What You Need To Do</h3>
              <p className="text-sm text-muted-foreground">
                Click cells to build a shape with the exact target area.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🏆 What Success Looks Like</h3>
              <p className="text-sm text-muted-foreground">
                Build the shape efficiently without wasting space.
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
          <DialogTitle>Geometry Builder 🏗️ - Level {currentLevel + 1}/{levels.length}</DialogTitle>
          <div className="flex gap-4 mt-4">
            <div>Score: <span className="font-bold text-primary">{score}</span></div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Targets */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Target Area</p>
              <p className="text-3xl font-bold text-blue-600">{level.targetArea}</p>
              <p className="text-xs text-muted-foreground mt-1">Current: {currentArea}</p>
            </div>
            <div className={`rounded-lg p-4 text-center ${
              currentPerimeter <= level.maxPerimeter ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950"
            }`}>
              <p className="text-xs text-muted-foreground mb-1">Max Perimeter</p>
              <p className={`text-3xl font-bold ${
                currentPerimeter <= level.maxPerimeter ? "text-green-600" : "text-red-600"
              }`}>{level.maxPerimeter}</p>
              <p className="text-xs text-muted-foreground mt-1">Current: {currentPerimeter}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950 rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Efficiency</p>
              <p className="text-3xl font-bold text-purple-600">
                {currentArea > 0 ? Math.round((currentArea / currentPerimeter) * 10) : 0}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">Less perimeter = better</p>
            </div>
          </div>

          {/* Grid */}
          <div className="flex justify-center">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border-2 border-slate-200 dark:border-slate-700">
              <div className="gap-1" style={{
                display: "grid",
                gridTemplateColumns: `repeat(${level.gridSize}, 1fr)`,
              }}>
                {grid.map((row, i) =>
                  row.map((cell, j) => (
                    <button
                      key={`${i}-${j}`}
                      onClick={() => handleToggleCell(i, j)}
                      className={`w-8 h-8 rounded-sm transition ${
                        cell
                          ? "bg-gradient-to-br from-primary to-primary/70 border-2 border-primary"
                          : "bg-slate-100 dark:bg-slate-700 border-2 border-transparent hover:border-primary/30"
                      }`}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Instructions */}
          {!won && (
            <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-4">
              <p className="text-sm font-semibold mb-2">💡 Strategy:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Click cells to color them and build your shape</li>
                <li>• Reach exactly {level.targetArea} colored cells (area)</li>
                <li>• Keep the perimeter ≤ {level.maxPerimeter} (less edge = better)</li>
                <li>• Compact shapes are more efficient!</li>
              </ul>
            </div>
          )}

          {/* Success */}
          {won && (
            <div className="bg-green-100 dark:bg-green-900 rounded-lg p-4 text-center">
              <p className="text-3xl mb-2">🎉</p>
              <p className="font-bold text-lg text-green-800 dark:text-green-200">Perfect Build!</p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                Area: {currentArea} | Perimeter: {currentPerimeter} | Efficiency: {Math.round((currentArea / currentPerimeter) * 10)}%
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            {!won && (
              <Button onClick={resetLevel} variant="outline" className="flex-1">
                Clear Grid
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
            💡 "Same area can have different shapes."
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
