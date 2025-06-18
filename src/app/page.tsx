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
// import StageOneTally from "./components/stages/components/hustle/StageOneTally"; // optional

const pageVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

const ContestantHomePage = () => {
  const [step, setStep] = useState<number | null>(null);
  const user = tokenStorage.getUser();
  const { data: allContestants, isLoading } = useGetGameContestants(user?.game_episode as number);

  useEffect(() => {
    if (isLoading || !allContestants?.data || !user?.contestant_id) return;

    const myContestant = allContestants.data.find((c) => c.id === user?.contestant_id);
    const gameStage = allContestants?.game?.stage;

    console.log("Game Stage:", gameStage);
    console.log("Is Eliminated:", myContestant?.is_eliminated);

    if (!myContestant || myContestant?.is_eliminated) return;

    setStep((prevStep) => {
      if (prevStep !== null) return prevStep; // don't override if already set

      switch (gameStage) {
        case "STAGE_ONE":
          return 1;
        case "STAGE_TWO":
          return 4;
        case "STAGE_THREE":
          return 5;
        default:
          return 1;
      }
    });
  }, [isLoading, allContestants?.data, user?.contestant_id]);

  if (step === null || isLoading) return null;

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

      {/* Optional Tally View */}
      {/* {step === 4 && (
        <motion.div
          key="step4-tally"
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
          key="step4-question"
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

      {step === 5 && (
        <motion.div
          key="step5"
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
          key="step6"
          className="h-full"
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4 }}
          variants={pageVariants}
        >
          <Stage3CardSelection />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContestantHomePage;
