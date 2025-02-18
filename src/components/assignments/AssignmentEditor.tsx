
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Save, 
  Send,
  BookOpen,
  List,
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

  return (
    <Card className="p-4 space-y-4 bg-black/40 border-white/10 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1">
          {assignment && (
            <>
              <h3 className="text-lg font-semibold text-white/90">{assignment.name}</h3>
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
            className="bg-white/5 hover:bg-white/10 border-white/10"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Version
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white/5 hover:bg-white/10 border-white/10"
              >
                <List className="w-4 h-4 mr-2" />
                Past Versions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-black/90 border-white/10">
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

      <div className="relative">
        <Textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[400px] bg-black/20 border-white/10 text-white/90 placeholder-white/50 font-mono resize-none"
          placeholder="Start writing or generate a response..."
        />

        <Card className="absolute bottom-4 right-4 p-2 bg-black/80 border-white/10">
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="h-8 px-3 hover:bg-white/10 text-white/90"
                >
                  <BookOpen className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40 bg-black/90 border-white/10">
                <DropdownMenuItem 
                  onClick={() => handleStyleChange('elementary')}
                  className="text-white/90 hover:bg-white/10"
                >
                  Elementary
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleStyleChange('middle_school')}
                  className="text-white/90 hover:bg-white/10"
                >
                  Middle School
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleStyleChange('high_school')}
                  className="text-white/90 hover:bg-white/10"
                >
                  High School
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleStyleChange('college')}
                  className="text-white/90 hover:bg-white/10"
                >
                  College Level
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      </div>

      <div className="flex justify-between items-center pt-2">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={generateContent}
            disabled={isProcessing || !assignment}
            className="bg-white/5 hover:bg-white/10 border-white/10"
          >
            Generate Response
          </Button>
          <Button
            variant="outline"
            onClick={improveWriting}
            disabled={isProcessing || !content.trim()}
            className="bg-white/5 hover:bg-white/10 border-white/10"
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
            className="bg-[#9b87f5] hover:bg-[#8b77e5] text-white"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? "Submitting..." : "Submit to Canvas"}
          </Button>
        </div>
      </div>
    </Card>
  );
};
