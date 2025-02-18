
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  User,
  BookOpen,
  Settings,
  MessagesSquare,
  FileText,
  Menu,
  ChevronLeft,
  Home,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export const Sidebar = ({ className }: SidebarProps) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: FileText, label: "Assignments", href: "/assignments" },
    { icon: BookOpen, label: "Courses", href: "/courses" },
    { icon: MessagesSquare, label: "Chat", href: "/chat" },
    { icon: User, label: "Profile", href: "/profile" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <div
      className={cn(
        "glass-morphism border-r border-white/5 transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="p-4 flex flex-col h-full">
        <Button
          variant="ghost"
          size="icon"
          className="self-end mb-6 hover:bg-white/10"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <Menu className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "w-full justify-start hover:bg-white/10 transition-all",
                collapsed ? "px-3" : "px-4"
              )}
              onClick={() => navigate(item.href)}
            >
              <item.icon className="h-5 w-5" />
              {!collapsed && (
                <span className="ml-3">{item.label}</span>
              )}
            </Button>
          ))}
        </nav>
      </div>
    </div>
  );
};
