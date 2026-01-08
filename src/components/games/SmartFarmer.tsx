import React, { useState, useEffect } from "react";
import { GameStartPopup } from "./GameStartPopup";
import { GameCompletionPopup } from "./GameCompletionPopup";

interface SoilPlot {
  id: number;
  water: number;
  compost: number;
  growth: number; // 0-100
  status: "empty" | "growing" | "healthy" | "withered" | "ready";
  planted: boolean;
}

interface SmartFarmerProps {
  onGameComplete?: (success: boolean, score: number) => void;
  onExit?: () => void;
}

export function SmartFarmer({ onGameComplete, onExit }: SmartFarmerProps) {
  const [showStartPopup, setShowStartPopup] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [gameSuccess, setGameSuccess] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [plots, setPlots] = useState<SoilPlot[]>([
    { id: 1, water: 0, compost: 0, growth: 0, status: "empty", planted: false },
    { id: 2, water: 0, compost: 0, growth: 0, status: "empty", planted: false },
    { id: 3, water: 0, compost: 0, growth: 0, status: "empty", planted: false },
  ]);

  const [sunLevel, setSunLevel] = useState(75);
  const [gameTime, setGameTime] = useState(0);
  const [seedsDragging, setSeedsDragging] = useState(false);

  // Game loop - simulate growth
  useEffect(() => {
    if (!gameStarted || gameComplete) return;

    const interval = setInterval(() => {
      setGameTime((t) => t + 1);

      setPlots((prevPlots) =>
        prevPlots.map((plot) => {
          if (!plot.planted) return plot;

          let newGrowth = plot.growth;
          let newStatus = plot.status;

          // Growth calculation based on water and compost
          const waterBalance = Math.abs(plot.water - 50);
          const compostBonus = Math.min(plot.compost / 30, 1);

          if (plot.water < 20 || plot.water > 80) {
            // Bad conditions - wither
            newGrowth = Math.max(0, newGrowth - 2);
            newStatus = newGrowth === 0 ? "withered" : "growing";
          } else if (plot.water >= 40 && plot.water <= 60) {
            // Good conditions - grow
            newGrowth = Math.min(100, newGrowth + 1 + compostBonus);
            newStatus = newGrowth >= 100 ? "ready" : "healthy";
          }

          // Water evaporation
          let newWater = plot.water - 0.5;
          if (newWater < 0) newWater = 0;

          return {
            ...plot,
            water: newWater,
            growth: newGrowth,
            status: newStatus,
          };
        })
      );
    }, 500);

    return () => clearInterval(interval);
  }, [gameStarted, gameComplete]);

  // Check win condition
  useEffect(() => {
    if (!gameStarted || gameComplete) return;

    const allReady = plots.filter((p) => p.planted).length > 0 && plots.every(
      (p) => !p.planted || p.status === "ready"
    );

    if (allReady && gameTime > 10) {
      setGameComplete(true);
      setGameSuccess(true);
      onGameComplete?.(true, 100);
    }

    // Lose condition - too many withered
    const witheredCount = plots.filter((p) => p.status === "withered").length;
    if (witheredCount >= 2) {
      setGameComplete(true);
      setGameSuccess(false);
      onGameComplete?.(false, 30);
    }
  }, [plots, gameTime, gameComplete, gameStarted, onGameComplete]);

  const handlePlantSeed = (plotId: number) => {
    if (!gameStarted) return;
    setPlots((prev) =>
      prev.map((p) =>
        p.id === plotId && !p.planted
          ? { ...p, planted: true, status: "growing" }
          : p
      )
    );
  };

  const handleAddWater = (plotId: number, amount: number) => {
    if (!gameStarted) return;
    setPlots((prev) =>
      prev.map((p) =>
        p.id === plotId && p.planted
          ? { ...p, water: Math.min(100, p.water + amount) }
          : p
      )
    );
  };

  const handleAddCompost = (plotId: number, amount: number) => {
    if (!gameStarted) return;
    setPlots((prev) =>
      prev.map((p) =>
        p.id === plotId && p.planted
          ? { ...p, compost: Math.min(100, p.compost + amount) }
          : p
      )
    );
  };

  const getCropEmoji = (plot: SoilPlot) => {
    if (!plot.planted) return "🌱";
    if (plot.growth < 30) return "🌱";
    if (plot.growth < 60) return "🌿";
    if (plot.growth < 100) return "🌾";
    return "🌾✨";
  };

  const getHealthStatus = (plot: SoilPlot) => {
    if (!plot.planted) return "Empty";
    if (plot.status === "withered") return "❌ Withered";
    if (plot.status === "ready") return "✅ Ready";
    if (plot.water < 20) return "🏜️ Dry";
    if (plot.water > 80) return "💧 Waterlogged";
    return "🌱 Growing";
  };

  const readyCount = plots.filter((p) => p.status === "ready").length;

  const gameContent = (
    <div className="w-full max-w-2xl mx-auto">
      {/* Game Title */}
      <div className="text-center mb-6">
        <h2 className="font-heading text-3xl font-bold text-foreground">🌾 Smart Farmer</h2>
        <p className="text-muted-foreground mt-2">Grow healthy crops with balanced care</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-secondary/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-secondary">{readyCount}/3</div>
          <div className="text-xs text-muted-foreground">Ready Crops</div>
        </div>
        <div className="bg-primary/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-primary">{Math.floor(gameTime)}s</div>
          <div className="text-xs text-muted-foreground">Time</div>
        </div>
        <div className="bg-accent/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-accent">☀️ {sunLevel}%</div>
          <div className="text-xs text-muted-foreground">Sun Level</div>
        </div>
      </div>

      {/* Farm Plots */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {plots.map((plot) => (
          <div
            key={plot.id}
            className="border-2 border-secondary/40 rounded-2xl p-5 bg-gradient-to-b from-slate-700/50 to-slate-800/50 backdrop-blur-sm"
          >
            {/* Soil */}
            <div className="relative h-32 bg-gradient-to-b from-amber-900 to-amber-950 rounded-lg mb-3 flex items-center justify-center border-2 border-amber-800/50">
              {/* Crop Display */}
              <div className="text-5xl text-center">{getCropEmoji(plot)}</div>

              {/* Growth Bar */}
              {plot.planted && (
                <div className="absolute bottom-2 left-2 right-2 h-2 bg-black/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 to-green-500 transition-all"
                    style={{ width: `${plot.growth}%` }}
                  />
                </div>
              )}
            </div>

            {/* Status */}
            <div className="text-center mb-3">
              <div className="text-sm font-semibold text-foreground mb-1">
                {getHealthStatus(plot)}
              </div>
              <div className="text-xs text-muted-foreground">
                Growth: {Math.floor(plot.growth)}%
              </div>
            </div>

            {/* Water/Compost Bars */}
            <div className="space-y-2 mb-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-semibold">💧 Water</span>
                  <span className="text-xs">{Math.floor(plot.water)}</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      plot.water < 20 ? "bg-red-500" : plot.water > 80 ? "bg-orange-500" : "bg-blue-500"
                    }`}
                    style={{ width: `${plot.water}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-semibold">🌱 Compost</span>
                  <span className="text-xs">{Math.floor(plot.compost)}</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 transition-all"
                    style={{ width: `${plot.compost}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-2">
              {!plot.planted ? (
                <button
                  onClick={() => handlePlantSeed(plot.id)}
                  className="w-full py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg font-semibold text-sm transition-colors"
                >
                  🌱 Plant Seed
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleAddWater(plot.id, 20)}
                    className="w-full py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 rounded-lg text-xs font-semibold transition-colors"
                  >
                    💧 Add Water
                  </button>
                  <button
                    onClick={() => handleAddCompost(plot.id, 15)}
                    className="w-full py-1.5 bg-green-600/30 hover:bg-green-600/50 text-green-200 rounded-lg text-xs font-semibold transition-colors"
                  >
                    🌱 Add Compost
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* How to Play */}
      <div className="space-y-3">
        <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-4">
          <h3 className="font-heading font-semibold text-foreground mb-2">🧭 How to Play</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>✓ Plant seeds in soil plots</li>
            <li>✓ Add water gradually (avoid too much or too little)</li>
            <li>✓ Add compost for faster growth</li>
            <li>✓ Grow 3 healthy crops to win!</li>
          </ul>
        </div>

        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
          <h3 className="font-heading font-semibold text-foreground mb-2">🧠 What You Learn</h3>
          <p className="text-sm text-muted-foreground">
            Good farming is about balance, not excess. Healthy crops need just the right amount of water and nutrients.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {showStartPopup && (
        <GameStartPopup
          title="Smart Farmer"
          discover="How farmers grow healthy crops without wasting water or soil"
          challenge="Plant seeds and care for crops using water and compost"
          success="Grow 3 healthy crops to complete the harvest"
          onStart={() => {
            setShowStartPopup(false);
            setGameStarted(true);
          }}
          onCancel={onExit || (() => {})}
        />
      )}

      {gameComplete && (
        <GameCompletionPopup
          title="Smart Farmer"
          message={gameSuccess ? "You harvested all your crops! 🎉" : "Some crops withered. Try again!"}
          isSuccess={gameSuccess}
          coins={gameSuccess ? 50 : 10}
          xp={gameSuccess ? 100 : 30}
          onReplay={() => {
            setGameComplete(false);
            setGameSuccess(false);
            setGameTime(0);
            setShowStartPopup(true);
            setGameStarted(false);
            setPlots([
              { id: 1, water: 0, compost: 0, growth: 0, status: "empty", planted: false },
              { id: 2, water: 0, compost: 0, growth: 0, status: "empty", planted: false },
              { id: 3, water: 0, compost: 0, growth: 0, status: "empty", planted: false },
            ]);
          }}
          onExit={onExit || (() => {})}
        />
      )}

      {gameStarted && !gameComplete && (
        <div className={`${isFullscreen ? "fixed inset-0 z-40 bg-background" : ""} flex items-center justify-center p-4`}>
          <div className={`${isFullscreen ? "w-full h-full flex flex-col" : "w-full max-w-3xl"} relative`}>
            {/* Fullscreen Button */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="absolute top-4 right-4 p-2 bg-muted hover:bg-muted/80 rounded-lg text-foreground transition-colors z-10"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              ⛶
            </button>

            {/* Game Content */}
            <div className={isFullscreen ? "flex-1 overflow-y-auto p-4" : ""}>{gameContent}</div>
          </div>
        </div>
      )}

      {!gameStarted && !showStartPopup && <div className="p-4">{gameContent}</div>}
    </div>
  );
}
