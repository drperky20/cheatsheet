
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, Moon, Bell, Shield, Laptop } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: true,
    autoSubmit: false,
    aiAssistance: true,
  });

  const handleSettingChange = (setting: keyof typeof settings) => {
    setSettings(prev => {
      const newSettings = { ...prev, [setting]: !prev[setting] };
      toast({
        title: "Settings updated",
        description: `${setting} has been ${newSettings[setting] ? 'enabled' : 'disabled'}.`
      });
      return newSettings;
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

        <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

        <div className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how CheatSheet looks and feels.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="dark-mode" className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Dark Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable dark mode for a better night-time experience
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={settings.darkMode}
                  onCheckedChange={() => handleSettingChange('darkMode')}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configure your notification preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="notifications" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Push Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about assignments and updates
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={() => handleSettingChange('notifications')}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle>AI Features</CardTitle>
              <CardDescription>Customize AI-powered features.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="ai-assistance" className="flex items-center gap-2">
                    <Laptop className="h-4 w-4" />
                    AI Assistance
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable AI-powered writing and editing assistance
                  </p>
                </div>
                <Switch
                  id="ai-assistance"
                  checked={settings.aiAssistance}
                  onCheckedChange={() => handleSettingChange('aiAssistance')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="auto-submit" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Auto-Submit
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically submit completed assignments
                  </p>
                </div>
                <Switch
                  id="auto-submit"
                  checked={settings.autoSubmit}
                  onCheckedChange={() => handleSettingChange('autoSubmit')}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
