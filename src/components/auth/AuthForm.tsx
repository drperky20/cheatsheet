
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const AuthForm = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [apiKey, setApiKey] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Successfully authenticated!");
      // Here you would handle the actual authentication
    } catch (error) {
      toast.error("Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-sm mx-auto">
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="Email address"
          className="input-gradient text-lg h-12"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
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
  );
};
