
import { useState } from "react";
import {
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  Moon,
  User,
  Sparkles,
  Sun,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/ThemeContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NavigateFunction } from "react-router-dom";

interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

interface UserMenuProps {
  profile: Profile | null;
  onSignOut: () => void;
  onNavigate: NavigateFunction;
}

export const UserMenu = ({
  profile,
  onSignOut,
  onNavigate,
}: UserMenuProps) => {
  const { setTheme, theme } = useTheme();
  const [notificationsCount] = useState(3);

  if (!profile) {
    return (
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => onNavigate("/login")}
          className="
            h-10 px-5 rounded-xl
            glass-morphism border border-white/10
            hover:bg-white/5 hover:border-[#9b87f5]/30
            transition-all duration-300 text-white font-medium
          "
        >
          Log in
        </Button>
        <Button
          onClick={() => onNavigate("/signup")}
          className="
            h-10 px-5 rounded-xl
            bg-gradient-to-r from-[#9b87f5] to-[#6366f1]
            hover:opacity-90 transition-all duration-300
            shadow-lg shadow-[#9b87f5]/20
            text-white font-medium
          "
        >
          Sign up
        </Button>
      </div>
    );
  }

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-6">
      <Button
        variant="ghost"
        size="icon"
        className="relative h-10 w-10 text-[#E5DEFF]/70 hover:text-[#9b87f5] hover:bg-white/5 rounded-xl transition-all duration-300 hover:scale-105"
      >
        <Bell className="h-5 w-5" />
        {notificationsCount > 0 && (
          <span className="absolute top-0.5 right-0.5 w-5 h-5 flex items-center justify-center text-xs font-medium text-white bg-[#9b87f5] rounded-full">
            {notificationsCount}
          </span>
        )}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="
              relative h-10 pl-4 pr-3 rounded-xl overflow-hidden
              glass-morphism border border-white/10 
              hover:bg-white/5 hover:border-[#9b87f5]/30
              transition-all duration-300
              group
            "
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#9b87f5]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10 flex items-center gap-3">
              <Avatar className="h-6 w-6 ring-2 ring-white/10 group-hover:ring-[#9b87f5]/20 transition-all duration-300">
                <AvatarImage src={profile.avatar_url} alt={profile.name} />
                <AvatarFallback className="bg-[#1A1F2C] text-[#9b87f5] text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-white">
                {profile.name.split(" ")[0]}
              </span>
              <ChevronDown className="h-4 w-4 text-[#E5DEFF]/70 group-hover:text-[#9b87f5] transition-colors" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-64 glass-morphism border-0 shadow-2xl p-2"
        >
          <DropdownMenuLabel className="px-4 py-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-[#9b87f5]/20">
                <AvatarImage src={profile.avatar_url} alt={profile.name} />
                <AvatarFallback className="bg-[#1A1F2C] text-[#9b87f5]">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-base font-medium text-white">
                  {profile.name}
                </div>
                <div className="text-xs text-[#E5DEFF]/60">{profile.email}</div>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/5" />

          <DropdownMenuItem 
            className="px-4 py-2.5 rounded-lg my-1 cursor-pointer group"
            onClick={() => onNavigate("/profile")}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#9b87f5]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
            <User className="h-4 w-4 mr-3 text-[#9b87f5] opacity-70" />
            <span>Profile</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="px-4 py-2.5 rounded-lg my-1 cursor-pointer group"
            onClick={() => onNavigate("/chat")}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#9b87f5]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
            <MessageCircle className="h-4 w-4 mr-3 text-[#9b87f5] opacity-70" />
            <span>Chat</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="px-4 py-2.5 rounded-lg my-1 cursor-pointer group"
            onClick={() => onNavigate("/settings")}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#9b87f5]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
            <Settings className="h-4 w-4 mr-3 text-[#9b87f5] opacity-70" />
            <span>Settings</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="px-4 py-2.5 rounded-lg my-1 cursor-pointer group"
            onClick={() => onNavigate("/premium")}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#9b87f5]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
            <Sparkles className="h-4 w-4 mr-3 text-[#9b87f5] opacity-70" />
            <span>Premium</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="px-4 py-2.5 rounded-lg my-1 cursor-pointer group"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#9b87f5]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
            {theme === "dark" ? (
              <Sun className="h-4 w-4 mr-3 text-[#9b87f5] opacity-70" />
            ) : (
              <Moon className="h-4 w-4 mr-3 text-[#9b87f5] opacity-70" />
            )}
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-white/5" />
          
          <DropdownMenuItem 
            className="px-4 py-2.5 rounded-lg my-1 cursor-pointer group text-red-400 hover:text-red-300"
            onClick={onSignOut}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
            <LogOut className="h-4 w-4 mr-3 opacity-70" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
