
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AssignmentQualityConfig } from "@/types/assignment";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Save, Sparkles, Send, FileText, PenTool, BookOpen, Loader2, RefreshCw } from "lucide-react";
import { AssignmentHeader } from "./workspace/AssignmentHeader";
import { AssignmentEditor } from "./AssignmentEditor";
import { AssignmentQualityControls } from "./AssignmentQualityControls";

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
  onComplete?: () => void;
}

export const AssignmentWorkspace = ({
  assignment,
  onClose,
  onComplete,
}: AssignmentWorkspaceProps) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [externalLinks, setExternalLinks] = useState<
    Array<{ url: string; type: "google_doc" | "external_link" }>
  >([]);
  const [processingLinks, setProcessingLinks] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");
  const [qualityConfig, setQualityConfig] = useState<AssignmentQualityConfig>({
    targetGrade: 'A',
    selectedFlaws: [],
    writingStyle: 'formal',
    confidenceLevel: 75
  });

  const handleAnalyzeAssignment = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-processor', {
        body: {
          type: 'analyze_requirements',
          content: assignment.description
        }
      });

      if (error) throw error;

      // Update the editor content with the analysis
      setContent((prevContent) => {
        const newAnalysis = data.result || "";
        return prevContent ? `${prevContent}\n\n${newAnalysis}` : newAnalysis;
      });
      
      toast.success("Assignment requirements analyzed successfully");
    } catch (error) {
      console.error("Error analyzing assignment:", error);
      toast.error("Failed to analyze assignment requirements");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const extractLinks = () => {
      const linkRegex = /(https?:\/\/[^\s"]+)/g;
      const matches = assignment.description.match(linkRegex) || [];

      const processedLinks = matches.map(url => ({
        url,
        type: url.includes("docs.google.com") ? "google_doc" : "external_link"
      } as { url: string; type: "google_doc" | "external_link" }));

      setExternalLinks(processedLinks);
    };

    extractLinks();
  }, [assignment.description]);

  const handleProcessLinks = async () => {
    setProcessingLinks(true);

    try {
      await supabase.functions.invoke('analyze-links', {
        body: { 
          links: externalLinks,
          assignmentId: assignment.id
        }
      });

      toast.success("External resources analyzed successfully");
      setContent(prev => 
        prev + "\n\n### External Resources Summary\nThe content from external resources has been analyzed and integrated into this response."
      );
    } catch (error) {
      console.error("Error processing links:", error);
      toast.error("Failed to process external resources");
    } finally {
      setProcessingLinks(false);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('submissions')
        .upsert({
          assignment_id: assignment.id,
          content,
          status: 'draft',
          quality_config: qualityConfig
        });

      if (error) throw error;

      toast.success("Assignment saved successfully!");
      if (onComplete) onComplete();
    } catch (error) {
      console.error("Error saving assignment:", error);
      toast.error("Failed to save assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateResponse = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-processor', {
        body: {
          type: 'generate_assignment_response',
          assignment: {
            description: assignment.description,
            name: assignment.name,
            qualityConfig
          }
        }
      });

      if (error) throw error;
      
      const generatedContent = data.content || "";
      setContent((prevContent) => {
        return prevContent ? `${prevContent}\n\n${generatedContent}` : generatedContent;
      });
      
      toast.success("Response generated successfully");
    } catch (error) {
      console.error("Error generating response:", error);
      toast.error("Failed to generate response");
    } finally {
      setIsGenerating(false);
    }
  };

  const sanitizeHTML = (html: string) => {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/g, '');
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-black via-[#121212] to-[#0a0a0a] overflow-auto animate-fadeIn">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#9b87f5]/10 rounded-full mix-blend-plus-lighter filter blur-3xl opacity-30 animate-float" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#D6BCFA]/10 rounded-full mix-blend-plus-lighter filter blur-3xl opacity-30 animate-float-delay" />
      </div>

      <div className="container relative z-10 max-w-screen-2xl mx-auto">
        <div className="pt-6 pb-16">
          <AssignmentHeader
            name={assignment.name}
            dueDate={assignment.due_at}
            onClose={onClose}
          />

          <div className="p-6 space-y-6">
            <Button
              variant="ghost"
              onClick={onClose}
              className="group flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to assignments</span>
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6 animate-slideInLeft">
                <Card className="neo-blur border-0 overflow-hidden shadow-lg">
                  <div className="p-6 border-b border-white/10 bg-gradient-to-r from-black/60 to-black/40">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-[#9b87f5]" />
                        <h3 className="text-lg font-semibold text-gradient">Assignment Details</h3>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAnalyzeAssignment}
                        disabled={isAnalyzing}
                        className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Re-Analyze
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-6 max-h-[60vh] overflow-y-auto scrollbar-styled">
                    <div 
                      className="
                        prose prose-invert max-w-none
                        prose-p:text-gray-300 prose-headings:text-white/90
                        prose-a:text-[#9b87f5] prose-a:no-underline hover:prose-a:text-[#8b77e5]
                        prose-strong:text-white prose-strong:font-semibold
                        prose-ul:text-gray-300 prose-ol:text-gray-300
                        prose-li:marker:text-[#9b87f5]/70
                      "
                      dangerouslySetInnerHTML={{ __html: sanitizeHTML(assignment.description) }} 
                    />
                    
                    {externalLinks.length > 0 && (
                      <div className="mt-6 p-4 border border-white/10 rounded-xl bg-white/5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2 text-[#9b87f5]">
                            <FileText className="w-4 h-4" />
                            <h3 className="text-base font-medium">
                              {externalLinks.length} External Resource{externalLinks.length > 1 ? 's' : ''}
                            </h3>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleProcessLinks}
                            disabled={processingLinks}
                            className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
                          >
                            {processingLinks ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Analyze
                              </>
                            )}
                          </Button>
                        </div>
                        
                        {externalLinks.map((link, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white py-2 transition-colors">
                            <div className="w-2 h-2 rounded-full bg-[#9b87f5]" />
                            <a 
                              href={link.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="truncate hover:text-[#9b87f5] transition-colors"
                            >
                              {link.url}
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
                
                <Card className="neo-blur border-0 overflow-hidden shadow-lg p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Points Possible:</span>
                    <span className="font-semibold text-gradient">{assignment.points_possible}</span>
                  </div>
                </Card>
              </div>

              <div className="lg:col-span-2 space-y-6 animate-slideInRight">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-2 neo-blur border-0">
                    <TabsTrigger value="editor" className="data-[state=active]:bg-[#9b87f5]/20">
                      <PenTool className="w-4 h-4 mr-2" />
                      Editor
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="data-[state=active]:bg-[#9b87f5]/20">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Quality Settings
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="editor" className="mt-4">
                    <Card className="neo-blur border-0 overflow-hidden transition-all duration-300 hover:shadow-xl">
                      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-black/60 to-black/40">
                        <h3 className="text-lg font-semibold text-gradient">
                          Assignment Response
                        </h3>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleGenerateResponse}
                            disabled={isGenerating}
                            className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Generate Response
                              </>
                            )}
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSave}
                            disabled={isSubmitting || !content}
                            className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Draft
                              </>
                            )}
                          </Button>
                          
                          <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={isSubmitting || !content}
                            className="bg-gradient-to-r from-[#9b87f5] to-[#6366f1] hover:from-[#8b77e5] hover:to-[#5356e1] text-white border-0"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Submit
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <AssignmentEditor
                          content={content}
                          onChange={setContent}
                          assignment={assignment}
                          onSave={handleSave}
                          isSubmitting={isSubmitting}
                        />
                      </div>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="settings" className="mt-4">
                    <Card className="neo-blur border-0 overflow-hidden transition-all duration-300 hover:shadow-xl">
                      <div className="p-6 border-b border-white/5 bg-gradient-to-r from-black/60 to-black/40">
                        <h3 className="text-lg font-semibold text-gradient">
                          Quality Settings
                        </h3>
                      </div>
                      
                      <div className="p-6">
                        <AssignmentQualityControls onConfigChange={setQualityConfig} />
                      </div>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
