
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ShrinkIcon, ExpandIcon, Loader2 } from "lucide-react";

interface LengthAdjusterProps {
  lengthFactor: number;
  onLengthFactorChange: (value: number) => void;
  onAdjust: () => void;
  isProcessing: boolean;
  hasContent: boolean;
}

export const LengthAdjuster = ({
  lengthFactor,
  onLengthFactorChange,
  onAdjust,
  isProcessing,
  hasContent,
}: LengthAdjusterProps) => {
  return (
    <Card className="p-4 neo-blur border-white/10">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">Length Adjustment</span>
        </div>
        
        <div className="flex items-center gap-2">
          <ShrinkIcon className="w-4 h-4 text-[#9b87f5]" />
          <div className="w-[200px] px-2">
            <Slider
              value={[lengthFactor * 100]}
              onValueChange={(value) => onLengthFactorChange(value[0] / 100)}
              min={50}
              max={200}
              step={10}
            />
          </div>
          <ExpandIcon className="w-4 h-4 text-[#9b87f5]" />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-[#9b87f5] font-medium">
            {Math.round(lengthFactor * 100)}% Length
          </div>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={onAdjust}
            disabled={isProcessing || !hasContent}
            className="bg-[#1A1F2C] hover:bg-[#2A2F3C] text-white"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              "Adjust Length"
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};
