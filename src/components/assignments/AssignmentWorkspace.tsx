
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AssignmentQualityConfig } from "@/types/assignment";
import pdfMake from "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
import { AssignmentHeader } from "./workspace/AssignmentHeader";
import { AssignmentDescription } from "./workspace/AssignmentDescription";
import { AssignmentContent } from "./workspace/AssignmentContent";

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

interface AssignmentWorkspaceProps {
  assignment: Assignment;
  onClose: () => void;
}

export const AssignmentWorkspace = ({ assignment, onClose }: AssignmentWorkspaceProps) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const [qualityConfig, setQualityConfig] = useState<AssignmentQualityConfig>({
    targetGrade: 'B',
    selectedFlaws: [],
    writingStyle: 'mixed',
    confidenceLevel: 75
  });

  const generatePDF = async (content: string) => {
    const docDefinition = {
      content: [
        {
          text: assignment.name,
          style: 'header'
        },
        {
          text: new Date().toLocaleDateString(),
          style: 'date'
        },
        {
          text: content,
          style: 'content'
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          marginBottom: 10
        },
        date: {
          fontSize: 12,
          marginBottom: 20,
          color: 'grey'
        },
        content: {
          fontSize: 12,
          lineHeight: 1.5
        }
      },
      defaultStyle: {
        font: 'Helvetica'
      }
    };

    return new Promise((resolve) => {
      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
      pdfDocGenerator.getBlob((blob) => {
        resolve(blob);
      });
    });
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Please add some content before submitting");
      return;
    }

    try {
      setSubmitting(true);
      
      const pdfBlob = await generatePDF(content);
      
      const formData = new FormData();
      formData.append('file', new File([pdfBlob as Blob], 'submission.pdf', { type: 'application/pdf' }));
      
      const { error } = await supabase.functions.invoke('canvas-proxy', {
        body: {
          endpoint: `/courses/${assignment.course_id}/assignments/${assignment.id}/submissions`,
          method: 'POST',
          formData: formData
        }
      });

      if (error) throw error;

      toast.success("Assignment submitted to Canvas successfully!");
      onClose();
    } catch (error) {
      console.error('Submission error:', error);
      toast.error("Failed to submit assignment to Canvas");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[90vh] glass overflow-hidden flex flex-col">
        <AssignmentHeader
          name={assignment.name}
          dueDate={assignment.due_at}
          onClose={onClose}
        />

        <div className="flex-1 p-4 space-y-4 overflow-auto">
          <AssignmentDescription
            description={assignment.description}
          />

          <AssignmentContent
            content={content}
            onContentChange={setContent}
            assignment={assignment}
            onSave={handleSubmit}
            isSubmitting={isSubmitting}
            qualityConfig={qualityConfig}
            onQualityConfigChange={setQualityConfig}
          />
        </div>
      </Card>
    </div>
  );
};
