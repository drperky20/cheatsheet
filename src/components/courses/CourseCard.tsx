import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, ArrowRight } from "lucide-react";
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
  
  const progressValue = course.assignments_count > 0 
    ? ((course.assignments_count - course.pending_assignments) / course.assignments_count) * 100
    : 0;

  const getRandomGradient = () => {
    const gradients = [
      'from-blue-500/10 to-indigo-500/10',
      'from-green-500/10 to-emerald-500/10',
      'from-purple-500/10 to-pink-500/10',
      'from-orange-500/10 to-red-500/10',
      'from-teal-500/10 to-cyan-500/10',
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  const handleViewAssignments = () => {
    console.log("View assignments for course:", course.id);
  };

  return (
    <>
      <Card 
        className={`group relative overflow-hidden transition-all duration-300 backdrop-blur-lg bg-black/40 
          border-white/5 hover:border-white/10
          ${isHovered ? 'transform scale-[1.02]' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${getRandomGradient()} opacity-100`} />
        
        <div className="relative p-6 space-y-4">
          <div className="flex items-start justify-between">
            <CourseRename 
              courseId={course.id}
              currentName={course.name}
              nickname={nickname}
              onUpdate={setNickname}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Progress</span>
              <span className="text-gray-400">{Math.round(progressValue)}%</span>
            </div>
            <Progress value={progressValue} className="h-1" />
          </div>

          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <BookOpen className="w-4 h-4" />
              <span>{course.assignments_count} assignments</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{course.pending_assignments} pending</span>
            </div>
          </div>

          {isHovered && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-200">
              <Button 
                onClick={() => setShowAssignments(true)}
                className="bg-white/10 hover:bg-white/20 text-white flex items-center gap-2"
              >
                View Assignments
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </Card>

      {showAssignments && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl glass">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {nickname || course.name} - Assignments
              </h2>
              <Button variant="ghost" onClick={() => setShowAssignments(false)}>
                Close
              </Button>
            </div>
            <div className="p-4">
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
