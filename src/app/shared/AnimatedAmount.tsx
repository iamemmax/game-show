import React, { useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";

interface AnimatedAmountProps {
  from: number;
  to: number;
  onStart?: () => void;
  onComplete?: () => void;
}

export const AnimatedAmount = ({
  from,
  to,
  onStart,
  onComplete,
}: AnimatedAmountProps) => {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) =>
    `₦${Math.floor(latest).toLocaleString()}`
  );

  useEffect(() => {
    const controls = animate(count, to, {
      duration: 0.8,
      ease: "easeInOut",
      onPlay: () => onStart?.(),
      onComplete: () => onComplete?.(),
    });
    return controls.stop;
  }, [to, onStart, onComplete]);

  return <motion.span>{rounded}</motion.span>;
};
