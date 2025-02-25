import { Button } from "@/components/ui/button";
import { X, Calendar } from "lucide-react";

interface AssignmentHeaderProps {
  name: string;
  dueDate: string;
  onClose: () => void;
}

export const AssignmentHeader = ({ name, dueDate, onClose }: AssignmentHeaderProps) => {
  return (
    <div className="p-6 border-b border-white/10 bg-gradient-to-r from-black/60 to-black/40 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2 flex-1">
          <h2 className="text-2xl font-semibold bg-gradient-to-br from-white via-white/90 to-[#D6BCFA] bg-clip-text text-transparent">
            {name}
          </h2>
          <div className="flex items-center gap-2 text-sm text-[#E5DEFF]">
            <Calendar className="w-4 h-4 opacity-70" />
            <p>Due {new Date(dueDate).toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-10 w-10 rounded-full hover:bg-white/10 transition-all duration-300 hover:scale-105"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
    </div>
  );
};
