
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Wand2, Save, Send, RotateCcw } from "lucide-react";

interface Assignment {
  id: string;
  name: string;
  description: string;
  due_at: string;
  points_possible: number;
  submission_types: string[];
  workflow_state: string;
  html_url: string;
}

interface AssignmentWorkspaceProps {
  assignment: Assignment;
  onClose: () => void;
}

export const AssignmentWorkspace = ({ assignment, onClose }: AssignmentWorkspaceProps) => {
  const [content, setContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [improving, setImproving] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const generateContent = async () => {
    try {
      setGenerating(true);
      const { data, error } = await supabase.functions.invoke('gemini-processor', {
        body: {
          content: assignment.description,
          type: 'generate_content'
        }
      });

      if (error) throw error;

      setHistory([...history, content]);
      setContent(data.result);
      toast.success("Content generated successfully");
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error("Failed to generate content");
    } finally {
      setGenerating(false);
    }
  };

  const improveWriting = async () => {
    if (!content) {
      toast.error("Please add some content first");
      return;
    }

    try {
      setImproving(true);
      const { data, error } = await supabase.functions.invoke('gemini-processor', {
        body: {
          content,
          type: 'improve_writing'
        }
      });

      if (error) throw error;

      setHistory([...history, content]);
      setContent(data.result);
      toast.success("Writing improved successfully");
    } catch (error) {
      console.error('Error improving writing:', error);
      toast.error("Failed to improve writing");
    } finally {
      setImproving(false);
    }
  };

  const undoChanges = () => {
    if (history.length > 0) {
      const previousContent = history[history.length - 1];
      setContent(previousContent);
      setHistory(history.slice(0, -1));
      toast.success("Changes reverted");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[90vh] glass overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{assignment.name}</h2>
            <p className="text-sm text-gray-400">Due {new Date(assignment.due_at).toLocaleDateString()}</p>
          </div>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-auto">
          <div className="space-y-2">
            <label className="text-sm font-medium">Assignment Description</label>
            <Card className="p-4 bg-black/40">
              <div dangerouslySetInnerHTML={{ __html: assignment.description }} />
            </Card>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Your Response</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={undoChanges}
                  disabled={history.length === 0}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Undo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={improveWriting}
                  disabled={improving || !content}
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Improve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateContent}
                  disabled={generating}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Generate
                </Button>
              </div>
            </div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[400px] bg-black/40"
              placeholder="Start writing or generate content..."
            />
          </div>
        </div>

        <div className="p-4 border-t border-white/10 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => toast.success("Submission feature coming soon!")}>
            <Save className="w-4 h-4 mr-2" />
            Submit to Canvas
          </Button>
        </div>
      </Card>
    </div>
  );
};
