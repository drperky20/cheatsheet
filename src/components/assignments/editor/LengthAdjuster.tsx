
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ShrinkIcon, ExpandIcon } from "lucide-react";

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
    <Card className="p-4 neo-blur">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">Length Adjustment</span>
          <div className="flex items-center gap-2">
            <ShrinkIcon className="w-4 h-4 text-white/60" />
            <Slider
              value={[lengthFactor * 100]}
              onValueChange={(value) => onLengthFactorChange(value[0] / 100)}
              min={50}
              max={200}
              step={10}
              className="w-[200px]"
            />
            <ExpandIcon className="w-4 h-4 text-white/60" />
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={onAdjust}
            disabled={isProcessing || !hasContent}
          >
            Adjust Length
          </Button>
        </div>
      </div>
    </Card>
  );
};
