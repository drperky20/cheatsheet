
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, Loader2, ExternalLink } from "lucide-react";
import { sanitizeHTML } from "@/utils/docProcessor";
import { toast } from "sonner";

interface AssignmentDescriptionProps {
  description: string;
  externalLinks: Array<{ url: string; type: 'google_doc' | 'external_link' }>;
  onProcessLinks: () => Promise<void>;
  processingLinks: boolean;
}

export const AssignmentDescription = ({
  description,
  externalLinks = [],
  onProcessLinks = async () => {},
  processingLinks = false
}: AssignmentDescriptionProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gradient">Assignment Details</label>
      <Card className="neo-blur border-white/5 overflow-hidden">
        <div className="p-6">
          <div 
            className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-white/90"
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(description) }} 
          />
        </div>
        
        {externalLinks.length > 0 && (
          <div className="mt-2 p-4 bg-white/5 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-[#9b87f5]">
                <span className="flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  Found {externalLinks.length} external resource{externalLinks.length > 1 ? 's' : ''}
                </span>
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={onProcessLinks}
                disabled={processingLinks}
                className="h-8 bg-black/20 hover:bg-black/40 transition-colors"
              >
                {processingLinks ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Process Links
                  </>
                )}
              </Button>
            </div>
            <div className="space-y-2">
              {externalLinks.map((link, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between gap-2 p-3 rounded-lg bg-black/20 hover:bg-black/30 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`w-2 h-2 rounded-full ${
                      processingLinks ? 'bg-[#9b87f5] animate-pulse' : 'bg-[#9b87f5]/80'
                    }`} />
                    <span className="truncate text-sm text-gray-300">{link.url}</span>
                  </div>
                  <span className="text-xs text-[#9b87f5]/80 font-medium">
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
