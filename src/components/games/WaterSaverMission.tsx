import React, { useState, useEffect } from "react";
import { GameStartPopup } from "./GameStartPopup";
import { GameCompletionPopup } from "./GameCompletionPopup";

interface WaterSource {
  id: string;
  name: string;
  emoji: string;
  position: { x: number; y: number };
  isLeaking: boolean;
  leakAmount: number;
  fixed: boolean;
}

interface WaterSaverMissionProps {
  onGameComplete?: (success: boolean, score: number) => void;
  onExit?: () => void;
}

export function WaterSaverMission({ onGameComplete, onExit }: WaterSaverMissionProps) {
  const [showStartPopup, setShowStartPopup] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [gameSuccess, setGameSuccess] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [waterLevel, setWaterLevel] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [drainRate, setDrainRate] = useState(15);
  const [totalWaterSaved, setTotalWaterSaved] = useState(0);

  const [sources, setSources] = useState<WaterSource[]>([
    {
      id: "tap",
      name: "Kitchen Tap",
      emoji: "🚰",
      position: { x: 20, y: 30 },
      isLeaking: true,
      leakAmount: 5,
      fixed: false,
    },
    {
      id: "shower",
      name: "Bathroom Shower",
      emoji: "🚿",
      position: { x: 50, y: 25 },
      isLeaking: true,
      leakAmount: 8,
      fixed: false,
    },
    {
      id: "toilet",
      name: "Toilet Leak",
      emoji: "🚽",
      position: { x: 80, y: 35 },
      isLeaking: true,
      leakAmount: 6,
      fixed: false,
    },
  ]);

  const [choicesMade, setChoicesMade] = useState({
    bucket: false,
    shower: false,
  });

  const [messages, setMessages] = useState<Array<{ id: string; text: string }>>([]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameComplete) return;

    const interval = setInterval(() => {
      setGameTime((t) => t + 1);

      // Calculate total leak rate
      let currentLeakRate = drainRate;
      sources.forEach((source) => {
        if (source.isLeaking && !source.fixed) {
          currentLeakRate += source.leakAmount;
        }
      });

      // Apply choices to reduce drain
      if (choicesMade.bucket) currentLeakRate -= 8;
      if (choicesMade.shower) currentLeakRate -= 6;

      // Update water level
      setWaterLevel((prev) => {
        let newLevel = prev - currentLeakRate;
        if (newLevel < 0) newLevel = 0;
        return newLevel;
      });

      // Track water saved
      if (currentLeakRate < drainRate) {
        setTotalWaterSaved((prev) => prev + (drainRate - currentLeakRate) * 0.5);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [gameStarted, gameComplete, drainRate, sources, choicesMade]);

  // Check win/lose conditions
  useEffect(() => {
    if (!gameStarted || gameComplete) return;

    // Win - tank full and all leaks fixed
    const allFixed = sources.every((s) => !s.isLeaking || s.fixed);
    if (waterLevel >= 90 && allFixed) {
      setGameComplete(true);
      setGameSuccess(true);
      onGameComplete?.(true, 100);
    }

    // Lose - tank empty and leaks still active
    if (waterLevel <= 0 && !allFixed) {
      setGameComplete(true);
      setGameSuccess(false);
      onGameComplete?.(false, 30);
    }
  }, [waterLevel, gameComplete, gameStarted, sources, onGameComplete]);

  const handleFixLeak = (sourceId: string) => {
    setSources((prev) =>
      prev.map((s) =>
        s.id === sourceId ? { ...s, fixed: true, isLeaking: false } : s
      )
    );

    addMessage(`✓ Fixed ${sources.find((s) => s.id === sourceId)?.name}!`);
  };

  const handleBucketChoice = () => {
    setChoicesMade((prev) => ({ ...prev, bucket: !prev.bucket }));
    addMessage("💧 Using bucket instead of tap - water saved!");
  };

  const handleShowerChoice = () => {
    setChoicesMade((prev) => ({ ...prev, shower: !prev.shower }));
    addMessage("⏰ Short showers - saving water!");
  };

  const addMessage = (text: string) => {
    const id = Math.random().toString();
    setMessages((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }, 2000);
  };

  const gameContent = (
    <div className="w-full max-w-2xl mx-auto">
      {/* Game Title */}
      <div className="text-center mb-6">
        <h2 className="font-heading text-3xl font-bold text-foreground">💧 Water Saver Mission</h2>
        <p className="text-muted-foreground mt-2">Fix leaks and save water for your village</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-blue-600/20 rounded-lg p-3 text-center border border-blue-500/30">
          <div className="text-2xl font-bold text-blue-400">{Math.floor(waterLevel)}%</div>
          <div className="text-xs text-muted-foreground">Tank Level</div>
        </div>
        <div className="bg-green-600/20 rounded-lg p-3 text-center border border-green-500/30">
          <div className="text-2xl font-bold text-green-400">
            {sources.filter((s) => s.fixed || !s.isLeaking).length}/3
          </div>
          <div className="text-xs text-muted-foreground">Leaks Fixed</div>
        </div>
        <div className="bg-secondary/20 rounded-lg p-3 text-center border border-secondary/30">
          <div className="text-2xl font-bold text-secondary">{Math.floor(gameTime)}s</div>
          <div className="text-xs text-muted-foreground">Time</div>
        </div>
      </div>

      {/* Water Tank Display */}
      <div className="mb-6 relative h-40 bg-gradient-to-b from-slate-700/50 to-slate-800/50 rounded-2xl border-4 border-blue-500/40 flex items-end justify-center p-4 overflow-hidden">
        {/* Tank Background */}
        <div className="absolute inset-0 flex items-end">
          <div
            className="w-full bg-gradient-to-t from-blue-500/40 to-blue-300/20 transition-all duration-300"
            style={{ height: `${Math.max(0, waterLevel)}%` }}
          />
        </div>

        {/* Tank Level Text */}
        <div className="relative z-10 text-center">
          {waterLevel < 30 && !gameSuccess && (
            <div className="text-sm text-orange-400 font-semibold">⚠️ Tank Running Low!</div>
          )}
          {waterLevel >= 80 && (
            <div className="text-sm text-green-400 font-semibold">✓ Tank Filling Up!</div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="h-6 mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="text-sm text-green-400 font-semibold animate-fade-out"
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Leak Spots */}
      <div className="mb-6 relative h-48 bg-gradient-to-b from-slate-600/30 to-slate-700/50 rounded-2xl border-2 border-slate-600/50 p-4 overflow-hidden">
        <div className="text-center mb-2 text-xs font-semibold text-muted-foreground">
          🏠 Find and fix the leaks!
        </div>

        {sources.map((source) => (
          <div
            key={source.id}
            className="absolute"
            style={{ left: `${source.position.x}%`, top: `${source.position.y}%` }}
          >
            <button
              onClick={() => handleFixLeak(source.id)}
              disabled={source.fixed}
              className={`relative group transition-all ${
                source.fixed ? "opacity-50 cursor-default" : "cursor-pointer hover:scale-110"
              }`}
            >
              {/* Leak Animation */}
              {source.isLeaking && !source.fixed && (
                <div className="absolute inset-0 animate-pulse">
                  <div className="w-full h-full rounded-full border-2 border-blue-500/50" />
                </div>
              )}

              {/* Icon */}
              <div className="text-4xl">{source.emoji}</div>

              {/* Fixed Badge */}
              {source.fixed && (
                <div className="absolute top-0 right-0 bg-green-500 rounded-full p-1">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {source.fixed ? "✓ Fixed" : "Click to fix"}
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* Smart Choices */}
      <div className="space-y-3 mb-6">
        <h3 className="font-heading font-semibold text-foreground text-sm">🎯 Smart Water Choices</h3>

        <button
          onClick={handleBucketChoice}
          className={`w-full p-4 rounded-xl border-2 transition-all ${
            choicesMade.bucket
              ? "bg-green-600/30 border-green-500/60"
              : "bg-slate-700/30 border-slate-600/50 hover:border-green-500/40"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">💧</span>
            <div className="text-left flex-1">
              <div className="font-semibold text-sm">Use a Bucket</div>
              <div className="text-xs text-muted-foreground">
                {choicesMade.bucket ? "✓ Saving 8L per day" : "Click to use bucket for washing"}
              </div>
            </div>
            {choicesMade.bucket && <span className="text-green-400">✓</span>}
          </div>
        </button>

        <button
          onClick={handleShowerChoice}
          className={`w-full p-4 rounded-xl border-2 transition-all ${
            choicesMade.shower
              ? "bg-green-600/30 border-green-500/60"
              : "bg-slate-700/30 border-slate-600/50 hover:border-green-500/40"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏰</span>
            <div className="text-left flex-1">
              <div className="font-semibold text-sm">Short Showers</div>
              <div className="text-xs text-muted-foreground">
                {choicesMade.shower ? "✓ Saving 6L per day" : "Click for quick 5-minute showers"}
              </div>
            </div>
            {choicesMade.shower && <span className="text-green-400">✓</span>}
          </div>
        </button>
      </div>

      {/* How to Play */}
      <div className="space-y-3">
        <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-4">
          <h3 className="font-heading font-semibold text-foreground mb-2">🧭 How to Play</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>✓ Click on leaks to fix them</li>
            <li>✓ Make smart water choices</li>
            <li>✓ Fill the tank to 90%</li>
            <li>✓ Fix all leaks to win!</li>
          </ul>
        </div>

        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
          <h3 className="font-heading font-semibold text-foreground mb-2">🧠 What You Learn</h3>
          <p className="text-sm text-muted-foreground">
            Saving water saves life. Small actions like fixing leaks and taking short showers have a big impact on your village.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {showStartPopup && (
        <GameStartPopup
          title="Water Saver Mission"
          discover="Where water is wasted in your home and how to stop it"
          challenge="Fix leaks and make smart water choices to fill the tank"
          success="Fill the tank and fix all leaks to save your village"
          onStart={() => {
            setShowStartPopup(false);
            setGameStarted(true);
          }}
          onCancel={onExit || (() => {})}
        />
      )}

      {gameComplete && (
        <GameCompletionPopup
          title="Water Saver Mission"
          message={gameSuccess ? "You saved water for your village! 💧" : "Tank emptied. Your village needs more water!"}
          isSuccess={gameSuccess}
          coins={gameSuccess ? 50 : 10}
          xp={gameSuccess ? 100 : 30}
          onReplay={() => {
            setGameComplete(false);
            setGameSuccess(false);
            setGameTime(0);
            setWaterLevel(0);
            setTotalWaterSaved(0);
            setChoicesMade({ bucket: false, shower: false });
            setShowStartPopup(true);
            setGameStarted(false);
            setSources([
              {
                id: "tap",
                name: "Kitchen Tap",
                emoji: "🚰",
                position: { x: 20, y: 30 },
                isLeaking: true,
                leakAmount: 5,
                fixed: false,
              },
              {
                id: "shower",
                name: "Bathroom Shower",
                emoji: "🚿",
                position: { x: 50, y: 25 },
                isLeaking: true,
                leakAmount: 8,
                fixed: false,
              },
              {
                id: "toilet",
                name: "Toilet Leak",
                emoji: "🚽",
                position: { x: 80, y: 35 },
                isLeaking: true,
                leakAmount: 6,
                fixed: false,
              },
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
