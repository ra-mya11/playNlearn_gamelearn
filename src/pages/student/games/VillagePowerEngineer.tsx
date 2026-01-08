import { useState } from "react";
import { AppLayout } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { GameBadge } from "@/components/ui/game-badge";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import { 
  ArrowLeft, 
  Zap, 
  Lightbulb, 
  Home, 
  Battery, 
  Cable,
  RotateCcw,
  CheckCircle,
  Star,
  HelpCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface GridComponent {
  id: string;
  type: "battery" | "wire" | "bulb" | "house" | "empty";
  connected: boolean;
}

const initialGrid: GridComponent[][] = [
  [
    { id: "0-0", type: "empty", connected: false },
    { id: "0-1", type: "empty", connected: false },
    { id: "0-2", type: "empty", connected: false },
    { id: "0-3", type: "empty", connected: false },
  ],
  [
    { id: "1-0", type: "battery", connected: true },
    { id: "1-1", type: "empty", connected: false },
    { id: "1-2", type: "empty", connected: false },
    { id: "1-3", type: "house", connected: false },
  ],
  [
    { id: "2-0", type: "empty", connected: false },
    { id: "2-1", type: "empty", connected: false },
    { id: "2-2", type: "empty", connected: false },
    { id: "2-3", type: "empty", connected: false },
  ],
];

const componentIcons = {
  battery: Battery,
  wire: Cable,
  bulb: Lightbulb,
  house: Home,
  empty: null,
};

const toolPalette = [
  { type: "wire" as const, icon: Cable, label: "Wire", count: 5 },
  { type: "bulb" as const, icon: Lightbulb, label: "Bulb", count: 2 },
];

export default function VillagePowerEngineer() {
  const navigate = useNavigate();
  const [grid, setGrid] = useState(initialGrid);
  const [selectedTool, setSelectedTool] = useState<"wire" | "bulb" | null>(null);
  const [toolCounts, setToolCounts] = useState({ wire: 5, bulb: 2 });
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [showTutorial, setShowTutorial] = useState(true);

  const handleCellClick = (row: number, col: number) => {
    if (!selectedTool) {
      toast({ title: "Select a tool first!", description: "Choose a wire or bulb from the palette below." });
      return;
    }

    const cell = grid[row][col];
    if (cell.type !== "empty") {
      toast({ title: "Cell occupied!", description: "This cell already has a component." });
      return;
    }

    if (toolCounts[selectedTool] <= 0) {
      toast({ title: "No more " + selectedTool + "s!", description: "You've used all available " + selectedTool + "s." });
      return;
    }

    const newGrid = [...grid.map(r => [...r])];
    newGrid[row][col] = { ...cell, type: selectedTool, connected: false };
    setGrid(newGrid);
    setToolCounts({ ...toolCounts, [selectedTool]: toolCounts[selectedTool] - 1 });
    setScore(score + 10);

    // Check if circuit is complete (simplified logic)
    checkCircuit(newGrid);
  };

  const checkCircuit = (currentGrid: GridComponent[][]) => {
    // Simplified: check if there's a path from battery to house
    const batteryPos = { row: 1, col: 0 };
    const housePos = { row: 1, col: 3 };

    let connected = true;
    for (let col = batteryPos.col + 1; col < housePos.col; col++) {
      if (currentGrid[batteryPos.row][col].type === "empty") {
        connected = false;
        break;
      }
    }

    if (connected) {
      const newGrid = currentGrid.map(row =>
        row.map(cell => ({ ...cell, connected: cell.type !== "empty" }))
      );
      setGrid(newGrid);
      setScore(score + 100);
      toast({ 
        title: "🎉 Circuit Complete!", 
        description: "You powered the house! +100 points",
      });
    }
  };

  const resetGame = () => {
    setGrid(initialGrid);
    setToolCounts({ wire: 5, bulb: 2 });
    setScore(0);
  };

  const isHousePowered = grid[1][3].connected;

  return (
    <AppLayout role="student" playCoins={1250} title="Village Power Engineer">
      <div className="px-4 py-6">
        {/* Header */}
        <div className="mb-4 slide-up">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2"
            onClick={() => navigate("/student/physics")}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Tutorial Overlay */}
        {showTutorial && (
          <div className="mb-4 rounded-xl border border-primary/30 bg-primary/10 p-4 slide-up">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">How to Play</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Connect the battery to the house using wires and bulbs. 
                  Tap a tool, then tap an empty cell to place it.
                </p>
                <Button size="sm" onClick={() => setShowTutorial(false)}>
                  Got it!
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Game Stats */}
        <div className="mb-4 grid grid-cols-3 gap-3 slide-up" style={{ animationDelay: "50ms" }}>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <Zap className="mx-auto mb-1 h-5 w-5 text-accent" />
            <p className="font-heading text-lg font-bold">{score}</p>
            <p className="text-xs text-muted-foreground">Score</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <Star className="mx-auto mb-1 h-5 w-5 text-badge" />
            <p className="font-heading text-lg font-bold">Level {level}</p>
            <p className="text-xs text-muted-foreground">Current</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <div className={cn(
              "mx-auto mb-1 h-5 w-5 rounded-full",
              isHousePowered ? "bg-secondary" : "bg-muted"
            )} />
            <p className="font-heading text-lg font-bold">{isHousePowered ? "ON" : "OFF"}</p>
            <p className="text-xs text-muted-foreground">Power</p>
          </div>
        </div>

        {/* Game Grid */}
        <div className="mb-4 rounded-xl border border-border bg-card p-4 slide-up" style={{ animationDelay: "100ms" }}>
          <div className="grid grid-cols-4 gap-2">
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const Icon = componentIcons[cell.type];
                return (
                  <button
                    key={cell.id}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    className={cn(
                      "aspect-square rounded-lg border-2 border-dashed transition-all duration-200 flex items-center justify-center",
                      cell.type === "empty" 
                        ? "border-muted-foreground/30 bg-muted/30 hover:border-primary/50 hover:bg-primary/10" 
                        : "border-solid",
                      cell.type === "battery" && "border-accent bg-accent/20",
                      cell.type === "house" && (cell.connected ? "border-secondary bg-secondary/20" : "border-muted-foreground bg-muted/50"),
                      cell.type === "wire" && (cell.connected ? "border-secondary bg-secondary/20" : "border-primary bg-primary/20"),
                      cell.type === "bulb" && (cell.connected ? "border-accent bg-accent/20 animate-pulse" : "border-badge bg-badge/20"),
                    )}
                  >
                    {Icon && (
                      <Icon className={cn(
                        "h-8 w-8",
                        cell.type === "battery" && "text-accent",
                        cell.type === "house" && (cell.connected ? "text-secondary" : "text-muted-foreground"),
                        cell.type === "wire" && (cell.connected ? "text-secondary" : "text-primary"),
                        cell.type === "bulb" && (cell.connected ? "text-accent" : "text-badge"),
                      )} />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Tool Palette */}
        <div className="mb-4 rounded-xl border border-border bg-card p-4 slide-up" style={{ animationDelay: "150ms" }}>
          <h4 className="mb-3 font-heading font-semibold">Tool Palette</h4>
          <div className="flex gap-3">
            {toolPalette.map((tool) => (
              <button
                key={tool.type}
                onClick={() => setSelectedTool(tool.type)}
                className={cn(
                  "flex-1 rounded-xl border-2 p-3 transition-all",
                  selectedTool === tool.type 
                    ? "border-primary bg-primary/20" 
                    : "border-border hover:border-primary/50"
                )}
              >
                <tool.icon className="mx-auto mb-1 h-6 w-6" />
                <p className="text-sm font-medium">{tool.label}</p>
                <p className="text-xs text-muted-foreground">x{toolCounts[tool.type]}</p>
              </button>
            ))}
            <button
              onClick={resetGame}
              className="flex-1 rounded-xl border-2 border-border p-3 hover:border-destructive/50 transition-all"
            >
              <RotateCcw className="mx-auto mb-1 h-6 w-6 text-muted-foreground" />
              <p className="text-sm font-medium">Reset</p>
              <p className="text-xs text-muted-foreground">Start Over</p>
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="rounded-xl border border-border bg-card p-4 slide-up" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-heading font-semibold">Mission Progress</h4>
            <GameBadge variant="accent" size="sm">
              +100 🪙
            </GameBadge>
          </div>
          <AnimatedProgress value={isHousePowered ? 100 : (score / 100) * 50} />
          <p className="mt-2 text-sm text-muted-foreground">
            {isHousePowered 
              ? "🎉 Level complete! Tap to continue to next level." 
              : "Connect the battery to the house to power it up!"}
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
