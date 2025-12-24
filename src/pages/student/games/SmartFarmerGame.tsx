import { AppLayout } from "@/components/navigation";
import { SmartFarmer } from "@/components/games/SmartFarmer";
import { useNavigate } from "react-router-dom";

export default function SmartFarmerGame() {
  const navigate = useNavigate();

  return (
    <AppLayout role="student" playCoins={1250} title="Smart Farmer">
      <div className="px-4 py-6 pb-24">
        <SmartFarmer
          onGameComplete={(success, score) => {
            // Optional: handle completion
          }}
          onExit={() => navigate("/student/village-skills")}
        />
      </div>
    </AppLayout>
  );
}
