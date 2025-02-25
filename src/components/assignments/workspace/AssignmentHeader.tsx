import React from 'react';
import { cn } from '@/lib/utils';

interface AssignmentHeaderProps {
  title: string;
  className?: string;
}

export const AssignmentHeader: React.FC<AssignmentHeaderProps> = ({
  title,
  className,
}) => {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
        {title}
      </h1>
    </div>
  );
};
