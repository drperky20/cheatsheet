
import { createContext, useContext, useEffect, useState } from "react";
import { AuthState, UserProfile, CanvasConfig } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  updateCanvasConfig: (domain: string, apiKey: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>({
    profile: null,
    canvasConfig: null,
    isLoading: true,
  });

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setState(s => ({ ...s, isLoading: false }));
        return;
      }
      fetchUserData(session.user.id);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setState({
          profile: null,
          canvasConfig: null,
          isLoading: false,
        });
        return;
      }
      fetchUserData(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) throw profileError;

      // Fetch canvas config
      const { data: canvasConfig, error: configError } = await supabase
        .from("canvas_configs")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (configError && configError.code !== "PGRST116") throw configError;

      setState({
        profile: profile || null,
        canvasConfig: canvasConfig || null,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      setState(s => ({ ...s, isLoading: false }));
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
          },
        },
      });

      if (error) throw error;
      
      // The redirect will happen automatically
      // When the user returns, the session will be handled by the onAuthStateChange listener
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: data.user.id,
            email,
            full_name: fullName,
          },
        ]);

        if (profileError) throw profileError;
      }

      toast.success("Account created successfully! Please check your email to verify your account.");
      navigate("/auth");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Signed in successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success("Signed out successfully");
      navigate("/auth");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const updateCanvasConfig = async (domain: string, apiKey: string) => {
    if (!state.profile) return;

    try {
      const { error } = await supabase.from("canvas_configs").upsert({
        user_id: state.profile.id,
        domain,
        api_key: apiKey,
        is_valid: true, // We'll validate this with the Canvas API later
      });

      if (error) throw error;

      // Refresh user data to get the updated canvas config
      await fetchUserData(state.profile.id);
      toast.success("Canvas configuration updated successfully!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        updateCanvasConfig,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
