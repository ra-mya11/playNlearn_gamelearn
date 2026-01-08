import { SubjectLayout } from "@/components/student/SubjectLayout";
import { Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";

const financeGames = [
  {
    title: "Real Life Budget Survival",
    description: "Manage ₹3000 monthly salary with smart decisions",
    emoji: "💰",
    path: "/learn/finance/levels",
    reward: 200,
    difficulty: "hard" as const,
  },
  {
    title: "Market Price Negotiator",
    description: "Compare 3 sellers and pick the best value",
    emoji: "🛍️",
    path: "/learn/finance/levels",
    reward: 150,
    difficulty: "medium" as const,
  },
  {
    title: "Saving Tree",
    description: "Grow a tree through 30 days of consistent saving",
    emoji: "🌱",
    path: "/learn/finance/levels",
    reward: 150,
    difficulty: "medium" as const,
  },
  {
    title: "Bank Interest Simulator",
    description: "Deposit money and watch interest grow it over time",
    emoji: "🏦",
    path: "/learn/finance/levels",
    reward: 200,
    difficulty: "medium" as const,
  },
  {
    title: "Micro Business Builder",
    description: "Run a juice stall: buy inventory, set prices, maximize profit",
    emoji: "🧃",
    path: "/learn/finance/levels",
    reward: 200,
    difficulty: "hard" as const,
  },
  {
    title: "Digital Money Choices",
    description: "Choose the right payment method for each situation",
    emoji: "💳",
    path: "/learn/finance/levels",
    reward: 150,
    difficulty: "easy" as const,
  },
];

export default function FinancePage() {
  const navigate = useNavigate();

  return (
    <SubjectLayout
      title="Finance"
      icon={Wallet}
      iconColor="text-accent"
      progress={55}
      totalLessons={6}
      completedLessons={2}
      xpEarned={340}
    >
      <div className="slide-up" style={{ animationDelay: "150ms" }}>
        <h3 className="mb-4 font-heading font-semibold text-foreground">
          🎮 Gamified Learning
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Master finance through interactive games. Each game teaches real money concepts through hands-on play!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {financeGames.map((game, index) => (
            <div
              key={game.title}
              className="slide-up"
              style={{ animationDelay: `${200 + index * 50}ms` }}
            >
              <div
                onClick={() => navigate(game.path)}
                className="cursor-pointer group"
              >
                <div className="relative rounded-2xl overflow-hidden border-2 border-accent/30 bg-gradient-to-br from-accent/10 to-accent/5 p-6 hover:border-accent/60 hover:shadow-glow transition-all duration-300 glass-card touch-scale h-full">
                  {/* Background decoration */}
                  <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full blur-2xl opacity-20 bg-accent/30" />

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
                        <span className="inline-block px-2 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium">
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
                    <button className="w-full py-2 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground font-semibold rounded-lg transition-all transform hover:scale-105">
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
