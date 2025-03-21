
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { BookOpen, Clock, ArrowRight, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseRename } from "./CourseRename";
import { AssignmentsList } from "../assignments/AssignmentsList";
import { AssignmentWorkspace } from "../assignments/AssignmentWorkspace";
import { motion } from "framer-motion";

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
      'from-blue-500/10 to-indigo-500/10',
      'from-green-500/10 to-emerald-500/10',
      'from-purple-500/10 to-pink-500/10',
      'from-orange-500/10 to-red-500/10',
      'from-teal-500/10 to-cyan-500/10',
    ];
    // Use course.id to get a consistent gradient for each course
    const index = parseInt(course.id) % gradients.length;
    return gradients[index];
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card 
          className={`group relative overflow-hidden transition-all duration-300 backdrop-blur-lg bg-black/40 
            border-white/5 hover:border-[#9b87f5]/20`}
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

            <div className="flex items-center justify-between">
              <div className="space-y-3 w-full">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.assignments_count} assignments</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.pending_assignments} missing</span>
                  </div>
                </div>
              </div>
            </div>

            {isHovered && (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Button 
                  onClick={() => setShowAssignments(true)}
                  className="bg-[#9b87f5]/20 hover:bg-[#9b87f5]/40 text-[#9b87f5] flex items-center gap-2"
                >
                  View Assignments
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>

      {showAssignments && (
        <motion.div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl"
          >
            <Card className="w-full glass">
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
                <div className="flex items-center space-x-2">
                  <BarChart className="h-5 w-5 text-[#9b87f5]" />
                  <h2 className="text-xl font-semibold">
                    {nickname || course.name}
                  </h2>
                </div>
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
          </motion.div>
        </motion.div>
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
