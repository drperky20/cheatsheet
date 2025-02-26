
import { CourseCard } from "./CourseCard";

const courses = [
  {
    title: "Introduction to React",
    description: "Learn the fundamentals of React and modern web development",
    progress: 75,
    students: 234,
    duration: "8 weeks",
    category: "Web Development"
  },
  {
    title: "Advanced TypeScript",
    description: "Master TypeScript features and best practices",
    progress: 45,
    students: 189,
    duration: "6 weeks",
    category: "Programming"
  },
  // Add more courses as needed
];

export function CourseGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course, index) => (
        <CourseCard key={index} {...course} />
      ))}
    </div>
  );
}
