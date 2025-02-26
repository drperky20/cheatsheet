
import { useAuth } from "@/contexts/AuthContext";
import { SearchBar } from "./SearchBar";
import { UserMenu } from "./UserMenu";
import { useNavigate } from "react-router-dom";

export const DashboardHeader = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="relative z-20">
      <div className="fixed top-0 inset-x-0 h-20 backdrop-blur-xl bg-background/80 border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between gap-8">
          <div className="flex-shrink-0 group cursor-pointer">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent group-hover:scale-105 transition-transform">
              CheatSheet
            </h1>
            <p className="text-sm text-[#E5DEFF]/60 group-hover:text-[#E5DEFF]/80 transition-colors">
              Your academic super-weapon
            </p>
          </div>

          <div className="flex-1 max-w-2xl">
            <SearchBar />
          </div>

          <div className="flex items-center gap-4">
            <UserMenu profile={profile} onSignOut={signOut} onNavigate={navigate} />
          </div>
        </div>
      </div>
    </header>
  );
};
