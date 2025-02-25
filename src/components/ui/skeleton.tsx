import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { skeletonVariants } from "@/lib/motion";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  animated?: boolean;
}

/**
 * Skeleton component for loading states
 * Optionally accepts 'animated' prop to enable gradient animation
 */
function Skeleton({ className, animated = true, ...props }: SkeletonProps) {
  if (animated) {
    return (
      <motion.div
        className={cn(
          "rounded-md bg-gradient-to-r from-black/40 via-black/30 to-black/40 bg-[length:400%_100%]",
          className
        )}
        variants={skeletonVariants}
        initial="initial"
        animate="animate"
        {...props as any}
      />
    );
  }
  
  return (
    <div
      className={cn(
        "rounded-md bg-gradient-to-r from-black/40 via-black/30 to-black/40",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
