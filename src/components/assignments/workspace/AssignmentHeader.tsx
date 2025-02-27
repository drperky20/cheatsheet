
import { Button } from "@/components/ui/button";
import { X, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface AssignmentHeaderProps {
  name: string;
  dueDate: string;
  onClose: () => void;
}

export const AssignmentHeader = ({ name, dueDate, onClose }: AssignmentHeaderProps) => {
  const formatDueDate = () => {
    const date = new Date(dueDate);
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 border-b border-white/10 bg-gradient-to-r from-black/60 to-black/40 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2 flex-1">
          <h2 className="text-2xl font-semibold bg-gradient-to-br from-white via-white/90 to-[#D6BCFA] bg-clip-text text-transparent">
            {name}
          </h2>
          <div className="flex items-center gap-2 text-sm text-[#E5DEFF]">
            <Calendar className="w-4 h-4 opacity-70" />
            <p>Due {formatDueDate()}</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="
            relative overflow-hidden
            h-10 w-10 rounded-full 
            hover:bg-white/10 transition-all duration-300 
            hover:scale-105 group
          "
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <X className="h-5 w-5 relative z-10" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
    </motion.div>
  );
};
