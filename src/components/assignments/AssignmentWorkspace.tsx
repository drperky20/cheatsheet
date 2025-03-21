
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Wand2, 
  Save, 
  Send, 
  RotateCcw, 
  FileText, 
  X, 
  FileQuestion, 
  Settings, 
  Pencil,
  CheckCircle,
  ArrowLeft
} from "lucide-react";
import { extractGoogleDocLinks, sanitizeHTML } from "@/utils/docProcessor";
import { AssignmentQualityControls } from "./AssignmentQualityControls";
import { AssignmentEditor } from "./AssignmentEditor";
import { AssignmentQualityConfig } from "@/types/assignment";
import pdfMake from "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [activeTab, setActiveTab] = useState("requirements");
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
    } catch (error) {
      console.error('Error processing Google Docs:', error);
      toast.error("Failed to process Google Docs");
    } finally {
      setProcessingDocs(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col"
        >
          <Card className="h-full glass overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/60">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={onClose} className="mr-2 p-2 h-10 w-10">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h2 className="text-xl font-semibold text-white">{assignment.name}</h2>
                  <p className="text-sm text-[#9b87f5]/80">Due {new Date(assignment.due_at).toLocaleDateString()}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                onClick={onClose} 
                className="h-8 w-8 p-0 rounded-full bg-white/5 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              <Tabs 
                defaultValue="requirements" 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <TabsList className="justify-start p-1 m-2 bg-black/20 border border-white/5 rounded-lg">
                  <TabsTrigger 
                    value="requirements"
                    className="data-[state=active]:bg-[#9b87f5]/20 data-[state=active]:text-[#9b87f5] data-[state=active]:shadow-none rounded-md"
                  >
                    <FileQuestion className="h-4 w-4 mr-2" />
                    Requirements
                  </TabsTrigger>
                  <TabsTrigger 
                    value="ai-settings"
                    className="data-[state=active]:bg-[#9b87f5]/20 data-[state=active]:text-[#9b87f5] data-[state=active]:shadow-none rounded-md"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    AI Settings
                  </TabsTrigger>
                  <TabsTrigger 
                    value="write"
                    className="data-[state=active]:bg-[#9b87f5]/20 data-[state=active]:text-[#9b87f5] data-[state=active]:shadow-none rounded-md"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Write
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="requirements" className="flex-1 p-4 space-y-4 overflow-auto m-0 mt-0">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-white mb-2">Assignment Details</h3>
                    <Card className="p-6 bg-black/20 border-white/10">
                      <div 
                        className="prose prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: sanitizeHTML(assignment.description) }} 
                      />
                      
                      {googleDocs.length > 0 && (
                        <motion.div 
                          className="mt-6 p-4 bg-[#9b87f5]/5 rounded-lg border border-[#9b87f5]/20"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <h3 className="text-sm font-medium text-[#9b87f5] mb-2 flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            Found {googleDocs.length} Google Doc{googleDocs.length > 1 ? 's' : ''}
                          </h3>
                          <Button
                            onClick={processGoogleDocs}
                            disabled={processingDocs}
                            className="w-full bg-[#9b87f5]/10 hover:bg-[#9b87f5]/20 text-[#9b87f5]"
                          >
                            {processingDocs ? (
                              <>
                                <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                                Processing Documents...
                              </>
                            ) : (
                              <>
                                <FileText className="w-4 h-4 mr-2" />
                                Process Google Docs
                              </>
                            )}
                          </Button>
                        </motion.div>
                      )}
                    </Card>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      onClick={() => setActiveTab("ai-settings")}
                      className="bg-white/5 hover:bg-white/10 text-white"
                    >
                      Next: AI Settings
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="ai-settings" className="flex-1 p-4 space-y-4 overflow-auto m-0 mt-0">
                  <h3 className="text-lg font-medium text-white mb-2">AI Settings</h3>
                  <AssignmentQualityControls onConfigChange={setQualityConfig} />
                  
                  <div className="flex justify-between space-x-2 pt-4">
                    <Button 
                      onClick={() => setActiveTab("requirements")}
                      variant="outline"
                    >
                      Back to Requirements
                    </Button>
                    <Button 
                      onClick={() => setActiveTab("write")}
                      className="bg-[#9b87f5] hover:bg-[#9b87f5]/80"
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate Response
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="write" className="flex-1 overflow-hidden m-0 mt-0">
                  <AssignmentEditor
                    content={content}
                    onChange={setContent}
                    assignment={assignment}
                    onSave={handleSubmit}
                    isSubmitting={isSubmitting}
                    qualityConfig={qualityConfig}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {activeTab === "write" && (
              <div className="p-3 border-t border-white/10 bg-black/40 flex items-center justify-between space-x-2">
                <Button 
                  onClick={() => setActiveTab("ai-settings")}
                  variant="outline"
                  size="sm"
                >
                  Back to Settings
                </Button>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !content.trim()}
                    className="bg-[#9b87f5] hover:bg-[#9b87f5]/80"
                    size="sm"
                  >
                    {isSubmitting ? (
                      <>
                        <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit to Canvas
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
