
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AssignmentCard } from "./AssignmentCard";

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

      let allAssignments: Assignment[] = [];
      let page = 1;
      let hasMore = true;
      const PER_PAGE = 100;

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
          allAssignments = [...allAssignments, ...pageAssignments];
          
          if (pageAssignments.length < PER_PAGE) {
            hasMore = false;
          } else {
            page++;
          }
        }
      }

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
          return new Date(b.due_at).getTime() - new Date(a.due_at).getTime();
        });

      console.log(`Total assignments after filtering: ${filteredAssignments.length}`);
      setAssignments(filteredAssignments);
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
      
      // First check if we have an existing cached analysis
      const { data: existingAnalysis } = await supabase
        .from('cached_assignments')
        .select('*')
        .eq('canvas_assignment_id', assignment.id)
        .single();

      if (existingAnalysis) {
        console.log('Using cached analysis:', existingAnalysis);
        onStartAssignment({
          ...assignment,
          description: existingAnalysis.description || assignment.description
        });
        return;
      }

      // If no cached analysis exists, perform a new analysis
      const { data: responseData, error } = await supabase.functions.invoke('gemini-processor', {
        body: {
          content: assignment.description,
          type: 'analyze_requirements'
        }
      });

      if (error) {
        console.error('Analysis error:', error);
        throw error;
      }

      if (!responseData?.result) {
        throw new Error('Invalid response from analysis');
      }

      console.log('Analysis result:', responseData);

      // Cache the analysis result
      const { error: cacheError } = await supabase
        .from('cached_assignments')
        .upsert({
          canvas_assignment_id: assignment.id,
          course_id: courseId,
          name: assignment.name,
          description: responseData.result,
          due_at: assignment.due_at,
          points_possible: assignment.points_possible,
          published: assignment.published
        });

      if (cacheError) {
        console.error('Error caching analysis:', cacheError);
      }

      toast.success("Assignment requirements analyzed");
      onStartAssignment({
        ...assignment,
        description: responseData.result
      });
    } catch (error) {
      console.error('Error analyzing requirements:', error);
      toast.error("Failed to analyze assignment requirements. Please try again.");
    } finally {
      setAnalyzing(null);
    }
  };

  const filteredAssignments = assignments.filter(assignment =>
    assignment.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4 h-[calc(100vh-12rem)] overflow-y-auto p-4 neo-blur rounded-lg scrollbar-styled">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton 
            key={i} 
            className="h-[120px] rounded-lg bg-surface-100/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="
      h-[calc(100vh-12rem)] overflow-y-auto
      neo-blur rounded-lg
      border border-white/10
      scrollbar-styled
    ">
      {/* Search Header */}
      <div className="
        sticky top-0 z-10 
        backdrop-blur-2xl bg-black/80
        border-b border-white/5
        px-4 py-3 space-y-2
      ">
        <div className="relative group">
          <Search className="
            absolute left-3 top-1/2 transform -translate-y-1/2 
            w-5 h-5 text-muted-foreground
            group-focus-within:text-primary
            transition-colors duration-200
          " />
          <Input
            type="text"
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
              pl-10 h-11
              bg-surface-100/50 hover:bg-surface-100/70
              border-white/10 focus:border-primary/50
              placeholder:text-muted-foreground
              transition-all duration-200
            "
          />
        </div>
        <div className="text-sm text-muted-foreground font-medium px-1">
          {assignments.length} assignments found
        </div>
      </div>

      {/* Assignments Grid */}
      <div className="p-4 space-y-4">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((assignment, index) => (
            <div
              key={assignment.id}
              className="animate-fadeIn"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <AssignmentCard
                assignment={assignment}
                onStart={analyzeRequirements}
                isAnalyzing={analyzing === assignment.id}
              />
            </div>
          ))
        ) : (
          <div className="
            text-center p-8 glass-morphism
            animate-fadeIn select-none
          ">
            <AlertCircle className="
              mx-auto h-12 w-12 
              text-muted-foreground
              animate-float
              mb-4
            " />
            <h3 className="text-2xl font-semibold mb-2 text-gradient">
              No Assignments Found
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
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
