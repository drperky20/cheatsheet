import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, CheckCircle, Calendar, ChevronRight, FileText } from "lucide-react";
import { themeConfig } from "@/app/theme-config";

interface Assignment {
  id: string;
  name: string;
  description: string;
  due_at: string | null;
  points_possible: number;
  published: boolean;
  courseName: string;
  status: string;
  dueDate: string;
  estimatedTime: string;
}

interface AssignmentCardProps {
  assignment: Assignment;
  onStart: (assignment: Assignment) => void;
  isAnalyzing: boolean;
}

export const AssignmentCard = ({ assignment, onStart, isAnalyzing }: AssignmentCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const getDueStatus = (dueDate: string | null) => {
    if (!dueDate) return {
      text: "No due date",
      color: "text-muted-foreground",
      bgColor: themeConfig.glass.subtle,
      statusColor: "border-white/20"
    };

    const now = new Date();
    const due = new Date(dueDate);
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 3600 * 24));

    if (daysUntilDue < 0) return {
      text: "Overdue",
      color: "text-status-error-DEFAULT",
      bgColor: themeConfig.glass.subtle,
      statusColor: "border-status-error-DEFAULT"
    };
    if (daysUntilDue === 0) return {
      text: "Due today",
      color: "text-status-warning-DEFAULT",
      bgColor: themeConfig.glass.subtle,
      statusColor: "border-status-warning-DEFAULT"
    };
    if (daysUntilDue <= 3) return {
      text: `Due in ${daysUntilDue} days`,
      color: "text-status-warning-DEFAULT",
      bgColor: themeConfig.glass.subtle,
      statusColor: "border-status-warning-DEFAULT"
    };
    return {
      text: `Due in ${daysUntilDue} days`,
      color: "text-status-success-DEFAULT",
      bgColor: themeConfig.glass.subtle,
      statusColor: "border-status-success-DEFAULT"
    };
  };

  const getStatusConfig = (status: string) => {
    switch(status) {
      case "completed":
        return {
          bg: "bg-status-success-muted",
          text: "text-status-success-DEFAULT",
          icon: <CheckCircle className="w-3.5 h-3.5 text-status-success-DEFAULT" />
        };
      case "in-progress":
        return {
          bg: "bg-status-info-muted",
          text: "text-status-info-DEFAULT",
          icon: <Clock className="w-3.5 h-3.5 text-status-info-DEFAULT" />
        };
      default:
        return {
          bg: "bg-card-highlight",
          text: "text-muted-foreground",
          icon: <FileText className="w-3.5 h-3.5 text-muted-foreground" />
        };
    }
  };

  const { text: dueText, color: dueColor, bgColor: dueBgColor, statusColor } = getDueStatus(assignment.due_at);
  const statusConfig = getStatusConfig(assignment.status);

  return (
    <Card
      className={`
        ${themeConfig.glass.card}
        ${themeConfig.radius.md}
        ${themeConfig.shadow.sm}
        ${themeConfig.animation.DEFAULT}
        ${isHovered ? `${themeConfig.glass.heavy} ${themeConfig.shadow.DEFAULT} scale-[1.01]` : ''}
        relative overflow-hidden group cursor-pointer
        border-l-4 ${statusColor}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onStart(assignment)}
    >
      {/* Subtle gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-card-highlight to-transparent opacity-30" />
      
      {/* Hover highlight effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Main content */}
      <div className="relative p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5 flex-1">
            <h3 className="font-medium text-white tracking-tight">{assignment.name}</h3>
            <p className="text-sm text-muted-foreground">
              {assignment.courseName}
            </p>
          </div>
          
          {/* Status badge */}
          <div className={`
            px-2.5 py-1 rounded-full text-xs font-medium
            flex items-center gap-1.5
            ${statusConfig.bg} ${statusConfig.text}
            border border-white/5
          `}>
            {statusConfig.icon}
            <span>{assignment.status}</span>
          </div>
        </div>
        
        {/* Metadata */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-card-highlight">
            <Calendar className="w-4 h-4 text-primary/80" />
            <span className={dueColor}>{dueText}</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-card-highlight">
            <Clock className="w-4 h-4 text-secondary/80" />
            <span>{assignment.estimatedTime}</span>
          </div>
        </div>
        
        {/* Start button (appears on hover) */}
        <div className="
          absolute right-4 top-1/2 -translate-y-1/2
          opacity-0 group-hover:opacity-100
          transform translate-x-4 group-hover:translate-x-0
          transition-all duration-300 ease-out
        ">
          <Button
            className={`
              bg-gradient-to-r from-primary to-secondary
              hover:from-primary-hover hover:to-secondary-hover
              text-white rounded-full aspect-square w-10 h-10
              flex items-center justify-center
              ${themeConfig.shadow.sm}
            `}
            onClick={(e) => {
              e.stopPropagation();
              onStart(assignment);
            }}
            disabled={isAnalyzing}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
