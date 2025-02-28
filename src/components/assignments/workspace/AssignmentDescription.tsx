
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "lucide-react";
import { sanitizeHTML } from "@/utils/docProcessor";

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
            <h3 className="text-sm font-medium text-blue-400 mb-2">
              Found {externalLinks.length} external link{externalLinks.length > 1 ? 's' : ''} in description
            </h3>
            <Button
              onClick={onProcessLinks}
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
  );
};
