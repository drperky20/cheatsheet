
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EditingToolbar } from "./editor/EditingToolbar";
import { AdjustmentSlider } from "./editor/AdjustmentSlider";
import { WritingStyleControls } from "./editor/WritingStyleControls";
import { LengthAdjuster } from "./editor/LengthAdjuster";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Send, Loader2 } from "lucide-react";

interface Assignment {
  id: string;
  name: string;
  description: string;
  due_at: string;
  points_possible: number;
  submission_types: string[];
  workflow_state: string;
  html_url: string;
  course_id: number;
}

interface AssignmentEditorProps {
  content: string;
  onChange: (content: string) => void;
  assignment: Assignment;
  onSave: () => Promise<void>;
  isSubmitting: boolean;
}

export const AssignmentEditor = ({
  content,
  onChange,
  assignment,
  onSave,
  isSubmitting,
}: AssignmentEditorProps) => {
  const [showStyleControl, setShowStyleControl] = useState(false);
  const [showLengthControl, setShowLengthControl] = useState(false);
  const [showGradeSlider, setShowGradeSlider] = useState(false);
  const [lengthFactor, setLengthFactor] = useState(1);
  const [gradeLevel, setGradeLevel] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStyleChange = async (level: 'elementary' | 'middle_school' | 'high_school' | 'college') => {
    if (!content.trim()) {
      toast.error("Please enter some content first");
      return;
    }

    setIsProcessing(true);
    setShowStyleControl(false);

    try {
      const { data, error } = await supabase.functions.invoke('gemini-processor', {
        body: {
          content,
          type: 'adjust_style',
          level
        }
      });

      if (error) throw error;
      onChange(data.content || content);
      toast.success(`Writing style adjusted to ${level.replace('_', ' ')} level`);
    } catch (error) {
      console.error("Error adjusting style:", error);
      toast.error("Failed to adjust writing style");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLengthAdjust = async () => {
    if (!content.trim()) {
      toast.error("Please enter some content first");
      return;
    }

    setIsProcessing(true);
    setShowLengthControl(false);

    try {
      const { data, error } = await supabase.functions.invoke('gemini-processor', {
        body: {
          content,
          type: 'adjust_length',
          factor: lengthFactor
        }
      });

      if (error) throw error;
      onChange(data.content || content);
      toast.success(`Content length adjusted to ${Math.round(lengthFactor * 100)}%`);
    } catch (error) {
      console.error("Error adjusting length:", error);
      toast.error("Failed to adjust content length");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImprove = async () => {
    if (!content.trim()) {
      toast.error("Please enter some content first");
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('gemini-processor', {
        body: {
          content,
          type: 'improve_writing'
        }
      });

      if (error) throw error;
      onChange(data.content || content);
      toast.success("Content has been improved");
    } catch (error) {
      console.error("Error improving content:", error);
      toast.error("Failed to improve content");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFormat = async () => {
    if (!content.trim()) {
      toast.error("Please enter some content first");
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('gemini-processor', {
        body: {
          content,
          type: 'format_text'
        }
      });

      if (error) throw error;
      onChange(data.content || content);
      toast.success("Content has been formatted");
    } catch (error) {
      console.error("Error formatting content:", error);
      toast.error("Failed to format content");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGradeChange = async (newLevel: number) => {
    if (!content.trim()) {
      toast.error("Please enter some content first");
      return;
    }

    setIsProcessing(true);
    setShowGradeSlider(false);

    try {
      const { data, error } = await supabase.functions.invoke('gemini-processor', {
        body: {
          content,
          type: 'adjust_grade_level',
          level: newLevel
        }
      });

      if (error) throw error;
      onChange(data.content || content);
      toast.success("Grade level adjusted successfully");
    } catch (error) {
      console.error("Error adjusting grade level:", error);
      toast.error("Failed to adjust grade level");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative">
      <div className="mb-4">
        <Textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Start writing your assignment response here..."
          className="min-h-[400px] bg-surface-100/30 border-white/10 focus:border-[#9b87f5]/50 text-white scrollbar-styled resize-none"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-end gap-2">
          <Button
            onClick={onSave}
            disabled={isSubmitting || !content.trim()}
            className="
              bg-gradient-to-r from-[#9b87f5] to-[#6366f1] 
              hover:from-[#8b77e5] hover:to-[#5356e1]
              text-white border-0 px-6
            "
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Assignment
              </>
            )}
          </Button>
        </div>

        <div className="text-sm text-white/50 text-right">
          {content.trim().length > 0 ? (
            <>
              <span className="text-[#9b87f5]">{content.trim().split(/\s+/).length}</span> words |{" "}
              <span className="text-[#9b87f5]">{content.length}</span> characters
            </>
          ) : (
            "No content yet"
          )}
        </div>
      </div>

      {/* Editing Tools */}
      <EditingToolbar
        onStyleClick={() => setShowStyleControl(true)}
        onLengthClick={() => setShowLengthControl(true)}
        onImproveClick={handleImprove}
        onFormatClick={handleFormat}
        onGradeClick={() => setShowGradeSlider(true)}
        isSliderVisible={showStyleControl || showLengthControl || showGradeSlider}
        disabled={isProcessing || !content.trim()}
      />

      {showStyleControl && (
        <WritingStyleControls
          onStyleChange={handleStyleChange}
        />
      )}

      {showLengthControl && (
        <LengthAdjuster
          lengthFactor={lengthFactor}
          onLengthFactorChange={setLengthFactor}
          onAdjust={handleLengthAdjust}
          isProcessing={isProcessing}
          hasContent={content.trim().length > 0}
        />
      )}

      {showGradeSlider && (
        <AdjustmentSlider
          type="grade"
          value={gradeLevel}
          onChange={handleGradeChange}
          onClose={() => setShowGradeSlider(false)}
        />
      )}
    </div>
  );
};
