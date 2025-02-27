
import { useAuth } from "@/contexts/AuthContext";
import { SearchBar } from "./SearchBar";
import { UserMenu } from "./UserMenu";
import { useNavigate } from "react-router-dom";

export const DashboardHeader = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="relative z-20">
      <div className="fixed top-0 inset-x-0 h-24 glass-morphism border-b border-white/5">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between gap-8">
          {/* Logo & Branding */}
          <div className="flex-shrink-0">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent">
              CheatSheet
            </h1>
            <p className="text-sm text-[#E5DEFF]/60">
              Your academic super-weapon
            </p>
          </div>

          <SearchBar />
          <UserMenu 
            profile={{
              ...profile,
              name: profile?.full_name || 'User'
            }} 
            onSignOut={signOut} 
            onNavigate={navigate} 
          />
        </div>
      </div>
    </header>
  );
};
