
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { CanvasSetup } from "@/components/canvas/CanvasSetup";
import { CoursesDashboard } from "@/components/courses/CoursesDashboard";
import { Settings, LogOut, User, BookOpen, Upload, Send } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { profile, canvasConfig, signOut } = useAuth();
  const navigate = useNavigate();
  const [showCourses, setShowCourses] = useState(false);
  const [question, setQuestion] = useState("");
  const [showChat, setShowChat] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      setShowChat(true);
    }
  };

  if (showChat) {
    return (
      <div className="min-h-screen w-full p-4 bg-black animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4 flex justify-between items-center">
            <Button 
              variant="ghost" 
              onClick={() => setShowChat(false)}
              className="text-white hover:bg-white/10"
            >
              ← Back
            </Button>
            <h2 className="text-xl font-semibold text-white">AI Assistant</h2>
          </div>
          
          <div className="h-[calc(100vh-12rem)] glass rounded-lg p-6 overflow-y-auto mb-4">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-white/90">{question}</p>
                </div>
              </div>
              {/* Response will be added here */}
            </div>
          </div>
        </div>
      </div>
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <User className="h-5 w-5 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-56 bg-black/90 backdrop-blur-lg border border-white/10" 
              align="end"
            >
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-white">{profile?.full_name}</p>
                  <p className="text-xs leading-none text-gray-400">{profile?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem 
                className="text-white hover:bg-white/10 cursor-pointer"
                onClick={() => navigate('/profile')}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-white hover:bg-white/10 cursor-pointer"
                onClick={() => navigate('/settings')}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem 
                className="text-white hover:bg-white/10 cursor-pointer"
                onClick={() => signOut()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <div className="flex flex-col space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder="Ask anything... Or upload a file and ask about it"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full h-16 pl-4 pr-24 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 rounded-full hover:bg-white/10"
                    >
                      <Upload className="h-5 w-5" />
                    </Button>
                    <Button
                      type="submit"
                      size="icon"
                      className="h-10 w-10 rounded-full bg-blue-500 hover:bg-blue-600"
                      disabled={!question.trim()}
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>

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
