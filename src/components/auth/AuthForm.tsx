
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const AuthForm = () => {
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn(email, password);
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signUp(email, password, fullName);
    setLoading(false);
  };

  return (
    <Card className="p-6 glass">
      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        
        <TabsContent value="signin">
          <form onSubmit={handleSignIn} className="space-y-4">
            <Input
              type="email"
              placeholder="Email address"
              className="input-gradient text-lg h-12"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              className="input-gradient text-lg h-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <Button
              type="submit"
              className="w-full h-12 text-lg font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="signup">
          <form onSubmit={handleSignUp} className="space-y-4">
            <Input
              placeholder="Full Name"
              className="input-gradient text-lg h-12"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
              required
            />
            <Input
              type="email"
              placeholder="Email address"
              className="input-gradient text-lg h-12"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              className="input-gradient text-lg h-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <Button
              type="submit"
              className="w-full h-12 text-lg font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
