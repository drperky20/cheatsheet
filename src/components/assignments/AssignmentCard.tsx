
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

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
    if (!dueDate) return { text: "No due date", color: "text-gray-400", icon: Clock };

    const now = new Date();
    const due = new Date(dueDate);
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 3600 * 24));

    if (daysUntilDue < 0) return { text: "Overdue", color: "text-red-400", icon: AlertTriangle };
    if (daysUntilDue === 0) return { text: "Due today", color: "text-yellow-400", icon: Clock };
    if (daysUntilDue <= 3) return { text: `Due in ${daysUntilDue} days`, color: "text-orange-400", icon: Clock };
    return { text: `Due in ${daysUntilDue} days`, color: "text-green-400", icon: Clock };
  };

  const { text: dueText, color: dueColor, icon: DueIcon } = getDueStatus(assignment.due_at);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      <Card className="p-4 glass hover:border-[#9b87f5]/20 transition-all duration-200">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-white">{assignment.name}</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-[#9b87f5]/80">
                <CheckCircle className="w-4 h-4" />
                <span>{assignment.points_possible} points</span>
              </div>
              <div className={`flex items-center gap-1 ${dueColor}`}>
                <DueIcon className="w-4 h-4" />
                <span>{dueText}</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            className="bg-[#9b87f5]/10 hover:bg-[#9b87f5]/20 text-[#9b87f5]"
            onClick={() => onStart(assignment)}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                Start Assignment
                <BookOpen className="ml-2 w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};
