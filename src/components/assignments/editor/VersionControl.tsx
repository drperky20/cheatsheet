import { Button } from "@/components/ui/button";
import { Save, List, History, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={saveVersion}
        className="
          relative h-9 px-4 
          bg-gradient-to-r from-[#9b87f5] to-[#6366f1]
          hover:opacity-90 transition-all duration-300
          text-white font-medium
          hover:scale-105 transform
          disabled:opacity-50 disabled:hover:scale-100
        "
      >
        <Save className="w-4 h-4 mr-2" />
        Save Version
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            className="
              h-9 px-4
              glass-morphism border-0
              hover:bg-white/10 transition-all duration-300
              text-white font-medium
              hover:scale-105 transform
              disabled:opacity-50 disabled:hover:scale-100
            "
          >
            <History className="w-4 h-4 mr-2" />
            History
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-72 glass-morphism border-0 shadow-2xl p-2" 
          align="end"
        >
          <DropdownMenuLabel className="text-white/90 px-2 py-3 text-sm font-medium">
            Version History
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/10" />
          
          {versions.length > 0 ? (
            versions.map((version, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => onVersionChange(version.content)}
                className="
                  relative group px-3 py-2.5 rounded-lg my-1
                  text-white/90 hover:bg-white/10 
                  transition-all duration-300 cursor-pointer
                "
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#9b87f5] opacity-70" />
                    <span>Version {versions.length - index}</span>
                  </div>
                  <span className="text-sm text-white/60">
                    {version.timestamp.toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="
                  absolute inset-0 bg-gradient-to-r from-[#9b87f5]/5 to-transparent
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300
                  rounded-lg pointer-events-none
                "/>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="px-3 py-8 text-center">
              <History className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-sm text-white/60">No saved versions yet</p>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
