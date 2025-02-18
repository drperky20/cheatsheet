
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { VersionControl } from './editor/VersionControl';
import { WritingStyleControls } from './editor/WritingStyleControls';
import { LengthAdjuster } from './editor/LengthAdjuster';

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
  const [quality, setQuality] = useState<'elementary' | 'middle_school' | 'high_school' | 'college'>('middle_school');
  const [lengthFactor, setLengthFactor] = useState(1);

  const handleStyleChange = async (level: 'elementary' | 'middle_school' | 'high_school' | 'college') => {
    if (!content.trim()) {
      toast.error("Please add some content first");
      return;
    }

    try {
      setIsProcessing(true);
      setQuality(level);

      const { data, error } = await supabase.functions.invoke('gemini-processor', {
        body: {
          content,
          type: 'adjust_reading_level',
          level,
          config: { assignment }
        }
      });

      if (error) throw error;

      onChange(data.result);
      toast.success(`Style adjusted to ${level.replace('_', ' ')} level`);
    } catch (error) {
      console.error('Style adjustment error:', error);
      toast.error("Failed to adjust writing style");
    } finally {
      setIsProcessing(false);
    }
  };

  const improveWriting = async () => {
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
          config: {
            assignment,
            writingLevel: quality
          }
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

  const generateContent = async () => {
    if (!assignment) {
      toast.error("No assignment selected");
      return;
    }

    try {
      setIsProcessing(true);

      const { data, error } = await supabase.functions.invoke('gemini-processor', {
        body: {
          content: assignment.description,
          type: 'generate_content',
          config: {
            assignment,
            writingLevel: quality
          }
        }
      });

      if (error) throw error;

      onChange(data.result);
      toast.success("Response generated!");
    } catch (error) {
      console.error('Generation error:', error);
      toast.error("Failed to generate response");
    } finally {
      setIsProcessing(false);
    }
  };

  const adjustLength = async () => {
    if (!content.trim()) {
      toast.error("Please add some content first");
      return;
    }

    try {
      setIsProcessing(true);

      const { data, error } = await supabase.functions.invoke('gemini-processor', {
        body: {
          content,
          type: 'adjust_text',
          config: {
            lengthFactor,
            assignment
          }
        }
      });

      if (error) throw error;

      onChange(data.result);
      toast.success(`Length ${lengthFactor > 1 ? 'increased' : 'decreased'} successfully`);
    } catch (error) {
      console.error('Length adjustment error:', error);
      toast.error("Failed to adjust length");
    } finally {
      setIsProcessing(false);
    }
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

      <div className="p-4 space-y-4">
        <div className="relative">
          <Textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[400px] neo-blur text-white/90 placeholder-white/50 font-mono resize-none"
            placeholder="Start writing or generate a response..."
          />

          <WritingStyleControls onStyleChange={handleStyleChange} />
        </div>

        <LengthAdjuster
          lengthFactor={lengthFactor}
          onLengthFactorChange={setLengthFactor}
          onAdjust={adjustLength}
          isProcessing={isProcessing}
          hasContent={Boolean(content.trim())}
        />

        <div className="flex justify-between items-center pt-2">
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              onClick={generateContent}
              disabled={isProcessing || !assignment}
            >
              Generate Response
            </Button>
            <Button
              variant="secondary"
              onClick={improveWriting}
              disabled={isProcessing || !content.trim()}
            >
              Improve Writing
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-white/60">
              {content.length} characters
            </span>
            <Button
              onClick={onSave}
              disabled={isSubmitting || !content.trim()}
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? "Submitting..." : "Submit to Canvas"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
