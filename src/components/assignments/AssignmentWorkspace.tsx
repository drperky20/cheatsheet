
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Wand2, Save, Send, RotateCcw, FileText, FileQuestion, FilePen, CheckCircle, Copy } from "lucide-react";
import { extractGoogleDocLinks, sanitizeHTML } from "@/utils/docProcessor";
import { AssignmentQualityControls } from "./AssignmentQualityControls";
import { AssignmentEditor } from "./AssignmentEditor";
import { AssignmentQualityConfig } from "@/types/assignment";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [googleDocs, setGoogleDocs] = useState<string[]>([]);
  const [processingDocs, setProcessingDocs] = useState(false);
  const [qualityConfig, setQualityConfig] = useState<AssignmentQualityConfig>({
    targetGrade: 'B',
    selectedFlaws: [],
    writingStyle: 'mixed',
    confidenceLevel: 75
  });
  const [activeTab, setActiveTab] = useState("requirements");
  const [requirementsProcessed, setRequirementsProcessed] = useState(false);

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

  const processGoogleDocs = async () => {
    if (googleDocs.length === 0) {
      toast.error("No Google Docs found in this assignment");
      return;
    }

    try {
      setProcessingDocs(true);
      
      for (const docUrl of googleDocs) {
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
      setRequirementsProcessed(true);
    } catch (error) {
      console.error('Error processing Google Docs:', error);
      toast.error("Failed to process Google Docs");
    } finally {
      setProcessingDocs(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content)
      .then(() => toast.success("Content copied to clipboard"))
      .catch(() => toast.error("Failed to copy content"));
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl h-[95vh] glass overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div>
            <h2 className="text-xl font-semibold text-white">{assignment.name}</h2>
            <p className="text-sm text-gray-400">Due {new Date(assignment.due_at).toLocaleDateString()}</p>
          </div>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 pt-2 bg-black/30 border-b border-white/10">
            <TabsList className="bg-black/30 w-full justify-start">
              <TabsTrigger value="requirements" className="flex items-center gap-2 data-[state=active]:bg-white/10">
                <FileQuestion className="w-4 h-4" />
                Requirements
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-white/10">
                <Wand2 className="w-4 h-4" />
                AI Settings
              </TabsTrigger>
              <TabsTrigger value="editor" className="flex items-center gap-2 data-[state=active]:bg-white/10">
                <FilePen className="w-4 h-4" />
                Write
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-auto">
            <TabsContent value="requirements" className="p-4 m-0 h-full">
              <div className="space-y-4 h-full flex flex-col">
                <Card className="p-4 bg-black/40 border-white/10 flex-1 overflow-auto">
                  <div 
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: sanitizeHTML(assignment.description) }} 
                  />
                </Card>
                
                {googleDocs.length > 0 && (
                  <div className="bg-blue-500/10 rounded-lg border border-blue-500/20 p-4">
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
                
                <div className="flex justify-end">
                  <Button 
                    onClick={() => setActiveTab("settings")}
                    className="bg-[#9b87f5] hover:bg-[#8b77e5]"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Next: Configure AI
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="p-4 m-0 h-full">
              <div className="h-full flex flex-col space-y-4">
                <AssignmentQualityControls onConfigChange={setQualityConfig} />
                
                <div className="flex justify-between mt-auto">
                  <Button 
                    onClick={() => setActiveTab("requirements")}
                    variant="outline"
                  >
                    Back to Requirements
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("editor")}
                    className="bg-[#9b87f5] hover:bg-[#8b77e5]"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Next: Write
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="editor" className="p-0 m-0 h-full flex flex-col">
              <div className="p-4 flex-1 overflow-auto">
                <AssignmentEditor
                  content={content}
                  onChange={setContent}
                  assignment={assignment}
                  onSave={handleSubmit}
                  isSubmitting={isSubmitting}
                  qualityConfig={qualityConfig}
                />
              </div>
              
              <div className="p-4 border-t border-white/10 bg-black/30 flex justify-between">
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setActiveTab("settings")}
                    variant="outline"
                  >
                    Back to Settings
                  </Button>
                  <Button 
                    onClick={copyToClipboard} 
                    variant="secondary"
                    disabled={!content.trim()}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !content.trim()}
                  className="bg-[#9b87f5] hover:bg-[#8b77e5]"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Submitting..." : "Submit to Canvas"}
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
};
