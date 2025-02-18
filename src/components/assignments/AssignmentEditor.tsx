
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Wand2,
  ChevronDown,
  RotateCcw,
  Save,
  Send,
  FileText,
  ArrowBigUpDash,
  ArrowBigDownDash,
  GraduationCap,
  Smile,
  History,
  Sparkles,
  PenTool,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface Version {
  content: string;
  timestamp: Date;
}

interface EditorProps {
  content: string;
  assignment?: {
    name: string;
    description: string;
    points_possible: number;
    due_at: string;
  };
  onChange: (content: string) => void;
  onImprove: () => Promise<void>;
  onGenerate: () => Promise<void>;
  onSave?: () => Promise<void>;
  isGenerating?: boolean;
  isImproving?: boolean;
  isSubmitting?: boolean;
}

export const AssignmentEditor = ({
  content,
  assignment,
  onChange,
  onImprove,
  onGenerate,
  onSave,
  isGenerating = false,
  isImproving = false,
  isSubmitting = false
}: EditorProps) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [adjustLength, setAdjustLength] = useState(1); // 0.5 to 2.0

  const handleTextSelect = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      setSelectedText(selection.toString());
    }
  };

  const saveVersion = () => {
    setVersions(prev => [...prev, { content, timestamp: new Date() }]);
    toast.success("Version saved to history!");
  };

  const restoreVersion = (version: Version) => {
    onChange(version.content);
    toast.success("Previous version restored!");
  };

  const adjustText = async () => {
    const textToAdjust = selectedText || content;
    if (!textToAdjust) {
      toast.error("No text to adjust");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('gemini-processor', {
        body: {
          content: textToAdjust,
          type: 'adjust_text',
          config: {
            assignment,
            lengthFactor: adjustLength,
            selection: !!selectedText
          }
        }
      });

      if (error) throw error;

      if (selectedText) {
        const newContent = content.replace(selectedText, data.result);
        onChange(newContent);
      } else {
        onChange(data.result);
      }
      
      toast.success(`Text adjusted successfully`);
    } catch (error) {
      toast.error("Failed to adjust text");
    }
  };

  const changeReadingLevel = async (level: string) => {
    const textToAdjust = selectedText || content;
    if (!textToAdjust) {
      toast.error("No text to adjust");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('gemini-processor', {
        body: {
          content: textToAdjust,
          type: 'adjust_reading_level',
          level,
          config: { assignment }
        }
      });

      if (error) throw error;

      if (selectedText) {
        const newContent = content.replace(selectedText, data.result);
        onChange(newContent);
      } else {
        onChange(data.result);
      }
      toast.success(`Reading level adjusted to ${level}`);
    } catch (error) {
      toast.error("Failed to adjust reading level");
    }
  };

  return (
    <Card className="p-6 space-y-6 bg-black/40 border-white/10 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold text-gradient">Your Response</Label>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onGenerate}
            disabled={isGenerating}
            className="gap-2 bg-white/5 hover:bg-white/10 border-white/10"
          >
            <Wand2 className="w-4 h-4" />
            {isGenerating ? "Generating..." : "Generate Response"}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 bg-white/5 hover:bg-white/10 border-white/10"
              >
                <History className="w-4 h-4" />
                Version History
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-black/90 border-white/10">
              <DropdownMenuLabel>Previous Versions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {versions.length === 0 ? (
                <DropdownMenuItem disabled>No versions saved</DropdownMenuItem>
              ) : (
                versions.map((version, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => restoreVersion(version)}
                  >
                    Version {index + 1} - {version.timestamp.toLocaleTimeString()}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={saveVersion}
            className="gap-2 bg-white/5 hover:bg-white/10 border-white/10"
          >
            <Save className="w-4 h-4" />
            Save Version
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label className="text-sm text-white/60 mb-2">Adjust Length</Label>
            <Slider
              value={[adjustLength]}
              onValueChange={([value]) => setAdjustLength(value)}
              min={0.5}
              max={2}
              step={0.1}
              className="my-2"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={adjustText}
            className="gap-2 h-10 bg-white/5 hover:bg-white/10 border-white/10"
          >
            <PenTool className="w-4 h-4" />
            {selectedText ? "Adjust Selection" : "Adjust Text"}
          </Button>
        </div>

        <div className="relative">
          <Textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            onSelect={handleTextSelect}
            className="min-h-[400px] bg-black/20 border-white/10 text-white/90 placeholder-white/50 font-mono rounded-xl resize-none"
            placeholder="Start writing or generate content..."
          />

          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-2 bg-black/40 hover:bg-black/60 border-white/10"
                >
                  <BookOpen className="w-4 h-4" />
                  Reading Level
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-black/90 border-white/10">
                <DropdownMenuItem onClick={() => changeReadingLevel('elementary')}>
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Elementary
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeReadingLevel('middle_school')}>
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Middle School
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeReadingLevel('high_school')}>
                  <GraduationCap className="w-4 h-4 mr-2" />
                  High School
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeReadingLevel('college')}>
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Graduate Level
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={onImprove}
              disabled={isImproving}
              className="gap-2 bg-black/40 hover:bg-black/60 border-white/10"
            >
              <Sparkles className="w-4 h-4" />
              {isImproving ? "Polishing..." : "Polish Writing"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onSave && (
          <Button
            onClick={onSave}
            disabled={isSubmitting || !content.trim()}
            className="gap-2 bg-[#9b87f5] hover:bg-[#8b77e5] text-white"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? "Submitting..." : "Submit to Canvas"}
          </Button>
        )}
      </div>
    </Card>
  );
};
