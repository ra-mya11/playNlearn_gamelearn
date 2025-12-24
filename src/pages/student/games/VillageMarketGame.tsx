import { AppLayout } from "@/components/navigation";
import { VillageMarketManager } from "@/components/games/VillageMarketManager";
import { useNavigate } from "react-router-dom";

export default function VillageMarketGame() {
  const navigate = useNavigate();

  return (
    <AppLayout role="student" playCoins={1250} title="Village Market Manager">
      <div className="px-4 py-6 pb-24">
        <VillageMarketManager
          onGameComplete={(success, score) => {
            // Optional: handle completion
          }}
          onExit={() => navigate("/student/village-skills")}
        />
      </div>
    </AppLayout>
  );
}
