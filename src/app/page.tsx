
"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import Stage1 from "./components/stages/Stage1";
import Hustle from "./components/stages/components/hustle/Hustle";
import QuestionScreen from "./components/stages/components/hustle/QuestionScreen";
import { tokenStorage } from "@/utils/auth";
import { useGetGameContestants } from "./admin/misc/api";
import QuestionTwoScreen from "./components/stages/components/stage2/QuestionTwoScreen";
import Stage3CardSelection from "./hustle-board/components/stage3/Stage3CardSelectionScreen";
import Stage3GetReadyPage from "./components/stages/components/stage3/Stage3GetReadyPage";

const pageVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

const ContestantHomePage = () => {
  const [step, setStep] = useState<number | null>(1); // null until we decide
  const user = tokenStorage.getUser();

  const { data: allContestants, isLoading } = useGetGameContestants(
user?.game_episode as number
    
  );



useEffect(() => {
  if (isLoading || !allContestants?.data) return;

  const myContestant = allContestants.data.find(
    (c) => c.id === user?.contestant_id
  );
  const gameStage = allContestants.game?.stage;

  console.log("Game Stage:", gameStage);
  console.log("Is Eliminated:", myContestant?.is_eliminated);

  if (myContestant?.is_eliminated) {
    return;
  }

  switch (gameStage) {
    case "STAGE_ONE":
      setStep(1);
      break;
    case "STAGE_TWO":
      setStep(4);
      break;
    case "STAGE_THREE":
      setStep(5);
      break;
    default:
      setStep(1);
  }
}, [isLoading, allContestants]);


  if (step === null || isLoading) return null; // or show loader

  return (
    <AnimatePresence mode="wait">
      {step === 1 && (
        <motion.div
          key="step1"
          className="h-full"
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4 }}
          variants={pageVariants}
        >
          <Stage1 onNext={() => setStep(2)} />
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          key="step2"
          className="h-full"
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4 }}
          variants={pageVariants}
        >
          <Hustle />
        </motion.div>
      )}

      {step === 3 && (
        <motion.div
          key="step3"
          className="h-full"
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4 }}
          variants={pageVariants}
        >
          <QuestionScreen />
        </motion.div>
      )}

      {/* {step === 4 && (
        <motion.div
          key="step4"
          className="h-full"
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4 }}
          variants={pageVariants}
        >
          <StageOneTally />
        </motion.div>
      )} */}
      {step === 4 && (
        <motion.div
          key="step4"
          className="h-full"
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4 }}
          variants={pageVariants}
        >
          <QuestionTwoScreen />
        </motion.div>
      )}
      {step ===5 && (
        <motion.div
          key="step4"
          className="h-full"
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4 }}
          variants={pageVariants}
        >
          <Stage3GetReadyPage />
        </motion.div>
      )}
      {step === 6 && (
        <motion.div
          key="step4"
          className="h-full"
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4 }}
          variants={pageVariants}
        >
       <Stage3CardSelection/>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContestantHomePage;
