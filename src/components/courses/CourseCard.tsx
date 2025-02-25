import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import Button from '../ui/button';

interface CourseCardProps {
  title: string;
  description: string;
  progress: number;
  onEnter?: () => void;
  onRename?: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  title,
  description,
  progress,
  onEnter,
  onRename,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card className="overflow-hidden group">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
              {title}
            </CardTitle>
            <Button
              variant="secondary"
              onClick={onRename}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Rename
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-white/70 mb-4">{description}</p>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-white/60">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              />
            </div>
          </div>

          <div className="mt-6">
            <Button
              onClick={onEnter}
              className="w-full bg-gradient-to-r from-blue-500/80 to-purple-500/80 hover:from-blue-500/90 hover:to-purple-500/90"
            >
              Enter Course
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CourseCard;
