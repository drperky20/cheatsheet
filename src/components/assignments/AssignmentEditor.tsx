
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
  Upload,
  FileText,
  Expand,
  Compress,
  GraduationCap,
  Smile,
  History,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

interface Version {
  content: string;
  timestamp: Date;
}

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  onImprove: () => Promise<void>;
  onSave?: () => Promise<void>;
  isLoading?: boolean;
}

export const AssignmentEditor = ({
  content,
  onChange,
  onImprove,
  onSave,
  isLoading = false
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
    toast.success("Version saved!");
  };

  const restoreVersion = (version: Version) => {
    onChange(version.content);
    toast.success("Version restored!");
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
        <Label className="text-lg font-semibold">Your Response</Label>
        <div className="flex items-center gap-2">
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
          className="min-h-[400px] bg-black/20 border-white/10 text-white/90 placeholder-white/50"
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
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => adjustLength('expand')}>
                  <Expand className="w-4 h-4 mr-2" />
                  Expand
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => adjustLength('shorten')}>
                  <Compress className="w-4 h-4 mr-2" />
                  Shorten
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Reading Level</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => changeReadingLevel('elementary')}>
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Elementary
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeReadingLevel('high_school')}>
                  <GraduationCap className="w-4 h-4 mr-2" />
                  High School
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeReadingLevel('college')}>
                  <GraduationCap className="w-4 h-4 mr-2" />
                  College
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={addEmojis}>
                  <Smile className="w-4 h-4 mr-2" />
                  Add Emojis
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onImprove}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Polish Writing
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
            disabled={isLoading}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Submit to Canvas
          </Button>
        )}
      </div>
    </Card>
  );
};
