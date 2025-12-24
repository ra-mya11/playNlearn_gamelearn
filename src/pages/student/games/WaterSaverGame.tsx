import { AppLayout } from "@/components/navigation";
import { WaterSaverMission } from "@/components/games/WaterSaverMission";
import { useNavigate } from "react-router-dom";

export default function WaterSaverGame() {
  const navigate = useNavigate();

  return (
    <AppLayout role="student" playCoins={1250} title="Water Saver Mission">
      <div className="px-4 py-6 pb-24">
        <WaterSaverMission
          onGameComplete={(success, score) => {
            // Optional: handle completion
          }}
          onExit={() => navigate("/student/village-skills")}
        />
      </div>
    </AppLayout>
  );
}
