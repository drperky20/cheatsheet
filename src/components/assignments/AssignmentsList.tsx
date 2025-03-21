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
      fetchAllAssignmentsOptimized();
    }
  }, [courseId, canvasConfig]);

  const fetchAllAssignmentsOptimized = async () => {
    try {
      setError(null);
      if (!canvasConfig) {
        throw new Error('Canvas configuration not found');
      }

      console.log(`Starting optimized assignments loading for course ${courseId}...`);
      
      const assignmentsCache = localStorage.getItem(`assignments_${courseId}`);
      const cacheTimestamp = localStorage.getItem(`assignments_${courseId}_timestamp`);
      
      // Check if we have a recent cache (less than 5 minutes old)
      if (assignmentsCache && cacheTimestamp) {
        const cachedTime = parseInt(cacheTimestamp, 10);
        const now = Date.now();
        
        // Use cache if it's less than 5 minutes old
        if (now - cachedTime < 5 * 60 * 1000) {
          console.log('Using cached assignments data');
          const cachedAssignments = JSON.parse(assignmentsCache);
          setAssignments(cachedAssignments);
          setLoading(false);
          
          // Refresh in background after using cache
          setTimeout(() => {
            refreshAssignmentsInBackground();
          }, 100);
          
          return;
        }
      }
      
      // If no valid cache, load from API directly
      await loadAssignmentsFromAPI();
      
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setError('Failed to load assignments. Please try again.');
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };
  
  const refreshAssignmentsInBackground = async () => {
    try {
      console.log('Refreshing assignments data in background...');
      await loadAssignmentsFromAPI(true);
    } catch (error) {
      console.error('Background refresh error:', error);
      // Don't show toast for background errors
    }
  };
  
  const loadAssignmentsFromAPI = async (isBackground = false) => {
    let allAssignments: Assignment[] = [];
    const parallelBatches = 2; // Number of parallel pages to load
    let page = 1;
    let hasMore = true;
    const PER_PAGE = 100; // Maximum allowed by Canvas API
    
    if (!isBackground) {
      setLoading(true);
    }

    while (hasMore) {
      console.log(`Fetching assignments batch starting from page ${page}...`);
      
      // Create a batch of parallel requests
      const batchPromises = [];
      for (let i = 0; i < parallelBatches; i++) {
        const currentPage = page + i;
        batchPromises.push(
          supabase.functions.invoke('canvas-proxy', {
            body: {
              endpoint: `/courses/${courseId}/assignments?include[]=submission&page=${currentPage}&per_page=${PER_PAGE}`,
              method: 'GET',
              domain: canvasConfig.domain,
              apiKey: canvasConfig.api_key,
            }
          }).then(response => {
            if (response.error) throw response.error;
            return { page: currentPage, data: response.data };
          }).catch(error => {
            console.error(`Error fetching page ${currentPage}:`, error);
            return { page: currentPage, data: [], error };
          })
        );
      }
      
      // Wait for all requests in the batch to complete
      const batchResults = await Promise.all(batchPromises);
      let batchHasData = false;
      
      // Process results from this batch
      for (const result of batchResults) {
        const pageAssignments = Array.isArray(result.data) ? result.data : [];
        console.log(`Received ${pageAssignments.length} assignments on page ${result.page}`);
        
        if (pageAssignments.length > 0) {
          batchHasData = true;
          
          // Add course_id to each assignment
          const assignmentsWithCourseId = pageAssignments.map(assignment => ({
            ...assignment,
            course_id: parseInt(courseId)
          }));
          
          allAssignments = [...allAssignments, ...assignmentsWithCourseId];
        }
        
        // If we received fewer assignments than the page size, we've reached the end
        if (pageAssignments.length < PER_PAGE) {
          hasMore = false;
        }
      }
      
      // If no page in the batch had data, we're done
      if (!batchHasData) {
        hasMore = false;
      } else if (hasMore) {
        page += parallelBatches;
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
    
    // Cache the results
    localStorage.setItem(`assignments_${courseId}`, JSON.stringify(filteredAssignments));
    localStorage.setItem(`assignments_${courseId}_timestamp`, Date.now().toString());
    
    // Update state with new assignments
    setAssignments(filteredAssignments);
    
    if (!isBackground) {
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
  )
  // Sort assignments from newest to oldest based on due dates
  .sort((a, b) => {
    if (!a.due_at && !b.due_at) return 0;
    if (!a.due_at) return 1;
    if (!b.due_at) return -1;
    // Reverse the sorting order to show newest first
    return new Date(b.due_at).getTime() - new Date(a.due_at).getTime();
  });

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
          <Button onClick={fetchAllAssignmentsOptimized} className="bg-[#9b87f5]">
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
