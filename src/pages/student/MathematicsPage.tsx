import { SubjectLayout } from "@/components/student/SubjectLayout";
import { GameMissionCard } from "@/components/student/GameMissionCard";
import { MathematicsActiveLearning } from "@/components/active-learning/MathematicsActiveLearning";
import {
  FractionForge,
  PatternMaster,
  VillageBudgetPlanner,
  MathHeist,
  GroceryMarket,
  DailyMathSpin,
  PatternMasterGame,
  FarmYieldCalculator,
} from "@/components/games";
import {
  Calculator,
  PieChart,
  Puzzle,
  PiggyBank,
  Vault,
  ShoppingCart,
  Loader,
  BarChart3,
  Sprout,
} from "lucide-react";
import { useState } from "react";

const mathGames = [
  {
    title: "Fraction Forge",
    description: "Build fractions perfectly by combining pieces of the whole",
    icon: PieChart,
    reward: 110,
    difficulty: "easy" as const,
    status: "available" as const,
    gameId: "fractions",
  },
  {
    title: "Pattern Master",
    description: "Unlock patterns with animated flows and limited attempts",
    icon: Puzzle,
    reward: 130,
    difficulty: "hard" as const,
    status: "available" as const,
    gameId: "pattern-master",
  },
  {
    title: "Village Budget Planner",
    description: "Balance family income with expenses, even with surprise events",
    icon: PiggyBank,
    reward: 135,
    difficulty: "hard" as const,
    status: "available" as const,
    gameId: "budget",
  },
  {
    title: "Math Heist",
    description: "Reach the exact target number using addition and subtraction cards",
    icon: Vault,
    reward: 150,
    difficulty: "easy" as const,
    status: "available" as const,
    gameId: "heist",
  },
  {
    title: "Grocery Market",
    description: "Weigh items and pay exact amounts using decimals and money",
    icon: ShoppingCart,
    reward: 160,
    difficulty: "medium" as const,
    status: "available" as const,
    gameId: "grocery",
  },
  {
    title: "Daily Math Spin",
    description: "Solve fast-paced spinning math problems and build your streak",
    icon: Loader,
    reward: 140,
    difficulty: "medium" as const,
    status: "available" as const,
    gameId: "spin",
  },
  {
    title: "Pattern Master Quest",
    description: "Complete number sequences by identifying the hidden pattern",
    icon: BarChart3,
    reward: 155,
    difficulty: "hard" as const,
    status: "available" as const,
    gameId: "pattern-quest",
  },
  {
    title: "Farm Yield Calculator",
    description: "Balance field size, seeds, and water to maximize crop yield",
    icon: Sprout,
    reward: 170,
    difficulty: "hard" as const,
    status: "available" as const,
    gameId: "farm",
  },
];

export default function MathematicsPage() {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const handleGameSelect = (gameId: string) => {
    setActiveGame(gameId);
  };

  const handleGameClose = () => {
    setActiveGame(null);
  };

  return (
    <>
      <SubjectLayout
        title="Mathematics"
        icon={Calculator}
        iconColor="text-badge"
        progress={65}
        totalLessons={7}
        completedLessons={0}
        xpEarned={0}
      >
        <div className="slide-up" style={{ animationDelay: "150ms" }}>
          <MathematicsActiveLearning />
        </div>

        <div className="slide-up" style={{ animationDelay: "200ms" }}>
          <h3 className="mb-4 font-heading font-semibold">Gamified Learning Missions</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Master mathematical concepts through interactive puzzle games. Each game teaches one key concept through play.
          </p>
          <div className="space-y-3">
            {mathGames.map((game, index) => (
              <div
                key={game.gameId}
                className="slide-up"
                style={{ animationDelay: `${200 + index * 50}ms` }}
              >
                <GameMissionCard
                  title={game.title}
                  description={game.description}
                  icon={game.icon}
                  reward={game.reward}
                  difficulty={game.difficulty}
                  status={game.status}
                  onClick={() => handleGameSelect(game.gameId)}
                />
              </div>
            ))}
          </div>
        </div>
      </SubjectLayout>

      {/* Game Components */}
      {activeGame === "fractions" && <FractionForge onClose={handleGameClose} />}
      {activeGame === "pattern-master" && <PatternMaster onClose={handleGameClose} />}
      {activeGame === "budget" && <VillageBudgetPlanner onClose={handleGameClose} />}
      {activeGame === "heist" && <MathHeist onClose={handleGameClose} />}
      {activeGame === "grocery" && <GroceryMarket onClose={handleGameClose} />}
      {activeGame === "spin" && <DailyMathSpin onClose={handleGameClose} />}
      {activeGame === "pattern-quest" && <PatternMasterGame onClose={handleGameClose} />}
      {activeGame === "farm" && <FarmYieldCalculator onClose={handleGameClose} />}
    </>
  );
}
