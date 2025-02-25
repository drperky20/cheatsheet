import React from 'react';
import { cn } from '@/lib/utils';

interface AssignmentDescriptionProps {
  description: string;
  className?: string;
}

export const AssignmentDescription: React.FC<AssignmentDescriptionProps> = ({
  description,
  className,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      <h2 className="text-xl font-semibold text-white/90">Description</h2>
      <div className="prose prose-invert prose-sm max-w-none">
        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
          <p className="text-white/80">{description}</p>
        </div>
      </div>
    </div>
  );
};
