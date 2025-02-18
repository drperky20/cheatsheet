
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Loader2, Upload } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ChatInterfaceProps {
  onBack: () => void;
  initialQuestion?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatInterface = ({ onBack, initialQuestion = '' }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(initialQuestion);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded successfully.`
      });
    }
  };

  const processWithGemini = async (content: string, type: string) => {
    console.log('Calling Gemini processor with:', { content, type });
    
    const { data, error } = await supabase.functions.invoke('gemini-processor', {
      body: { content, type }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(error.message || 'Failed to process with Gemini');
    }

    if (!data?.result) {
      console.error('Invalid response from Gemini processor:', data);
      throw new Error('Invalid response from AI processor');
    }

    return data.result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !uploadedFile) return;

    const userMessage = uploadedFile 
      ? `${input}\n[Analyzing file: ${uploadedFile.name}]`
      : input;

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      let response;
      if (uploadedFile) {
        const text = await uploadedFile.text().catch(error => {
          console.error('Error reading file:', error);
          throw new Error('Failed to read uploaded file');
        });
        
        response = await processWithGemini(
          `${input}\n\nFile Content:\n${text}`,
          'analyze_requirements'
        );
      } else {
        response = await processWithGemini(input, 'generate_content');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setInput('');
      setUploadedFile(null);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to get a response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-black">
      {/* Background gradients */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1F2C] to-black" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#9b87f5]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#D6BCFA]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col max-w-4xl mx-auto w-full p-4">
        {/* Header */}
        <div className="glass-morphism rounded-xl p-4 mb-4 flex items-center">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mr-4 hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-gradient">Chat Assistant</h1>
        </div>

        {/* Messages */}
        <div className="flex-1 glass-morphism rounded-xl p-4 mb-4 overflow-auto">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-xl p-4 ${
                    message.role === 'user'
                      ? 'bg-[#9b87f5] text-white'
                      : 'glass-morphism text-white/90'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="glass-morphism rounded-xl p-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="glass-morphism rounded-xl p-2">
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={uploadedFile ? "Ask about the uploaded file..." : "Type your message..."}
              className="min-h-[60px] w-full pl-6 pr-24 py-4 bg-white/5 border-0 text-white placeholder:text-gray-400 rounded-xl focus:ring-2 focus:ring-[#9b87f5] transition-all resize-none"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                className="h-12 w-12 rounded-xl hover:bg-white/10"
              >
                <Upload className="h-5 w-5" />
              </Button>
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || (!input.trim() && !uploadedFile)}
                className="h-12 w-12 rounded-xl bg-[#9b87f5] hover:bg-[#8b5cf6] transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
          {uploadedFile && (
            <div className="mt-2 px-4">
              <span className="text-sm text-[#E5DEFF]">
                File: {uploadedFile.name}
              </span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
