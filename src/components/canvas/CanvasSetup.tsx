
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { LoaderCircle, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

export const CanvasSetup = () => {
  const { updateCanvasConfig, canvasConfig } = useAuth();
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [domain, setDomain] = useState(canvasConfig?.domain || "");
  const [apiKey, setApiKey] = useState(canvasConfig?.api_key || "");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionSuccess, setConnectionSuccess] = useState(false);

  const validateDomain = (input: string) => {
    // Basic validation to ensure it's a valid domain
    return /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(input);
  };

  const validateApiKey = (input: string) => {
    // Canvas API tokens are typically long alphanumeric strings
    return input.length > 20;
  };

  const testConnection = async (domainToTest: string, apiKeyToTest: string) => {
    setTestingConnection(true);
    setConnectionError(null);
    setConnectionSuccess(false);
    
    try {
      const { data: response, error } = await supabase.functions.invoke('canvas-proxy', {
        body: {
          endpoint: '/users/self',
          method: 'GET',
          domain: domainToTest,
          apiKey: apiKeyToTest
        }
      });
      
      if (error) {
        throw new Error(error);
      }
      
      if (response && response.error) {
        throw new Error(response.details || response.error);
      }
      
      setConnectionSuccess(true);
      return true;
    } catch (error: any) {
      console.error("Canvas connection test error:", error);
      setConnectionError(error.message || "Failed to connect to Canvas");
      return false;
    } finally {
      setTestingConnection(false);
    }
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
    setConnectionError(null);
    
    try {
      // Test the connection first
      const isConnected = await testConnection(trimmedDomain, trimmedApiKey);
      
      if (isConnected) {
        await updateCanvasConfig(trimmedDomain, trimmedApiKey);
        toast.success("Canvas connection successful!");
      } else {
        toast.error("Failed to connect to Canvas. Please check your API key and domain.");
      }
    } catch (error) {
      console.error("Canvas connection error:", error);
      toast.error("Failed to connect to Canvas. Please check your API key and domain.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 glass">
      {connectionError && (
        <Alert variant="destructive" className="mb-4 bg-red-900/40 border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>
            {connectionError}
          </AlertDescription>
        </Alert>
      )}
      
      {connectionSuccess && (
        <Alert className="mb-4 bg-green-900/40 border-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>Connection Successful</AlertTitle>
          <AlertDescription>
            Successfully connected to Canvas! You can now access your courses and assignments.
          </AlertDescription>
        </Alert>
      )}

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

        <Alert className="bg-blue-900/20 border-blue-800/50">
          <AlertTitle>API Key Instructions</AlertTitle>
          <AlertDescription className="text-xs space-y-1 mt-2">
            <p>1. Log in to your Canvas LMS account</p>
            <p>2. Go to Account &gt; Settings</p>
            <p>3. Scroll down to "Approved Integrations"</p>
            <p>4. Click "New Access Token"</p>
            <p>5. Enter "CheatSheet" as the purpose and set an appropriate expiry date</p>
            <p>6. Copy the token that appears (it will only be shown once!)</p>
          </AlertDescription>
        </Alert>

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
          ) : connectionSuccess ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Update Connection
            </>
          ) : (
            "Connect to Canvas"
          )}
        </Button>
      </form>
    </Card>
  );
};
