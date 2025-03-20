import { useEffect, useState } from "react";
import { CourseCard } from "./CourseCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Clock, ArrowUpDown, AlertCircle, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface Course {
  id: string;
  name: string;
  nickname?: string;
  course_code: string;
  assignments_count: number;
  pending_assignments: number;
  term?: {
    name: string;
    start_at: string;
    end_at: string;
  };
}

type SortOption = "name" | "pending" | "progress";

export const CoursesDashboard = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [hasSeenDisclaimer, setHasSeenDisclaimer] = useState(false);
  const { toast } = useToast();
  const { canvasConfig } = useAuth();

  useEffect(() => {
    if (canvasConfig) {
      fetchCourses();
    }
  }, [canvasConfig]);

  const fetchAllAssignments = async (courseId: string) => {
    let allAssignments: any[] = [];
    let page = 1;
    let hasMore = true;
    const PER_PAGE = 100;

    try {
      while (hasMore) {
        console.log(`Fetching assignments page ${page} for course ${courseId}...`);
        const { data: assignments, error } = await supabase.functions.invoke('canvas-proxy', {
          body: {
            endpoint: `/courses/${courseId}/assignments?include[]=submission&page=${page}&per_page=${PER_PAGE}`,
            method: 'GET',
            domain: canvasConfig?.domain,
            apiKey: canvasConfig?.api_key
          }
        });

        if (error) {
          console.error('Error fetching assignments:', error);
          throw new Error(`Failed to fetch assignments: ${error.message}`);
        }

        if (!Array.isArray(assignments)) {
          console.error('Unexpected assignments response:', assignments);
          throw new Error('Received invalid assignments data from Canvas API');
        }

        const pageAssignments = assignments;
        allAssignments = [...allAssignments, ...pageAssignments];

        if (pageAssignments.length < PER_PAGE) {
          hasMore = false;
        } else {
          page++;
        }
      }

      return allAssignments;
    } catch (error) {
      console.error(`Error fetching assignments for course ${courseId}:`, error);
      throw error;
    }
  };

  const fetchCourses = async () => {
    setError(null);
    setErrorDetails(null);
    setLoading(true);
    
    try {
      if (!canvasConfig) {
        console.log('No Canvas configuration found');
        setError('Canvas configuration is missing. Please connect your Canvas account.');
        setLoading(false);
        return;
      }

      console.log('Fetching courses from Canvas...');
      console.log('Using Canvas domain:', canvasConfig.domain);
      
      const response = await supabase.functions.invoke('canvas-proxy', {
        body: {
          endpoint: '/courses?enrollment_state=active&state[]=available',
          method: 'GET',
          domain: canvasConfig.domain,
          apiKey: canvasConfig.api_key
        }
      });

      if (response.error) {
        console.error('Error fetching courses:', response.error);
        setError(`Failed to fetch courses: ${response.error}`);
        if (response.data && response.data.details) {
          setErrorDetails(response.data.details);
        }
        setLoading(false);
        toast({
          title: "Error fetching courses",
          description: response.error,
          variant: "destructive"
        });
        return;
      }

      const coursesData = response.data;
      
      if (!Array.isArray(coursesData)) {
        console.error('Unexpected courses response:', coursesData);
        setError('Received invalid data from Canvas API');
        setLoading(false);
        toast({
          title: "Error fetching courses",
          description: "Received invalid data from Canvas API",
          variant: "destructive"
        });
        return;
      }

      console.log('Courses data received:', coursesData.length, 'courses');
      
      const coursesWithAssignments = await Promise.all(
        coursesData.map(async (course) => {
          try {
            const assignments = await fetchAllAssignments(course.id);
            
            const startDate = new Date('2024-01-01');
            const totalAssignments = assignments.length;
            const missingAssignments = assignments.filter(a => {
              const dueDate = a.due_at ? new Date(a.due_at) : null;
              if (!dueDate || dueDate < startDate) return false;
              const hasSubmission = a.submission && typeof a.submission.score === 'number';
              const isZeroScore = hasSubmission && a.submission.score === 0;
              const hasPointsPossible = a.points_possible > 0;
              return hasPointsPossible && isZeroScore;
            }).length;

            return {
              id: course.id,
              name: course.name,
              course_code: course.course_code || course.name,
              assignments_count: totalAssignments,
              pending_assignments: missingAssignments,
              term: course.term,
              nickname: undefined
            } as Course;
          } catch (error) {
            console.error(`Error processing course ${course.id}:`, error);
            return null;
          }
        })
      );

      const validCourses = coursesWithAssignments.filter((course): course is Course => course !== null);
      console.log('Processed courses with assignments:', validCourses.length);
      setCourses(sortCourses(validCourses, sortBy));
    } catch (error: any) {
      console.error('Error in fetchCourses:', error);
      setError(error.message || "An unexpected error occurred");
      toast({
        title: "Error fetching courses",
        description: error.message || "Please check your Canvas configuration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sortCourses = (coursesToSort: Course[], sortOption: SortOption) => {
    return [...coursesToSort].sort((a, b) => {
      switch (sortOption) {
        case "name":
          return (a.nickname || a.name).localeCompare(b.nickname || b.name);
        case "pending":
          return b.pending_assignments - a.pending_assignments;
        case "progress":
          const progressA = (a.assignments_count - a.pending_assignments) / Math.max(a.assignments_count, 1);
          const progressB = (b.assignments_count - b.pending_assignments) / Math.max(b.assignments_count, 1);
          return progressB - progressA;
        default:
          return 0;
      }
    });
  };

  const handleSort = (option: SortOption) => {
    setSortBy(option);
    setCourses(sortCourses(courses, option));
  };

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    if (!hasSeenDisclaimer) {
      setShowDisclaimer(true);
    } else {
      console.log("Proceeding with course:", course);
    }
  };

  const handleCanvasReconnect = () => {
    window.location.href = "/settings";
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[200px] rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 glass">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Failed to Load Courses</h3>
        <p className="text-gray-400 mb-4">
          {error}
        </p>
        
        {errorDetails && (
          <Alert variant="destructive" className="mb-4 bg-red-900/40 border-red-800">
            <AlertTitle>Canvas API Error</AlertTitle>
            <AlertDescription className="mt-2">
              {errorDetails}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col gap-3 mt-4">
          <Button 
            onClick={fetchCourses} 
            className="mx-auto flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          
          {errorDetails && errorDetails.includes("token") && (
            <Button 
              onClick={handleCanvasReconnect}
              variant="outline" 
              className="mx-auto mt-2"
            >
              Update Canvas Connection
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center p-8 glass">
        <h3 className="text-xl font-semibold mb-2">No Active Courses Found</h3>
        <p className="text-gray-400 mb-6">
          We couldn't find any active courses. If you believe this is an error, please check your Canvas configuration.
        </p>
        <Button 
          onClick={fetchCourses} 
          className="mx-auto flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Courses
        </Button>
      </div>
    );
  }

  return (
    <>
      <Dialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
        <DialogContent className="bg-black/90 border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#9b87f5]">⚠️ Alpha Feature Warning</DialogTitle>
            <DialogDescription className="text-white/80 space-y-4">
              <p className="text-lg font-semibold text-red-400">
                This feature is currently in ALPHA testing!
              </p>
              <div className="space-y-2">
                <p>Please be aware of the following:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>The assignment completion feature is experimental and may break unexpectedly</li>
                  <li>For best results, we recommend using the chat bar above to upload assignment information directly</li>
                  <li>Some assignments may not be properly processed or may fail to submit</li>
                  <li>Always review and verify any generated content before submission</li>
                </ul>
              </div>
              <p className="font-medium text-[#9b87f5]">
                Do you wish to continue anyway?
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button
              variant="ghost"
              onClick={() => setShowDisclaimer(false)}
              className="bg-white/10 hover:bg-white/20"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowDisclaimer(false);
                setHasSeenDisclaimer(true);
                if (selectedCourse) {
                  console.log("Proceeding with course:", selectedCourse);
                }
              }}
              className="bg-[#9b87f5] hover:bg-[#8b5cf6]"
            >
              I Understand, Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Your Courses</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Real-time sync enabled</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-black/80 backdrop-blur-lg border-white/10">
                <DropdownMenuItem onClick={() => handleSort("name")}>
                  Sort by Name
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("pending")}>
                  Sort by Missing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("progress")}>
                  Sort by Progress
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} onClick={() => handleCourseClick(course)} className="cursor-pointer">
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
