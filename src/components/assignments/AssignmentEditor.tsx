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
  Settings,
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
  const [adjustLength, setAdjustLength] = useState(1);

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
    <Card className="p-6 space-y-6 bg-gradient-to-br from-black/60 to-black/40 border-white/10 backdrop-blur-xl shadow-lg">
      <div className="flex items-center justify-between">
        <Label className="text-xl font-semibold bg-gradient-to-br from-white via-white/90 to-[#D6BCFA] bg-clip-text text-transparent">
          Your Response
        </Label>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onGenerate}
            disabled={isGenerating}
            className="gap-2 bg-white/5 hover:bg-white/10 border-white/10 text-white/90"
          >
            <Wand2 className="w-4 h-4" />
            {isGenerating ? "Generating..." : "Generate Response"}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 bg-white/5 hover:bg-white/10 border-white/10 text-white/90"
              >
                <History className="w-4 h-4" />
                History
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-black/90 border-white/10">
              <DropdownMenuLabel className="text-white/90">Previous Versions</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              {versions.length === 0 ? (
                <DropdownMenuItem disabled className="text-white/60">No versions saved</DropdownMenuItem>
              ) : (
                versions.map((version, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => restoreVersion(version)}
                    className="text-white/90 hover:bg-white/10"
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
            className="gap-2 bg-white/5 hover:bg-white/10 border-white/10 text-white/90"
          >
            <Save className="w-4 h-4" />
            Save
          </Button>
        </div>
      </div>

      <div className="relative space-y-4">
        <Textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          onSelect={handleTextSelect}
          className="min-h-[400px] bg-black/20 border-white/10 text-white/90 placeholder-white/50 font-mono rounded-xl resize-none"
          placeholder="Start writing or generate content..."
        />

        <Card className="absolute bottom-4 right-4 p-2 bg-black/80 border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 pr-4 border-r border-white/10">
              <Label className="text-xs text-white/60">Length</Label>
              <div className="w-32">
                <Slider
                  value={[adjustLength]}
                  onValueChange={([value]) => setAdjustLength(value)}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="my-1.5"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={adjustText}
                className="h-8 px-2 hover:bg-white/10 text-white/90"
              >
                <PenTool className="w-4 h-4" />
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 px-2 hover:bg-white/10 text-white/90"
                >
                  <BookOpen className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40 bg-black/90 border-white/10">
                <DropdownMenuLabel className="text-white/60">Reading Level</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem 
                  onClick={() => changeReadingLevel('elementary')}
                  className="text-white/90 hover:bg-white/10"
                >
                  Elementary
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => changeReadingLevel('middle_school')}
                  className="text-white/90 hover:bg-white/10"
                >
                  Middle School
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => changeReadingLevel('high_school')}
                  className="text-white/90 hover:bg-white/10"
                >
                  High School
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => changeReadingLevel('college')}
                  className="text-white/90 hover:bg-white/10"
                >
                  Graduate Level
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              onClick={onImprove}
              disabled={isImproving}
              className="h-8 px-2 hover:bg-white/10 text-white/90"
            >
              <Sparkles className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-white/60">
          {selectedText ? `${selectedText.length} characters selected` : `${content.length} characters`}
        </div>
        {onSave && (
          <Button
            onClick={onSave}
            disabled={isSubmitting || !content.trim()}
            className="gap-2 bg-[#9b87f5] hover:bg-[#8b77e5] text-white border-none"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? "Submitting..." : "Submit to Canvas"}
          </Button>
        )}
      </div>
    </Card>
  );
};
