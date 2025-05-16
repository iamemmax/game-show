"use client"
import { AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { motion } from "framer-motion"
import Stage1 from "./components/stages/Stage1";
import Hustle from "./components/stages/components/hustle/Hustle";
import QuestionScreen from "./components/stages/components/hustle/QuestionScreen";
import { useMQTT } from "@/hooks/useMqttService";
import { tokenStorage } from "@/utils/auth";
import StageOneTally from "./components/stages/components/hustle/StageOneTally";
import QuestionTwoScreen from "./components/stages/components/stage2/QuestionTwoScreen";

export interface resetprop {
  email: string;
  otp: string;
}

const HomePage = () => {
  const [step, setStep] = useState(1);
  const { isConnected, onMessage } = useMQTT();
  const user = tokenStorage.getUser();

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
          {/* <Stage1
            onNext={() => setStep(2)}
          /> */}
          <QuestionTwoScreen
          />
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
          <Hustle />
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
          <QuestionScreen />
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
          <StageOneTally />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HomePage;

