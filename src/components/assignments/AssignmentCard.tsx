
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, CheckCircle } from "lucide-react";

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
    if (!dueDate) return { text: "No due date", color: "text-gray-400" };

    const now = new Date();
    const due = new Date(dueDate);
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 3600 * 24));

    if (daysUntilDue < 0) return { text: "Overdue", color: "text-red-400" };
    if (daysUntilDue === 0) return { text: "Due today", color: "text-yellow-400" };
    if (daysUntilDue <= 3) return { text: `Due in ${daysUntilDue} days`, color: "text-orange-400" };
    return { text: `Due in ${daysUntilDue} days`, color: "text-green-400" };
  };

  const { text: dueText, color: dueColor } = getDueStatus(assignment.due_at);

  return (
    <Card className="p-4 glass hover:border-white/10 transition-all">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">{assignment.name}</h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>{assignment.points_possible} points</span>
            </div>
            <div className={`flex items-center gap-1 ${dueColor}`}>
              <Clock className="w-4 h-4" />
              <span>{dueText}</span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          className="bg-white/5 hover:bg-white/10"
          onClick={() => onStart(assignment)}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>Analyzing...</>
          ) : (
            <>
              Start Assignment
              <BookOpen className="ml-2 w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};
