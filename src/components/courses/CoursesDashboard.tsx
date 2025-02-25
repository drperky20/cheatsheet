import React from 'react';
import { motion } from 'framer-motion';
import CourseCard from './CourseCard';

interface Course {
  id: string;
  title: string;
  description: string;
  progress: number;
}

interface CoursesDashboardProps {
  courses: Course[];
  onEnterCourse: (courseId: string) => void;
  onRenameCourse: (courseId: string) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const CoursesDashboard: React.FC<CoursesDashboardProps> = ({
  courses,
  onEnterCourse,
  onRenameCourse,
}) => {
  return (
    <div className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
      <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
        My Courses
      </h1>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {courses.map((course) => (
          <motion.div key={course.id} variants={item}>
            <CourseCard
              title={course.title}
              description={course.description}
              progress={course.progress}
              onEnter={() => onEnterCourse(course.id)}
              onRename={() => onRenameCourse(course.id)}
            />
          </motion.div>
        ))}
      </motion.div>

      {courses.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-white/60 text-lg">
            No courses yet. Start by creating your first course!
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default CoursesDashboard;
