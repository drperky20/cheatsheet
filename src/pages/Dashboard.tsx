
import { useAuth } from "@/contexts/AuthContext";
import { CanvasSetup } from "@/components/canvas/CanvasSetup";
import { CoursesDashboard } from "@/components/courses/CoursesDashboard";

const Dashboard = () => {
  const { profile, canvasConfig } = useAuth();

  if (!canvasConfig) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6 text-white">Connect to Canvas</h1>
          <CanvasSetup />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-4 bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white">Welcome, {profile?.full_name}</h1>
          <p className="text-gray-300">Your AI-powered academic workspace</p>
        </header>
        <CoursesDashboard />
      </div>
    </div>
  );
};

export default Dashboard;
