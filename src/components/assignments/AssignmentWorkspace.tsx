
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Send, RotateCcw, FileText, Link } from "lucide-react";
import { extractGoogleDocLinks, extractAllExternalLinks, sanitizeHTML } from "@/utils/docProcessor";
import { AssignmentQualityControls } from "./AssignmentQualityControls";
import { AssignmentEditor } from "./AssignmentEditor";
import { AssignmentQualityConfig } from "@/types/assignment";
import pdfMake from "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";

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
  const [processingLinks, setProcessingLinks] = useState(false);
  const [externalLinks, setExternalLinks] = useState<Array<{ url: string; type: 'google_doc' | 'external_link' }>>([]);
  const [qualityConfig, setQualityConfig] = useState<AssignmentQualityConfig>({
    targetGrade: 'B',
    selectedFlaws: [],
    writingStyle: 'mixed',
    confidenceLevel: 75
  });

  useEffect(() => {
    // Only extract links from the assignment description
    if (assignment.description) {
      const links = extractAllExternalLinks(assignment.description);
      setExternalLinks(links);
    }
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

  const processExternalLinks = async () => {
    if (externalLinks.length === 0) {
      toast.error("No external links found in the assignment description");
      return;
    }

    try {
      setProcessingLinks(true);
      
      for (const link of externalLinks) {
        const { data, error } = await supabase.functions.invoke('browser-processor', {
          body: {
            url: link.url,
            type: link.type
          }
        });

        if (error) throw error;

        if (data.success) {
          setContent(prev => {
            const newContent = `${prev}\n\n### Content from ${link.url}:\n${data.content}`;
            return newContent.trim();
          });
          
          toast.success(`Processed ${link.type === 'google_doc' ? 'Google Doc' : 'external link'} successfully`);
        }
      }
    } catch (error) {
      console.error('Error processing external links:', error);
      toast.error("Failed to process external links");
    } finally {
      setProcessingLinks(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[90vh] glass overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div>
            <h2 className="text-xl font-semibold text-white">{assignment.name}</h2>
            <p className="text-sm text-gray-400">Due {new Date(assignment.due_at).toLocaleDateString()}</p>
          </div>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-auto">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Assignment Description</label>
            <Card className="p-4 bg-black/40 border-white/10">
              <div 
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(assignment.description) }} 
              />
              
              {externalLinks.length > 0 && (
                <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <h3 className="text-sm font-medium text-blue-400 mb-2">
                    Found {externalLinks.length} external link{externalLinks.length > 1 ? 's' : ''} in description
                  </h3>
                  <Button
                    onClick={processExternalLinks}
                    disabled={processingLinks}
                    className="w-full bg-blue-500/20 hover:bg-blue-500/30"
                  >
                    <Link className="w-4 h-4 mr-2" />
                    {processingLinks ? "Processing Links..." : "Process External Links"}
                  </Button>
                </div>
              )}
            </Card>
          </div>

          <AssignmentQualityControls onConfigChange={setQualityConfig} />

          <AssignmentEditor
            content={content}
            onChange={setContent}
            assignment={assignment}
            onSave={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </Card>
    </div>
  );
};
