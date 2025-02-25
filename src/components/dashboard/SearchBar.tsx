
import { useState, useRef } from "react";
import { Search, Upload, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ChatInterface } from "@/components/chat/ChatInterface";

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

export const SearchBar = () => {
  const [showChat, setShowChat] = useState(false);
  const [initialQuestion, setInitialQuestion] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  if (showChat) {
    return <ChatInterface onBack={() => setShowChat(false)} initialQuestion={initialQuestion} initialFile={uploadedFile} />;
  }

  return (
    <form onSubmit={handleAskQuestion} className="flex-1 max-w-3xl">
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-white/40" />
        </div>
        <Input 
          type="text" 
          placeholder={uploadedFile ? "Ask about your file..." : "Ask anything... Or upload a file and ask about it"} 
          value={initialQuestion} 
          onChange={e => setInitialQuestion(e.target.value)} 
          className="w-full h-12 pl-12 pr-28 bg-white/5 border-0 text-white placeholder:text-white/40 rounded-2xl focus:ring-2 focus:ring-[#8B5CF6]/50 transition-all" 
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
              className="h-8 w-8 rounded-xl hover:bg-white/10"
            >
              <Upload className="h-4 w-4" />
            </Button>
            <div className="absolute bottom-full right-0 mb-2 w-64 p-3 glass-morphism rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              Supported formats:
              <ul className="mt-2 space-y-1">
                {Object.values(SUPPORTED_FORMATS).map((format, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span className="w-1 h-1 bg-[#8B5CF6] rounded-full" />
                    <span>{format}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Button 
            type="submit" 
            size="icon" 
            className="h-8 w-8 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:opacity-90 disabled:opacity-50" 
            disabled={!initialQuestion.trim() && !uploadedFile}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
};
