
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  hideSidebar?: boolean;
}

export const Layout = ({ children, hideSidebar = false }: LayoutProps) => {
  return (
    <div className="min-h-screen w-full relative bg-gradient-to-br from-[#1A1F2C] to-black overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#9b87f5]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#D6BCFA]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex min-h-screen">
        {!hideSidebar && <Sidebar />}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
