
import { useEffect, useState } from "react";
import { CourseCard } from "./CourseCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowUpDown } from "lucide-react";
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
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [hasSeenDisclaimer, setHasSeenDisclaimer] = useState(false);
  const { toast } = useToast();
  const { canvasConfig } = useAuth();

  useEffect(() => {
    if (canvasConfig) {
      fetchCourses();
    }
  }, [canvasConfig]);

  const fetchCourses = async () => {
    if (!canvasConfig?.domain || !canvasConfig?.api_key) {
      toast({
        title: "Missing Canvas Configuration",
        description:
          "Please configure your Canvas domain and API key in your profile.",
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://${canvasConfig.domain}/api/v1/courses?enrollment_state=active&per_page=100`,
        {
          headers: {
            Authorization: `Bearer ${canvasConfig.api_key}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch courses: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const coursesWithCounts = await Promise.all(
        data.map(async (course: any) => {
          const assignments = await fetchAllAssignments(course.id);
          const pendingAssignments = assignments.filter(
            (assignment: any) =>
              !assignment.submission?.workflow_state ||
              assignment.submission?.workflow_state === "unsubmitted"
          ).length;

          return {
            id: course.id,
            name: course.name,
            nickname: course.nickname,
            course_code: course.course_code,
            assignments_count: assignments.length,
            pending_assignments: pendingAssignments,
            term: course.term,
          };
        })
      );

      setCourses(coursesWithCounts);
    } catch (error: any) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error fetching courses",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAssignments = async (courseId: string) => {
    try {
      const response = await fetch(
        `https://${canvasConfig?.domain}/api/v1/courses/${courseId}/assignments?per_page=100&include[]=submission`,
        {
          headers: {
            Authorization: `Bearer ${canvasConfig?.api_key}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch assignments: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching assignments:", error);
      return [];
    }
  };

  const sortCourses = (courses: Course[], sortBy: SortOption): Course[] => {
    switch (sortBy) {
      case "name":
        return [...courses].sort((a, b) => a.name.localeCompare(b.name));
      case "pending":
        return [...courses].sort((a, b) => b.pending_assignments - a.pending_assignments);
      case "progress":
        return [...courses].sort((a, b) => {
          const progressA = a.assignments_count > 0 ? (a.assignments_count - a.pending_assignments) / a.assignments_count : 0;
          const progressB = b.assignments_count > 0 ? (b.assignments_count - b.pending_assignments) / b.assignments_count : 0;
          return progressB - progressA;
        });
      default:
        return courses;
    }
  };

  const sortedCourses = sortCourses(courses, sortBy);

  useEffect(() => {
    const viewedDisclaimer = localStorage.getItem("viewedDisclaimer");
    setHasSeenDisclaimer(!!viewedDisclaimer);
    if (!viewedDisclaimer) {
      setShowDisclaimer(true);
    }
  }, []);

  const handleCloseDisclaimer = () => {
    localStorage.setItem("viewedDisclaimer", "true");
    setHasSeenDisclaimer(true);
    setShowDisclaimer(false);
  };

  return (
    <>
      <Dialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
        <DialogContent className="sm:max-w-[425px] bg-black/80 backdrop-blur-sm border-white/10">
          <DialogHeader>
            <DialogTitle>Disclaimer</DialogTitle>
            <DialogDescription>
              This application is not affiliated with Canvas or Instructure.
              It is a personal project and is not intended for commercial use.
              Please use responsibly.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={handleCloseDisclaimer}>
            I Understand
          </Button>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">
            My Courses
          </h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Sort By <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy("name")}>
                Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("pending")}>
                Pending Assignments
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("progress")}>
                Progress
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-md" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedCourses.length > 0 ? (
              sortedCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                />
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500">
                No courses found.
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
