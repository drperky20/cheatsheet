import { useEffect, useState } from "react";
import { CourseCard } from "./CourseCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Clock, ArrowUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

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
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const { toast } = useToast();
  const { canvasConfig } = useAuth();

  useEffect(() => {
    fetchCourses();
  }, [canvasConfig]);

  const fetchAllAssignments = async (courseId: string) => {
    let allAssignments: any[] = [];
    let page = 1;
    let hasMore = true;
    const PER_PAGE = 100;

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
        break;
      }

      const pageAssignments = Array.isArray(assignments) ? assignments : [];
      allAssignments = [...allAssignments, ...pageAssignments];

      if (pageAssignments.length < PER_PAGE) {
        hasMore = false;
      } else {
        page++;
      }
    }

    return allAssignments;
  };

  const fetchCourses = async () => {
    try {
      if (!canvasConfig) {
        console.log('No Canvas configuration found');
        return;
      }

      console.log('Fetching courses from Canvas...');
      const { data: coursesData, error: coursesError } = await supabase.functions.invoke('canvas-proxy', {
        body: {
          endpoint: '/courses?enrollment_state=active&state[]=available',
          method: 'GET',
          domain: canvasConfig.domain,
          apiKey: canvasConfig.api_key
        }
      });

      if (coursesError) throw coursesError;

      const coursesWithAssignments = await Promise.all(
        (Array.isArray(coursesData) ? coursesData : []).map(async (course) => {
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
        })
      );

      const validCourses = coursesWithAssignments.filter((course): course is Course => course !== null);
      console.log('Courses with assignments:', validCourses);
      setCourses(sortCourses(validCourses, sortBy));
    } catch (error: any) {
      console.error('Error fetching courses:', error);
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
    setCourses(prev => [...prev].sort((a, b) => {
      switch (option) {
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
    }));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[200px] rounded-xl bg-[#1A1F2C]/40" />
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center p-8 glass-morphism">
        <h3 className="text-xl font-semibold mb-2 text-[#E5DEFF]">No Active Courses Found</h3>
        <p className="text-[#403E43]">
          We couldn't find any active courses. If you believe this is an error, please check your Canvas configuration.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-[#403E43]" />
          <h2 className="text-xl font-semibold text-[#E5DEFF]">Your Courses</h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-[#403E43]">
            <Clock className="w-4 h-4" />
            <span>Real-time sync enabled</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-2 text-[#E5DEFF] hover:bg-[#1A1F2C]/60"
              >
                <ArrowUpDown className="h-4 w-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1A1F2C]/90 backdrop-blur-xl border-white/10">
              <DropdownMenuItem onClick={() => handleSort("name")} className="text-[#E5DEFF] hover:bg-[#403E43]/20">
                Sort by Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("pending")} className="text-[#E5DEFF] hover:bg-[#403E43]/20">
                Sort by Missing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("progress")} className="text-[#E5DEFF] hover:bg-[#403E43]/20">
                Sort by Progress
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="transform transition-all duration-500 hover:scale-[1.02]">
            <CourseCard course={course} />
          </div>
        ))}
      </div>
    </div>
  );
};
