
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BookOpen,
  GraduationCap,
  ArrowUpDown,
  Sparkles,
  PencilRuler,
  Wand2,
  Loader2
} from "lucide-react";

interface EditingToolbarProps {
  onStyleClick: () => void;
  onLengthClick: () => void;
  onImproveClick: () => void;
  onFormatClick: () => void;
  onGradeClick: () => void;
  onGenerate?: () => void;
  isSliderVisible?: boolean;
  isProcessing?: boolean;
}

export const EditingToolbar = ({
  onStyleClick,
  onLengthClick,
  onImproveClick,
  onFormatClick,
  onGradeClick,
  onGenerate,
  isSliderVisible,
  isProcessing = false
}: EditingToolbarProps) => {
  if (isSliderVisible) return null;

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50">
      <div className="flex flex-col gap-4 p-3 rounded-full bg-[#222222]/90 backdrop-blur-md border border-white/10">
        <TooltipProvider>
          {onGenerate && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={onGenerate}
                  disabled={isProcessing}
                  className="text-[#9b87f5] hover:text-[#8b77e5] hover:bg-white/5"
                >
                  {isProcessing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Wand2 className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="neo-blur">
                <p>Generate Response</p>
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onGradeClick}
                disabled={isProcessing}
                className="text-white/70 hover:text-[#9b87f5] hover:bg-white/5"
              >
                <GraduationCap className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="neo-blur">
              <p>Adjust Grade Level</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onStyleClick}
                disabled={isProcessing}
                className="text-white/70 hover:text-[#9b87f5] hover:bg-white/5"
              >
                <BookOpen className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="neo-blur">
              <p>Change Writing Style</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onLengthClick}
                disabled={isProcessing}
                className="text-white/70 hover:text-[#9b87f5] hover:bg-white/5"
              >
                <ArrowUpDown className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="neo-blur">
              <p>Adjust Length</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onImproveClick}
                disabled={isProcessing}
                className="text-white/70 hover:text-[#9b87f5] hover:bg-white/5"
              >
                <Sparkles className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="neo-blur">
              <p>Improve Writing</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onFormatClick}
                disabled={isProcessing}
                className="text-white/70 hover:text-[#9b87f5] hover:bg-white/5"
              >
                <PencilRuler className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="neo-blur">
              <p>Format Text</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
