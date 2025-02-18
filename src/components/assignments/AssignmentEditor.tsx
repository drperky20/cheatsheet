import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EditingToolbar } from './editor/EditingToolbar';
import { VersionControl } from './editor/VersionControl';
import { AdjustmentSlider } from './editor/AdjustmentSlider';

interface Assignment {
  id: string;
  name: string;
  description: string;
  due_at: string;
  points_possible: number;
}

interface EditorProps {
  content: string;
  assignment?: Assignment;
  onChange: (content: string) => void;
  onSave?: () => Promise<void>;
  isSubmitting?: boolean;
}

interface Version {
  content: string;
  timestamp: Date;
}

export const AssignmentEditor = ({
  content,
  assignment,
  onChange,
  onSave,
  isSubmitting = false
}: EditorProps) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeSlider, setActiveSlider] = useState<'length' | 'grade' | null>(null);
  const [sliderValue, setSliderValue] = useState(5);

  const handleGenerate = async () => {
    try {
      setIsProcessing(true);
      const { data, error } = await supabase.functions.invoke('gemini-processor', {
        body: {
          content: assignment?.description || "",
          type: 'generate',
          config: { assignment }
        }
      });

      if (error) throw error;
      onChange(data.result);
      toast.success("Response generated successfully!");
    } catch (error) {
      console.error('Generation error:', error);
      toast.error("Failed to generate response");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStyleChange = async () => {
    if (!content.trim()) {
      toast.error("Please add some content first");
      return;
    }

    try {
      setIsProcessing(true);
      const { data, error } = await supabase.functions.invoke('gemini-processor', {
        body: {
          content,
          type: 'adjust_reading_level',
          level: 'college',
          config: { assignment }
        }
      });

      if (error) throw error;
      onChange(data.result);
      toast.success("Style adjusted successfully");
    } catch (error) {
      console.error('Style adjustment error:', error);
      toast.error("Failed to adjust writing style");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLengthAdjust = async () => {
    if (!content.trim()) {
      toast.error("Please add some content first");
      return;
    }
    setActiveSlider('length');
    setSliderValue(5);
  };

  const handleGradeClick = () => {
    if (!content.trim()) {
      toast.error("Please add some content first");
      return;
    }
    setActiveSlider('grade');
    setSliderValue(5);
  };

  const handleSliderChange = async (value: number) => {
    setSliderValue(value);
    
    try {
      setIsProcessing(true);
      const { data, error } = await supabase.functions.invoke('gemini-processor', {
        body: {
          content,
          type: activeSlider === 'length' ? 'adjust_text' : 'adjust_reading_level',
          level: activeSlider === 'grade' ? 
            (value <= 2.5 ? 'kindergarten' : 
             value <= 5 ? 'middle_school' : 
             value <= 7.5 ? 'high_school' : 
             'college') : undefined,
          config: {
            lengthFactor: activeSlider === 'length' ? value / 5 : undefined,
            assignment
          }
        }
      });

      if (error) throw error;
      onChange(data.result);
    } catch (error) {
      console.error('Adjustment error:', error);
      toast.error(`Failed to adjust ${activeSlider}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImproveClick = async () => {
    if (!content.trim()) {
      toast.error("Please add some content first");
      return;
    }

    try {
      setIsProcessing(true);
      const { data, error } = await supabase.functions.invoke('gemini-processor', {
        body: {
          content,
          type: 'improve_writing',
          config: { assignment }
        }
      });

      if (error) throw error;
      onChange(data.result);
      toast.success("Writing improved!");
    } catch (error) {
      console.error('Improvement error:', error);
      toast.error("Failed to improve writing");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatText = () => {
    toast.success("Text formatting applied");
  };

  return (
    <Card className="glass-morphism">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="space-y-1">
          {assignment && (
            <>
              <h3 className="text-lg font-semibold text-gradient">{assignment.name}</h3>
              <p className="text-sm text-white/60">
                Due {new Date(assignment.due_at).toLocaleDateString()} • 
                {assignment.points_possible} points
              </p>
            </>
          )}
        </div>

        <VersionControl
          content={content}
          versions={versions}
          onVersionChange={onChange}
          onVersionSave={setVersions}
        />
      </div>

      <div className="relative p-4">
        <Textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[400px] neo-blur text-white/90 placeholder-white/50 font-mono resize-none"
          placeholder="Start writing or generate a response..."
        />

        <EditingToolbar
          onStyleClick={handleStyleChange}
          onLengthClick={handleLengthAdjust}
          onImproveClick={handleImproveClick}
          onFormatClick={formatText}
          onGradeClick={handleGradeClick}
          onGenerate={handleGenerate}
        />

        {activeSlider && (
          <AdjustmentSlider
            type={activeSlider}
            value={sliderValue}
            onChange={handleSliderChange}
            onClose={() => setActiveSlider(null)}
          />
        )}

        <div className="flex justify-end items-center gap-4 mt-4">
          <span className="text-sm text-white/60">
            {content.length} characters
          </span>
          <Button
            onClick={onSave}
            disabled={isSubmitting || !content.trim()}
            className="bg-[#9b87f5] hover:bg-[#8b77e5]"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? "Submitting..." : "Submit to Canvas"}
          </Button>
        </div>
      </div>
    </Card>
  );
};
