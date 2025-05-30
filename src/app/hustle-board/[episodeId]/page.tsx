"use client"
import { AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { motion } from "framer-motion"
import HustleBoardNumberPicks from "../components/HustleBoardNumberPicks";
import ReviewHustle from "../components/ReviewHustle";

// import Stage3CardSelection from "./components/stages/components/stage3/Stage3CardSelection"

export interface resetprop {
  email: string;
  otp: string;
}

const HomePage = () => {
  const [step, setStep] = useState(1);


  const pageVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };



  return (
    <AnimatePresence mode="wait">
      {step === 1 && (
        <motion.div
          animate="animate"
          className="h-full"
          exit="exit"
          initial="initial"
          key="step1"
          transition={{ duration: 0.4 }}
          variants={pageVariants}
        >
         
          <HustleBoardNumberPicks onNext={() => setStep(2)} />
        </motion.div>
      )}
      {step === 2 && (
        <motion.div
          animate="animate"
          className="h-full"
          exit="exit"
          initial="initial"
          key="step2"
          transition={{ duration: 0.4 }}
          variants={pageVariants}
        >
        <ReviewHustle/>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div
          animate="animate"
          className="h-full"
          exit="exit"
          initial="initial"
          key="step6"
          transition={{ duration: 0.4 }}
          variants={pageVariants}
        >
         3
        </motion.div>
      )}
      {step === 4 && (
        <motion.div
          animate="animate"
          className="h-full"
          exit="exit"
          initial="initial"
          key="step6"
          transition={{ duration: 0.4 }}
          variants={pageVariants}
        >
         4
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HomePage;

