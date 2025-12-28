import { Variants } from "framer-motion";

// --- NANO BANANA PRO ANIMATION SYSTEM ---
// "Organic, Snappy, Professional"

export const springTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
};

export const softSpringTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: springTransition
  },
  exit: { 
    opacity: 0, 
    scale: 0.9,
    transition: { duration: 0.2 }
  },
};

export const popHover: Variants = {
  hover: { 
    scale: 1.05, 
    y: -5,
    transition: { type: "spring", stiffness: 400, damping: 17 }
  },
  tap: { 
    scale: 0.95,
    transition: { type: "spring", stiffness: 400, damping: 17 }
  }
};

export const slideUpVariants: Variants = {
  hidden: { y: "100%", opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 }
  },
  exit: { 
    y: "100%", 
    opacity: 0,
    transition: { duration: 0.3, ease: "easeInOut" }
  }
};
