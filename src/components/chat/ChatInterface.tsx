
import { useState, useRef } from "react";
import { Bot, Send, Upload, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  onBack: () => void;
  initialQuestion?: string;
  initialFile?: File | null;
}

export const ChatInterface = ({ onBack, initialQuestion = "", initialFile = null }: ChatInterfaceProps) => {
  const [question, setQuestion] = useState(initialQuestion);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(initialFile);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast.success(`File selected: ${file.name}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() && !selectedFile) return;

    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('question', question);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const newUserMessage: Message = {
        role: 'user',
        content: selectedFile 
          ? `[File: ${selectedFile.name}] ${question}` 
          : question
      };

      setMessages(prev => [...prev, newUserMessage]);
      setQuestion("");
      setSelectedFile(null);

      const { data, error } = await supabase.functions.invoke('gemini-chat', {
        body: formData
      });

      if (error) throw error;

      const newAssistantMessage: Message = {
        role: 'assistant',
        content: data.answer
      };

      setMessages(prev => [...prev, newAssistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to process your request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full p-4 bg-black animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 flex justify-between items-center">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-white hover:bg-white/10"
          >
            ← Back
          </Button>
          <h2 className="text-xl font-semibold text-white">AI Assistant</h2>
        </div>
        
        <div className="h-[calc(100vh-12rem)] glass rounded-lg p-6 overflow-y-auto mb-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className="flex gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center
                  ${message.role === 'assistant' ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}
                >
                  {message.role === 'assistant' ? (
                    <Bot className="w-5 h-5" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-white/90 whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-white/90">Thinking...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Ask a follow-up question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full h-12 pl-4 pr-24 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                disabled={isLoading}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full hover:bg-white/10"
                  onClick={handleFileSelect}
                  disabled={isLoading}
                >
                  <Upload className="h-4 w-4" />
                </Button>
                <Button
                  type="submit"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-blue-500 hover:bg-blue-600"
                  disabled={isLoading || (!question.trim() && !selectedFile)}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
