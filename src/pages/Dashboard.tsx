
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { CanvasSetup } from "@/components/canvas/CanvasSetup";
import { CoursesDashboard } from "@/components/courses/CoursesDashboard";
import { BookOpen, Upload, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserMenu } from "@/components/user/UserMenu";
import { ChatInterface } from "@/components/chat/ChatInterface";

const Dashboard = () => {
  const { profile, canvasConfig, signOut } = useAuth();
  const [showCourses, setShowCourses] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [initialQuestion, setInitialQuestion] = useState("");

  if (!canvasConfig) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#221F26] via-[#403E43] to-[#221F26]">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6 text-white">
            Connect to Canvas
          </h1>
          <CanvasSetup />
        </div>
      </div>
    );
  }

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialQuestion.trim()) {
      setShowChat(true);
    }
  };

  if (showChat) {
    return (
      <ChatInterface
        onBack={() => {
          setShowChat(false);
          setInitialQuestion("");
        }}
        initialQuestion={initialQuestion}
      />
    );
  }

  return (
    <div className="min-h-screen w-full relative bg-gradient-to-br from-[#221F26] via-[#403E43] to-[#221F26] overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30 pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto p-4 z-10">
        <header className="mb-8">
          <div className="glass-morphism rounded-xl p-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gradient">
                Welcome, {profile?.full_name}
              </h1>
              <p className="text-gray-400 mt-1">Your AI-powered academic workspace</p>
            </div>
            
            <UserMenu
              fullName={profile?.full_name || ""}
              email={profile?.email || ""}
              onSignOut={signOut}
            />
          </div>
        </header>

        <div className="flex flex-col space-y-6">
          <form onSubmit={handleAskQuestion}>
            <div className="glass-morphism rounded-2xl p-2">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Ask anything... Or upload a file and ask about it"
                  value={initialQuestion}
                  onChange={(e) => setInitialQuestion(e.target.value)}
                  className="w-full h-16 pl-6 pr-24 bg-white/5 border-0 text-white placeholder:text-gray-400 rounded-xl focus:ring-2 focus:ring-[#9b87f5] transition-all"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                  <Button
                    type="submit"
                    size="icon"
                    className="h-12 w-12 rounded-xl bg-[#9b87f5] hover:bg-[#8b5cf6] transition-all duration-200 hover:scale-105"
                    disabled={!initialQuestion.trim()}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </form>

          <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
            <Button 
              onClick={() => setShowCourses(!showCourses)}
              className="h-16 px-8 glass-morphism hover:bg-white/10 hover:scale-105 transition-all duration-200 rounded-2xl group"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="h-6 w-6 group-hover:text-[#9b87f5] transition-colors" />
                <span className="text-lg font-medium">Canvas Courses</span>
              </div>
            </Button>
          </div>
        </div>

        {showCourses && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 animate-fade-in">
            <div className="h-full overflow-auto p-4">
              <div className="max-w-7xl mx-auto">
                <div className="glass-morphism rounded-xl p-6 mb-6 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gradient">Your Courses</h2>
                  <Button
                    variant="ghost"
                    onClick={() => setShowCourses(false)}
                    className="text-white hover:bg-white/10 hover:scale-105 transition-all"
                  >
                    Close
                  </Button>
                </div>
                <div className="glass-morphism rounded-xl p-6">
                  <CoursesDashboard />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
