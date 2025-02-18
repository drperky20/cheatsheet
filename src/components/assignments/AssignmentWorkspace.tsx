import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Wand2, Save, Send, RotateCcw, FileText } from "lucide-react";
import { extractGoogleDocLinks, sanitizeHTML } from "@/utils/docProcessor";
import { AssignmentQualityControls } from "./AssignmentQualityControls";
import { AssignmentEditor } from "./AssignmentEditor";
import { AssignmentQualityConfig } from "@/types/assignment";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

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
  const [generating, setGenerating] = useState(false);
  const [improving, setImproving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [googleDocs, setGoogleDocs] = useState<string[]>([]);
  const [processingDocs, setProcessingDocs] = useState(false);
  const [qualityConfig, setQualityConfig] = useState<AssignmentQualityConfig>({
    targetGrade: 'B',
    selectedFlaws: [],
    writingStyle: 'mixed',
    confidenceLevel: 75
  });

  useEffect(() => {
    const links = extractGoogleDocLinks(assignment.description);
    setGoogleDocs(links);
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
        font: 'Roboto'
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

      toast.success("Assignment submitted successfully!");
      onClose();
    } catch (error) {
      console.error('Submission error:', error);
      toast.error("Failed to submit assignment");
    } finally {
      setSubmitting(false);
    }
  };

  const processGoogleDocs = async () => {
    if (googleDocs.length === 0) {
      toast.error("No Google Docs found in this assignment");
      return;
    }

    try {
      setProcessingDocs(true);
      
      for (const docUrl of googleDocs) {
        console.log("Processing Google Doc:", docUrl);
        
        const { data, error } = await supabase.functions.invoke('gemini-processor', {
          body: {
            content: `Process this Google Doc and provide a detailed analysis: ${docUrl}\n\nAssignment Context: ${assignment.name}\n\nAssignment Description: ${assignment.description}`,
            type: 'analyze_requirements'
          }
        });

        if (error) throw error;

        setContent(prev => {
          const newContent = `${prev}\n\n### Analysis of Google Doc (${docUrl}):\n${data.result}`;
          return newContent.trim();
        });
        
        toast.success("Google Doc processed successfully");
      }
    } catch (error) {
      console.error('Error processing Google Docs:', error);
      toast.error("Failed to process Google Docs");
    } finally {
      setProcessingDocs(false);
    }
  };

  const generateContent = async () => {
    try {
      setGenerating(true);
      const { data, error } = await supabase.functions.invoke('gemini-processor', {
        body: {
          content: assignment.description,
          type: 'generate_content',
          config: qualityConfig
        }
      });

      if (error) throw error;

      setHistory([...history, content]);
      setContent(data.result);
      toast.success("Content generated successfully");
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error("Failed to generate content");
    } finally {
      setGenerating(false);
    }
  };

  const improveWriting = async () => {
    if (!content) {
      toast.error("Please add some content first");
      return;
    }

    try {
      setImproving(true);
      const { data, error } = await supabase.functions.invoke('gemini-processor', {
        body: {
          content,
          type: 'improve_writing'
        }
      });

      if (error) throw error;

      setHistory([...history, content]);
      setContent(data.result);
      toast.success("Writing improved successfully");
    } catch (error) {
      console.error('Error improving writing:', error);
      toast.error("Failed to improve writing");
    } finally {
      setImproving(false);
    }
  };

  const undoChanges = () => {
    if (history.length > 0) {
      const previousContent = history[history.length - 1];
      setContent(previousContent);
      setHistory(history.slice(0, -1));
      toast.success("Changes reverted");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[90vh] glass overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{assignment.name}</h2>
            <p className="text-sm text-gray-400">Due {new Date(assignment.due_at).toLocaleDateString()}</p>
          </div>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-auto">
          <div className="space-y-2">
            <label className="text-sm font-medium">Assignment Description</label>
            <Card className="p-4 bg-black/40">
              <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(assignment.description) }} />
              
              {googleDocs.length > 0 && (
                <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <h3 className="text-sm font-medium text-blue-400 mb-2">
                    Found {googleDocs.length} Google Doc{googleDocs.length > 1 ? 's' : ''}
                  </h3>
                  <Button
                    onClick={processGoogleDocs}
                    disabled={processingDocs}
                    className="w-full bg-blue-500/20 hover:bg-blue-500/30"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {processingDocs ? "Processing Documents..." : "Process Google Docs"}
                  </Button>
                </div>
              )}
            </Card>
          </div>

          <AssignmentQualityControls onConfigChange={setQualityConfig} />

          <AssignmentEditor
            content={content}
            onChange={setContent}
            onImprove={improveWriting}
            onSave={handleSubmit}
            isLoading={submitting}
          />
        </div>

        <div className="p-4 border-t border-white/10 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => toast.success("Submission feature coming soon!")}>
            <Save className="w-4 h-4 mr-2" />
            Submit to Canvas
          </Button>
        </div>
      </Card>
    </div>
  );
};
