
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
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-black">
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
    <div className="min-h-screen w-full p-4 bg-black">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome, {profile?.full_name}
            </h1>
            <p className="text-gray-400">Your AI-powered academic workspace</p>
          </div>
          
          <UserMenu
            fullName={profile?.full_name || ""}
            email={profile?.email || ""}
            onSignOut={signOut}
          />
        </header>

        <div className="flex flex-col space-y-6">
          <form onSubmit={handleAskQuestion} className="relative">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Ask anything... Or upload a file and ask about it"
                  value={initialQuestion}
                  onChange={(e) => setInitialQuestion(e.target.value)}
                  className="w-full h-16 pl-4 pr-24 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                  <Button
                    type="submit"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-blue-500 hover:bg-blue-600"
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
              className="h-16 px-8 bg-black border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="h-6 w-6" />
                <span className="text-lg font-medium">Canvas Courses</span>
              </div>
            </Button>
          </div>
        </div>

        {showCourses && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 animate-fade-in">
            <div className="h-full overflow-auto p-4">
              <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Your Courses</h2>
                  <Button
                    variant="ghost"
                    onClick={() => setShowCourses(false)}
                    className="text-white hover:bg-white/10"
                  >
                    Close
                  </Button>
                </div>
                <CoursesDashboard />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
