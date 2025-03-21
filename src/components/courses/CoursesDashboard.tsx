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
  term?: {
    name: string;
    start_at: string;
    end_at: string;
  };
}

type SortOption = "name" | "pending" | "progress";

const coursesCache = {
  data: null as Course[] | null,
  expiry: 0,
  ttl: 5 * 60 * 1000,
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

  const fetchCourseAssignments = useCallback(async (courseId: string, retryCount = 0): Promise<any[]> => {
    const maxRetries = 2;
    const PER_PAGE = 100;
    
    try {
      console.log(`Fetching assignments for course ${courseId}...`);
      const cacheKey = `course_assignments_${courseId}`;
      
      if (sessionStorage.getItem(cacheKey)) {
        const { data, expiry } = JSON.parse(sessionStorage.getItem(cacheKey)!);
        if (Date.now() < expiry) {
          console.log(`Using cached assignments for course ${courseId}`);
          return data;
        }
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
      
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data: assignments,
        expiry: Date.now() + 5 * 60 * 1000
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

  const fetchBatchAssignments = useCallback(async (coursesToFetch: any[]) => {
    console.log(`Starting optimized batch assignments fetch for ${coursesToFetch.length} courses...`);
    const courseAssignmentsMap = new Map();
    
    const MAX_CONCURRENT = 3;
    const batches = [];
    
    for (let i = 0; i < coursesToFetch.length; i += MAX_CONCURRENT) {
      batches.push(coursesToFetch.slice(i, i + MAX_CONCURRENT));
    }
    
    for (const batch of batches) {
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

  const fetchCourses = useCallback(async (options: { showLoading?: boolean; force?: boolean } = {}) => {
    const { showLoading = true, force = false } = options;
    
    setError(null);
    setErrorDetails(null);
    setErrorType(null);
    
    if (!force && !showLoading && coursesCache.isValid()) {
      console.log('Using cached courses data');
      setCourses(sortCourses(coursesCache.data!, sortBy));
      return;
    }
    
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
      
      const activeCourses = responseData.filter(course => 
        course.workflow_state === 'available'
      );
      
      const assignmentsMap = await fetchBatchAssignments(activeCourses);
      
      const processedCourses = activeCourses.map(course => {
        const courseAssignments = assignmentsMap.get(course.id) || [];
        const { totalAssignments, missingAssignments } = processAssignments(courseAssignments);
        
        return {
          id: course.id,
          name: course.name,
          course_code: course.course_code || course.name,
          assignments_count: totalAssignments,
          pending_assignments: missingAssignments,
          term: course.term,
          nickname: undefined
        } as Course;
      });

      console.log('Processed courses with assignments:', processedCourses.length);
      
      coursesCache.set(processedCourses);
      
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
  }, [canvasConfig, fetchBatchAssignments, sortBy, toast]);

  useEffect(() => {
    if (canvasConfig) {
      fetchCourses({ showLoading: true });
    }
  }, [canvasConfig, fetchCourses]);

  useEffect(() => {
    if (!canvasConfig) return;
    
    const refreshInterval = setInterval(() => {
      console.log('Refreshing courses data in background...');
      fetchCourses({ showLoading: false, force: true });
    }, 3 * 60 * 1000);
    
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
        <DialogContent className="bg-[#1A1F2C] border border-[#9b87f5]/20 text-white rounded-xl shadow-xl shadow-purple-900/10 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-[#9b87f5]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              Alpha Feature Warning
            </DialogTitle>
            <DialogDescription className="pt-4">
              <div className="text-lg font-semibold text-red-400 mb-4">
                This feature is currently in ALPHA testing!
              </div>
              <div className="space-y-4 text-gray-200">
                <p>Please be aware of the following:</p>
                <ul className="space-y-2 pl-6">
                  <li className="flex items-start gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 mt-2"></span>
                    <span>The assignment completion feature is experimental and may break unexpectedly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 mt-2"></span>
                    <span>For best results, we recommend using the chat bar above to upload assignment information directly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 mt-2"></span>
                    <span>Some assignments may not be properly processed or may fail to submit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 mt-2"></span>
                    <span>Always review and verify any generated content before submission</span>
                  </li>
                </ul>
                <p className="font-medium text-[#9b87f5] mt-2">
                  Do you wish to continue anyway?
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setShowDisclaimer(false)}
              className="bg-white/5 hover:bg-white/10 text-gray-200 transition-colors"
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
              className="bg-gradient-to-r from-[#9b87f5] to-[#8b5cf6] hover:opacity-90 text-white border-0"
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
