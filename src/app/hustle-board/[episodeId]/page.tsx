"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useGetGameContestants } from "@/app/admin/misc/api";
import HustleBoardNumberPicks from "../components/HustleBoardNumberPicks";
import ReviewHustle from "../components/ReviewHustle";
import Stage1QuestionScreen from "../components/Stage1QuestionScreen";
import ViewOnlyQuestionTwoScreen from "../components/statge2/StageTwoQuestionScreen";
// import Stage3GetReadyPage from "@/app/components/stages/components/stage3/Stage3GetReadyPage";
// import Stage3CardSelectionScreens from "../components/stage3/Stage3CardSelectionScreen";
import Stage4BoardGetReadyPage from "../components/stage4/ShowStage4Prep";
import Stage3HustleBoardGetReadyPage from "../components/stage3/Stage3GetReadyScreen";
import RevealBallNumber from "../components/stage4/RevealBallNumber";

const pageVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

const HomePage = () => {
  const [step, setStep] = useState<number | null>(1);
  const params = useParams();

  const { data: allContestants, isLoading } = useGetGameContestants(
    Number(params?.episodeId)
  );

  const gameStage = allContestants?.game?.stage;

  // Set initial step based on game.stage
  // useEffect(() => {
  //   if (!isLoading && gameStage) {
  //      setStep((prevStep) => {
  //     if (prevStep !== null) return prevStep; // don't override if already set

  //     switch (gameStage) {
  //       case "STAGE_ONE":
  //         return 1;
  //       case "STAGE_TWO":
  //         return 4;
  //       case "STAGE_THREE":
  //         return 5;
  //       default:
  //         return 1;
  //     }
  //   });
  //   }
  // }, [isLoading, gameStage]);

  // if (step === null || isLoading) return null; // or loader

  return (
    <AnimatePresence mode="wait">
      {/* {step === 1 && (
        <motion.div key="step1" className="h-full" {...motionProps}>
          <HustleBoardNumberPicks onNext={() => setStep(2)} />
        </motion.div>
      )}

      {step === 2 && (
        <motion.div key="step2" className="h-full" {...motionProps}>
          <ReviewHustle onNext={() => setStep(3)} />
        </motion.div>
      )}

      {step === 3 && (
        <motion.div key="step3" className="h-full" {...motionProps}>
          <Stage1QuestionScreen />
        </motion.div>
      )}

      {step === 4 && (
        <motion.div key="step4" className="h-full" {...motionProps}>
          <ViewOnlyQuestionTwoScreen  />
        </motion.div>
      )}

     

      {step === 5 && (
        <motion.div key="step5" className="h-full" {...motionProps}>
          <Stage3HustleBoardGetReadyPage />
        </motion.div>
      )}

      {step === 6 && (
        <motion.div key="step6" className="h-full" {...motionProps}>
          <Stage4BoardGetReadyPage />
        </motion.div>
      )} */}

     {step===1&& <RevealBallNumber/>}
    </AnimatePresence>
  );
};

const motionProps = {
  initial: "initial",
  animate: "animate",
  exit: "exit",
  transition: { duration: 0.4 },
  variants: pageVariants,
};

export default HomePage;