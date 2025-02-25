import { useState } from "react";
import { Card } from "@/components/ui/card";
import { BookOpen, Clock, ArrowRight, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseRename } from "./CourseRename";
import { AssignmentsList } from "../assignments/AssignmentsList";
import { AssignmentWorkspace } from "../assignments/AssignmentWorkspace";

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
      'from-[#403E43]/10 via-[#555555]/10 to-[#222222]/10',
      'from-[#1A1F2C]/10 via-[#403E43]/10 to-[#222222]/10',
      'from-[#222222]/10 via-[#403E43]/10 to-[#555555]/10',
      'from-[#333333]/10 via-[#403E43]/10 to-[#1A1F2C]/10',
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  return (
    <>
      <Card 
        className={`
          group relative overflow-hidden
          bg-[#1A1F2C]/40 hover:bg-[#1A1F2C]/60
          border border-white/5 hover:border-white/10
          shadow-lg hover:shadow-xl
          transition-all duration-700 ease-out
          hover:-translate-y-1 hover:scale-[1.02]
          ${isHovered ? 'transform scale-[1.02]' : ''}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`
          absolute inset-0 bg-gradient-to-br ${getRandomGradient()}
          transition-opacity duration-700
        `} />
        <div className={`
          absolute inset-0 bg-gradient-to-br from-[#403E43]/5 to-transparent
          opacity-0 group-hover:opacity-100 transition-opacity duration-700
        `} />
        
        <div className="relative p-8 space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CourseRename 
                courseId={course.id}
                currentName={course.name}
                nickname={nickname}
                onUpdate={setNickname}
              />
              {course.term && (
                <p className="text-sm text-[#403E43]/60 transition-colors duration-300">{course.term.name}</p>
              )}
            </div>
            {course.final_grade && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A1F2C]/50 backdrop-blur-xl border border-white/5 transition-all duration-300 hover:bg-[#1A1F2C]/70">
                <Sparkles className="w-4 h-4 text-[#403E43]" />
                <span className="text-[#E5DEFF] font-medium">{course.final_grade}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="
              flex items-center gap-2 px-4 py-2 rounded-xl
              bg-[#1A1F2C]/50 backdrop-blur-xl border border-white/5
              hover:bg-[#1A1F2C]/70 hover:border-white/10
              transition-all duration-500 group/stat
            ">
              <BookOpen className="w-4 h-4 text-[#403E43] group-hover/stat:scale-110 transition-transform duration-500" />
              <div className="flex flex-col">
                <span className="text-xs text-[#403E43]/60">Assignments</span>
                <span className="text-sm font-medium text-[#E5DEFF]">{course.assignments_count}</span>
              </div>
            </div>
            
            <div className="
              flex items-center gap-2 px-4 py-2 rounded-xl
              bg-[#1A1F2C]/50 backdrop-blur-xl border border-white/5
              hover:bg-[#1A1F2C]/70 hover:border-white/10
              transition-all duration-500 group/stat
            ">
              <Clock className="w-4 h-4 text-[#403E43] group-hover/stat:scale-110 transition-transform duration-500" />
              <div className="flex flex-col">
                <span className="text-xs text-[#403E43]/60">Missing</span>
                <span className="text-sm font-medium text-[#E5DEFF]">{course.pending_assignments}</span>
              </div>
            </div>
          </div>

          <div className="
            absolute inset-0 flex items-center justify-center
            bg-[#0F172A]/80 backdrop-blur-md
            opacity-0 group-hover:opacity-100
            transition-all duration-700
          ">
            <Button 
              onClick={() => setShowAssignments(true)}
              className="
                relative overflow-hidden
                bg-[#403E43] hover:bg-[#555555]
                text-[#E5DEFF] font-medium px-6 py-2 rounded-xl
                flex items-center gap-3
                transition-all duration-500
                hover:scale-105 transform
                group/btn
              "
            >
              <span>View Assignments</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-500" />
              <div className="
                absolute inset-0 bg-gradient-to-r 
                from-white/5 to-transparent opacity-0 
                group-hover/btn:opacity-100 
                transition-opacity duration-500
              " />
            </Button>
          </div>
        </div>
      </Card>

      {showAssignments && (
        <div className="
          fixed inset-0 z-40
          bg-black/90 backdrop-blur-xl
          flex items-center justify-center p-6
          animate-in fade-in slide-in-from-bottom-4
          duration-300
        ">
          <Card className="
            w-full max-w-3xl
            glass-morphism border-0
            shadow-2xl shadow-black/50
            animate-in zoom-in-95
            duration-300
          ">
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-black/60 to-black/40">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gradient">
                  {nickname || course.name} - Assignments
                </h2>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowAssignments(false)}
                  className="
                    rounded-full h-10 w-10
                    hover:bg-white/10
                    transition-colors duration-300
                  "
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
