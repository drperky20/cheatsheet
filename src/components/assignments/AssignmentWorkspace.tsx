import { useState, useEffect } from "react";
import { AssignmentHeader } from "./workspace/AssignmentHeader";
import { AssignmentDescription } from "./workspace/AssignmentDescription";
import { AssignmentContent } from "./workspace/AssignmentContent";
import { Card } from "@/components/ui/card";
import { AssignmentQualityConfig } from "@/types/assignment";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const [externalLinks, setExternalLinks] = useState<
    Array<{ url: string; type: "google_doc" | "external_link" }>
  >([]);
  const [processingLinks, setProcessingLinks] = useState(false);
  const [qualityConfig, setQualityConfig] = useState<AssignmentQualityConfig>({
    grade: "high_school",
    factualAccuracy: true,
    citationCount: 3,
    wordCount: 500,
  });

  useEffect(() => {
    // Extract links from assignment description
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
      // Simulate processing links with a real function call to Supabase
      await supabase.functions.invoke('analyze-links', {
        body: { 
          links: externalLinks,
          assignmentId: assignment.id
        }
      });

      toast.success("Successfully processed external resource content");
      // Here you would typically update the content with processed data
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
        .from('assignment_submissions')
        .upsert({
          assignment_id: assignment.id,
          course_id: assignment.course_id,
          content,
          status: 'draft',
          quality_config: qualityConfig
        });

      if (error) throw error;

      toast.success("Assignment saved successfully!");
    } catch (error) {
      console.error("Error saving assignment:", error);
      toast.error("Failed to save assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 overflow-auto animate-fadeIn">
      <div className="relative z-10 min-h-screen">
        {/* Background effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#9b87f5]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#D6BCFA]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-delay" />
        </div>

        {/* Content */}
        <div className="container max-w-7xl mx-auto">
          <div className="pt-24 pb-16">
            <AssignmentHeader
              name={assignment.name}
              dueDate={assignment.due_at}
              onClose={onClose}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 pb-12">
              <Card className="neo-blur border-0 overflow-hidden animate-slideInLeft">
                <AssignmentDescription
                  description={assignment.description}
                  externalLinks={externalLinks}
                  onProcessLinks={handleProcessLinks}
                  processingLinks={processingLinks}
                />
              </Card>

              <div className="space-y-6 animate-slideInRight">
                <AssignmentContent
                  content={content}
                  onContentChange={setContent}
                  assignment={assignment}
                  onSave={handleSave}
                  isSubmitting={isSubmitting}
                  qualityConfig={qualityConfig}
                  onQualityConfigChange={setQualityConfig}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};