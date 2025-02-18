import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { 
  Save, 
  Send,
  BookOpen,
  List,
  ShrinkIcon,
  ExpandIcon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";

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

  const saveVersion = () => {
    setVersions(prev => [...prev, { content, timestamp: new Date() }]);
    toast.success("Version saved!");
  };

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
                  onClick={() => onChange(version.content)}
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
      </div>

      <div className="p-4 space-y-4">
        <div className="relative">
          <Textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[400px] neo-blur text-white/90 placeholder-white/50 font-mono resize-none"
            placeholder="Start writing or generate a response..."
          />

          <Card className="absolute bottom-4 right-4 p-2 neo-blur">
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="h-8 px-3"
                  >
                    <BookOpen className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="neo-blur w-40">
                  <DropdownMenuItem onClick={() => handleStyleChange('elementary')}>
                    Elementary
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStyleChange('middle_school')}>
                    Middle School
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStyleChange('high_school')}>
                    High School
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStyleChange('college')}>
                    College Level
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        </div>

        <Card className="p-4 neo-blur">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">Length Adjustment</span>
              <div className="flex items-center gap-2">
                <ShrinkIcon className="w-4 h-4 text-white/60" />
                <Slider
                  value={[lengthFactor * 100]}
                  onValueChange={(value) => setLengthFactor(value[0] / 100)}
                  min={50}
                  max={200}
                  step={10}
                  className="w-[200px]"
                />
                <ExpandIcon className="w-4 h-4 text-white/60" />
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={adjustLength}
                disabled={isProcessing || !content.trim()}
              >
                Adjust Length
              </Button>
            </div>
          </div>
        </Card>

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
