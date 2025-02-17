
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourseCardProps {
  course: {
    id: string;
    name: string;
    nickname?: string;
    course_code: string;
    assignments_count: number;
    pending_assignments: number;
  };
}

export const CourseCard = ({ course }: CourseCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const progressValue = course.assignments_count > 0 
    ? ((course.assignments_count - course.pending_assignments) / course.assignments_count) * 100
    : 0;

  const getRandomGradient = () => {
    const gradients = [
      'from-blue-400 to-indigo-500',
      'from-green-400 to-emerald-500',
      'from-purple-400 to-pink-500',
      'from-orange-400 to-red-500',
      'from-teal-400 to-cyan-500',
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-300 backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 
        ${isHovered ? 'transform scale-[1.02]' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${getRandomGradient()}`} />
      
      <div className="relative p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{course.nickname || course.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{course.course_code}</p>
          </div>
          <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
            <Edit2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(progressValue)}%</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
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
          <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-sm transition-opacity duration-200">
            <Button className="bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800">
              View Assignments
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
