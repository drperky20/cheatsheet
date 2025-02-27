
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
    if (value <= 2) return "Elementary";
    if (value <= 5) return "Middle School";
    if (value <= 8) return "High School";
    return "College";
  };

  const getLabel = type === 'length' ? getLengthLabel : getGradeLabel;

  const handleSubmit = () => {
    onChange(localValue);
    onClose();
  };

  return (
    <Card className="fixed right-20 top-1/2 -translate-y-1/2 z-40 h-auto w-64 neo-blur border-white/10 p-5 rounded-xl">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-[#9b87f5]">
            {type === 'length' ? 'Adjust Length' : 'Grade Level'}
          </h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 hover:bg-white/10" 
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between text-xs text-white/70">
            <span>{type === 'length' ? 'Shorter' : 'Elementary'}</span>
            <span>{type === 'length' ? 'Longer' : 'College'}</span>
          </div>
          
          <Slider
            value={[localValue]}
            onValueChange={([newValue]) => setLocalValue(newValue)}
            max={type === 'length' ? 2 : 10}
            step={type === 'length' ? 0.1 : 1}
            className="mt-6"
          />
          
          <div className="text-right text-sm font-medium text-[#9b87f5]">
            {getLabel(localValue)}
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button 
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-white/10 text-white/80"
          >
            Cancel
          </Button>
          
          <Button 
            size="sm"
            onClick={handleSubmit}
            className="bg-[#9b87f5] hover:bg-[#8b77e5] text-white gap-1"
          >
            <Check className="w-4 h-4" />
            Apply
          </Button>
        </div>
      </div>
    </Card>
  );
};
