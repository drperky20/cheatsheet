
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, KeyRound, UserRound, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const SignUpForm = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      toast.success("Account created successfully!", {
        description: "Please check your email to verify your account.",
      });
      
      navigate("/auth");
    } catch (error: any) {
      toast.error("Sign up failed", {
        description: error?.message || "Please check your information and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full neo-blur border-0">
      <CardHeader className="space-y-3">
        <CardTitle className="text-2xl text-gradient">Create Account</CardTitle>
        <CardDescription className="text-[#E5DEFF]">
          Enter your details to create a new account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full name"
                  className="glass-input pl-11"
                  required
                />
                <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="glass-input pl-11"
                  required
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="glass-input pl-11"
                  required
                />
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-11" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>

          <p className="text-center text-sm text-[#E5DEFF]/60">
            Already have an account?{" "}
            <Button
              variant="link"
              className="text-primary hover:text-primary/80 p-0"
              onClick={() => navigate("/auth")}
            >
              Sign in
            </Button>
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
