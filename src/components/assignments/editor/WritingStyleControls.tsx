
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type WritingLevel = 'elementary' | 'middle_school' | 'high_school' | 'college';

interface WritingStyleControlsProps {
  onStyleChange: (level: WritingLevel) => void;
}

export const WritingStyleControls = ({
  onStyleChange,
}: WritingStyleControlsProps) => {
  return (
    <Card className="absolute bottom-4 right-4 p-2 neo-blur border-white/10">
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              size="sm" 
              variant="ghost"
              className="h-8 px-3 text-white/80 hover:text-[#9b87f5]"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              <span>Style</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="neo-blur w-40 border-white/10">
            <DropdownMenuItem onClick={() => onStyleChange('elementary')} className="text-white/80 hover:text-[#9b87f5] focus:text-[#9b87f5] focus:bg-[#9b87f5]/10">
              Elementary
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStyleChange('middle_school')} className="text-white/80 hover:text-[#9b87f5] focus:text-[#9b87f5] focus:bg-[#9b87f5]/10">
              Middle School
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStyleChange('high_school')} className="text-white/80 hover:text-[#9b87f5] focus:text-[#9b87f5] focus:bg-[#9b87f5]/10">
              High School
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStyleChange('college')} className="text-white/80 hover:text-[#9b87f5] focus:text-[#9b87f5] focus:bg-[#9b87f5]/10">
              College Level
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};
