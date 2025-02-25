import { useState } from "react";
import { Card } from "@/components/ui/card";
import { BookOpen, Clock, ArrowRight, X, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseRename } from "./CourseRename";
import { AssignmentsList } from "../assignments/AssignmentsList";
import { AssignmentWorkspace } from "../assignments/AssignmentWorkspace";
import { themeConfig } from "@/app/theme-config";

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
      'from-primary/20 via-secondary/20 to-accent/20',
      'from-secondary/20 via-accent/20 to-primary/20',
      'from-accent/20 via-primary/20 to-secondary/20',
      'from-indigo-500/20 via-fuchsia-500/20 to-violet-500/20',
      'from-violet-500/20 via-indigo-500/20 to-fuchsia-500/20',
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  return (
    <>
      <Card
        className={`
          group relative overflow-hidden
          ${themeConfig.glass.card}
          ${themeConfig.shadow.DEFAULT}
          ${themeConfig.animation.DEFAULT}
          hover:${themeConfig.glass.heavy}
          hover:${themeConfig.shadow.lg}
          hover:-translate-y-1
          ${isHovered ? 'transform scale-[1.02]' : ''}
          ${themeConfig.spacing.card} ${themeConfig.radius.md}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background gradient effects */}
        <div className={`
          absolute inset-0 bg-gradient-to-br ${getRandomGradient()}
          transition-opacity duration-500
        `} />
        
        {/* Animated highlight gradient on hover */}
        <div className="
          absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent
          opacity-0 group-hover:opacity-100 transition-opacity duration-500
          mix-blend-overlay
        " />
        
        {/* Light border top highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        
        {/* Content */}
        <div className="relative p-8 space-y-6 z-10">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CourseRename
                courseId={course.id}
                currentName={course.name}
                nickname={nickname}
                onUpdate={setNickname}
              />
              {course.term && (
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent/80 animate-pulse"></div>
                  <p className="text-sm text-white/60">{course.term.name}</p>
                </div>
              )}
            </div>
            {course.final_grade && (
              <div className={`
                flex items-center gap-2 px-4 py-2
                ${themeConfig.radius.md}
                ${themeConfig.glass.light}
                border border-white/10
                shadow-sm shadow-black/20
              `}>
                <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                <span className="text-white font-medium">{course.final_grade}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className={`
              flex items-center gap-3 px-4 py-2 ${themeConfig.radius.md}
              ${themeConfig.glass.light} hover:bg-white/5
              ${themeConfig.animation.DEFAULT}
              group/stat border border-white/10
            `}>
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center
                ring-1 ring-primary/30 group-hover/stat:ring-primary/50 transition-all">
                <BookOpen className="w-4 h-4 text-primary group-hover/stat:scale-110 transition-transform" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-white/60">Assignments</span>
                <span className="text-sm font-medium text-white">{course.assignments_count}</span>
              </div>
            </div>
            
            <div className={`
              flex items-center gap-3 px-4 py-2 ${themeConfig.radius.md}
              ${themeConfig.glass.light} hover:bg-white/5
              ${themeConfig.animation.DEFAULT}
              group/stat border border-white/10
            `}>
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center
                ring-1 ring-amber-500/30 group-hover/stat:ring-amber-500/50 transition-all">
                <Clock className="w-4 h-4 text-amber-500 group-hover/stat:scale-110 transition-transform" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-white/60">Missing</span>
                <span className="text-sm font-medium text-white">{course.pending_assignments}</span>
              </div>
            </div>
          </div>

          {/* Card hover overlay with action button */}
          <div className={`
            absolute inset-0 flex items-center justify-center
            bg-gradient-to-t from-black/80 via-black/70 to-black/60 backdrop-blur-md
            opacity-0 group-hover:opacity-100
            ${themeConfig.animation.slow}
            z-20
          `}>
            <Button
              onClick={() => setShowAssignments(true)}
              className={`
                relative overflow-hidden
                bg-gradient-to-r from-primary to-secondary
                text-white font-medium px-6 py-6
                ${themeConfig.radius.md}
                flex items-center gap-3
                ${themeConfig.animation.DEFAULT}
                shadow-lg shadow-primary/30
                hover:shadow-xl hover:shadow-primary/40
                hover:scale-105 transform
                group/btn
              `}
            >
              <span className="text-base font-medium tracking-wide">View Assignments</span>
              <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform" />
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

      {/* Assignments modal overlay */}
      {showAssignments && (
        <div className="
          fixed inset-0 z-40
          bg-black/80 backdrop-blur-xl
          flex items-center justify-center p-6
          animate-in fade-in slide-in-from-bottom-4
          duration-300
        ">
          <Card className={`
            w-full max-w-4xl
            ${themeConfig.glass.heavy} border-0
            shadow-2xl shadow-black/60
            animate-in zoom-in-95
            duration-300
            ${themeConfig.radius.lg}
            overflow-hidden
          `}>
            {/* Header */}
            <div className="
              p-6 border-b border-white/10
              bg-gradient-to-r from-background-darker to-background-lighter
            ">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full
                    bg-gradient-to-br from-primary to-secondary
                    flex items-center justify-center
                    shadow-lg shadow-primary/20">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-semibold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                    {nickname || course.name} - Assignments
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAssignments(false)}
                  className={`
                    rounded-full h-10 w-10
                    hover:bg-white/10
                    ${themeConfig.animation.DEFAULT}
                  `}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Content */}
            <div className="
              p-6 max-h-[70vh] overflow-y-auto
              scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent
              bg-gradient-to-b from-transparent to-background-darker/50
            ">
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
