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
  disabled?: boolean;
}

export const EditingToolbar = ({
  onStyleClick,
  onLengthClick,
  onImproveClick,
  onFormatClick,
  onGradeClick,
  onGenerate,
  isSliderVisible,
  disabled = false
}: EditingToolbarProps) => {
  if (isSliderVisible) return null;

  const buttonClasses = `
    relative overflow-hidden transition-all duration-300
    disabled:opacity-50 disabled:cursor-not-allowed
    before:absolute before:inset-0 before:bg-gradient-to-r 
    before:from-white/5 before:to-transparent before:opacity-0
    hover:before:opacity-100 before:transition-opacity
    text-white/70 hover:text-[#9b87f5] hover:scale-105
    disabled:hover:scale-100 disabled:hover:before:opacity-0
  `;

  const tooltipClasses = "glass-morphism border-0 shadow-xl px-3 py-2";

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50">
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-b from-[#9b87f5]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
        <div className="flex flex-col gap-4 p-3 rounded-full glass-morphism border-0">
          <TooltipProvider>
            {onGenerate && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={onGenerate}
                    disabled={disabled}
                    className={`text-[#9b87f5] hover:text-[#8b77e5] ${buttonClasses}`}
                  >
                    {disabled ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Wand2 className="h-5 w-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" className={tooltipClasses}>
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
                  disabled={disabled}
                  className={buttonClasses}
                >
                  <GraduationCap className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className={tooltipClasses}>
                <p>Adjust Grade Level</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={onStyleClick}
                  disabled={disabled}
                  className={buttonClasses}
                >
                  <BookOpen className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className={tooltipClasses}>
                <p>Change Writing Style</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={onLengthClick}
                  disabled={disabled}
                  className={buttonClasses}
                >
                  <ArrowUpDown className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className={tooltipClasses}>
                <p>Adjust Length</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={onImproveClick}
                  disabled={disabled}
                  className={buttonClasses}
                >
                  <Sparkles className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className={tooltipClasses}>
                <p>Improve Writing</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={onFormatClick}
                  disabled={disabled}
                  className={buttonClasses}
                >
                  <PencilRuler className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className={tooltipClasses}>
                <p>Format Text</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};
