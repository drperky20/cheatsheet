
import React, { useState } from 'react';
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface AdjustmentSliderProps {
  type: 'length' | 'grade';
  value: number;
  onChange: (value: number) => void;
  onClose: () => void;
}

export const AdjustmentSlider = ({ type, value, onChange, onClose }: AdjustmentSliderProps) => {
  const [localValue, setLocalValue] = useState(value);
  
  const getLengthLabel = (value: number) => {
    if (value <= 2.5) return "Shortest";
    if (value <= 5) return "Shorter";
    if (value <= 7.5) return "Longer";
    return "Longest";
  };

  const getGradeLabel = (value: number) => {
    if (value <= 2.5) return "Kindergarten";
    if (value <= 5) return "Middle School";
    if (value <= 7.5) return "High School";
    return "College";
  };

  const getLabel = type === 'length' ? getLengthLabel : getGradeLabel;

  const handleSubmit = () => {
    onChange(localValue);
    onClose();
  };

  const labelPosition = `${(10 - localValue) * 10}%`;

  return (
    <Card className="fixed right-20 top-1/2 -translate-y-1/2 h-[520px] w-28 bg-[#222222]/90 backdrop-blur-md p-4 rounded-[32px] flex flex-col items-center justify-between gap-4 border border-white/10">
      <div className="flex-1 relative w-full flex items-center justify-center">
        <Slider
          orientation="vertical"
          defaultValue={[value]}
          max={10}
          step={1}
          value={[localValue]}
          onValueChange={([newValue]) => setLocalValue(newValue)}
          className="h-[380px]"
        />
        <div 
          className="absolute -left-48 select-none transition-all duration-200 ease-out"
          style={{ 
            top: labelPosition,
            transform: 'translateY(-50%)' 
          }}
        >
          <div className="px-4 py-2 rounded-xl bg-[#222222]/95 backdrop-blur-sm text-white/90 text-sm font-medium border border-white/10">
            {getLabel(localValue)}
          </div>
        </div>
      </div>
      
      <div className="w-full space-y-2">
        <Button 
          onClick={handleSubmit}
          className="w-full rounded-xl bg-[#9b87f5] hover:bg-[#8b77e5] text-white"
          size="sm"
        >
          <Check className="w-4 h-4" />
        </Button>
        <Button 
          onClick={onClose}
          variant="outline"
          className="w-full rounded-xl border-white/10 hover:bg-white/5 text-white/80"
          size="sm"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};
