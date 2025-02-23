
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, Loader2, ExternalLink } from "lucide-react";
import { sanitizeHTML } from "@/utils/docProcessor";
import { toast } from "sonner";
import { useEffect } from "react";

interface AssignmentDescriptionProps {
  description: string;
  externalLinks: Array<{ url: string; type: 'google_doc' | 'external_link' }>;
  onProcessLinks: () => Promise<void>;
  processingLinks: boolean;
}

export const AssignmentDescription = ({
  description,
  externalLinks,
  onProcessLinks,
  processingLinks
}: AssignmentDescriptionProps) => {
  const handleProcessLinks = async () => {
    try {
      await onProcessLinks();
    } catch (error) {
      console.error('Error processing links:', error);
      toast.error("Failed to process external links");
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white">Assignment Description</label>
      <Card className="p-4 bg-black/40 border-white/10">
        <div 
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizeHTML(description) }} 
        />
        
        {externalLinks.length > 0 && (
          <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-blue-400">
                <span className="flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  Found {externalLinks.length} external link{externalLinks.length > 1 ? 's' : ''}
                </span>
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleProcessLinks}
                disabled={processingLinks}
                className="h-8"
              >
                {processingLinks ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Analyze Links
                  </>
                )}
              </Button>
            </div>
            <div className="text-xs text-gray-400 mt-1 space-y-1">
              {externalLinks.map((link, index) => (
                <div key={index} className="flex items-center justify-between gap-2 p-2 rounded bg-black/20">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`w-2 h-2 rounded-full ${processingLinks ? 'bg-blue-500 animate-pulse' : 'bg-blue-400'}`} />
                    <span className="truncate">{link.url}</span>
                  </div>
                  <span className="text-xs text-blue-400/80">
                    {link.type === 'google_doc' ? 'Google Doc' : 'External Link'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
