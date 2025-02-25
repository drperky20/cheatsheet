import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";
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
    <Card className="neo-blur border-0 overflow-hidden transition-all duration-300">
      <div className="p-6 border-b border-white/10 bg-gradient-to-r from-black/60 to-black/40">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            {assignment && (
              <>
                <h3 className="text-xl font-semibold text-gradient">{assignment.name}</h3>
                <div className="flex items-center gap-4 text-sm">
                  <div className="px-3 py-1.5 rounded-lg bg-white/5 backdrop-blur-sm text-[#E5DEFF]">
                    Due {new Date(assignment.due_at).toLocaleDateString()}
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-white/5 backdrop-blur-sm text-[#E5DEFF]">
                    {assignment.points_possible} points
                  </div>
                </div>
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
      </div>

      <div className="relative p-6 space-y-6">
        <div className="relative group">
          <Textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[400px] glass-morphism text-white/90 placeholder:text-white/40 font-mono resize-none p-4 focus:ring-1 focus:ring-[#9b87f5]/50 transition-all duration-300"
            placeholder="Start writing or generate a response..."
          />
          {isProcessing && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#9b87f5] animate-spin" />
            </div>
          )}
        </div>

        <EditingToolbar
          onStyleClick={handleStyleChange}
          onLengthClick={handleLengthAdjust}
          onImproveClick={handleImproveClick}
          onFormatClick={formatText}
          onGradeClick={handleGradeClick}
          onGenerate={handleGenerate}
          disabled={isProcessing}
        />

        {activeSlider && (
          <AdjustmentSlider
            type={activeSlider}
            value={sliderValue}
            onChange={handleSliderChange}
            onClose={() => setActiveSlider(null)}
          />
        )}

        <div className="flex justify-between items-center">
          <span className="text-sm text-white/60 bg-white/5 px-3 py-1.5 rounded-lg backdrop-blur-sm">
            {content.length.toLocaleString()} characters
          </span>
          <Button
            onClick={onSave}
            disabled={isSubmitting || !content.trim() || isProcessing}
            className={`
              bg-gradient-to-r from-[#9b87f5] to-[#6366f1] 
              hover:opacity-90 transition-all duration-300
              px-6 py-2 rounded-xl font-medium
              disabled:opacity-50 disabled:cursor-not-allowed
              group relative overflow-hidden
            `}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                Submit to Canvas
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};
