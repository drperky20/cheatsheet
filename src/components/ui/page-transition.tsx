import React, { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { pageTransitionVariants } from "@/hooks/use-animations";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  /**
   * A unique identifier for the route, used for AnimatePresence to track route changes
   */
  routeKey: string | number;
}

/**
 * Page transition component that wraps page content to provide smooth transitions
 * between routes using Framer Motion animations.
 */
const PageTransition = ({ children, className = "", routeKey }: PageTransitionProps) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={routeKey}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransitionVariants}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * A wrapper for content sections that adds entry animations
 * when the section becomes visible in the viewport
 */
export const AnimatedSection = ({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ 
        opacity: 1, 
        y: 0, 
        transition: { 
          duration: 0.7, 
          ease: [0.65, 0, 0.35, 1],
          delay 
        } 
      }}
      viewport={{ once: true, margin: "-100px" }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

/**
 * A micro-interaction wrapper for interactive elements
 */
export const MicroInteraction = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * A skeleton loader component for content that's being loaded
 */
export const SkeletonLoader = ({
  width = "100%",
  height = "20px",
  className = "",
}: {
  width?: string | number;
  height?: string | number;
  className?: string;
}) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
    />
  );
};

export default PageTransition;