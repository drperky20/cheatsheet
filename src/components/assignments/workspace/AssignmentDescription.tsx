
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReloadIcon } from "lucide-react";

interface AssignmentDescriptionProps {
  description: string;
  externalLinks: Array<{ url: string; type: string }>;
  onProcessLinks: () => void;
  processingLinks: boolean;
  onAnalyzeAssignment: () => void;
  isAnalyzing: boolean;
  onGenerateResponse: () => void;
  isGenerating: boolean;
}

export const AssignmentDescription = ({
  description,
  externalLinks,
  onProcessLinks,
  processingLinks,
  onAnalyzeAssignment,
  isAnalyzing,
  onGenerateResponse,
  isGenerating
}: AssignmentDescriptionProps) => {
  return (
    <div className="bg-black/40 rounded-lg p-4">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-white">Assignment Description</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onAnalyzeAssignment} 
            disabled={isAnalyzing}
            className="text-xs"
          >
            {isAnalyzing ? (
              <>
                <ReloadIcon className="mr-2 h-3 w-3 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Re-Analyze"
            )}
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={onGenerateResponse} 
            disabled={isGenerating}
            className="text-xs"
          >
            {isGenerating ? (
              <>
                <ReloadIcon className="mr-2 h-3 w-3 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Response"
            )}
          </Button>

          {externalLinks.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onProcessLinks} 
              disabled={processingLinks}
              className="text-xs"
            >
              {processingLinks ? (
                <>
                  <ReloadIcon className="mr-2 h-3 w-3 animate-spin" />
                  Processing...
                </>
              ) : (
                "Process Links"
              )}
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="description" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="links">External Links ({externalLinks.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="text-gray-300 prose-sm prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: description }} />
        </TabsContent>
        <TabsContent value="links">
          {externalLinks.length > 0 ? (
            <ul className="space-y-2 text-gray-300">
              {externalLinks.map((link, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-700">
                    {link.type === 'google_doc' ? 'Google Doc' : 'Link'}
                  </span>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm truncate">
                    {link.url}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No external links found in the assignment description.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
