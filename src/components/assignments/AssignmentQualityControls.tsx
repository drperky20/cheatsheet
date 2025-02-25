
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { GradeLevel, WritingFlaw, AVAILABLE_FLAWS } from "@/types/assignment";
import { useState } from "react";

interface AssignmentQualityControlsProps {
  onConfigChange: (config: {
    targetGrade: GradeLevel;
    selectedFlaws: WritingFlaw[];
    writingStyle: 'formal' | 'casual' | 'mixed';
    confidenceLevel: number;
  }) => void;
}

export const AssignmentQualityControls = ({
  onConfigChange,
}: AssignmentQualityControlsProps) => {
  const [targetGrade, setTargetGrade] = useState<GradeLevel>('B');
  const [selectedFlaws, setSelectedFlaws] = useState<WritingFlaw[]>([]);
  const [writingStyle, setWritingStyle] = useState<'formal' | 'casual' | 'mixed'>('mixed');
  const [confidenceLevel, setConfidenceLevel] = useState(75);

  const handleFlawToggle = (flaw: WritingFlaw) => {
    const newFlaws = selectedFlaws.some(f => f.id === flaw.id)
      ? selectedFlaws.filter(f => f.id !== flaw.id)
      : [...selectedFlaws, flaw];
    
    setSelectedFlaws(newFlaws);
    updateConfig(targetGrade, newFlaws, writingStyle, confidenceLevel);
  };

  const updateConfig = (
    grade: GradeLevel,
    flaws: WritingFlaw[],
    style: 'formal' | 'casual' | 'mixed',
    confidence: number
  ) => {
    onConfigChange({
      targetGrade: grade,
      selectedFlaws: flaws,
      writingStyle: style,
      confidenceLevel: confidence,
    });
  };

  return (
    <Card className="p-6 space-y-6 neo-blur">
      <div className="space-y-4">
        <Label className="text-lg font-semibold text-white">Target Grade Level</Label>
        <div className="grid grid-cols-3 gap-2">
          {(['A', 'B', 'C'] as GradeLevel[]).map((grade) => (
            <button
              key={grade}
              onClick={() => {
                setTargetGrade(grade);
                updateConfig(grade, selectedFlaws, writingStyle, confidenceLevel);
              }}
              className={`p-3 rounded-lg text-center transition-all ${
                targetGrade === grade
                  ? 'bg-[#9b87f5] text-white'
                  : 'bg-white/5 hover:bg-white/10 text-white/80'
              }`}
            >
              {grade}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-lg font-semibold text-white">Writing Style</Label>
        <Select
          value={writingStyle}
          onValueChange={(value: 'formal' | 'casual' | 'mixed') => {
            setWritingStyle(value);
            updateConfig(targetGrade, selectedFlaws, value, confidenceLevel);
          }}
        >
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent className="neo-blur border-white/10">
            <SelectItem value="formal" className="text-white">Formal</SelectItem>
            <SelectItem value="casual" className="text-white">Casual</SelectItem>
            <SelectItem value="mixed" className="text-white">Mixed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <Label className="text-lg font-semibold text-white">Confidence Level</Label>
        <div className="px-2">
          <Slider
            value={[confidenceLevel]}
            onValueChange={(value) => {
              setConfidenceLevel(value[0]);
              updateConfig(targetGrade, selectedFlaws, writingStyle, value[0]);
            }}
            max={100}
            step={1}
            className="py-4"
          />
        </div>
        <div className="text-sm text-[#9b87f5] text-right font-medium">
          {confidenceLevel}% Confident
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-lg font-semibold text-white">Writing Flaws</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {AVAILABLE_FLAWS.map((flaw) => (
            <div
              key={flaw.id}
              className="flex items-start space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
              onClick={() => handleFlawToggle(flaw)}
            >
              <Checkbox
                checked={selectedFlaws.some(f => f.id === flaw.id)}
                onCheckedChange={() => handleFlawToggle(flaw)}
                className="border-[#9b87f5] data-[state=checked]:bg-[#9b87f5] data-[state=checked]:border-[#9b87f5]"
              />
              <div className="space-y-1">
                <Label className="text-sm font-medium text-white">{flaw.label}</Label>
                <p className="text-xs text-gray-400">{flaw.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
