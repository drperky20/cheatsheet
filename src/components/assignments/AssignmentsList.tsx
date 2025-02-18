import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Clock, BookOpen, CheckCircle, AlertCircle, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Assignment {
  id: string;
  name: string;
  description: string;
  due_at: string | null;
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
  const [searchQuery, setSearchQuery] = useState("");
  const { canvasConfig } = useAuth();

  useEffect(() => {
    if (canvasConfig && courseId) {
      fetchAllAssignments();
    }
  }, [courseId, canvasConfig]);

  const fetchAllAssignments = async () => {
    try {
      if (!canvasConfig) {
        throw new Error('Canvas configuration not found');
      }

      console.log('Starting to fetch all assignments for course:', courseId);
      let allAssignments: Assignment[] = [];
      let page = 1;
      let hasMore = true;

      // Fetch all pages of assignments
      while (hasMore) {
        console.log(`Fetching page ${page} of assignments...`);
        const { data, error } = await supabase.functions.invoke('canvas-proxy', {
          body: {
            endpoint: `/courses/${courseId}/assignments?page=${page}&per_page=100`,
            method: 'GET',
            domain: canvasConfig.domain,
            apiKey: canvasConfig.api_key
          }
        });

        if (error) throw error;

        // Ensure data is an array
        const pageAssignments = Array.isArray(data) ? data : [];
        console.log(`Received ${pageAssignments.length} assignments on page ${page}`);

        if (pageAssignments.length === 0) {
          hasMore = false;
        } else {
          allAssignments = [...allAssignments, ...pageAssignments];
          page++;
        }
      }

      console.log('Total assignments fetched:', allAssignments.length);

      // Filter active and published assignments
      const filteredAssignments = allAssignments.filter(assignment => 
        assignment && 
        assignment.workflow_state !== 'deleted' &&
        assignment.published === true
      );

      console.log('Filtered assignments count:', filteredAssignments.length);

      // Sort assignments by due date (newest first)
      const sortedAssignments = filteredAssignments.sort((a, b) => {
        // Handle null values - put them at the end
        if (!a.due_at && !b.due_at) return 0;
        if (!a.due_at) return 1;
        if (!b.due_at) return -1;

        const dateA = new Date(a.due_at);
        const dateB = new Date(b.due_at);
        return dateB.getTime() - dateA.getTime();
      });

      console.log('Assignments sorted by due date');
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

  const filteredAssignments = assignments.filter(assignment =>
    assignment.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4 h-[calc(100vh-12rem)] overflow-y-auto p-4 border border-white/10 rounded-lg">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-[100px] rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-12rem)] overflow-y-auto p-4 border border-white/10 rounded-lg">
      <div className="sticky top-0 z-10 mb-4 bg-black/80 backdrop-blur-lg p-2 rounded-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-black/20 border-white/10"
          />
        </div>
        <div className="mt-2 text-sm text-gray-400">
          {assignments.length} assignments found
        </div>
      </div>

      <div className="space-y-4">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((assignment) => {
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
            <h3 className="text-xl font-semibold mb-2">No Assignments Found</h3>
            <p className="text-gray-400">
              {searchQuery 
                ? "No assignments match your search query." 
                : "There are no pending assignments for this course at the moment."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
