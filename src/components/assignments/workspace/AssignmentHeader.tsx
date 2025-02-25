
import { Button } from "@/components/ui/button";

interface AssignmentHeaderProps {
  name: string;
  dueDate: string;
  onClose: () => void;
}

export const AssignmentHeader = ({ name, dueDate, onClose }: AssignmentHeaderProps) => {
  return (
    <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-xl">
      <div>
        <h2 className="text-xl font-semibold text-gradient">{name}</h2>
        <p className="text-sm text-[#9b87f5]/80">Due {new Date(dueDate).toLocaleDateString()}</p>
      </div>
      <Button 
        variant="ghost" 
        onClick={onClose}
        className="hover:bg-white/10 transition-colors duration-300"
      >
        Close
      </Button>
    </div>
  );
};
