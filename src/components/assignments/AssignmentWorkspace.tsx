import React from 'react';
import { motion } from 'framer-motion';
import { AssignmentHeader } from './workspace/AssignmentHeader';
import { AssignmentDescription } from './workspace/AssignmentDescription';
import { AssignmentContent } from './workspace/AssignmentContent';
import Button from '../ui/button';

interface AssignmentWorkspaceProps {
  assignment: {
    title: string;
    description: string;
    content: string;
  };
  onSave?: () => void;
  onClose?: () => void;
}

const AssignmentWorkspace: React.FC<AssignmentWorkspaceProps> = ({
  assignment,
  onSave,
  onClose,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full flex flex-col gap-4 p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20"
    >
      <AssignmentHeader
        title={assignment.title}
        className="border-b border-white/10 pb-4"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow overflow-hidden">
        <AssignmentDescription
          description={assignment.description}
          className="h-full overflow-auto p-4 bg-white/5 rounded-xl"
        />
        <AssignmentContent
          content={assignment.content}
          className="h-full overflow-auto p-4 bg-white/5 rounded-xl"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
        <Button
          variant="secondary"
          onClick={onClose}
          className="hover:bg-white/15"
        >
          Close
        </Button>
        <Button
          onClick={onSave}
          className="bg-gradient-to-r from-blue-500/80 to-purple-500/80 hover:from-blue-500/90 hover:to-purple-500/90"
        >
          Save Changes
        </Button>
      </div>
    </motion.div>
  );
};

export default AssignmentWorkspace;
