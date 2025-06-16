"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { tokenStorage } from "@/utils/auth";
import { useGetGameContestants } from "@/app/admin/misc/api";
import HustleBoardNumberPicks from "../components/HustleBoardNumberPicks";
import ReviewHustle from "../components/ReviewHustle";
import Stage1QuestionScreen from "../components/Stage1QuestionScreen";
import ViewOnlyQuestionTwoScreen from "../components/statge2/StageTwoQuestionScreen";
import Stage3GetReadyPage from "@/app/components/stages/components/stage3/Stage3GetReadyPage";
import Stage3CardSelection from "../components/stage3/Stage3CardSelectionScreen";

const pageVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

const HomePage = () => {
  const [step, setStep] = useState<number | null>(null);
  const params = useParams();

  const { data: allContestants, isLoading } = useGetGameContestants(
    Number(params?.episodeId)
  );

  const gameStage = allContestants?.game?.stage;

  // Set latest visible stage based on game.stage
  useEffect(() => {
    if (!isLoading && gameStage) {
      switch (gameStage) {
        case "STAGE_ONE":
          setStep(1); // Stage 1 Question Screen (final step of Stage 1)
          break;
        case "STAGE_TWO":
          setStep(4); // Stage 2 question viewer
          break;
        case "STAGE_THREE":
          setStep(6); // Card Selection (most visual/interactive for viewers)
          break;
        default:
          setStep(3);
      }
    }
  }, [isLoading, gameStage]);

  if (step === null || isLoading) return null; // or loader

  return (
    <AnimatePresence mode="wait">
      {step === 1 && (
        <motion.div key="step1" className="h-full" {...motionProps}>
          <HustleBoardNumberPicks onNext={() => setStep(2)} />
        </motion.div>
      )}

      {step === 2 && (
        <motion.div key="step2" className="h-full" {...motionProps}>
          <ReviewHustle />
        </motion.div>
      )}

      {step === 3 && (
        <motion.div key="step3" className="h-full" {...motionProps}>
          <Stage1QuestionScreen />
        </motion.div>
      )}

      {step === 4 && (
        <motion.div key="step4" className="h-full" {...motionProps}>
          <ViewOnlyQuestionTwoScreen />
        </motion.div>
      )}

      {step === 5 && (
        <motion.div key="step5" className="h-full" {...motionProps}>
          <Stage3GetReadyPage />
        </motion.div>
      )}

      {step === 6 && (
        <motion.div key="step6" className="h-full" {...motionProps}>
          <Stage3CardSelection />
        </motion.div>
      )}
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
