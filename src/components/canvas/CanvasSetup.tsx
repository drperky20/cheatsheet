
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";

export const CanvasSetup = () => {
  const { updateCanvasConfig } = useAuth();
  const [loading, setLoading] = useState(false);
  const [domain, setDomain] = useState("");
  const [apiKey, setApiKey] = useState("");

  const validateDomain = (input: string) => {
    // Basic validation to ensure it's a valid domain
    return /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(input);
  };

  const validateApiKey = (input: string) => {
    // Canvas API tokens are typically long alphanumeric strings
    return input.length > 20;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Trim inputs
    const trimmedDomain = domain.trim();
    const trimmedApiKey = apiKey.trim();
    
    // Basic validation
    if (!trimmedDomain) {
      toast.error("Please enter your Canvas domain");
      return;
    }
    
    if (!trimmedApiKey) {
      toast.error("Please enter your Canvas API key");
      return;
    }
    
    if (!validateDomain(trimmedDomain)) {
      toast.error("Please enter a valid domain (e.g. school.instructure.com)");
      return;
    }
    
    if (!validateApiKey(trimmedApiKey)) {
      toast.warning("The API key seems too short. Please check that you've entered the full token");
    }

    setLoading(true);
    try {
      await updateCanvasConfig(trimmedDomain, trimmedApiKey);
      toast.success("Canvas connection successful!");
    } catch (error) {
      console.error("Canvas connection error:", error);
      toast.error("Failed to connect to Canvas. Please check your API key and domain.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 glass">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="Canvas Domain (e.g., school.instructure.com)"
            className="input-gradient text-lg h-12"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            disabled={loading}
            required
          />
          <p className="text-xs text-gray-400">
            Enter only the domain, without https:// or any paths
          </p>
        </div>
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Canvas API Key"
            className="input-gradient text-lg h-12"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={loading}
            required
          />
          <p className="text-xs text-gray-400">
            Generate this in your Canvas account settings under "Approved Integrations"
          </p>
        </div>
        <Button
          type="submit"
          className="w-full h-12 text-lg font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            "Connect to Canvas"
          )}
        </Button>
      </form>
    </Card>
  );
};
