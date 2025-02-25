import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, CheckCircle, Calendar } from "lucide-react";

interface Assignment {
  id: string;
  name: string;
  description: string;
  due_at: string | null;
  points_possible: number;
  published: boolean;
}

interface AssignmentCardProps {
  assignment: Assignment;
  onStart: (assignment: Assignment) => void;
  isAnalyzing: boolean;
}

export const AssignmentCard = ({ assignment, onStart, isAnalyzing }: AssignmentCardProps) => {
  const getDueStatus = (dueDate: string | null) => {
    if (!dueDate) return {
      text: "No due date",
      color: "text-muted-foreground",
      bgColor: "bg-surface-100",
      borderColor: "border-surface-200"
    };

    const now = new Date();
    const due = new Date(dueDate);
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 3600 * 24));

    if (daysUntilDue < 0) return {
      text: "Overdue",
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      borderColor: "border-destructive/20"
    };
    if (daysUntilDue === 0) return {
      text: "Due today",
      color: "text-warning",
      bgColor: "bg-warning/10",
      borderColor: "border-warning/20"
    };
    if (daysUntilDue <= 3) return {
      text: `Due in ${daysUntilDue} days`,
      color: "text-accent-pink",
      bgColor: "bg-accent-pink/10",
      borderColor: "border-accent-pink/20"
    };
    return {
      text: `Due in ${daysUntilDue} days`,
      color: "text-success",
      bgColor: "bg-success/10",
      borderColor: "border-success/20"
    };
  };

  const { text: dueText, color: dueColor, bgColor: dueBgColor, borderColor: dueBorderColor } = getDueStatus(assignment.due_at);

  return (
    <Card className="
      relative overflow-hidden
      neo-blur hover:bg-black/75
      border border-white/10 hover:border-primary/20
      shadow-lg hover:shadow-xl shadow-black/20
      transition-all duration-300 ease-out
      group animate-fadeIn
      hover:-translate-y-1
    ">
      {/* Ambient highlight effect */}
      <div className="
        absolute inset-0 
        bg-gradient-to-br from-primary/10 via-transparent to-transparent 
        opacity-0 group-hover:opacity-100 
        transition-opacity duration-500
      " />
      
      <div className="p-6 relative z-10">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div className="space-y-1">
              <h3 className="
                font-semibold text-xl tracking-tight
                text-gradient group-hover:text-gradient-primary
                transition-all duration-300
              ">
                {assignment.name}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Points indicator */}
              <div className="
                flex items-center gap-2 px-3 py-1.5 
                glass-morphism
                border border-white/10
                rounded-lg interactive
              ">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="text-sm text-white/90 font-medium">
                  {assignment.points_possible} points
                </span>
              </div>

              {/* Due date indicator */}
              <div className={`
                flex items-center gap-2 px-3 py-1.5 
                rounded-lg interactive
                ${dueBgColor} ${dueBorderColor}
                border backdrop-blur-lg
              `}>
                <Calendar className={`w-4 h-4 ${dueColor}`} />
                <span className={`text-sm font-medium ${dueColor}`}>
                  {dueText}
                </span>
              </div>
            </div>
          </div>
          
          {/* Start button */}
          <Button
            variant="ghost"
            className={`
              relative overflow-hidden rounded-xl
              px-6 py-5 h-auto min-w-[160px]
              ${isAnalyzing 
                ? 'glass-morphism text-white/70 cursor-not-allowed border border-white/10' 
                : 'bg-gradient-to-r from-primary to-accent-purple hover:from-primary-light hover:to-accent-blue text-white'
              }
              transition-all duration-300 
              hover:scale-105 hover:shadow-lg
              disabled:hover:scale-100
              group/btn animate-float
            `}
            onClick={() => onStart(assignment)}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white/90 rounded-full animate-spin" />
                <span>Analyzing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>Start Assignment</span>
                <BookOpen className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </div>
            )}
            
            {/* Button hover effect */}
            <div className="
              absolute inset-0 
              bg-gradient-to-r from-white/20 via-white/10 to-transparent 
              opacity-0 group-hover/btn:opacity-100 
              transition-opacity duration-300
            " />
          </Button>
        </div>
      </div>
    </Card>
  );
};
