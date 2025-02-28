
import { Button } from "@/components/ui/button";

interface AssignmentHeaderProps {
  name: string;
  dueDate: string;
  onClose: () => void;
}

export const AssignmentHeader = ({ name, dueDate, onClose }: AssignmentHeaderProps) => {
  return (
    <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
      <div>
        <h2 className="text-xl font-semibold text-white">{name}</h2>
        <p className="text-sm text-gray-400">Due {new Date(dueDate).toLocaleDateString()}</p>
      </div>
      <Button variant="ghost" onClick={onClose}>Close</Button>
    </div>
  );
};
