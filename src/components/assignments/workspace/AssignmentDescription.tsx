import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, Loader2, ExternalLink, BookOpen } from "lucide-react";
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
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <BookOpen className="w-5 h-5 text-[#9b87f5]" />
        <h3 className="text-lg font-medium text-gradient">Assignment Details</h3>
      </div>

      <Card className="neo-blur border-0 overflow-hidden transition-all duration-300 group hover:shadow-lg">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#9b87f5]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative z-10 p-6">
            <div 
              className="
                prose prose-invert max-w-none
                prose-p:text-gray-300 prose-headings:text-white/90
                prose-a:text-[#9b87f5] prose-a:no-underline hover:prose-a:text-[#8b77e5]
                prose-strong:text-white prose-strong:font-semibold
                prose-ul:text-gray-300 prose-ol:text-gray-300
                prose-li:marker:text-[#9b87f5]/70
              "
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(description) }} 
            />
          </div>
        </div>
        
        {externalLinks.length > 0 && (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
            
            <div className="relative z-10 p-6 space-y-4 bg-black/20 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#9b87f5]">
                  <Link className="w-5 h-5" />
                  <h3 className="text-base font-medium">
                    Found {externalLinks.length} external resource{externalLinks.length > 1 ? 's' : ''}
                  </h3>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onProcessLinks}
                  disabled={processingLinks}
                  className="
                    relative h-9 px-4
                    glass-morphism border-0
                    hover:bg-white/10 transition-all duration-300
                    text-white font-medium
                    hover:scale-105 transform
                    disabled:opacity-50 disabled:hover:scale-100
                    group/btn
                  "
                >
                  {processingLinks ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2 group-hover/btn:translate-x-0.5 transition-transform" />
                      Process Links
                    </>
                  )}
                </Button>
              </div>

              <div className="grid gap-2">
                {externalLinks.map((link, index) => (
                  <div 
                    key={index} 
                    className="
                      group/link relative overflow-hidden
                      flex items-center justify-between gap-3
                      p-4 rounded-xl
                      glass-morphism border-0
                      hover:bg-white/5 transition-all duration-300
                      cursor-pointer
                    "
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#9b87f5]/5 to-transparent opacity-0 group-hover/link:opacity-100 transition-opacity duration-300" />
                    
                    <div className="relative z-10 flex items-center gap-3 flex-1 min-w-0">
                      <div className={`
                        w-2 h-2 rounded-full
                        ${processingLinks 
                          ? 'bg-[#9b87f5] animate-pulse' 
                          : 'bg-gradient-to-r from-[#9b87f5] to-[#6366f1]'
                        }
                      `} />
                      <span className="truncate text-sm text-gray-300 group-hover/link:text-white transition-colors">
                        {link.url}
                      </span>
                    </div>
                    
                    <span className="
                      relative z-10 px-3 py-1 rounded-full text-xs font-medium
                      bg-white/5 text-[#9b87f5]
                      group-hover/link:bg-[#9b87f5]/10 transition-colors
                    ">
                      {link.type === 'google_doc' ? 'Google Doc' : 'External Link'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
