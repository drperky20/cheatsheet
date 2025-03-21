
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const Watermark = () => {
  return (
    <motion.div 
      className={cn(
        "fixed top-6 right-6 z-[9999] pointer-events-none select-none",
        "flex items-center justify-center"
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
    >
      <div className="relative">
        <div className="absolute inset-0 blur-sm bg-[#9b87f5]/10 rounded-full" />
        <div 
          className={cn(
            "px-3 py-1 rounded-full",
            "border border-[#9b87f5]/20 shadow-lg",
            "bg-black/40 backdrop-blur-sm",
            "text-[#9b87f5] text-sm font-medium"
          )}
        >
          Alpha
        </div>
      </div>
    </motion.div>
  );
};
