import { useState } from "react";
import { Card } from "@/components/ui/card";
import { BookOpen, Clock, ArrowRight, X, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseRename } from "./CourseRename";
import { AssignmentsList } from "../assignments/AssignmentsList";
import { AssignmentWorkspace } from "../assignments/AssignmentWorkspace";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";


interface CourseCardProps {
  course: {
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
  };
}

export const CourseCard = ({ course }: CourseCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [nickname, setNickname] = useState(course.nickname);
  const [showAssignments, setShowAssignments] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);

  const getRandomGradient = () => {
    const gradients = [
      'from-[#6366f1]/20 via-[#9b87f5]/20 to-[#a78bfa]/20',
      'from-[#10b981]/20 via-[#34d399]/20 to-[#6ee7b7]/20',
      'from-[#8b5cf6]/20 via-[#d946ef]/20 to-[#ec4899]/20',
      'from-[#f59e0b]/20 via-[#ef4444]/20 to-[#dc2626]/20',
      'from-[#06b6d4]/20 via-[#22d3ee]/20 to-[#67e8f9]/20',
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  return (
    <>
      <Card
        className={`
          group relative overflow-hidden
          neo-blur hover:bg-black/60
          border-0 shadow-lg hover:shadow-xl
          transition-all duration-500 ease-out
          hover:-translate-y-1
          card-gradient p-6 hover:scale-[1.02] transition-all duration-300
          ${isHovered ? 'transform scale-[1.02]' : ''}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`
          absolute inset-0 bg-gradient-to-br ${getRandomGradient()}
          transition-opacity duration-500
        `} />
        <div className="
          absolute inset-0 bg-gradient-to-br from-[#9b87f5]/10 to-transparent
          opacity-0 group-hover:opacity-100 transition-opacity duration-500
        " />

        <div className="relative p-8 space-y-6 flex flex-col h-full gap-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CourseRename
                courseId={course.id}
                currentName={course.name}
                nickname={nickname}
                onUpdate={setNickname}
              />
              {course.term && (
                <p className="text-sm text-white/60">{course.term.name}</p>
              )}
            </div>
            {course.final_grade && (
              <Badge variant="secondary" className="bg-primary/20 text-primary-foreground">
                {course.final_grade}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass-morphism hover:bg-white/10 transition-all duration-300 group/stat">
              <BookOpen className="w-4 h-4 text-[#9b87f5] group-hover/stat:scale-110 transition-transform" />
              <div className="flex flex-col">
                <span className="text-xs text-white/60">Assignments</span>
                <span className="text-sm font-medium text-white">{course.assignments_count}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass-morphism hover:bg-white/10 transition-all duration-300 group/stat">
              <Clock className="w-4 h-4 text-[#f59e0b] group-hover/stat:scale-110 transition-transform" />
              <div className="flex flex-col">
                <span className="text-xs text-white/60">Missing</span>
                <span className="text-sm font-medium text-white">{course.pending_assignments}</span>
              </div>
            </div>
          </div>
          <Progress value={course.final_score ? Math.round((course.final_score / 100) * 100) : 0} className="h-2" />

          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-500">
            <Button
              onClick={() => setShowAssignments(true)}
              className="relative overflow-hidden bg-gradient-to-r from-[#9b87f5] to-[#6366f1] text-white font-medium px-6 py-2 rounded-xl flex items-center gap-3 transition-all duration-300 hover:scale-105 transform group/btn"
            >
              <span>View Assignments</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            </Button>
          </div>
        </div>
      </Card>

      {showAssignments && (
        <div className="fixed inset-0 z-40 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Card className="w-full max-w-3xl glass-morphism border-0 shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-black/60 to-black/40">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gradient">
                  {nickname || course.name} - Assignments
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAssignments(false)}
                  className="rounded-full h-10 w-10 hover:bg-white/10 transition-colors duration-300"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <AssignmentsList
                courseId={course.id}
                onStartAssignment={(assignment) => {
                  setSelectedAssignment(assignment);
                  setShowAssignments(false);
                }}
              />
            </div>
          </Card>
        </div>
      )}

      {selectedAssignment && (
        <AssignmentWorkspace
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
        />
      )}
    </>
  );
};