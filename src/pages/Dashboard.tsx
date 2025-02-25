import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { CanvasSetup } from "@/components/canvas/CanvasSetup";
import { CoursesDashboard } from "@/components/courses/CoursesDashboard";
import { Settings, LogOut, User, Send, Upload, Sparkles, BookOpen, CalendarCheck, ChevronRight } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { useToast } from "@/hooks/use-toast";
import { themeConfig } from "@/app/theme-config";
import { Card } from "@/components/ui/card";

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
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative overflow-hidden bg-background-darker">
        {/* Enhanced background effects */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-background-darker via-background-DEFAULT to-background-darker" />
          
          {/* Animated orbs */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-secondary/5 rounded-full mix-blend-screen filter blur-[150px] opacity-40 animate-pulse" />
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full mix-blend-screen filter blur-[100px] opacity-30" />
          
          {/* Noise texture */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('/noise.png')]"></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03]"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-md">
          <div className={`
            flex items-center justify-center mb-8
            w-16 h-16 mx-auto
            rounded-2xl
            bg-gradient-to-br from-primary to-secondary
            ${themeConfig.shadow.DEFAULT}
          `}>
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Connect to Canvas
          </h1>
          
          <Card className={`
            ${themeConfig.glass.heavy}
            ${themeConfig.shadow.lg}
            border border-white/10
            ${themeConfig.radius.md}
            p-6
          `}>
            <div className="relative">
              {/* Light border top highlight */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              
              <CanvasSetup />
            </div>
          </Card>
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
      description: `${file.name} has been uploaded successfully.`,
      className: `${themeConfig.glass.heavy} border border-white/10 text-white`
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
    <div className="min-h-screen bg-background-darker">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-primary/5 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-[800px] h-[800px] bg-secondary/5 rounded-full mix-blend-screen filter blur-[150px] opacity-30 animate-pulse" />
        
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('/noise.png')]"></div>
      </div>
      
      {/* Header with user info and navigation */}
      <header className={`
        ${themeConfig.glass.light} border-b border-white/5
        sticky top-0 z-30 w-full
        py-4 px-6
      `}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              EduAssist
            </span>
          </div>
          
          {/* Search/Ask input */}
          <form
            onSubmit={handleAskQuestion}
            className={`
              hidden md:flex items-center gap-3 max-w-xl w-full
              ${themeConfig.glass.light}
              ${themeConfig.radius.full}
              px-4 py-2 border border-white/10
            `}
          >
            <Input
              type="text"
              placeholder="Ask a question about your courses..."
              value={initialQuestion}
              onChange={(e) => setInitialQuestion(e.target.value)}
              className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-white/50"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept={acceptedFileTypes}
              className="hidden"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-white/10"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4" />
            </Button>
            <Button
              type="submit"
              disabled={!initialQuestion.trim() && !uploadedFile}
              className={`
                rounded-full aspect-square w-8 h-8 p-0
                bg-gradient-to-r from-primary to-secondary
                hover:from-primary-hover hover:to-secondary-hover
                text-white ${themeConfig.shadow.sm}
              `}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          
          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={`
                ${themeConfig.glass.subtle}
                ${themeConfig.radius.full}
                border border-white/10
                hover:bg-white/5
                px-3 gap-2
              `}>
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium hidden md:inline">{profile?.name || 'User'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={`
              ${themeConfig.glass.heavy}
              ${themeConfig.radius.md}
              ${themeConfig.shadow.DEFAULT}
              border border-white/10
              p-2
            `}>
              <DropdownMenuLabel className="text-white/80">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer text-white focus:bg-white/10 rounded-md"
                onClick={() => navigate('/settings')}
              >
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer text-white focus:bg-white/10 rounded-md text-status-error-DEFAULT"
                onClick={() => signOut()}
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main content */}
      <main className={`relative z-10 ${themeConfig.spacing.page} ${themeConfig.spacing.section}`}>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Main column */}
          <div className="col-span-2">
            <h1 className="text-3xl font-bold tracking-tight mb-8 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Welcome back, {profile?.name?.split(' ')[0] || 'Student'}
            </h1>
            
            <div className="grid gap-8">
              {/* Course cards */}
              <section className="grid gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Your Courses</h2>
                  </div>
                  
                  {/* View all courses button */}
                  <Button variant="ghost" className={`
                    text-sm text-white/70 hover:text-white flex items-center gap-1
                    ${themeConfig.glass.subtle} hover:bg-white/5
                    ${themeConfig.radius.md} ${themeConfig.animation.DEFAULT}
                  `}>
                    <span>View All</span>
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                  <CoursesDashboard />
                </div>
              </section>
              
              {/* Recent assignments */}
              <section className="grid gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                      <CalendarCheck className="w-4 h-4 text-accent" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Recent Assignments</h2>
                  </div>
                  
                  {/* View all assignments button */}
                  <Button variant="ghost" className={`
                    text-sm text-white/70 hover:text-white flex items-center gap-1
                    ${themeConfig.glass.subtle} hover:bg-white/5
                    ${themeConfig.radius.md} ${themeConfig.animation.DEFAULT}
                  `}>
                    <span>View All</span>
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </section>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick actions card */}
            <Card className={`
              ${themeConfig.glass.card}
              ${themeConfig.shadow.DEFAULT}
              ${themeConfig.radius.md}
              p-6 border border-white/10
            `}>
              <h3 className="text-lg font-semibold mb-4 text-white">Quick Actions</h3>
              
              {/* Mobile search/ask (visible only on mobile) */}
              <form
                onSubmit={handleAskQuestion}
                className="mb-4 flex md:hidden items-center gap-2"
              >
                <Input
                  type="text"
                  placeholder="Ask a question..."
                  value={initialQuestion}
                  onChange={(e) => setInitialQuestion(e.target.value)}
                  className={`
                    ${themeConfig.glass.light}
                    bg-transparent border-white/10 focus-visible:ring-1
                    focus-visible:ring-white/30 focus-visible:ring-offset-0
                    text-white placeholder:text-white/50
                  `}
                />
                <Button
                  type="submit"
                  disabled={!initialQuestion.trim() && !uploadedFile}
                  className={`
                    rounded-full aspect-square w-10 h-10 p-0
                    bg-gradient-to-r from-primary to-secondary
                    hover:from-primary-hover hover:to-secondary-hover
                    text-white ${themeConfig.shadow.sm}
                  `}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              
              {/* Quick action buttons */}
              <div className="grid gap-3">
                <Button
                  className={`
                    w-full justify-start gap-3
                    ${themeConfig.glass.subtle} border border-white/10
                    hover:bg-white/10 text-white ${themeConfig.radius.md}
                  `}
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="w-4 h-4 text-secondary" />
                  <span>Account Settings</span>
                </Button>
              </div>
            </Card>
            
            {/* Stats card */}
            <Card className={`
              ${themeConfig.glass.card}
              ${themeConfig.shadow.DEFAULT}
              ${themeConfig.radius.md}
              p-6 border border-white/10
              relative overflow-hidden
            `}>
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/10 to-secondary/5 rounded-full blur-2xl opacity-70 -z-10"></div>
              
              <h3 className="text-lg font-semibold mb-4 text-white">Stats & Progress</h3>
              
              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`
                  p-4 ${themeConfig.glass.light} border border-white/10
                  ${themeConfig.radius.md} ${themeConfig.shadow.sm}
                `}>
                  <div className="text-2xl font-bold text-white mb-1">85%</div>
                  <div className="text-xs text-white/70">Assignments Complete</div>
                </div>
                <div className={`
                  p-4 ${themeConfig.glass.light} border border-white/10
                  ${themeConfig.radius.md} ${themeConfig.shadow.sm}
                `}>
                  <div className="text-2xl font-bold text-white mb-1">3.8</div>
                  <div className="text-xs text-white/70">Current GPA</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;