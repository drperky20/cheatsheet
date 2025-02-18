
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, School, Key, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout/Layout";

const Profile = () => {
  const { profile, canvasConfig } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || "",
    email: profile?.email || "",
    canvasDomain: canvasConfig?.domain || "",
    apiKey: canvasConfig?.api_key || "",
  });

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your changes have been saved successfully."
    });
  };

  return (
    <Layout>
      <div className="w-full p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gradient">Profile</h1>
            <Button
              variant="outline"
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="glass-morphism hover:bg-white/10"
            >
              {isEditing ? "Save Changes" : "Edit Profile"}
            </Button>
          </div>

          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="text-gradient">Personal Information</CardTitle>
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
                  className="bg-white/5 border-white/10"
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
                  className="bg-white/5 border-white/10"
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
                  className="bg-white/5 border-white/10"
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
                  className="bg-white/5 border-white/10"
                  placeholder="Enter your Canvas API key"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
