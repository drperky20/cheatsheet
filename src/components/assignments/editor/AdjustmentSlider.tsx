
import React from 'react';
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";

interface AdjustmentSliderProps {
  type: 'length' | 'grade';
  value: number;
  onChange: (value: number) => void;
  onClose: () => void;
}

export const AdjustmentSlider = ({ type, value, onChange, onClose }: AdjustmentSliderProps) => {
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

  return (
    <Card className="fixed right-24 top-1/2 -translate-y-1/2 h-96 w-20 neo-blur p-3 rounded-full flex flex-col items-center justify-center">
      <div className="relative h-full w-full flex items-center justify-center">
        <Slider
          orientation="vertical"
          defaultValue={[value]}
          max={10}
          step={1}
          value={[value]}
          onValueChange={([newValue]) => onChange(newValue)}
          className="h-72"
        />
        <div className="absolute -left-32 select-none">
          <div className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium">
            {getLabel(value)}
          </div>
        </div>
        <div className="absolute -right-2 top-0 bottom-0 w-[2px] bg-white/10" />
      </div>
    </Card>
  );
};
