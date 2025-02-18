
import { cn } from "@/lib/utils";

export const Watermark = () => {
  return (
    <div 
      className={cn(
        "fixed top-6 right-6 z-[9999] pointer-events-none select-none",
        "flex items-center justify-center"
      )}
    >
      <div className="relative">
        <div className="absolute inset-0 blur-sm bg-red-500/10 rounded-full" />
        <div 
          className={cn(
            "px-3 py-1 rounded-full",
            "border border-white/10 shadow-lg",
            "bg-black/40 backdrop-blur-sm",
            "text-red-300/80 text-sm font-medium"
          )}
        >
          Alpha
        </div>
      </div>
    </div>
  );
};
