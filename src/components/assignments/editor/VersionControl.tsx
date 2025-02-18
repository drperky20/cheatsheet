
import { Button } from "@/components/ui/button";
import { Save, List } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Version {
  content: string;
  timestamp: Date;
}

interface VersionControlProps {
  content: string;
  versions: Version[];
  onVersionChange: (content: string) => void;
  onVersionSave: (versions: Version[]) => void;
}

export const VersionControl = ({
  content,
  versions,
  onVersionChange,
  onVersionSave,
}: VersionControlProps) => {
  const saveVersion = () => {
    onVersionSave([...versions, { content, timestamp: new Date() }]);
    toast.success("Version saved!");
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={saveVersion}
      >
        <Save className="w-4 h-4" />
        Save Version
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <List className="w-4 h-4" />
            Past Versions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="neo-blur w-56">
          {versions.map((version, index) => (
            <DropdownMenuItem
              key={index}
              onClick={() => onVersionChange(version.content)}
              className="text-white/90 hover:bg-white/10"
            >
              Version {versions.length - index} • 
              {version.timestamp.toLocaleTimeString()}
            </DropdownMenuItem>
          ))}
          {versions.length === 0 && (
            <DropdownMenuItem disabled className="text-white/60">
              No saved versions
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
