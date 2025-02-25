
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { CanvasSetup } from "@/components/canvas/CanvasSetup";
import { CoursesDashboard } from "@/components/courses/CoursesDashboard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Upload } from "lucide-react";

const Dashboard = () => {
  const { profile, canvasConfig } = useAuth();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  if (!canvasConfig) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#0A0A0B] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#111827] to-[#0A0A0B]" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#6366F1]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#8B5CF6]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
        </div>
        
        <div className="relative z-10 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-[#E5DEFF] via-[#E5DEFF]/90 to-[#E5DEFF]/70 bg-clip-text text-transparent">
            Connect to Canvas
          </h1>
          <CanvasSetup />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#0A0A0B]">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#111827] to-[#0A0A0B]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#6366F1]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#8B5CF6]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#EC4899]/5 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
      </div>

      <DashboardHeader />

      {/* Main Content */}
      <main className="relative z-10 pt-32 pb-12 px-6 max-w-7xl mx-auto">
        {uploadedFile && (
          <div className="mb-6">
            <div className="glass-morphism rounded-xl p-4 inline-flex items-center">
              <Upload className="h-4 w-4 mr-2 text-[#E5DEFF]/70" />
              <span className="text-sm text-[#E5DEFF]">{uploadedFile.name}</span>
            </div>
          </div>
        )}
        
        <CoursesDashboard />
      </main>
    </div>
  );
};

export default Dashboard;
