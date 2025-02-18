
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

  const adjustLength = async (type: 'expand' | 'shorten') => {
    if (!selectedText) {
      toast.error("Please select text to adjust");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('gemini-processor', {
        body: {
          content: selectedText,
          type: `${type}_text`
        }
      });

      if (error) throw error;

      const newContent = content.replace(selectedText, data.result);
      onChange(newContent);
      toast.success(`Text ${type}ed successfully`);
    } catch (error) {
      toast.error("Failed to adjust text length");
    }
  };

  const changeReadingLevel = async (level: string) => {
    if (!selectedText) {
      toast.error("Please select text to adjust");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('gemini-processor', {
        body: {
          content: selectedText,
          type: 'adjust_reading_level',
          level
        }
      });

      if (error) throw error;

      const newContent = content.replace(selectedText, data.result);
      onChange(newContent);
      toast.success(`Reading level adjusted to ${level}`);
    } catch (error) {
      toast.error("Failed to adjust reading level");
    }
  };

  const addEmojis = async () => {
    if (!selectedText) {
      toast.error("Please select text to add emojis");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('gemini-processor', {
        body: {
          content: selectedText,
          type: 'add_emojis'
        }
      });

      if (error) throw error;

      const newContent = content.replace(selectedText, data.result);
      onChange(newContent);
      toast.success("Emojis added successfully");
    } catch (error) {
      toast.error("Failed to add emojis");
    }
  };

  return (
    <Card className="p-4 space-y-4 bg-black/40 border-white/10">
      <div className="flex items-center justify-between mb-4">
        <Label className="text-lg font-semibold text-white">Your Response</Label>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onGenerate}
            disabled={isGenerating}
            className="gap-2"
          >
            <Wand2 className="w-4 h-4" />
            {isGenerating ? "Generating..." : "Generate Response"}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <History className="w-4 h-4" />
                Version History
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
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
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Save Version
          </Button>
        </div>
      </div>

      <div className="relative">
        <Textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          onSelect={handleTextSelect}
          className="min-h-[400px] bg-black/20 border-white/10 text-white/90 placeholder-white/50 font-mono"
          placeholder="Start writing or generate content..."
        />

        {selectedText && (
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                  <Wand2 className="w-4 h-4" />
                  Improve Selection
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem onClick={() => adjustLength('expand')}>
                  <ArrowBigUpDash className="w-4 h-4 mr-2" />
                  Expand
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => adjustLength('shorten')}>
                  <ArrowBigDownDash className="w-4 h-4 mr-2" />
                  Shorten
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Reading Level</DropdownMenuLabel>
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
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={addEmojis}>
                  <Smile className="w-4 h-4 mr-2" />
                  Add Emojis
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onImprove} disabled={isImproving}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isImproving ? "Polishing..." : "Polish Writing"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-4">
        {onSave && (
          <Button
            onClick={onSave}
            disabled={isSubmitting || !content.trim()}
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? "Submitting..." : "Submit to Canvas"}
          </Button>
        )}
      </div>
    </Card>
  );
};
