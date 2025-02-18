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
    const PER_PAGE = 100; // Maximum allowed by Canvas API

    while (hasMore) {
      console.log(`Fetching assignments page ${page} for course ${courseId}...`);
      const { data: assignments, error } = await supabase.functions.invoke('canvas-proxy', {
        body: {
          endpoint: `/courses/${courseId}/assignments?page=${page}&per_page=${PER_PAGE}`,
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

      // If we received fewer assignments than the page size, we've reached the end
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

      // Fetch assignment counts for each course
      const coursesWithAssignments = await Promise.all(
        (Array.isArray(coursesData) ? coursesData : []).map(async (course) => {
          const assignments = await fetchAllAssignments(course.id);
          
          const totalAssignments = assignments.length;
          const pendingAssignments = assignments.filter(a => 
            new Date(a.due_at) > new Date() && 
            !a.has_submitted_submissions
          ).length;

          return {
            id: course.id,
            name: course.name,
            course_code: course.course_code || course.name,
            assignments_count: totalAssignments,
            pending_assignments: pendingAssignments,
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
    setCourses(sortCourses(courses, option));
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

  if (courses.length === 0) {
    return (
      <div className="text-center p-8 glass">
        <h3 className="text-xl font-semibold mb-2">No Active Courses Found</h3>
        <p className="text-gray-400">
          We couldn't find any active courses. If you believe this is an error, please check your Canvas configuration.
        </p>
      </div>
    );
  }

  return (
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
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
};
