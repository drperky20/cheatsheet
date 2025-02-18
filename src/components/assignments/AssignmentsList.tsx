
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Clock, BookOpen, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Assignment {
  id: string;
  name: string;
  description: string;
  due_at: string;
  points_possible: number;
  submission_types: string[];
  workflow_state: string;
  html_url: string;
  published: boolean;
}

interface AssignmentsListProps {
  courseId: string;
  onStartAssignment: (assignment: Assignment) => void;
}

export const AssignmentsList = ({ courseId, onStartAssignment }: AssignmentsListProps) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const { canvasConfig } = useAuth();

  useEffect(() => {
    if (canvasConfig && courseId) {
      fetchAssignments();
    }
  }, [courseId, canvasConfig]);

  const fetchAssignments = async () => {
    try {
      if (!canvasConfig) {
        throw new Error('Canvas configuration not found');
      }

      console.log('Fetching assignments for course:', courseId);
      const { data, error } = await supabase.functions.invoke('canvas-proxy', {
        body: {
          endpoint: `/courses/${courseId}/assignments`,
          method: 'GET',
          domain: canvasConfig.domain,
          apiKey: canvasConfig.api_key
        }
      });

      if (error) throw error;

      // Ensure data is an array and filter/sort assignments
      let assignmentsData = Array.isArray(data) ? data : [];
      console.log('Raw assignments data:', assignmentsData);

      // Filter active assignments
      assignmentsData = assignmentsData.filter(assignment => 
        assignment && 
        assignment.workflow_state !== 'deleted' &&
        assignment.published === true
      );

      // Sort by due date (newest first)
      const sortedAssignments = assignmentsData.sort((a, b) => {
        const dateA = a.due_at ? new Date(a.due_at) : new Date(0);
        const dateB = b.due_at ? new Date(b.due_at) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      console.log('Processed assignments:', sortedAssignments);
      setAssignments(sortedAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const analyzeRequirements = async (assignment: Assignment) => {
    try {
      setAnalyzing(assignment.id);
      const { data, error } = await supabase.functions.invoke('gemini-processor', {
        body: {
          content: assignment.description,
          type: 'analyze_requirements'
        }
      });

      if (error) throw error;

      toast.success("Assignment requirements analyzed");
      onStartAssignment(assignment);
    } catch (error) {
      console.error('Error analyzing requirements:', error);
      toast.error("Failed to analyze assignment requirements");
    } finally {
      setAnalyzing(null);
    }
  };

  const getDueStatus = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 3600 * 24));

    if (daysUntilDue < 0) return { text: "Overdue", color: "text-red-400" };
    if (daysUntilDue === 0) return { text: "Due today", color: "text-yellow-400" };
    if (daysUntilDue <= 3) return { text: `Due in ${daysUntilDue} days`, color: "text-orange-400" };
    return { text: `Due in ${daysUntilDue} days`, color: "text-green-400" };
  };

  if (loading) {
    return (
      <div className="space-y-4 h-[calc(100vh-12rem)] overflow-y-auto p-4 border border-white/10 rounded-lg">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[100px] rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-12rem)] overflow-y-auto p-4 border border-white/10 rounded-lg">
      <div className="space-y-4">
        {assignments.length > 0 ? (
          assignments.map((assignment) => {
            const { text: dueText, color: dueColor } = getDueStatus(assignment.due_at);
            
            return (
              <Card key={assignment.id} className="p-4 glass hover:border-white/10 transition-all">
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
                    onClick={() => analyzeRequirements(assignment)}
                    disabled={analyzing === assignment.id}
                  >
                    {analyzing === assignment.id ? (
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
          })
        ) : (
          <div className="text-center p-8 glass rounded-lg">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Active Assignments Found</h3>
            <p className="text-gray-400">
              There are no pending assignments for this course at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
