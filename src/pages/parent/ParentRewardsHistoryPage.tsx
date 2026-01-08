import { AppLayout } from "@/components/navigation";
import { GameBadge } from "@/components/ui/game-badge";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingBag,
  TrendingUp,
  Gift,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  Package,
} from "lucide-react";

const rewardStats = [
  { label: "Total Earned", value: "2,450", icon: TrendingUp, color: "text-secondary" },
  { label: "Redeemed", value: "1,200", icon: ShoppingBag, color: "text-accent" },
  { label: "Available", value: "1,250", icon: Gift, color: "text-primary" },
];

const transactions = [
  { 
    id: "1", 
    type: "earned", 
    title: "Physics Quiz Completed", 
    amount: 50, 
    date: "Dec 20",
    category: "Learning"
  },
  { 
    id: "2", 
    type: "spent", 
    title: "Notebook Set", 
    amount: 150, 
    date: "Dec 19",
    category: "School Supplies"
  },
  { 
    id: "3", 
    type: "earned", 
    title: "Village Task - Electrical Safety", 
    amount: 50, 
    date: "Dec 18",
    category: "Village"
  },
  { 
    id: "4", 
    type: "earned", 
    title: "7 Day Learning Streak", 
    amount: 100, 
    date: "Dec 17",
    category: "Achievement"
  },
  { 
    id: "5", 
    type: "spent", 
    title: "Family Groceries", 
    amount: 300, 
    date: "Dec 15",
    category: "Family"
  },
  { 
    id: "6", 
    type: "earned", 
    title: "Math Chapter Completed", 
    amount: 40, 
    date: "Dec 14",
    category: "Learning"
  },
];

const redemptions = [
  { 
    id: "1", 
    item: "Notebook Set", 
    coins: 150, 
    value: "₹75", 
    date: "Dec 19",
    status: "delivered",
    image: "📚"
  },
  { 
    id: "2", 
    item: "Family Groceries", 
    coins: 300, 
    value: "₹150", 
    date: "Dec 15",
    status: "delivered",
    image: "🛒"
  },
  { 
    id: "3", 
    item: "Solar Calculator", 
    coins: 200, 
    value: "₹100", 
    date: "Dec 10",
    status: "delivered",
    image: "🔢"
  },
  { 
    id: "4", 
    item: "Drawing Kit", 
    coins: 250, 
    value: "₹125", 
    date: "Dec 5",
    status: "delivered",
    image: "🎨"
  },
];

const monthlyGoal = {
  current: 1250,
  target: 2000,
  label: "Monthly Goal",
};

export default function ParentRewardsHistoryPage() {
  return (
    <AppLayout role="parent" title="Rewards History">
      <div className="px-4 py-6">
        {/* Header */}
        <div className="mb-6 slide-up">
          <h2 className="font-heading text-2xl font-bold">Rewards History</h2>
          <p className="text-muted-foreground">Track earnings and redemptions</p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-3 slide-up" style={{ animationDelay: "100ms" }}>
          {rewardStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-3 text-center"
            >
              <stat.icon className={`mx-auto mb-1 h-5 w-5 ${stat.color}`} />
              <p className="font-heading text-lg font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Monthly Goal */}
        <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4 slide-up" style={{ animationDelay: "150ms" }}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">{monthlyGoal.label}</span>
            <span className="text-sm text-muted-foreground">
              {monthlyGoal.current}/{monthlyGoal.target} 🪙
            </span>
          </div>
          <AnimatedProgress 
            value={(monthlyGoal.current / monthlyGoal.target) * 100} 
            variant="default"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            {monthlyGoal.target - monthlyGoal.current} more coins to reach this month's goal!
          </p>
        </div>

        <Tabs defaultValue="transactions" className="slide-up" style={{ animationDelay: "200ms" }}>
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="transactions" className="flex-1">Transactions</TabsTrigger>
            <TabsTrigger value="redemptions" className="flex-1">Redemptions</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  tx.type === "earned" ? "bg-secondary/10" : "bg-accent/10"
                }`}>
                  {tx.type === "earned" ? (
                    <ArrowUpRight className="h-5 w-5 text-secondary" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 text-accent" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{tx.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{tx.date}</span>
                    <span>•</span>
                    <span>{tx.category}</span>
                  </div>
                </div>
                <span className={`font-heading font-semibold ${
                  tx.type === "earned" ? "text-secondary" : "text-accent"
                }`}>
                  {tx.type === "earned" ? "+" : "-"}{tx.amount} 🪙
                </span>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="redemptions" className="space-y-3">
            {redemptions.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-2xl">
                  {item.image}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{item.item}</h4>
                    <GameBadge variant="secondary" size="sm">
                      {item.status}
                    </GameBadge>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{item.coins} 🪙</span>
                    <span>•</span>
                    <span className="text-secondary font-medium">{item.value}</span>
                    <span>•</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Total Value */}
            <div className="mt-4 rounded-xl bg-gradient-to-r from-accent/20 to-accent/5 p-4 border border-accent/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Redeemed Value</p>
                  <p className="font-display text-2xl text-accent">₹450</p>
                </div>
                <Package className="h-10 w-10 text-accent/50" />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
