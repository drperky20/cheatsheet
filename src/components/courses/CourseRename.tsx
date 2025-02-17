
import { useState } from "react";
import { Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CourseRenameProps {
  courseId: string;
  currentName: string;
  nickname?: string | null;
  onUpdate: (newNickname: string | null) => void;
}

export const CourseRename = ({ courseId, currentName, nickname, onUpdate }: CourseRenameProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newNickname, setNewNickname] = useState(nickname || "");

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("courses")
        .update({ nickname: newNickname || null })
        .eq("canvas_course_id", courseId);

      if (error) throw error;

      onUpdate(newNickname || null);
      setIsEditing(false);
      toast.success("Course nickname updated");
    } catch (error) {
      console.error("Error updating nickname:", error);
      toast.error("Failed to update nickname");
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={newNickname}
          onChange={(e) => setNewNickname(e.target.value)}
          placeholder={currentName}
          className="h-8 bg-black/20"
        />
        <Button size="icon" variant="ghost" onClick={handleSave} className="h-8 w-8">
          <Check className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => setIsEditing(false)} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-semibold">{nickname || currentName}</span>
      <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)} className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
        <Edit2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
