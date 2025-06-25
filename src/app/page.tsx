// "use client";
// import { AnimatePresence, motion } from "framer-motion";
// import { useState, useEffect } from "react";
// import Stage1 from "./components/stages/Stage1";
// import Hustle from "./components/stages/components/hustle/Hustle";
// import QuestionScreen from "./components/stages/components/hustle/QuestionScreen";
// import { tokenStorage } from "@/utils/auth";
// import { useGetGameContestants } from "./admin/misc/api";
// import QuestionTwoScreen from "./components/stages/components/stage2/QuestionTwoScreen";
// import Stage3CardSelection from "./hustle-board/components/stage3/Stage3CardSelectionScreen";
// import Stage3GetReadyPage from "./components/stages/components/stage3/Stage3GetReadyPage";
// // import StageOneTally from "./components/stages/components/hustle/StageOneTally"; // optional

// const pageVariants = {
//   initial: { opacity: 0, x: 50 },
//   animate: { opacity: 1, x: 0 },
//   exit: { opacity: 0, x: -50 },
// };

// const ContestantHomePage = () => {
//   const [step, setStep] = useState<number | null>(null);
//   const user = tokenStorage.getUser();
//   const { data: allContestants, isLoading } = useGetGameContestants(user?.game_episode as number);

//   useEffect(() => {
//     if (isLoading || !allContestants?.data || !user?.contestant_id) return;

//     const myContestant = allContestants.data.find((c) => c.id === user?.contestant_id);
//     const gameStage = allContestants?.game?.stage;

//     console.log("Game Stage:", gameStage);
//     console.log("Is Eliminated:", myContestant?.is_eliminated);

//     if (!myContestant || myContestant?.is_eliminated) return;

//     setStep((prevStep) => {
//       if (prevStep !== null) return prevStep; // don't override if already set

//       switch (gameStage) {
//         case "STAGE_ONE":
//           return 1;
//         case "STAGE_TWO":
//           return 4;
//         case "STAGE_THREE":
//           return 5;
//         default:
//           return 1;
//       }
//     });
//   }, [isLoading, allContestants?.data, user?.contestant_id]);

//   if (step === null || isLoading) return null;

//   return (
//     <AnimatePresence mode="wait">
//       {step === 1 && (
//         <motion.div
//           key="step1"
//           className="h-full"
//           initial="initial"
//           animate="animate"
//           exit="exit"
//           transition={{ duration: 0.4 }}
//           variants={pageVariants}
//         >
//           <Stage1 onNext={() => setStep(2)} />
//         </motion.div>
//       )}

//       {step === 2 && (
//         <motion.div
//           key="step2"
//           className="h-full"
//           initial="initial"
//           animate="animate"
//           exit="exit"
//           transition={{ duration: 0.4 }}
//           variants={pageVariants}
//         >
//           <Hustle />
//         </motion.div>
//       )}

//       {step === 3 && (
//         <motion.div
//           key="step3"
//           className="h-full"
//           initial="initial"
//           animate="animate"
//           exit="exit"
//           transition={{ duration: 0.4 }}
//           variants={pageVariants}
//         >
//           <QuestionScreen />
//         </motion.div>
//       )}

      

//       {step === 4 && (
//         <motion.div
//           key="step4-question"
//           className="h-full"
//           initial="initial"
//           animate="animate"
//           exit="exit"
//           transition={{ duration: 0.4 }}
//           variants={pageVariants}
//         >
//           <QuestionTwoScreen />
//         </motion.div>
//       )}

//       {step === 5 && (
//         <motion.div
//           key="step5"
//           className="h-full"
//           initial="initial"
//           animate="animate"
//           exit="exit"
//           transition={{ duration: 0.4 }}
//           variants={pageVariants}
//         >
//           <Stage3GetReadyPage />
//         </motion.div>
//       )}

//       {step === 6 && (
//         <motion.div
//           key="step6"
//           className="h-full"
//           initial="initial"
//           animate="animate"
//           exit="exit"
//           transition={{ duration: 0.4 }}
//           variants={pageVariants}
//         >
//           <Stage3CardSelection />
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// };

// export default ContestantHomePage;


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

const LOCAL_STORAGE_KEY = "last_step";

const pageVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

const ContestantHomePage = () => {
  const [step, setStep] = useState<number | null>(null);
  const user = tokenStorage.getUser();
  const gameEpisode = user?.game_episode;
  const { data: allContestants, isLoading } = useGetGameContestants(gameEpisode as number);

  // Restore last step on mount if gameEpisode matches
  useEffect(() => {
    if (!user) return;

    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.gameEpisode === gameEpisode && parsed.step >= 1 && parsed.step <= 6) {
          setStep(parsed.step);
        }
      } catch {
        // Invalid storage — ignore
      }
    }
  }, [gameEpisode, user]);

  // Initialize step based on game stage if not already set
  useEffect(() => {
    if (isLoading || !allContestants?.data || !user?.contestant_id || step !== null) return;

    const myContestant = allContestants.data.find((c) => c.id === user?.contestant_id);
    const gameStage = allContestants?.game?.stage;

    if (!myContestant || myContestant?.is_eliminated) return;

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
        break;
    }
  }, [isLoading, allContestants?.data, user?.contestant_id, step]);

  // Save to localStorage on every step change
  useEffect(() => {
    if (step !== null && gameEpisode !== undefined) {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ step, gameEpisode })
      );
    }
  }, [step, gameEpisode]);

  if (step === null || isLoading) return null;

  const handleStepChange = (nextStep: number) => {
    setStep(nextStep);
  };

  return (
    <AnimatePresence mode="wait">
      {step === 1 && (
        <motion.div key="step1" className="h-full" {...motionProps}>
          <Stage1 onNext={() => handleStepChange(2)} />
        </motion.div>
      )}
      {step === 2 && (
        <motion.div key="step2" className="h-full" {...motionProps}>
          <Hustle />
        </motion.div>
      )}
      {step === 3 && (
        <motion.div key="step3" className="h-full" {...motionProps}>
          <QuestionScreen />
        </motion.div>
      )}
      {step === 4 && (
        <motion.div key="step4" className="h-full" {...motionProps}>
          <QuestionTwoScreen />
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
  variants: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  },
};

export default ContestantHomePage;
