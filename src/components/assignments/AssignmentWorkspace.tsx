import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { extractAllExternalLinks } from "@/utils/docProcessor";
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

interface ProcessedLink {
  id: string;
  url: string;
  type: 'google_doc' | 'external_link';
  status: string;
  content: string | null;
  error: string | null;
  assignment_id: string;
  created_at: string;
  updated_at: string;
}

interface AutomationResult {
  id: string;
  task_id: string;
  url: string;
  status: string;
  result: any;
  error: string | null;
  created_at: string;
  updated_at: string;
  processed_link_id: string;
}

export const AssignmentWorkspace = ({ assignment, onClose }: AssignmentWorkspaceProps) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const [processingLinks, setProcessingLinks] = useState(false);
  const [externalLinks, setExternalLinks] = useState<Array<{ url: string; type: 'google_doc' | 'external_link' }>>([]);
  const [processedLinks, setProcessedLinks] = useState<ProcessedLink[]>([]);
  const [qualityConfig, setQualityConfig] = useState<AssignmentQualityConfig>({
    targetGrade: 'B',
    selectedFlaws: [],
    writingStyle: 'mixed',
    confidenceLevel: 75
  });

  useEffect(() => {
    if (assignment.description) {
      const links = extractAllExternalLinks(assignment.description);
      setExternalLinks(links);
      fetchProcessedLinks();
    }
  }, [assignment.description]);

  const fetchProcessedLinks = async () => {
    try {
      const { data: links, error } = await supabase
        .from('processed_links')
        .select('*')
        .eq('assignment_id', assignment.id);

      if (error) throw error;
      
      const validLinks = links?.filter((link): link is ProcessedLink => {
        return link.type === 'google_doc' || link.type === 'external_link';
      }) || [];

      setProcessedLinks(validLinks);
    } catch (error) {
      console.error('Error fetching processed links:', error);
      toast.error("Failed to fetch processed links");
    }
  };

  const pollAutomationResult = async (processedLinkId: string): Promise<AutomationResult> => {
    const maxAttempts = 30;
    let attempts = 0;

    const poll = async (): Promise<AutomationResult> => {
      const { data, error } = await supabase
        .from('processed_links')
        .select(`
          *,
          automation_results (*)
        `)
        .eq('id', processedLinkId)
        .single();

      if (error) throw error;

      const automationResult = data.automation_results[0];
      
      if (!automationResult) {
        if (attempts >= maxAttempts) {
          throw new Error('Processing timed out');
        }
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000));
        return poll();
      }

      if (automationResult.status === 'completed') {
        return automationResult;
      } else if (automationResult.status === 'failed') {
        throw new Error(automationResult.error || 'Processing failed');
      }

      if (attempts >= maxAttempts) {
        throw new Error('Processing timed out');
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1000));
      return poll();
    };

    return poll();
  };

  const processLink = async (url: string, type: 'google_doc' | 'external_link') => {
    try {
      const { data: processedLink, error: insertError } = await supabase
        .from('processed_links')
        .insert({
          url,
          type,
          status: 'processing',
          assignment_id: assignment.id
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const { data, error } = await supabase.functions.invoke('aws-processor', {
        body: { url, type, processedLinkId: processedLink.id }
      });

      if (error) throw error;

      try {
        const automationResult = await pollAutomationResult(processedLink.id);
        
        const { error: updateError } = await supabase
          .from('processed_links')
          .update({
            status: 'completed',
            content: automationResult.result?.content || null,
            error: null
          })
          .eq('id', processedLink.id);

        if (updateError) throw updateError;

        if (automationResult.result?.content) {
          setContent(prev => {
            const newContent = `${prev}\n\n### Content from ${url}:\n${automationResult.result.content}`;
            return newContent.trim();
          });
          toast.success(`Processed ${type === 'google_doc' ? 'Google Doc' : 'external link'} successfully`);
        }
      } catch (pollError) {
        const { error: updateError } = await supabase
          .from('processed_links')
          .update({
            status: 'failed',
            error: pollError.message
          })
          .eq('id', processedLink.id);

        if (updateError) console.error('Error updating processed link:', updateError);
        throw pollError;
      }

      fetchProcessedLinks();
    } catch (error) {
      console.error('Error processing link:', error);
      toast.error("Failed to process link");
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
        const existingProcessed = processedLinks.find(pl => pl.url === link.url && pl.status === 'completed');
        
        if (existingProcessed) {
          setContent(prev => {
            const newContent = `${prev}\n\n### Content from ${link.url}:\n${existingProcessed.content}`;
            return newContent.trim();
          });
          toast.success(`Using cached content for ${link.type === 'google_doc' ? 'Google Doc' : 'external link'}`);
        } else {
          await processLink(link.url, link.type);
        }
      }
    } catch (error) {
      console.error('Error processing external links:', error);
      toast.error("Failed to process external links");
    } finally {
      setProcessingLinks(false);
    }
  };

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
            externalLinks={externalLinks}
            onProcessLinks={processExternalLinks}
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
