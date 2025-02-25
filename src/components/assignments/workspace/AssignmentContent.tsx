
import { AssignmentQualityControls } from "../AssignmentQualityControls";
import { AssignmentEditor } from "../AssignmentEditor";
import { AssignmentQualityConfig } from "@/types/assignment";

interface Assignment {
  id: string;
  name: string;
  description: string;
  due_at: string;
  points_possible: number;
  submission_types: string[];
  workflow_state: string;
  html_url: string;
  course_id: number;
}

interface AssignmentContentProps {
  content: string;
  onContentChange: (content: string) => void;
  assignment: Assignment;
  onSave: () => Promise<void>;
  isSubmitting: boolean;
  qualityConfig: AssignmentQualityConfig;
  onQualityConfigChange: (config: AssignmentQualityConfig) => void;
}

export const AssignmentContent = ({
  content,
  onContentChange,
  assignment,
  onSave,
  isSubmitting,
  qualityConfig,
  onQualityConfigChange,
}: AssignmentContentProps) => {
  return (
    <>
      <AssignmentQualityControls onConfigChange={onQualityConfigChange} />
      <AssignmentEditor
        content={content}
        onChange={onContentChange}
        assignment={assignment}
        onSave={onSave}
        isSubmitting={isSubmitting}
      />
    </>
  );
};
