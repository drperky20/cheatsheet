
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";

export const CanvasSetup = () => {
  const { updateCanvasConfig } = useAuth();
  const [loading, setLoading] = useState(false);
  const [domain, setDomain] = useState("");
  const [apiKey, setApiKey] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await updateCanvasConfig(domain, apiKey);
    setLoading(false);
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
        </div>
        <Button
          type="submit"
          className="w-full h-12 text-lg font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          disabled={loading}
        >
          {loading ? "Connecting..." : "Connect to Canvas"}
        </Button>
      </form>
    </Card>
  );
};
