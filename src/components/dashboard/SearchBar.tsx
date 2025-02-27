
import { useState, useRef } from "react";
import { Search, Upload, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ChatInterface } from "@/components/chat/ChatInterface";

export const SearchBar = () => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      toast.success(`File "${selectedFile.name}" ready to analyze`);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() || file) {
      setShowChat(true);
    }
  };

  if (showChat) {
    return (
      <ChatInterface
        onBack={() => {
          setShowChat(false);
          setQuery("");
          setFile(null);
        }}
        initialQuestion={query}
        initialFile={file}
      />
    );
  }

  return (
    <div className="relative z-10 flex-1 max-w-xl">
      <form 
        onSubmit={handleSearch}
        className={`
          relative flex items-center w-full
          rounded-2xl overflow-hidden transition-all duration-500
          ${isSearchFocused 
            ? 'glass-morphism shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-[#9b87f5]/30' 
            : 'neo-blur border border-white/5'}
        `}
      >
        <div className="absolute left-4 text-[#9b87f5]">
          <Search className="w-5 h-5" />
        </div>
        
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          placeholder="Search or ask anything..."
          className="h-14 pl-12 pr-24 bg-transparent border-0 text-white/90 placeholder:text-[#E5DEFF]/40 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        
        <div className="absolute right-2 flex gap-1.5">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleUpload}
            className="w-10 h-10 rounded-xl text-[#E5DEFF]/70 hover:text-[#9b87f5] hover:bg-white/5 transition-all duration-300 hover:scale-105"
          >
            <Upload className="w-5 h-5" />
          </Button>
          
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#9b87f5] to-[#6366f1] text-white hover:opacity-90 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>
      
      {file && (
        <div className="mt-2 px-4 text-sm text-[#E5DEFF]/60 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#9b87f5] animate-pulse" />
          {file.name}
        </div>
      )}
    </div>
  );
};
