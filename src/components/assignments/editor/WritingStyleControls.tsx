
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
    <Card className="absolute bottom-4 right-4 p-2 neo-blur">
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              size="sm" 
              variant="ghost"
              className="h-8 px-3"
            >
              <BookOpen className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="neo-blur w-40">
            <DropdownMenuItem onClick={() => onStyleChange('elementary')}>
              Elementary
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStyleChange('middle_school')}>
              Middle School
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStyleChange('high_school')}>
              High School
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStyleChange('college')}>
              College Level
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};
