import { AppLayout } from "@/components/navigation";
import { GameBadge } from "@/components/ui/game-badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  Clock,
  Image,
  Mic,
  Plus,
  Star,
  Home,
  Leaf,
  DollarSign,
} from "lucide-react";

const activeTasks = [
  {
    id: "1",
    title: "Check electrical safety at home",
    description: "Verify all electrical connections are safe and documented",
    category: "safety",
    coins: 50,
    status: "pending",
    dueDate: "Dec 22",
    icon: Home,
  },
  {
    id: "2",
    title: "Create family monthly budget",
    description: "Help parents plan the monthly expenses",
    category: "finance",
    coins: 40,
    status: "in_progress",
    dueDate: "Dec 24",
    icon: DollarSign,
  },
  {
    id: "3",
    title: "Plant a tree in the garden",
    description: "Contribute to village greenery initiative",
    category: "environment",
    coins: 60,
    status: "pending",
    dueDate: "Dec 26",
    icon: Leaf,
  },
];

const completedTasks = [
  {
    id: "4",
    title: "Help with evening cooking",
    completedAt: "Dec 18",
    coins: 30,
    rating: 5,
    hasPhoto: true,
  },
  {
    id: "5",
    title: "Water conservation week",
    completedAt: "Dec 15",
    coins: 45,
    rating: 4,
    hasPhoto: true,
  },
  {
    id: "6",
    title: "Teach younger sibling",
    completedAt: "Dec 12",
    coins: 35,
    rating: 5,
    hasPhoto: false,
  },
];

const impactStats = [
  { label: "Tasks Done", value: 24 },
  { label: "Total Coins", value: 890 },
  { label: "Family Rating", value: "4.8★" },
];

export default function ParentFamilyTasksPage() {
  const getCategoryColor = (category: string): "accent" | "primary" | "secondary" | "outline" => {
    switch (category) {
      case "safety":
        return "accent";
      case "finance":
        return "primary";
      case "environment":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <AppLayout role="parent" title="Family Tasks">
      <div className="px-4 py-6">
        {/* Header */}
        <div className="mb-6 slide-up">
          <h2 className="font-heading text-2xl font-bold">Family Tasks</h2>
          <p className="text-muted-foreground">Real-world learning activities</p>
        </div>

        {/* Impact Stats */}
        <div className="mb-6 grid grid-cols-3 gap-3 slide-up" style={{ animationDelay: "100ms" }}>
          {impactStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-3 text-center"
            >
              <p className="font-heading text-lg font-bold text-primary">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="active" className="slide-up" style={{ animationDelay: "150ms" }}>
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="active" className="flex-1">
              Active ({activeTasks.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1">
              Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="mb-3 flex items-start gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${getCategoryColor(task.category)}/10`}>
                    <task.icon className={`h-5 w-5 text-${getCategoryColor(task.category)}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h4 className="font-heading font-semibold">{task.title}</h4>
                      <GameBadge variant={getCategoryColor(task.category)} size="sm">
                        {task.category}
                      </GameBadge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {task.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Due: {task.dueDate}
                    </span>
                    <span className="font-semibold text-accent">
                      +{task.coins} 🪙
                    </span>
                  </div>
                  <GameBadge
                    variant={task.status === "in_progress" ? "accent" : "outline"}
                    size="sm"
                  >
                    {task.status === "in_progress" ? "In Progress" : "Pending"}
                  </GameBadge>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
                  <Check className="h-5 w-5 text-secondary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{task.title}</h4>
                  <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{task.completedAt}</span>
                    <span>•</span>
                    <span className="text-accent">+{task.coins} 🪙</span>
                    {task.hasPhoto && (
                      <>
                        <span>•</span>
                        <Image className="h-4 w-4" />
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="font-medium">{task.rating}</span>
                </div>
              </div>
            ))}

            {/* Family Impact Summary */}
            <div className="mt-6 rounded-xl bg-gradient-to-r from-secondary/20 to-secondary/5 p-4 border border-secondary/30">
              <h4 className="mb-2 font-heading font-semibold">Family Impact</h4>
              <p className="text-sm text-muted-foreground">
                Rahul has contributed 24 meaningful tasks to your family this month, 
                earning ₹450 worth of rewards and developing practical life skills.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
