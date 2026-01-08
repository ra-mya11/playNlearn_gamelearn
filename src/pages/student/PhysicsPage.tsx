import { SubjectLayout } from "@/components/student/SubjectLayout";
import { GameMissionCard } from "@/components/student/GameMissionCard";
import { Atom, Target, Zap, Wind, Zap as Lightning, Lightbulb, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";

const physicsMissions = [
  {
    title: "Projectile Motion",
    description: "Launch a cannon at the perfect angle and speed to hit the target",
    icon: Target,
    reward: 150,
    difficulty: "medium" as const,
    status: "available" as const,
    path: "/student/physics/projectile-motion",
  },
  {
    title: "Village Physics Explorer",
    description: "Push carts on different surfaces and feel how friction changes motion",
    icon: Wind,
    reward: 120,
    difficulty: "easy" as const,
    status: "available" as const,
    path: "/student/physics/village-physics-explorer",
  },
  {
    title: "Force Builder",
    description: "Apply force to objects of different mass and watch acceleration change",
    icon: Zap,
    reward: 100,
    difficulty: "medium" as const,
    status: "available" as const,
    path: "/student/physics/force-builder",
  },
  {
    title: "Energy Quest",
    description: "Control water flow to power turbines and light up the village",
    icon: Lightning,
    reward: 140,
    difficulty: "medium" as const,
    status: "available" as const,
    path: "/student/physics/energy-quest",
  },
  {
    title: "Village Light-Up",
    description: "Rotate wire tiles to complete circuits and power the lights",
    icon: Lightbulb,
    reward: 110,
    difficulty: "hard" as const,
    status: "available" as const,
    path: "/student/physics/village-light-up",
  },
  {
    title: "Logic Blocks Puzzle",
    description: "Connect logic gates to control signals and solve the puzzle",
    icon: Brain,
    reward: 130,
    difficulty: "hard" as const,
    status: "available" as const,
    path: "/student/physics/logic-blocks-puzzle",
  },
];

export default function PhysicsPage() {
  const navigate = useNavigate();

  return (
    <SubjectLayout
      title="Physics"
      icon={Atom}
      iconColor="text-primary"
      progress={65}
      totalLessons={12}
      completedLessons={8}
      xpEarned={450}
    >
      <div className="slide-up" style={{ animationDelay: "150ms" }}>
        <h3 className="mb-4 font-heading font-semibold">Missions & Games</h3>
        <div className="space-y-3">
          {physicsMissions.map((mission, index) => (
            <div
              key={mission.title}
              className="slide-up"
              style={{ animationDelay: `${200 + index * 50}ms` }}
            >
              <GameMissionCard
                {...mission}
                onClick={() => mission.path && navigate(mission.path)}
              />
            </div>
          ))}
        </div>
      </div>
    </SubjectLayout>
  );
}
