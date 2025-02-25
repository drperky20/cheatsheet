import * as React from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

export interface DebouncedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  debounceTime?: number;
  onDebounceChange?: (value: string) => void;
}

const DebouncedInput = React.forwardRef<HTMLInputElement, DebouncedInputProps>(
  ({ className, debounceTime = 400, onDebounceChange, onChange, value, ...props }, ref) => {
    const [inputValue, setInputValue] = React.useState<string>((value as string) || "");
    const debouncedValue = useDebounce(inputValue, debounceTime);
    
    // Handle immediate input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      onChange?.(e);
    };
    
    // Process debounced value
    React.useEffect(() => {
      if (onDebounceChange) {
        onDebounceChange(debouncedValue);
      }
    }, [debouncedValue, onDebounceChange]);
    
    // Sync the input value if the prop value changes externally
    React.useEffect(() => {
      if (value !== undefined && value !== inputValue) {
        setInputValue(value as string);
      }
    }, [value]);

    return (
      <input
        className={cn(
          "flex h-10 w-full rounded-xl border border-white/10 bg-black/20 backdrop-blur-md px-3 py-2",
          "text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2",
          "focus:ring-primary/40 focus-visible:ring-2 focus-visible:ring-primary/40",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-300",
          className
        )}
        ref={ref}
        value={inputValue}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

DebouncedInput.displayName = "DebouncedInput";

export { DebouncedInput };