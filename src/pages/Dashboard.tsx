
import { useAuth } from "@/contexts/AuthContext";
import { CanvasSetup } from "@/components/canvas/CanvasSetup";

const Dashboard = () => {
  const { profile, canvasConfig } = useAuth();

  if (!canvasConfig) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">Connect to Canvas</h1>
          <CanvasSetup />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-4">
      <h1>Welcome, {profile?.full_name}</h1>
      {/* We'll add the course dashboard here in the next step */}
    </div>
  );
};

export default Dashboard;
