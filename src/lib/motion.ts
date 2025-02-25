import { Variants } from 'framer-motion';

// Page transition variants
export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.8,
      ease: [0.65, 0, 0.35, 1] 
    }
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    transition: {
      duration: 0.6,
      ease: [0.65, 0, 0.35, 1]
    }
  }
};

// Element fade in variants
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    transition: { 
      delay: custom * 0.1,
      duration: 0.4
    }
  })
};

// Container staggered children variants
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      when: "beforeChildren"
    }
  }
};

// Card scale hover variants
export const cardVariants: Variants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.04,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  tap: { 
    scale: 0.98,
    transition: {
      duration: 0.15
    }
  }
};

// Button hover variants
export const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  tap: { 
    scale: 0.95,
    transition: {
      duration: 0.15
    }
  }
};

// Skeleton loading variants
export const skeletonVariants: Variants = {
  initial: {
    backgroundPosition: '0% 0%',
  },
  animate: {
    backgroundPosition: '100% 0%',
    transition: {
      repeat: Infinity,
      repeatType: 'mirror',
      duration: 1.5,
      ease: 'linear'
    }
  }
};