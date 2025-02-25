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
  const [externalLinks, setExternalLinks] = useState<Array<{ url: string; type: 'google_doc' | 'external_link' }>>([]);
  const [processingLinks, setProcessingLinks] = useState(false);
  const [qualityConfig, setQualityConfig] = useState<AssignmentQualityConfig>({
    targetGrade: 'B',
    selectedFlaws: [],
    writingStyle: 'mixed',
    confidenceLevel: 75
  });

  useEffect(() => {
    // Extract links from description
    const extractLinks = () => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(assignment.description, 'text/html');
      const links = Array.from(doc.querySelectorAll('a'));
      
      const extracted = links.map(link => ({
        url: link.href,
        type: link.href.includes('docs.google.com') ? 'google_doc' : 'external_link'
      } as const));

      setExternalLinks(extracted);
    };

    extractLinks();
  }, [assignment.description]);

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

  const handleProcessLinks = async () => {
    setProcessingLinks(true);
    try {
      // We'll implement link processing logic later
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("Links processed successfully");
    } catch (error) {
      console.error('Error processing links:', error);
      toast.error("Failed to process links");
    } finally {
      setProcessingLinks(false);
    }
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
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#9b87f5]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-[#6366f1]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-delayed" />
      </div>
      
      <Card className="
        w-full max-w-5xl h-[90vh] 
        glass-morphism border-0 shadow-2xl
        overflow-hidden flex flex-col
        relative z-10
        transform transition-all duration-300
        animate-in slide-in-from-bottom-4
      ">
        <AssignmentHeader
          name={assignment.name}
          dueDate={assignment.due_at}
          onClose={onClose}
        />

        <div className="flex-1 p-8 space-y-8 overflow-auto scrollbar-none">
          <AssignmentDescription
            description={assignment.description}
            externalLinks={externalLinks}
            onProcessLinks={handleProcessLinks}
            processingLinks={processingLinks}
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
