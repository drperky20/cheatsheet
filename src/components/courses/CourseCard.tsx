
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
      'from-[#6366f1]/30 via-[#9b87f5]/20 to-[#a78bfa]/10',
      'from-[#10b981]/30 via-[#34d399]/20 to-[#6ee7b7]/10',
      'from-[#8b5cf6]/30 via-[#d946ef]/20 to-[#ec4899]/10',
      'from-[#f59e0b]/30 via-[#ef4444]/20 to-[#dc2626]/10',
      'from-[#06b6d4]/30 via-[#22d3ee]/20 to-[#67e8f9]/10',
      'from-[#4f46e5]/30 via-[#3b82f6]/20 to-[#0ea5e9]/10',
      'from-[#8b5cf6]/30 via-[#6366f1]/20 to-[#4f46e5]/10',
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  return (
    <>
      <Card 
        className={`
          group relative overflow-hidden
          frost-panel rounded-xl
          border-0 shadow-lg
          transition-all duration-700 ease-out
          hover:-translate-y-2 hover:scale-[1.01]
          ${isHovered ? 'transform scale-[1.03]' : ''}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background Gradients */}
        <div className={`
          absolute inset-0 bg-gradient-to-br ${getRandomGradient()}
          opacity-40 transition-opacity duration-700
        `} />
        <div className="
          absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent-purple/10
          opacity-0 group-hover:opacity-100 transition-all duration-700 ease-in-out
        " />
        <div className="
          absolute inset-0 opacity-0 group-hover:opacity-30
          bg-[radial-gradient(circle_at_top_right,rgba(155,135,245,0.15),transparent_70%)]
          transition-opacity duration-1000
        "/>
        
        {/* Card Content */}
        <div className="relative p-8 space-y-6 z-10">
          <div className="flex items-start justify-between">
            <div className="space-y-2 animate-fadeIn">
              <CourseRename 
                courseId={course.id}
                currentName={course.name}
                nickname={nickname}
                onUpdate={setNickname}
              />
              {course.term && (
                <p className="text-sm text-white/70 font-light tracking-wide">{course.term.name}</p>
              )}
            </div>
            {course.final_grade && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass-morphism animate-fadeIn">
                <Sparkles className="w-4 h-4 text-primary animate-pulse-slow" />
                <span className="text-white font-medium">{course.final_grade}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="
              flex items-center gap-2 px-4 py-2 rounded-xl
              glass-morphism hover:bg-white/10
              transition-all duration-300 group/stat
            ">
              <BookOpen className="w-4 h-4 text-[#9b87f5] group-hover/stat:scale-110 transition-transform" />
              <div className="flex flex-col">
                <span className="text-xs text-white/60">Assignments</span>
                <span className="text-sm font-medium text-white">{course.assignments_count}</span>
              </div>
            </div>
            
            <div className="
              flex items-center gap-2 px-4 py-2 rounded-xl
              glass-morphism hover:bg-white/10
              transition-all duration-300 group/stat
            ">
              <Clock className="w-4 h-4 text-[#f59e0b] group-hover/stat:scale-110 transition-transform" />
              <div className="flex flex-col">
                <span className="text-xs text-white/60">Missing</span>
                <span className="text-sm font-medium text-white">{course.pending_assignments}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hover Overlay */}
        <div className="
          absolute inset-0 flex items-center justify-center
          bg-gradient-to-b from-transparent via-black/60 to-black/80
          opacity-0 group-hover:opacity-100
          backdrop-blur-[2px]
          transition-all duration-500 ease-in-out
          z-20
        ">
          <div className="
            transform translate-y-8 group-hover:translate-y-0
            transition-transform duration-500 ease-out
            space-y-4
          ">
            <div className="text-center mb-3">
              <p className="text-white/80 text-sm">
                View and manage all assignments
              </p>
            </div>
            <Button 
              onClick={() => setShowAssignments(true)}
              className="
                relative overflow-hidden
                bg-gradient-to-r from-[#9b87f5] to-[#6366f1]
                text-white font-medium px-8 py-2.5 rounded-xl
                flex items-center gap-3
                transition-all duration-300
                hover:scale-105 transform
                shadow-lg shadow-purple-500/20
                group/btn
              "
            >
              <span>View Assignments</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
              <div className="
                absolute inset-0 bg-gradient-to-r 
                from-white/20 to-transparent opacity-0 
                group-hover/btn:opacity-100 
                transition-opacity duration-300
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
