import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { CanvasSetup } from "@/components/canvas/CanvasSetup";
import { CoursesDashboard } from "@/components/courses/CoursesDashboard";
import { Settings, LogOut, User, Send, Upload } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  if (!canvasConfig) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-black">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1A1F2C] to-black" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#9b87f5]/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#D6BCFA]/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        </div>
        
        <div className="relative z-10 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6 text-gradient">
            Connect to Canvas
          </h1>
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
      toast({
        title: "Unsupported file format",
        description: "Please upload one of the following formats:\n" + Object.values(SUPPORTED_FORMATS).join(", "),
        variant: "destructive"
      });
      return;
    }
    setUploadedFile(file);
    toast({
      title: "File uploaded",
      description: `${file.name} has been uploaded successfully.`
    });
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialQuestion.trim() || uploadedFile) {
      setShowChat(true);
    }
  };

  const acceptedFileTypes = Object.keys(SUPPORTED_FORMATS).join(',');

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-black">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1F2C] to-black" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#9b87f5]/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#D6BCFA]/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#6366f1]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto p-6">
        <header className="mb-10 flex justify-between items-center">
          <div className="neo-blur rounded-2xl p-8 transition-all duration-300 hover:bg-black/70 group">
            <h1 className="text-4xl font-bold text-gradient group-hover:scale-105 transition-transform">
              Welcome, {profile?.full_name}
            </h1>
            <p className="text-[#E5DEFF] mt-3 text-lg opacity-90">Your AI Powered Academic Super Weapon</p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-14 w-14 rounded-full neo-blur hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <User className="h-6 w-6 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 glass-morphism border-0 shadow-2xl backdrop-blur-2xl" align="end">
              <DropdownMenuLabel className="px-4 py-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-white">{profile?.full_name}</p>
                  <p className="text-xs leading-none text-gray-400">{profile?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="text-white hover:bg-white/10 cursor-pointer px-4 py-3 transition-colors" onClick={() => navigate('/profile')}>
                <User className="mr-3 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-white/10 cursor-pointer px-4 py-3 transition-colors" onClick={() => navigate('/settings')}>
                <Settings className="mr-3 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="text-white hover:bg-white/10 cursor-pointer px-4 py-3 transition-colors" onClick={() => signOut()}>
                <LogOut className="mr-3 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <div className="mb-10">
          <form onSubmit={handleAskQuestion}>
            <div className="glass-morphism rounded-2xl p-3 transition-all duration-300 hover:shadow-lg">
              <div className="relative">
                <Input 
                  type="text" 
                  placeholder={uploadedFile ? "Ask about your file..." : "Ask anything... Or upload a file and ask about it"} 
                  value={initialQuestion} 
                  onChange={e => setInitialQuestion(e.target.value)} 
                  className="w-full h-16 pl-6 pr-28 bg-white/5 border-0 text-white placeholder:text-gray-400 rounded-xl focus:ring-2 focus:ring-[#9b87f5]/50 transition-all duration-300" 
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-3">
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept={acceptedFileTypes} />
                  <div className="relative group">
                    <Button 
                      type="button" 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => fileInputRef.current?.click()} 
                      className="h-12 w-12 rounded-xl hover:bg-white/10 transition-all duration-300 hover:scale-105"
                    >
                      <Upload className="h-5 w-5" />
                    </Button>
                    <div className="absolute bottom-full right-0 mb-2 w-64 p-3 glass-morphism rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      Supported formats:
                      <ul className="mt-2 space-y-1">
                        {Object.values(SUPPORTED_FORMATS).map((format, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <span className="w-1 h-1 bg-[#9b87f5] rounded-full" />
                            <span>{format}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    size="icon" 
                    className="h-12 w-12 rounded-xl bg-gradient-to-r from-[#9b87f5] to-[#6366f1] hover:opacity-90 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100" 
                    disabled={!initialQuestion.trim() && !uploadedFile}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              {uploadedFile && (
                <div className="mt-3 px-4">
                  <span className="text-sm text-[#E5DEFF] flex items-center">
                    <Upload className="h-4 w-4 mr-2 opacity-70" />
                    {uploadedFile.name}
                  </span>
                </div>
              )}
            </div>
          </form>
        </div>

        <CoursesDashboard />
      </div>
    </div>
  );
};

export default Dashboard;