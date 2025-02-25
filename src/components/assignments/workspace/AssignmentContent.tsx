import React from 'react';
import { cn } from '@/lib/utils';

interface AssignmentContentProps {
  content: string;
  className?: string;
}

export const AssignmentContent: React.FC<AssignmentContentProps> = ({
  content,
  className,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      <h2 className="text-xl font-semibold text-white/90">Content</h2>
      <div className="h-full">
        <div className="min-h-[200px] bg-white/5 p-4 rounded-lg border border-white/10">
          <pre className="whitespace-pre-wrap text-white/80 font-mono text-sm">
            {content}
          </pre>
        </div>
      </div>
    </div>
  );
};
