
import { useEffect, useState, useCallback } from "react";
import { CourseCard } from "./CourseCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Clock, ArrowUpDown, AlertCircle, RefreshCw, KeyRound } from "lucide-react";
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
import { useNavigate } from "react-router-dom";

interface Course {
  id: string;
  name: string;
  nickname?: string;
  course_code: string;
  assignments_count: number;
  pending_assignments: number;
  final_grade?: string;
  final_score?: number;
  term?: {
    name: string;
    start_at: string;
    end_at: string;
  };
}

type SortOption = "name" | "pending" | "progress" | "grade";

// Cache mechanism for courses data
const coursesCache = {
  data: null as Course[] | null,
  expiry: 0,
  ttl: 5 * 60 * 1000, // 5 minutes
  isValid: function() {
    return this.data && Date.now() < this.expiry;
  },
  set: function(data: Course[]) {
    this.data = data;
    this.expiry = Date.now() + this.ttl;
    console.log('Courses cache set with TTL of 5 minutes');
  },
  clear: function() {
    this.data = null;
    this.expiry = 0;
  }
};

export const CoursesDashboard = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [hasSeenDisclaimer, setHasSeenDisclaimer] = useState(false);
  const [isBackgroundRefreshing, setIsBackgroundRefreshing] = useState(false);
  const { toast } = useToast();
  const { canvasConfig } = useAuth();
  const navigate = useNavigate();

  // Process assignments to get counts and pending counts
  const processAssignments = (assignments: any[], startDate = new Date('2024-01-01')) => {
    const totalAssignments = assignments.length;
    const missingAssignments = assignments.filter(a => {
      const dueDate = a.due_at ? new Date(a.due_at) : null;
      if (!dueDate || dueDate < startDate) return false;
      const hasSubmission = a.submission && typeof a.submission.score === 'number';
      const isZeroScore = hasSubmission && a.submission.score === 0;
      const hasPointsPossible = a.points_possible > 0;
      return hasPointsPossible && isZeroScore;
    }).length;

    return { totalAssignments, missingAssignments };
  };

  // Fetch grades for a course
  const fetchCourseGrades = useCallback(async (courseId: string, retryCount = 0): Promise<any> => {
    const maxRetries = 2;
    
    try {
      console.log(`Fetching grades for course ${courseId}...`);
      const cacheKey = `course_grades_${courseId}`;
      
      // Check sessionStorage cache first
      const cachedData = sessionStorage.getItem(cacheKey);
      if (cachedData) {
        const { data, expiry } = JSON.parse(cachedData);
        if (Date.now() < expiry) {
          console.log(`Using cached grades for course ${courseId}`);
          return data;
        }
        // Clear expired cache
        sessionStorage.removeItem(cacheKey);
      }
      
      const { data, error } = await supabase.functions.invoke('canvas-proxy', {
        body: {
          endpoint: `/courses/${courseId}/enrollments?enrollment_state=active&include[]=grades`,
          method: 'GET',
          domain: canvasConfig?.domain,
          apiKey: canvasConfig?.api_key
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.details || data.error);
      }

      const enrollments = Array.isArray(data) ? data : [];
      console.log(`Received ${enrollments.length} enrollments with grades for course ${courseId}`);
      
      // Find the user's own enrollment (should only be one for the current user)
      const userEnrollment = enrollments.find(e => e.type === 'student');
      
      // Cache the result in sessionStorage for 10 minutes
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data: userEnrollment?.grades || {},
        expiry: Date.now() + 10 * 60 * 1000 // 10 minutes
      }));

      return userEnrollment?.grades || {};
    } catch (error: any) {
      console.error(`Error fetching grades for course ${courseId}:`, error);
      
      if (retryCount < maxRetries) {
        console.log(`Retrying fetch for course ${courseId} grades, attempt ${retryCount + 1}...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return fetchCourseGrades(courseId, retryCount + 1);
      }
      
      return {};
    }
  }, [canvasConfig]);

  // Fetch assignments for a single course with retries
  const fetchCourseAssignments = useCallback(async (courseId: string, retryCount = 0): Promise<any[]> => {
    const maxRetries = 2;
    const PER_PAGE = 100;
    
    try {
      console.log(`Fetching assignments for course ${courseId}...`);
      const cacheKey = `course_assignments_${courseId}`;
      
      // Check sessionStorage cache first
      const cachedData = sessionStorage.getItem(cacheKey);
      if (cachedData) {
        const { data, expiry } = JSON.parse(cachedData);
        if (Date.now() < expiry) {
          console.log(`Using cached assignments for course ${courseId}`);
          return data;
        }
        // Clear expired cache
        sessionStorage.removeItem(cacheKey);
      }
      
      const { data, error } = await supabase.functions.invoke('canvas-proxy', {
        body: {
          endpoint: `/courses/${courseId}/assignments?include[]=submission&per_page=${PER_PAGE}`,
          method: 'GET',
          domain: canvasConfig?.domain,
          apiKey: canvasConfig?.api_key
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.details || data.error);
      }

      const assignments = Array.isArray(data) ? data : [];
      console.log(`Received ${assignments.length} assignments for course ${courseId}`);
      
      // Cache the result in sessionStorage for 5 minutes
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data: assignments,
        expiry: Date.now() + 5 * 60 * 1000 // 5 minutes
      }));

      return assignments;
    } catch (error: any) {
      console.error(`Error fetching assignments for course ${courseId}:`, error);
      
      if (retryCount < maxRetries) {
        console.log(`Retrying fetch for course ${courseId}, attempt ${retryCount + 1}...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return fetchCourseAssignments(courseId, retryCount + 1);
      }
      
      return [];
    }
  }, [canvasConfig]);

  // Optimized batch fetching of assignments in parallel with concurrency control
  const fetchBatchAssignments = useCallback(async (coursesToFetch: any[]) => {
    console.log(`Starting optimized batch assignments fetch for ${coursesToFetch.length} courses...`);
    const courseAssignmentsMap = new Map();
    
    // Control concurrency with a smaller batch size for better performance
    const MAX_CONCURRENT = 3;
    const batches = [];
    
    for (let i = 0; i < coursesToFetch.length; i += MAX_CONCURRENT) {
      batches.push(coursesToFetch.slice(i, i + MAX_CONCURRENT));
    }
    
    for (const batch of batches) {
      // Process each batch in parallel
      await Promise.all(batch.map(async course => {
        try {
          const assignments = await fetchCourseAssignments(course.id);
          courseAssignmentsMap.set(course.id, assignments);
        } catch (error) {
          console.error(`Error in batch fetch for course ${course.id}:`, error);
          courseAssignmentsMap.set(course.id, []);
        }
      }));
    }
    
    return courseAssignmentsMap;
  }, [fetchCourseAssignments]);

  // Batch fetch grades for all courses
  const fetchBatchGrades = useCallback(async (coursesToFetch: any[]) => {
    console.log(`Starting batch grades fetch for ${coursesToFetch.length} courses...`);
    const courseGradesMap = new Map();
    
    // Control concurrency with a smaller batch size for better performance
    const MAX_CONCURRENT = 3;
    const batches = [];
    
    for (let i = 0; i < coursesToFetch.length; i += MAX_CONCURRENT) {
      batches.push(coursesToFetch.slice(i, i + MAX_CONCURRENT));
    }
    
    for (const batch of batches) {
      // Process each batch in parallel
      await Promise.all(batch.map(async course => {
        try {
          const grades = await fetchCourseGrades(course.id);
          courseGradesMap.set(course.id, grades);
        } catch (error) {
          console.error(`Error in batch fetch for course ${course.id} grades:`, error);
          courseGradesMap.set(course.id, {});
        }
      }));
    }
    
    return courseGradesMap;
  }, [fetchCourseGrades]);

  // Main function to fetch courses
  const fetchCourses = useCallback(async (options: { showLoading?: boolean; force?: boolean } = {}) => {
    const { showLoading = true, force = false } = options;
    
    // Reset error states
    setError(null);
    setErrorDetails(null);
    setErrorType(null);
    
    // Check if we can use cached data
    if (!force && !showLoading && coursesCache.isValid()) {
      console.log('Using cached courses data');
      setCourses(sortCourses(coursesCache.data!, sortBy));
      return;
    }
    
    // Set loading state only if this is not a background refresh
    if (showLoading) {
      setLoading(true);
    } else {
      setIsBackgroundRefreshing(true);
    }
    
    try {
      if (!canvasConfig) {
        console.log('No Canvas configuration found');
        setError('Canvas configuration is missing. Please connect your Canvas account.');
        if (showLoading) setLoading(false);
        else setIsBackgroundRefreshing(false);
        return;
      }

      console.log('Fetching courses from Canvas...');
      
      const response = await supabase.functions.invoke('canvas-proxy', {
        body: {
          endpoint: '/courses?enrollment_state=active&state[]=available',
          method: 'GET',
          domain: canvasConfig.domain,
          apiKey: canvasConfig.api_key,
          // Force refresh if requested
          bypassCache: force
        }
      });

      if (response.error) {
        throw new Error(`Failed to fetch courses: ${response.error}`);
      }

      const responseData = response.data;

      if (responseData && responseData.error) {
        console.error('Canvas API error:', responseData.error);
        setError(responseData.error);
        setErrorDetails(responseData.details || 'No additional details provided');
        setErrorType(responseData.type || 'api_error');
        
        if (showLoading) {
          toast({
            title: "Canvas API Error",
            description: responseData.details || responseData.error,
            variant: "destructive"
          });
        }
        return;
      }
      
      if (!Array.isArray(responseData)) {
        throw new Error('Received invalid data from Canvas API');
      }

      console.log('Courses data received:', responseData.length, 'courses');
      
      // Filter to active courses only
      const activeCourses = responseData.filter(course => 
        course.workflow_state === 'available'
      );
      
      // Fetch assignments for all courses in parallel batches
      const assignmentsMap = await fetchBatchAssignments(activeCourses);
      
      // Fetch grades for all courses in parallel batches
      const gradesMap = await fetchBatchGrades(activeCourses);
      
      // Process courses with their assignments and grades
      const processedCourses = activeCourses.map(course => {
        const courseAssignments = assignmentsMap.get(course.id) || [];
        const { totalAssignments, missingAssignments } = processAssignments(courseAssignments);
        
        // Get grades data for this course
        const gradesData = gradesMap.get(course.id) || {};
        
        return {
          id: course.id,
          name: course.name,
          course_code: course.course_code || course.name,
          assignments_count: totalAssignments,
          pending_assignments: missingAssignments,
          final_grade: gradesData.current_grade || gradesData.final_grade,
          final_score: gradesData.current_score !== undefined ? Number(gradesData.current_score) : 
                      (gradesData.final_score !== undefined ? Number(gradesData.final_score) : undefined),
          term: course.term,
          nickname: undefined
        } as Course;
      });

      console.log('Processed courses with assignments and grades:', processedCourses.length);
      
      // Update cache
      coursesCache.set(processedCourses);
      
      // Update state with sorted courses
      setCourses(sortCourses(processedCourses, sortBy));
    } catch (error: any) {
      console.error('Error in fetchCourses:', error);
      setError(error.message || "An unexpected error occurred");
      
      if (showLoading) {
        toast({
          title: "Error fetching courses",
          description: error.message || "Please check your Canvas configuration",
          variant: "destructive"
        });
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      } else {
        setIsBackgroundRefreshing(false);
      }
    }
  }, [canvasConfig, fetchBatchAssignments, fetchBatchGrades, sortBy, toast]);

  // Initial load with loading indicator
  useEffect(() => {
    if (canvasConfig) {
      fetchCourses({ showLoading: true });
    }
  }, [canvasConfig, fetchCourses]);

  // Background refresh every 3 minutes
  useEffect(() => {
    if (!canvasConfig) return;
    
    const refreshInterval = setInterval(() => {
      console.log('Refreshing courses data in background...');
      fetchCourses({ showLoading: false, force: true });
    }, 3 * 60 * 1000); // 3 minutes
    
    return () => clearInterval(refreshInterval);
  }, [canvasConfig, fetchCourses]);

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
        case "grade":
          const scoreA = a.final_score ?? -1;
          const scoreB = b.final_score ?? -1;
          return scoreB - scoreA;
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
    navigate("/settings");
  };

  const handleManualRefresh = () => {
    // Clear cache and force a refresh
    coursesCache.clear();
    fetchCourses({ showLoading: true, force: true });
    
    toast({
      title: "Refreshing Courses",
      description: "Fetching the latest data from Canvas...",
    });
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
            <AlertTitle>{errorType === 'token_revoked' ? 'Canvas API Token Expired' : 'Canvas API Error'}</AlertTitle>
            <AlertDescription className="mt-2">
              {errorType === 'token_revoked' ? (
                <div className="space-y-2">
                  <p>{errorDetails}</p>
                  <p className="font-medium">Your Canvas API token has been revoked or expired. Please generate a new token in your Canvas settings and update it here.</p>
                </div>
              ) : (
                errorDetails
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col gap-3 mt-4">
          <Button 
            onClick={handleManualRefresh} 
            className="mx-auto flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          
          {(errorType === 'token_revoked' || errorType === 'auth_error' || (errorDetails && (errorDetails.includes("token") || errorDetails.includes("authentication")))) && (
            <Button 
              onClick={handleCanvasReconnect}
              variant="secondary" 
              className="mx-auto mt-2 bg-blue-900/30 hover:bg-blue-800/40"
            >
              <KeyRound className="h-4 w-4 mr-2" />
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
          onClick={handleManualRefresh} 
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
            <DialogDescription>
              <p className="text-lg font-semibold text-red-400">
                This feature is currently in ALPHA testing!
              </p>
              <div className="space-y-2 mt-4">
                <p>Please be aware of the following:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>The assignment completion feature is experimental and may break unexpectedly</li>
                  <li>For best results, we recommend using the chat bar above to upload assignment information directly</li>
                  <li>Some assignments may not be properly processed or may fail to submit</li>
                  <li>Always review and verify any generated content before submission</li>
                </ul>
              </div>
              <p className="font-medium text-[#9b87f5] mt-4">
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
              {isBackgroundRefreshing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
              <span>{isBackgroundRefreshing ? 'Refreshing...' : 'Real-time sync enabled'}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={handleManualRefresh}
              disabled={loading || isBackgroundRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isBackgroundRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
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
                <DropdownMenuItem onClick={() => handleSort("grade")}>
                  Sort by Grade
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
