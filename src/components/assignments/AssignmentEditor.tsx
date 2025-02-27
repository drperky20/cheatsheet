
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Send, 
  Loader2, 
  Wand2, 
  BookOpen, 
  GraduationCap, 
  ArrowUpDown, 
  Sparkles, 
  PencilRuler, 
  Save,
  X,
  Check
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";

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
  qualityConfig?: {
    targetGrade: 'A' | 'B' | 'C';
    factualAccuracy: boolean;
    citationCount: number;
    wordCount: number;
  };
}

export const AssignmentEditor = ({
  content,
  onChange,
  assignment,
  onSave,
  isSubmitting,
  qualityConfig = {
    targetGrade: 'A',
    factualAccuracy: true,
    citationCount: 3,
    wordCount: 500,
  },
}: AssignmentEditorProps) => {
  const [activeControl, setActiveControl] = useState<string | null>(null);
  const [lengthFactor, setLengthFactor] = useState(1);
  const [gradeLevel, setGradeLevel] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    // Update word and character count when content changes
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(content.length);
  }, [content]);

  const closeActiveControl = () => setActiveControl(null);

  const handleStyleChange = async (level: 'elementary' | 'middle_school' | 'high_school' | 'college') => {
    if (!content.trim()) {
      toast.error("Please enter some content first");
      return;
    }

    setIsProcessing(true);
    closeActiveControl();

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
    closeActiveControl();

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

  const handleGradeChange = async () => {
    if (!content.trim()) {
      toast.error("Please enter some content first");
      return;
    }

    setIsProcessing(true);
    closeActiveControl();

    try {
      const { data, error } = await supabase.functions.invoke('gemini-processor', {
        body: {
          content,
          type: 'adjust_grade_level',
          level: gradeLevel
        }
      });

      if (error) throw error;
      onChange(data.content || content);
      toast.success(`Grade level adjusted to ${gradeLevel}`);
    } catch (error) {
      console.error("Error adjusting grade level:", error);
      toast.error("Failed to adjust grade level");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('gemini-processor', {
        body: {
          promptType: 'generate_assignment_response',
          assignment: {
            ...assignment,
            qualityConfig
          }
        }
      });

      if (error) throw error;
      if (!data?.content) throw new Error("No content generated");

      onChange(data.content);
      toast.success('Assignment response generated successfully!');
    } catch (error) {
      console.error("Generation error:", error);
      toast.error('Failed to generate assignment response. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getGradeLevelLabel = (level: number) => {
    if (level <= 2) return "Elementary";
    if (level <= 4) return "Middle School";
    if (level <= 7) return "High School";
    return "College";
  };

  return (
    <div className="relative">
      <div className="mb-4">
        <div className="flex items-center justify-end gap-2 mb-4">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            variant="outline"
            className="gap-2 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 hover:from-violet-500/20 hover:to-indigo-500/20 transition-all duration-300"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Generate Response
              </>
            )}
          </Button>
        </div>

        <div className="relative">
          <Textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Start writing your assignment response here..."
            className="min-h-[400px] bg-surface-100/30 border-white/10 focus:border-[#9b87f5]/50 text-white scrollbar-styled resize-none font-medium"
          />
          
          <div className="absolute bottom-3 right-3 text-xs text-white/50 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
            {content.trim().length > 0 ? (
              <>
                <span className="text-[#9b87f5]">{wordCount}</span> words |{" "}
                <span className="text-[#9b87f5]">{charCount}</span> characters
              </>
            ) : (
              "No content yet"
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mb-4">
        <Button
          onClick={onSave}
          disabled={isSubmitting || !content.trim()}
          variant="outline"
          className="gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Draft
            </>
          )}
        </Button>
        
        <Button
          onClick={onSave}
          disabled={isSubmitting || !content.trim()}
          className="
            bg-gradient-to-r from-[#9b87f5] to-[#6366f1] 
            hover:from-[#8b77e5] hover:to-[#5356e1]
            text-white border-0 gap-2
          "
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Assignment
            </>
          )}
        </Button>
      </div>

      {/* Floating Editing Toolbar */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50">
        <TooltipProvider>
          <div className="flex flex-col gap-2 p-2 rounded-full glass-morphism border-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setActiveControl(activeControl === 'grade' ? null : 'grade')}
                  disabled={isProcessing}
                  className={`
                    transition-all duration-300 
                    hover:text-[#9b87f5] hover:scale-105
                    ${activeControl === 'grade' ? 'bg-[#9b87f5]/20 text-[#9b87f5]' : 'text-white/70'}
                  `}
                >
                  <GraduationCap className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-black/70 backdrop-blur-md border-white/10">
                <p>Adjust Grade Level</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setActiveControl(activeControl === 'style' ? null : 'style')}
                  disabled={isProcessing}
                  className={`
                    transition-all duration-300 
                    hover:text-[#9b87f5] hover:scale-105
                    ${activeControl === 'style' ? 'bg-[#9b87f5]/20 text-[#9b87f5]' : 'text-white/70'}
                  `}
                >
                  <BookOpen className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-black/70 backdrop-blur-md border-white/10">
                <p>Change Writing Style</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setActiveControl(activeControl === 'length' ? null : 'length')}
                  disabled={isProcessing}
                  className={`
                    transition-all duration-300 
                    hover:text-[#9b87f5] hover:scale-105
                    ${activeControl === 'length' ? 'bg-[#9b87f5]/20 text-[#9b87f5]' : 'text-white/70'}
                  `}
                >
                  <ArrowUpDown className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-black/70 backdrop-blur-md border-white/10">
                <p>Adjust Length</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleImprove}
                  disabled={isProcessing}
                  className="transition-all duration-300 hover:text-[#9b87f5] hover:scale-105 text-white/70"
                >
                  {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-black/70 backdrop-blur-md border-white/10">
                <p>Improve Writing</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleFormat}
                  disabled={isProcessing}
                  className="transition-all duration-300 hover:text-[#9b87f5] hover:scale-105 text-white/70"
                >
                  {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <PencilRuler className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-black/70 backdrop-blur-md border-white/10">
                <p>Format Text</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      {/* Active Control Panels */}
      <AnimatePresence>
        {activeControl === 'style' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed right-20 top-1/2 -translate-y-1/2 z-40"
          >
            <Card className="neo-blur border-0 overflow-hidden p-4 w-48">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-[#9b87f5]">Writing Style</h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={closeActiveControl}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {(['elementary', 'middle_school', 'high_school', 'college'] as const).map((style) => (
                  <Button 
                    key={style}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-white/80 hover:text-[#9b87f5] hover:bg-white/5"
                    onClick={() => handleStyleChange(style)}
                  >
                    {style.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {activeControl === 'length' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed right-20 top-1/2 -translate-y-1/2 z-40"
          >
            <Card className="neo-blur border-0 overflow-hidden p-4 w-60">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-[#9b87f5]">Adjust Length</h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={closeActiveControl}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-white/70">
                    <span>Shorter</span>
                    <span>Longer</span>
                  </div>
                  <Slider
                    value={[lengthFactor * 100]}
                    onValueChange={(value) => setLengthFactor(value[0] / 100)}
                    min={50}
                    max={200}
                    step={10}
                    className="py-4"
                  />
                  <div className="text-sm text-right text-[#9b87f5]">
                    {Math.round(lengthFactor * 100)}%
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    className="bg-[#9b87f5] hover:bg-[#8b77e5] text-white gap-1"
                    onClick={handleLengthAdjust}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Apply</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {activeControl === 'grade' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed right-20 top-1/2 -translate-y-1/2 z-40"
          >
            <Card className="neo-blur border-0 overflow-hidden p-4 w-60">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-[#9b87f5]">Grade Level</h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={closeActiveControl}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-white/70">
                    <span>Elementary</span>
                    <span>College</span>
                  </div>
                  <Slider
                    value={[gradeLevel]}
                    onValueChange={(value) => setGradeLevel(value[0])}
                    min={1}
                    max={10}
                    step={1}
                    className="py-4"
                  />
                  <div className="text-sm text-right text-[#9b87f5]">
                    {getGradeLevelLabel(gradeLevel)}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    className="bg-[#9b87f5] hover:bg-[#8b77e5] text-white gap-1"
                    onClick={handleGradeChange}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Apply</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
