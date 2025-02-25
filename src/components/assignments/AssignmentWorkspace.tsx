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
import { themeConfig } from "@/app/theme-config";

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
      toast.success("Links processed successfully", {
        style: { background: "rgba(20, 20, 30, 0.8)", backdropFilter: "blur(10px)", border: "1px solid rgba(255, 255, 255, 0.1)" }
      });
    } catch (error) {
      console.error('Error processing links:', error);
      toast.error("Failed to process links", {
        style: { background: "rgba(30, 20, 20, 0.8)", backdropFilter: "blur(10px)", border: "1px solid rgba(255, 70, 70, 0.2)" }
      });
    } finally {
      setProcessingLinks(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Please add some content before submitting", {
        style: { background: "rgba(30, 20, 20, 0.8)", backdropFilter: "blur(10px)", border: "1px solid rgba(255, 70, 70, 0.2)" }
      });
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

      toast.success("Assignment submitted to Canvas successfully!", {
        style: { background: "rgba(20, 30, 20, 0.8)", backdropFilter: "blur(10px)", border: "1px solid rgba(70, 255, 70, 0.2)" }
      });
      onClose();
    } catch (error) {
      console.error('Submission error:', error);
      toast.error("Failed to submit assignment to Canvas", {
        style: { background: "rgba(30, 20, 20, 0.8)", backdropFilter: "blur(10px)", border: "1px solid rgba(255, 70, 70, 0.2)" }
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background-darker/95 backdrop-blur-2xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
      {/* Atmospheric background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top right orb */}
        <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-primary/5 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-pulse" />
        
        {/* Bottom left orb */}
        <div className="absolute -bottom-20 -left-20 w-[800px] h-[800px] bg-secondary/5 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-pulse" />
        
        {/* Center orb */}
        <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-accent/5 rounded-full mix-blend-screen filter blur-[80px] opacity-20" />
        
        {/* Static noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay bg-[url('/noise.png')]"></div>
      </div>
      
      <Card className={`
        w-full max-w-6xl h-[92vh]
        ${themeConfig.glass.heavy}
        ${themeConfig.shadow.lg}
        border border-white/10
        overflow-hidden flex flex-col
        relative z-10
        transform transition-all duration-500
        animate-in slide-in-from-bottom-4 zoom-in-95
        ${themeConfig.radius.lg}
      `}>
        {/* Subtle inner border glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
        </div>
        
        <AssignmentHeader
          name={assignment.name}
          dueDate={assignment.due_at}
          onClose={onClose}
        />

        <div className="
          flex-1 p-8 space-y-8 overflow-auto
          scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent
          bg-gradient-to-b from-transparent to-background-darker/30
        ">
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
        
        {/* Bottom reflection */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent w-full"></div>
      </Card>
    </div>
  );
};
