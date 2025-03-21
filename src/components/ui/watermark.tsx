
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
      <motion.div
        className={cn(
          "px-4 py-1.5 rounded-full",
          "border border-[#9b87f5]/30 shadow-lg",
          "bg-gradient-to-r from-[#9b87f5]/20 to-[#8b5cf6]/20",
          "flex items-center"
        )}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <div className={cn(
          "text-[#9b87f5] font-medium",
          "bg-gradient-to-r from-[#9b87f5] to-[#8b5cf6] bg-clip-text text-transparent"
        )}>
          Alpha
        </div>
      </motion.div>
    </motion.div>
  );
};
