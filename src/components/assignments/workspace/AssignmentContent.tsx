import { AssignmentQualityControls } from "../AssignmentQualityControls";
import { AssignmentEditor } from "../AssignmentEditor";
import { AssignmentQualityConfig } from "@/types/assignment";
import { Card } from "@/components/ui/card";

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
    <div className="space-y-6">
      <Card className="neo-blur p-6 border-0">
        <h3 className="text-lg font-semibold mb-4 text-gradient">
          Quality Controls
        </h3>
        <AssignmentQualityControls onConfigChange={onQualityConfigChange} />
      </Card>

      <Card className="neo-blur border-0 overflow-hidden transition-all duration-300 hover:shadow-lg">
        <h3 className="text-lg font-semibold p-6 border-b border-white/5 text-gradient bg-gradient-to-r from-black/60 to-black/40">
          Editor
        </h3>
        <div className="p-6">
          <AssignmentEditor
            content={content}
            onChange={onContentChange}
            assignment={assignment}
            onSave={onSave}
            isSubmitting={isSubmitting}
          />
        </div>
      </Card>
    </div>
  );
};
