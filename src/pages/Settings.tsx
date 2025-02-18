
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Moon, Bell, Shield, Laptop } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout/Layout";

const Settings = () => {
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
    <Layout>
      <div className="w-full p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gradient mb-8">Settings</h1>

          <div className="space-y-6">
            <Card className="glass-morphism">
              <CardHeader>
                <CardTitle className="text-gradient">Appearance</CardTitle>
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

            <Card className="glass-morphism">
              <CardHeader>
                <CardTitle className="text-gradient">Notifications</CardTitle>
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

            <Card className="glass-morphism">
              <CardHeader>
                <CardTitle className="text-gradient">AI Features</CardTitle>
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
    </Layout>
  );
};

export default Settings;
