
import React, { useState } from 'react';
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

  return (
    <Card className="fixed right-20 top-1/2 -translate-y-1/2 h-[500px] w-24 neo-blur p-4 rounded-[32px] flex flex-col items-center justify-between gap-4">
      <div className="flex-1 relative w-full flex items-center justify-center">
        <Slider
          orientation="vertical"
          defaultValue={[value]}
          max={10}
          step={1}
          value={[localValue]}
          onValueChange={([newValue]) => setLocalValue(newValue)}
          className="h-[360px]"
        />
        <div className="absolute -left-48 top-1/2 -translate-y-1/2 select-none">
          <div className="px-4 py-2 rounded-xl bg-black/80 backdrop-blur-sm text-white text-sm font-medium">
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
          Keep changes
        </Button>
        <Button 
          onClick={onClose}
          variant="outline"
          className="w-full rounded-xl border-white/10 hover:bg-white/5"
          size="sm"
        >
          Cancel
        </Button>
      </div>
    </Card>
  );
};
