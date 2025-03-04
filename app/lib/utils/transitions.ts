import { Variants } from 'framer-motion';

// Page transition variants
export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5, 
      ease: 'easeInOut' 
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { 
      duration: 0.3, 
      ease: 'easeInOut' 
    }
  }
};

// Staggered children animation variants
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
      when: 'beforeChildren'
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
      when: 'afterChildren'
    }
  }
};

// Individual item animation variants
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.4, 
      ease: 'easeOut' 
    }
  },
  exit: { 
    opacity: 0, 
    y: 10,
    transition: { 
      duration: 0.3, 
      ease: 'easeIn' 
    }
  }
};

// Fade in animation variants
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.6, 
      ease: 'easeInOut' 
    }
  },
  exit: { 
    opacity: 0,
    transition: { 
      duration: 0.4, 
      ease: 'easeInOut' 
    }
  }
};

// Scale animation variants
export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.5, 
      ease: [0.175, 0.885, 0.32, 1.275] // Custom cubic bezier for a nice spring effect
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { 
      duration: 0.3, 
      ease: 'easeIn' 
    }
  }
};

// Slide in from right animation variants
export const slideInRightVariants: Variants = {
  hidden: { opacity: 0, x: 100 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.5, 
      ease: 'easeOut' 
    }
  },
  exit: { 
    opacity: 0, 
    x: -100,
    transition: { 
      duration: 0.3, 
      ease: 'easeIn' 
    }
  }
};

// Slide in from left animation variants
export const slideInLeftVariants: Variants = {
  hidden: { opacity: 0, x: -100 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.5, 
      ease: 'easeOut' 
    }
  },
  exit: { 
    opacity: 0, 
    x: 100,
    transition: { 
      duration: 0.3, 
      ease: 'easeIn' 
    }
  }
};

// Form field animation variants
export const formFieldVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.3, 
      ease: 'easeOut' 
    }
  },
  exit: { 
    opacity: 0,
    transition: { 
      duration: 0.2, 
      ease: 'easeIn' 
    }
  }
};

// Button animation variants
export const buttonVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.3, 
      ease: 'easeOut' 
    }
  },
  hover: { 
    scale: 1.05,
    transition: { 
      duration: 0.2, 
      ease: 'easeInOut' 
    }
  },
  tap: { 
    scale: 0.95,
    transition: { 
      duration: 0.1, 
      ease: 'easeInOut' 
    }
  },
  exit: { 
    opacity: 0,
    transition: { 
      duration: 0.2, 
      ease: 'easeIn' 
    }
  }
}; 