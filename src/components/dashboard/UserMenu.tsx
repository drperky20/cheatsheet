
import { Settings, LogOut, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { NavigateFunction } from "react-router-dom";

interface UserMenuProps {
  profile: {
    full_name: string;
    email: string;
  } | null;
  onSignOut: () => Promise<void>;
  onNavigate: NavigateFunction;
}

export const UserMenu = ({ profile, onSignOut, onNavigate }: UserMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full neo-blur hover:bg-white/10">
          <User className="h-5 w-5 text-white" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 glass-morphism" align="end">
        <DropdownMenuLabel className="px-4 py-3">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-white">{profile?.full_name}</p>
            <p className="text-xs leading-none text-gray-400">{profile?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem className="text-white hover:bg-white/10 cursor-pointer px-4 py-3" onClick={() => onNavigate('/profile')}>
          <User className="mr-3 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-white hover:bg-white/10 cursor-pointer px-4 py-3" onClick={() => onNavigate('/settings')}>
          <Settings className="mr-3 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem className="text-white hover:bg-white/10 cursor-pointer px-4 py-3" onClick={() => onSignOut()}>
          <LogOut className="mr-3 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
