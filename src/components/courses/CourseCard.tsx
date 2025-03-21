import { useState } from "react";
import { Card } from "@/components/ui/card";
import { BookOpen, Clock, ArrowRight, BarChart, Sparkles } from "lucide-react";
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
      'from-indigo-600/30 to-violet-800/30',
      'from-emerald-600/30 to-teal-800/30',
      'from-pink-600/30 to-purple-800/30',
      'from-amber-500/30 to-orange-800/30',
      'from-cyan-600/30 to-blue-800/30',
    ];
    const index = parseInt(course.id) % gradients.length;
    return gradients[index];
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        whileHover={{ y: -5 }}
        className="h-full"
      >
        <Card 
          className="group relative overflow-hidden transition-all duration-300 backdrop-blur-lg 
            bg-black/50 border-white/5 hover:border-[#9b87f5]/30 shadow-lg hover:shadow-[#9b87f5]/10 
            hover:shadow-xl rounded-xl h-full flex flex-col"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${getRandomGradient()} opacity-100`} />
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#9b87f5]/10 rounded-full mix-blend-overlay filter blur-xl -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#D6BCFA]/10 rounded-full mix-blend-overlay filter blur-xl -ml-10 -mb-10" />
          
          <div className="relative p-6 space-y-4 flex-1 flex flex-col">
            <div className="flex items-start justify-between">
              <CourseRename 
                courseId={course.id}
                currentName={course.name}
                nickname={nickname}
                onUpdate={setNickname}
              />
              <div className="bg-white/10 p-1.5 rounded-full">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
            </div>

            <div className="flex items-center justify-between flex-1">
              <div className="space-y-3 w-full">
                <div className="flex items-center justify-between text-sm text-gray-300">
                  <div className="flex items-center space-x-1.5 backdrop-blur-sm bg-white/5 px-2 py-1 rounded-lg">
                    <BookOpen className="w-3.5 h-3.5 text-[#9b87f5]" />
                    <span>{course.assignments_count} assignments</span>
                  </div>
                  <div className="flex items-center space-x-1.5 backdrop-blur-sm bg-white/5 px-2 py-1 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-[#9b87f5]" />
                    <span>{course.pending_assignments} missing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isHovered && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black/80 to-black/95 backdrop-blur-md z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Button 
                onClick={() => setShowAssignments(true)}
                className="bg-gradient-to-r from-[#9b87f5] to-[#8b5cf6] hover:from-[#9b87f5]/90 hover:to-[#8b5cf6]/90 text-white flex items-center gap-2 px-5 py-6 rounded-xl shadow-lg shadow-purple-900/20 transition-all duration-300 hover:scale-105"
              >
                View Assignments
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </Card>
      </motion.div>

      {showAssignments && (
        <motion.div 
          className="fixed inset-0 bg-black/90 z-40 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-3xl"
          >
            <Card className="w-full rounded-2xl border border-[#9b87f5]/20 bg-[#1A1F2C] shadow-xl shadow-purple-900/10 overflow-hidden">
              <div className="p-4 border-b border-[#9b87f5]/20 flex items-center justify-between bg-gradient-to-r from-[#1A1F2C] to-[#9b87f5]/10 rounded-t-2xl">
                <div className="flex items-center space-x-3">
                  <div className="bg-[#9b87f5]/20 p-2 rounded-lg">
                    <BarChart className="h-5 w-5 text-[#9b87f5]" />
                  </div>
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {nickname || course.name}
                  </h2>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowAssignments(false)} 
                  className="rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-colors"
                >
                  Close
                </Button>
              </div>
              <div className="p-4 bg-gradient-to-br from-black/50 to-[#1A1F2C]/90">
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
