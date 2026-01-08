import { SubjectLayout } from "@/components/student/SubjectLayout";
import { Beaker } from "lucide-react";
import { useNavigate } from "react-router-dom";

const chemistryGames = [
  {
    title: "Reaction Detective",
    description: "Mix substances and identify reactions by their observable changes",
    emoji: "🔬",
    icon: "🔬",
    path: "/student/chemistry/reaction-detective",
    reward: 115,
    difficulty: "medium" as const,
  },
  {
    title: "Periodic Table Puzzle",
    description: "Discover patterns and arrange elements in their correct positions",
    emoji: "📋",
    icon: "📋",
    path: "/student/chemistry/periodic-table",
    reward: 120,
    difficulty: "medium" as const,
  },
  {
    title: "Molecule Builder",
    description: "Bond atoms together to create stable molecules",
    emoji: "⚛️",
    icon: "⚛️",
    path: "/student/chemistry/molecule-builder",
    reward: 110,
    difficulty: "medium" as const,
  },
  {
    title: "Property Puzzle",
    description: "Choose materials with the right properties for real-world situations",
    emoji: "🔧",
    icon: "🔧",
    path: "/student/chemistry/property-puzzle",
    reward: 100,
    difficulty: "easy" as const,
  },
  {
    title: "Equation Builder",
    description: "Balance chemical equations by placing atom blocks",
    emoji: "⚖️",
    icon: "⚖️",
    path: "/student/chemistry/equation-builder",
    reward: 130,
    difficulty: "hard" as const,
  },
];

export default function ChemistryPage() {
  const navigate = useNavigate();

  return (
    <SubjectLayout
      title="Chemistry"
      icon={Beaker}
      iconColor="text-secondary"
      progress={30}
      totalLessons={10}
      completedLessons={3}
      xpEarned={180}
    >
      <div className="slide-up" style={{ animationDelay: "150ms" }}>
        <h3 className="mb-4 font-heading font-semibold text-foreground">
          🎮 Gamified Learning
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Learn chemistry through interactive games. Each game teaches you real chemistry concepts through play!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {chemistryGames.map((game, index) => (
            <div
              key={game.title}
              className="slide-up"
              style={{ animationDelay: `${200 + index * 50}ms` }}
            >
              <div
                onClick={() => navigate(game.path)}
                className="cursor-pointer group"
              >
                <div className="relative rounded-2xl overflow-hidden border-2 border-secondary/30 bg-gradient-to-br from-secondary/10 to-secondary/5 p-6 hover:border-secondary/60 hover:shadow-glow transition-all duration-300 glass-card touch-scale h-full">
                  {/* Background decoration */}
                  <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full blur-2xl opacity-20 bg-secondary/30" />

                  <div className="relative z-10">
                    {/* Game Emoji */}
                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                      {game.emoji}
                    </div>

                    {/* Game Title */}
                    <h4 className="font-heading font-bold text-lg text-foreground mb-2">
                      {game.title}
                    </h4>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4">
                      {game.description}
                    </p>

                    {/* Game Stats */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-2">
                        <span className="inline-block px-2 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-medium">
                          🏆 {game.reward} XP
                        </span>
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            game.difficulty === "easy"
                              ? "bg-green-500/20 text-green-600"
                              : game.difficulty === "medium"
                                ? "bg-yellow-500/20 text-yellow-600"
                                : "bg-red-500/20 text-red-600"
                          }`}
                        >
                          {game.difficulty === "easy"
                            ? "🟢 Easy"
                            : game.difficulty === "medium"
                              ? "🟡 Medium"
                              : "🔴 Hard"}
                        </span>
                      </div>
                      <span className="text-xl">⛶</span>
                    </div>

                    {/* Play Button */}
                    <button className="w-full py-2 bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-secondary-foreground font-semibold rounded-lg transition-all transform hover:scale-105">
                      👉 Play Game
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SubjectLayout>
  );
}
