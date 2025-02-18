
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { CanvasSetup } from "@/components/canvas/CanvasSetup";
import { CoursesDashboard } from "@/components/courses/CoursesDashboard";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layout } from "@/components/layout/Layout";
import { ChatInterface } from "@/components/chat/ChatInterface";

const Dashboard = () => {
  const { profile, canvasConfig } = useAuth();
  const [showCourses, setShowCourses] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [initialQuestion, setInitialQuestion] = useState("");

  if (!canvasConfig) {
    return (
      <Layout hideSidebar>
        <div className="w-full flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md">
            <h1 className="text-2xl font-bold text-center mb-6 text-gradient">
              Connect to Canvas
            </h1>
            <CanvasSetup />
          </div>
        </div>
      </Layout>
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
      <Layout>
        <ChatInterface
          onBack={() => {
            setShowChat(false);
            setInitialQuestion("");
          }}
          initialQuestion={initialQuestion}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <div className="glass-morphism rounded-xl p-6">
              <h1 className="text-3xl font-bold text-gradient">
                Welcome, {profile?.full_name}
              </h1>
              <p className="text-gray-400 mt-1">Your AI-powered academic workspace</p>
            </div>
          </header>

          <div className="space-y-6">
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
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
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
          </div>
        </div>

        {showCourses && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 animate-fade-in">
            <div className="h-full overflow-auto p-4">
              <div className="max-w-7xl mx-auto">
                <div className="glass-morphism rounded-xl p-6 mb-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gradient">Your Courses</h2>
                    <Button
                      variant="ghost"
                      onClick={() => setShowCourses(false)}
                      className="text-white hover:bg-white/10"
                    >
                      Close
                    </Button>
                  </div>
                </div>
                <div className="glass-morphism rounded-xl p-6">
                  <CoursesDashboard />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
