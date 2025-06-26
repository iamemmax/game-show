export const questionVariants = {
  initial: {
    opacity: 0,
    y: 50,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94], // Custom easing
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -30,
    scale: 0.98,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// Animation variants for question elements
export const questionElementVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

// Animation variants for options
export const optionVariants = {
  initial: {
    opacity: 0,
    x: -20,
    scale: 0.95,
  },
  animate: (index: number) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      delay: 0.1 + index * 0.05, // Stagger animation
      ease: "easeOut",
    },
  }),
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
};

// Animation variants for amount buttons
export const amountButtonVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      delay: 0.2 + index * 0.05,
      ease: "easeOut",
    },
  }),
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
    },
  },
  tap: {
    scale: 0.95,
  },
};
