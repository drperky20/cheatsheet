import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion, useAnimation, Variants } from 'framer-motion';

// Standard animation variants
export const fadeIn: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.7,
      ease: [0.65, 0, 0.35, 1]
    }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: { 
      duration: 0.7,
      ease: [0.65, 0, 0.35, 1]
    }
  }
};

export const slideIn: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.7,
      ease: [0.65, 0, 0.35, 1]
    }
  },
  exit: { 
    opacity: 0, 
    x: 20,
    transition: { 
      duration: 0.7,
      ease: [0.65, 0, 0.35, 1]
    }
  }
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.4,
      ease: [0.65, 0, 0.35, 1]
    }
  },
  hover: {
    scale: 1.03,
    transition: { duration: 0.3 }
  },
  tap: {
    scale: 0.97,
    transition: { duration: 0.1 }
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.65, 0, 0.35, 1]
    }
  }
};

// Hook to trigger animations when element is in view
export function useAnimateOnScroll(threshold = 0.1) {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold,
    triggerOnce: true
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return { ref, controls, inView };
}

// Staggered animation for lists
export function useStaggerAnimation(itemCount: number, threshold = 0.1) {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold,
    triggerOnce: true
  });

  useEffect(() => {
    if (inView) {
      controls.start(i => ({
        opacity: 1,
        y: 0,
        transition: { 
          delay: i * 0.1,
          duration: 0.5,
          ease: [0.65, 0, 0.35, 1]
        }
      }));
    }
  }, [controls, inView, itemCount]);

  return { ref, controls, inView };
}

// Page transition animation
export const pageTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.65, 0, 0.35, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.7,
      ease: [0.65, 0, 0.35, 1],
    },
  },
};

// MicroInteraction for buttons and interactive elements
export const microInteraction: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.03, transition: { duration: 0.3 } },
  tap: { scale: 0.97, transition: { duration: 0.1 } }
};