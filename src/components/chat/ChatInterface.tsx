
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Loader2, Upload } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ChatInterfaceProps {
  onBack: () => void;
  initialQuestion?: string;
  initialFile?: File | null;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

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
  'image/heic': 'HEIC images',
} as const;

export const ChatInterface = ({ onBack, initialQuestion = '', initialFile = null }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(initialQuestion);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(initialFile);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!Object.keys(SUPPORTED_FORMATS).includes(file.type)) {
      toast({
        title: "Unsupported file format",
        description: "Please upload one of the following formats:\n" +
          Object.values(SUPPORTED_FORMATS).join(", "),
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

  const handleGoogleAuth = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/documents.readonly',
        },
      });

      if (error) throw error;

      // The OAuth flow will redirect and then come back with the token
      // No need to handle the redirect here as Supabase handles it
    } catch (error) {
      console.error('Google Auth Error:', error);
      toast({
        title: "Authentication Error",
        description: "Failed to authenticate with Google. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !uploadedFile) return;

    const userMessage = uploadedFile 
      ? `${input}\n[Analyzing file: ${uploadedFile.name} with Gemini 2.0 flash-thinking]`
      : input;

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      let response;
      if (uploadedFile) {
        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('question', input || '');
        
        const { data, error } = await supabase.functions.invoke('gemini-processor', {
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (error) throw error;
        response = data.result;
      } else {
        // Check if the input looks like a URL
        const urlPattern = /^(https?:\/\/)[^\s$.?#].[^\s]*$/i;
        const isUrl = urlPattern.test(input.trim());

        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.provider_token;

        const { data, error } = await supabase.functions.invoke('browser-processor', {
          body: JSON.stringify({
            url: isUrl ? input : undefined,
            content: !isUrl ? input : undefined,
            type: isUrl ? (input.includes('docs.google.com') ? 'google_doc' : 'external_link') : 'direct_input',
            accessToken: input.includes('docs.google.com') ? accessToken : undefined
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (error) {
          // Check if we need Google authentication
          if (error.status === 401 && error.message.includes('Google authentication required')) {
            await handleGoogleAuth();
            return; // The auth flow will redirect
          }
          throw error;
        }

        response = data.content;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setInput('');
      setUploadedFile(null);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      
      const isRateLimit = error.message?.toLowerCase().includes('rate limit') || 
                       error.message?.includes('429');
      
      toast({
        title: isRateLimit ? "Too Many Requests" : "Error",
        description: error.message || "Failed to get a response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const acceptedFileTypes = Object.keys(SUPPORTED_FORMATS).join(',');

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-black">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1F2C] to-black" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#9b87f5]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#D6BCFA]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col max-w-4xl mx-auto w-full p-4">
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
                accept={acceptedFileTypes}
              />
              <div className="relative group">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-12 w-12 rounded-xl hover:bg-white/10"
                >
                  <Upload className="h-5 w-5" />
                </Button>
                <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-black/90 rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  Supported formats:
                  <ul className="mt-1 space-y-1">
                    {Object.values(SUPPORTED_FORMATS).map((format, index) => (
                      <li key={index}>• {format}</li>
                    ))}
                  </ul>
                </div>
              </div>
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
