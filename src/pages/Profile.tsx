
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, User, Mail, School, Key, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const navigate = useNavigate();
  const { profile, canvasConfig } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || "",
    email: profile?.email || "",
    canvasDomain: canvasConfig?.domain || "",
    apiKey: canvasConfig?.api_key || "",
  });

  const checkGoogleConnection = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsGoogleConnected(session?.user?.app_metadata?.provider === 'google');
  };

  useState(() => {
    checkGoogleConnection();
  }, []);

  const handleGoogleAuth = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/documents.readonly',
          redirectTo: `${window.location.origin}/profile`,
        },
      });

      if (error) throw error;

      toast({
        title: "Google Authentication",
        description: "Please complete the Google sign-in process.",
      });
    } catch (error: any) {
      console.error('Google Auth Error:', error);
      toast({
        title: "Authentication Error",
        description: error.message || "Failed to connect Google account",
        variant: "destructive"
      });
    }
  };

  const handleDisconnectGoogle = async () => {
    try {
      const { error } = await supabase.auth.unlinkIdentity('google');
      if (error) throw error;

      setIsGoogleConnected(false);
      toast({
        title: "Success",
        description: "Google account disconnected successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to disconnect Google account",
        variant: "destructive"
      });
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your changes have been saved successfully."
    });
  };

  return (
    <div className="min-h-screen w-full p-4 bg-black">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6 text-white hover:text-white/80"
          onClick={() => navigate('/dashboard')}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Profile</h1>
          <Button
            variant="outline"
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          >
            {isEditing ? "Save Changes" : "Edit Profile"}
          </Button>
        </div>

        <div className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Manage your personal details and Canvas connection.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  disabled={!isEditing}
                  className="bg-black/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  className="bg-black/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="canvasDomain" className="flex items-center gap-2">
                  <School className="h-4 w-4" />
                  Canvas Domain
                </Label>
                <Input
                  id="canvasDomain"
                  value={formData.canvasDomain}
                  onChange={(e) => setFormData({ ...formData, canvasDomain: e.target.value })}
                  disabled={!isEditing}
                  className="bg-black/50"
                  placeholder="e.g., university.instructure.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Canvas API Key
                </Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  disabled={!isEditing}
                  className="bg-black/50"
                  placeholder="Enter your Canvas API key"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle>Connected Accounts</CardTitle>
              <CardDescription>Manage your connected service accounts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-white/10">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Google Account</h3>
                    <p className="text-sm text-gray-400">
                      {isGoogleConnected 
                        ? "Connected - Used for accessing Google Docs" 
                        : "Not connected - Connect to access Google Docs"}
                    </p>
                  </div>
                </div>
                <Button
                  variant={isGoogleConnected ? "destructive" : "secondary"}
                  onClick={isGoogleConnected ? handleDisconnectGoogle : handleGoogleAuth}
                >
                  {isGoogleConnected ? "Disconnect" : "Connect"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
