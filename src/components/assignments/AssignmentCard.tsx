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
    if (!dueDate) return { text: "No due date", color: "text-gray-400", bgColor: "bg-gray-500/10" };

    const now = new Date();
    const due = new Date(dueDate);
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 3600 * 24));

    if (daysUntilDue < 0) return { 
      text: "Overdue", 
      color: "text-red-400",
      bgColor: "bg-red-500/10"
    };
    if (daysUntilDue === 0) return { 
      text: "Due today", 
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10"
    };
    if (daysUntilDue <= 3) return { 
      text: `Due in ${daysUntilDue} days`, 
      color: "text-orange-400",
      bgColor: "bg-orange-500/10"
    };
    return { 
      text: `Due in ${daysUntilDue} days`, 
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10"
    };
  };

  const { text: dueText, color: dueColor, bgColor: dueBgColor } = getDueStatus(assignment.due_at);

  return (
    <Card className="
      relative overflow-hidden group
      neo-blur hover:bg-black/60
      transition-all duration-300 ease-out
      border-0 shadow-lg hover:shadow-xl
      hover:-translate-y-0.5
    ">
      <div className="absolute inset-0 bg-gradient-to-br from-[#9b87f5]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="p-6 relative z-10">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div className="space-y-1">
              <h3 className="
                font-semibold text-xl
                bg-gradient-to-r from-white to-white/90
                bg-clip-text text-transparent
                group-hover:from-[#9b87f5] group-hover:to-[#6366f1]
                transition-all duration-300
              ">
                {assignment.name}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="
                flex items-center gap-2 px-3 py-1.5 
                rounded-lg glass-morphism
                transition-transform duration-300 hover:scale-105
              ">
                <CheckCircle className="w-4 h-4 text-[#9b87f5]" />
                <span className="text-sm text-white/90 font-medium">
                  {assignment.points_possible} points
                </span>
              </div>

              <div className={`
                flex items-center gap-2 px-3 py-1.5 
                rounded-lg ${dueBgColor}
                transition-transform duration-300 hover:scale-105
              `}>
                <Calendar className={`w-4 h-4 ${dueColor}`} />
                <span className={`text-sm font-medium ${dueColor}`}>
                  {dueText}
                </span>
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            className={`
              relative overflow-hidden rounded-xl
              px-6 py-5 h-auto min-w-[160px]
              ${isAnalyzing 
                ? 'glass-morphism text-white/70 cursor-not-allowed' 
                : 'bg-gradient-to-r from-[#9b87f5] to-[#6366f1] text-white hover:opacity-90'
              }
              transition-all duration-300 
              hover:scale-105 
              disabled:hover:scale-100
              group/btn
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
                <BookOpen className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
              </div>
            )}
            
            <div className="
              absolute inset-0 bg-gradient-to-r 
              from-white/10 to-transparent opacity-0 
              group-hover/btn:opacity-100 
              transition-opacity duration-300
            " />
          </Button>
        </div>
      </div>
    </Card>
  );
};
