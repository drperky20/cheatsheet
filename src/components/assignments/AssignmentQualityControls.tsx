
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
import { useState, useEffect } from "react";
import { CheckCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

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

  useEffect(() => {
    // Update parent component with initial config
    updateConfig(targetGrade, selectedFlaws, writingStyle, confidenceLevel);
  }, []);

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
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="space-y-4"
      >
        <Label className="text-lg font-semibold text-gradient flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#9b87f5]" />
          Target Grade Level
        </Label>
        <div className="grid grid-cols-3 gap-3">
          {(['A', 'B', 'C'] as GradeLevel[]).map((grade) => (
            <button
              key={grade}
              onClick={() => {
                setTargetGrade(grade);
                updateConfig(grade, selectedFlaws, writingStyle, confidenceLevel);
              }}
              className={`
                relative p-4 rounded-xl text-center transition-all duration-300
                hover:scale-105 group
                ${targetGrade === grade
                  ? 'bg-gradient-to-r from-[#9b87f5] to-[#6366f1] text-white shadow-lg'
                  : 'neo-blur text-white/80 hover:bg-white/10'
                }
              `}
            >
              <span className="text-lg font-semibold">{grade}</span>
              {targetGrade === grade && (
                <CheckCircle className="absolute bottom-1 right-1 w-4 h-4 text-white/80" />
              )}

              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="space-y-4"
      >
        <Label className="text-lg font-semibold text-gradient flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#9b87f5]" />
          Writing Style
        </Label>
        <Select
          value={writingStyle}
          onValueChange={(value: 'formal' | 'casual' | 'mixed') => {
            setWritingStyle(value);
            updateConfig(targetGrade, selectedFlaws, value, confidenceLevel);
          }}
        >
          <SelectTrigger className="glass-morphism border-0 text-white h-12">
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent className="glass-morphism border-white/10">
            <SelectItem value="formal" className="text-white hover:bg-white/10">Formal</SelectItem>
            <SelectItem value="casual" className="text-white hover:bg-white/10">Casual</SelectItem>
            <SelectItem value="mixed" className="text-white hover:bg-white/10">Mixed</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="space-y-4"
      >
        <Label className="text-lg font-semibold text-gradient flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#9b87f5]" />
          Confidence Level
        </Label>
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
        <div className="text-sm font-medium bg-gradient-to-r from-[#9b87f5] to-[#6366f1] bg-clip-text text-transparent text-right">
          {confidenceLevel}% Confident
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="space-y-4"
      >
        <Label className="text-lg font-semibold text-gradient flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#9b87f5]" />
          Writing Flaws
        </Label>
        <p className="text-sm text-white/70">
          Select any flaws you'd like to include in your writing to make it appear more natural.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AVAILABLE_FLAWS.map((flaw, index) => (
            <motion.div
              key={flaw.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + (index * 0.05) }}
              onClick={() => handleFlawToggle(flaw)}
              className={`
                group relative overflow-hidden
                p-4 rounded-xl transition-all duration-300
                neo-blur hover:bg-black/60 cursor-pointer
                ${selectedFlaws.some(f => f.id === flaw.id) ? 'ring-2 ring-[#9b87f5]/50' : ''}
              `}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 flex items-start space-x-4">
                <Checkbox
                  checked={selectedFlaws.some(f => f.id === flaw.id)}
                  onCheckedChange={() => handleFlawToggle(flaw)}
                  className="rounded-lg border-[#9b87f5]/50 data-[state=checked]:bg-[#9b87f5] data-[state=checked]:border-[#9b87f5] transition-all duration-300"
                />
                <div className="space-y-1.5 flex-1">
                  <Label className="text-base font-medium text-white group-hover:text-[#9b87f5] transition-colors duration-300">
                    {flaw.label}
                  </Label>
                  <p className="text-sm text-gray-400 leading-relaxed">{flaw.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
