import { Variants } from 'framer-motion';

export const fadeIn = (direction: 'up' | 'down' | 'left' | 'right' = 'up'): Variants => {
  return {
    initial: {
      opacity: 0,
      y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0,
      x: direction === 'left' ? 40 : direction === 'right' ? -40 : 0,
    },
    animate: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    exit: {
      opacity: 0,
      y: direction === 'up' ? -40 : direction === 'down' ? 40 : 0,
      x: direction === 'left' ? -40 : direction === 'right' ? 40 : 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 1, 1],
      },
    },
  };
};

export const stagger = (staggerChildren = 0.1): Variants => ({
  initial: {},
  animate: {
    transition: {
      staggerChildren,
    },
  },
});

export const slideIn = (
  direction: 'up' | 'down' | 'left' | 'right',
  type: 'tween' | 'spring',
  delay?: number,
  duration?: number
): Variants => {
  return {
    initial: {
      opacity: 0,
      y: direction === 'up' ? 100 : direction === 'down' ? -100 : 0,
      x: direction === 'left' ? 100 : direction === 'right' ? -100 : 0,
    },
    animate: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        type,
        delay,
        duration: duration ?? (type === 'spring' ? 0.8 : 0.5),
        ease: 'easeOut',
      },
    },
  };
};

export const glassmorph: Variants = {
  initial: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
    backgroundColor: 'rgba(255, 255, 255, 0)',
  },
  animate: {
    opacity: 1,
    backdropFilter: 'blur(12px)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
    backgroundColor: 'rgba(255, 255, 255, 0)',
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
};