
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, AlertCircle, FileWarning } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AssignmentCard } from "./AssignmentCard";
import { Button } from "@/components/ui/button";

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
  course_id: number;
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
  const [error, setError] = useState<string | null>(null);
  const { canvasConfig } = useAuth();

  useEffect(() => {
    if (canvasConfig && courseId) {
      fetchAllAssignments();
    }
  }, [courseId, canvasConfig]);

  const fetchAllAssignments = async () => {
    try {
      setError(null);
      if (!canvasConfig) {
        throw new Error('Canvas configuration not found');
      }

      let allAssignments: Assignment[] = [];
      let page = 1;
      let hasMore = true;
      const PER_PAGE = 100; // Maximum allowed by Canvas API

      while (hasMore) {
        console.log(`Fetching assignments page ${page}...`);
        const { data: pageData, error } = await supabase.functions.invoke('canvas-proxy', {
          body: {
            endpoint: `/courses/${courseId}/assignments?page=${page}&per_page=${PER_PAGE}`,
            method: 'GET',
            domain: canvasConfig.domain,
            apiKey: canvasConfig.api_key
          }
        });

        if (error) throw error;

        const pageAssignments = Array.isArray(pageData) ? pageData : [];
        console.log(`Received ${pageAssignments.length} assignments on page ${page}`);

        if (pageAssignments.length === 0) {
          hasMore = false;
        } else {
          // Add course_id to each assignment
          const assignmentsWithCourseId = pageAssignments.map(assignment => ({
            ...assignment,
            course_id: parseInt(courseId)
          }));
          
          allAssignments = [...allAssignments, ...assignmentsWithCourseId];
          
          // If we received fewer assignments than the page size, we've reached the end
          if (pageAssignments.length < PER_PAGE) {
            hasMore = false;
          } else {
            page++;
          }
        }
      }

      // Filter and sort assignments
      const filteredAssignments = allAssignments
        .filter(assignment => 
          assignment && 
          assignment.workflow_state !== 'deleted' &&
          assignment.published === true
        )
        .sort((a, b) => {
          if (!a.due_at && !b.due_at) return 0;
          if (!a.due_at) return 1;
          if (!b.due_at) return -1;
          return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
        });

      console.log(`Total assignments after filtering: ${filteredAssignments.length}`);
      setAssignments(filteredAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setError('Failed to load assignments. Please try again.');
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const analyzeRequirements = async (assignment: Assignment) => {
    try {
      setAnalyzing(assignment.id);
      
      // Skip the actual analysis step and just proceed directly
      // This is a temporary workaround if the Gemini API is not set up
      try {
        // Attempt to analyze with Gemini
        const { data, error } = await supabase.functions.invoke('gemini-processor', {
          body: {
            content: assignment.description,
            type: 'analyze_requirements'
          }
        });

        if (error) throw error;
        
        console.log("Successfully analyzed assignment requirements:", data);
        toast.success("Assignment requirements analyzed");
      } catch (analyzeError) {
        // If the analysis fails, log it but continue
        console.error("Error during analysis, proceeding anyway:", analyzeError);
        toast.error("Could not analyze requirements, but you can still work on the assignment");
      }
      
      // Always proceed with the assignment, even if analysis fails
      onStartAssignment(assignment);
    } catch (error) {
      console.error('Error analyzing requirements:', error);
      toast.error("Failed to analyze assignment requirements");
    } finally {
      setAnalyzing(null);
    }
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

  if (error) {
    return (
      <div className="h-[calc(100vh-12rem)] overflow-y-auto p-4 border border-white/10 rounded-lg">
        <div className="flex flex-col items-center justify-center h-full">
          <FileWarning className="h-16 w-16 text-red-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Error Loading Assignments</h3>
          <p className="text-gray-400 mb-4 text-center">{error}</p>
          <Button onClick={fetchAllAssignments} className="bg-[#9b87f5]">
            Try Again
          </Button>
        </div>
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
          filteredAssignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              onStart={() => analyzeRequirements(assignment)}
              isAnalyzing={analyzing === assignment.id}
            />
          ))
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
