
import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { CanvasSetup } from "@/components/canvas/CanvasSetup";
import { CoursesDashboard } from "@/components/courses/CoursesDashboard";
import { Settings, LogOut, User, Send, Upload, Search } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { toast } from "sonner";

const SUPPORTED_FORMATS = {
  'application/pdf': 'PDF documents',
  'text/plain': 'Text files (.txt)',
  'application/msword': 'Word documents (.doc)',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word documents (.docx)',
  'text/markdown': 'Markdown files (.md)',
  'text/rtf': 'Rich Text Format (.rtf)',
  'application/x-latex': 'LaTeX documents (.tex)',
  'text/csv': 'CSV files',
  'image/jpeg': 'JPEG images',
  'image/png': 'PNG images',
  'image/gif': 'GIF images',
  'image/webp': 'WebP images',
  'image/heic': 'HEIC images'
} as const;

const Dashboard = () => {
  const { profile, canvasConfig, signOut } = useAuth();
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(false);
  const [initialQuestion, setInitialQuestion] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!canvasConfig) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-black relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1A1F2C] to-black" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#9b87f5]/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#D6BCFA]/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        </div>
        
        <div className="relative z-10 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6 text-gradient">Connect to Canvas</h1>
          <CanvasSetup />
        </div>
      </div>
    );
  }

  if (showChat) {
    return <ChatInterface onBack={() => setShowChat(false)} initialQuestion={initialQuestion} initialFile={uploadedFile} />;
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!Object.keys(SUPPORTED_FORMATS).includes(file.type)) {
      toast("Unsupported file format", {
        description: "Please upload one of the following formats:\n" + Object.values(SUPPORTED_FORMATS).join(", ")
      });
      return;
    }
    setUploadedFile(file);
    toast("File uploaded", {
      description: `${file.name} has been uploaded successfully.`
    });
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialQuestion.trim() || uploadedFile) {
      setShowChat(true);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#0F172A]">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1F2C] to-[#0F172A]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#403E43]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-slow" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#403E43]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#403E43]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-slow" />
      </div>

      {/* Header */}
      <header className="relative z-20">
        <div className="fixed top-0 inset-x-0 h-24 bg-[#1A1F2C]/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between gap-8">
            {/* Logo & Branding */}
            <div className="flex-shrink-0">
              <h1 className="text-3xl font-bold text-[#403E43] transition-all duration-300 hover:text-[#555555]">
                CheatSheet
              </h1>
              <p className="text-sm text-[#403E43]/60">
                Your academic super-weapon
              </p>
            </div>

            {/* Search & Upload Bar */}
            <form onSubmit={handleAskQuestion} className="flex-1 max-w-3xl">
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-[#403E43]/40" />
                </div>
                <Input 
                  type="text" 
                  placeholder={uploadedFile ? "Ask about your file..." : "Ask anything... Or upload a file and ask about it"} 
                  value={initialQuestion} 
                  onChange={e => setInitialQuestion(e.target.value)} 
                  className="w-full h-12 pl-12 pr-28 bg-[#222222]/50 border-0 text-[#E5DEFF] placeholder:text-[#403E43]/40 rounded-2xl focus:ring-2 focus:ring-[#403E43]/50 transition-all duration-300" 
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    accept={Object.keys(SUPPORTED_FORMATS).join(',')} 
                  />
                  <div className="relative group">
                    <Button 
                      type="button" 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => fileInputRef.current?.click()} 
                      className="h-8 w-8 rounded-xl hover:bg-[#403E43]/10 transition-all duration-300"
                    >
                      <Upload className="h-4 w-4 text-[#403E43]" />
                    </Button>
                    <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-[#1A1F2C]/90 backdrop-blur-xl border border-white/5 rounded-lg text-xs text-[#E5DEFF] opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                      Supported formats:
                      <ul className="mt-2 space-y-1">
                        {Object.values(SUPPORTED_FORMATS).map((format, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <span className="w-1 h-1 bg-[#403E43] rounded-full" />
                            <span>{format}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    size="icon" 
                    className="h-8 w-8 rounded-xl bg-[#403E43] hover:bg-[#555555] disabled:opacity-50 transition-all duration-300" 
                    disabled={!initialQuestion.trim() && !uploadedFile}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </form>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-[#222222]/50 hover:bg-[#403E43]/20 transition-all duration-300">
                  <User className="h-5 w-5 text-[#403E43]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-[#1A1F2C]/90 backdrop-blur-xl border border-white/5" align="end">
                <DropdownMenuLabel className="px-4 py-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-[#E5DEFF]">{profile?.full_name}</p>
                    <p className="text-xs leading-none text-[#403E43]">{profile?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem className="text-[#E5DEFF] hover:bg-[#403E43]/10 cursor-pointer px-4 py-3 transition-all duration-300" onClick={() => navigate('/profile')}>
                  <User className="mr-3 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-[#E5DEFF] hover:bg-[#403E43]/10 cursor-pointer px-4 py-3 transition-all duration-300" onClick={() => navigate('/settings')}>
                  <Settings className="mr-3 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem className="text-[#E5DEFF] hover:bg-[#403E43]/10 cursor-pointer px-4 py-3 transition-all duration-300" onClick={() => signOut()}>
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-32 pb-12 px-6 max-w-7xl mx-auto">
        {uploadedFile && (
          <div className="mb-6">
            <div className="bg-[#1A1F2C]/50 backdrop-blur-xl border border-white/5 rounded-xl p-4 inline-flex items-center">
              <Upload className="h-4 w-4 mr-2 text-[#403E43]" />
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
