import { Button } from "@/components/ui/button";
import { X, Calendar, Clock, AlertCircle } from "lucide-react";
import { themeConfig } from "@/app/theme-config";

interface AssignmentHeaderProps {
  name: string;
  dueDate: string;
  onClose: () => void;
}

export const AssignmentHeader = ({ name, dueDate, onClose }: AssignmentHeaderProps) => {
  const getDueStatus = () => {
    const now = new Date();
    const due = new Date(dueDate);
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 3600 * 24));
    
    if (daysUntilDue < 0) {
      return {
        text: "Overdue",
        color: "text-status-error-DEFAULT",
        bgColor: "bg-status-error-muted",
        icon: <AlertCircle className="w-4 h-4 text-status-error-DEFAULT" />
      };
    }
    if (daysUntilDue === 0) {
      return {
        text: "Due today",
        color: "text-status-warning-DEFAULT",
        bgColor: "bg-status-warning-muted",
        icon: <Clock className="w-4 h-4 text-status-warning-DEFAULT" />
      };
    }
    if (daysUntilDue <= 3) {
      return {
        text: `Due in ${daysUntilDue} days`,
        color: "text-status-warning-DEFAULT",
        bgColor: "bg-status-warning-muted",
        icon: <Calendar className="w-4 h-4 text-status-warning-DEFAULT" />
      };
    }
    return {
      text: `Due in ${daysUntilDue} days`,
      color: "text-status-success-DEFAULT",
      bgColor: "bg-status-success-muted",
      icon: <Calendar className="w-4 h-4 text-status-success-DEFAULT" />
    };
  };

  const { text: dueText, color: dueColor, bgColor: dueBgColor, icon: dueIcon } = getDueStatus();

  return (
    <div className={`
      p-6 border-b border-white/10
      bg-gradient-to-r from-background-darker to-background-DEFAULT
      backdrop-blur-xl relative overflow-hidden
    `}>
      {/* Subtle animated accent line */}
      <div className="absolute inset-x-0 bottom-0 h-[2px]">
        <div className="h-full w-full bg-gradient-to-r from-primary via-secondary to-accent animate-pulse"></div>
      </div>
      
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
      
      <div className="flex items-center justify-between gap-4 relative z-10">
        <div className="space-y-3 flex-1">
          <h2 className="text-2xl font-semibold bg-gradient-to-br from-white via-white/90 to-primary/90 bg-clip-text text-transparent tracking-tight">
            {name}
          </h2>
          
          <div className="flex items-center gap-3">
            {/* Due date badge */}
            <div className={`
              flex items-center gap-2 px-3 py-1.5
              ${themeConfig.radius.md}
              ${dueBgColor} ${dueColor}
              border border-white/5
              ${themeConfig.shadow.sm}
            `}>
              {dueIcon}
              <span className="text-sm font-medium">{dueText}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>•</span>
              <p>{new Date(dueDate).toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
            </div>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className={`
            h-10 w-10 rounded-full
            ${themeConfig.glass.light}
            hover:${themeConfig.glass.heavy}
            border border-white/10
            ${themeConfig.animation.DEFAULT}
            hover:scale-105
            ${themeConfig.shadow.sm}
          `}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
    </div>
  );
};
