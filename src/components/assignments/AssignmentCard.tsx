import React from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../ui/card';

interface AssignmentCardProps {
  title: string;
  description: string;
  status: string;
  dueDate?: string;
  onClick?: () => void;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({
  title,
  description,
  status,
  dueDate,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card
        className="cursor-pointer overflow-hidden group"
        onClick={onClick}
      >
        <CardHeader className="relative">
          <div className="absolute top-0 right-0 p-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white">
              {status}
            </span>
          </div>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
            {title}
          </CardTitle>
          {dueDate && (
            <CardDescription className="text-sm text-white/70">
              Due: {dueDate}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-white/80 line-clamp-2 group-hover:text-white transition-colors">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AssignmentCard;
