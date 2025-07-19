

"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import Hustle from "./components/stages/components/hustle/Hustle";
import QuestionScreen from "./components/stages/components/hustle/QuestionScreen";
import { tokenStorage } from "@/utils/auth";
import { useGetGameContestants } from "./admin/misc/api";
import QuestionTwoScreen from "./components/stages/components/stage2/QuestionTwoScreen";
import Stage3GetReadyPage from "./components/stages/components/stage3/Stage3GetReadyPage";
import Stage3CardSelection from "./components/stages/components/stage3/Stage3CardSelection";
import Stage1 from "./components/stages/components/hustle/Stage1";

const LOCAL_STORAGE_KEY = "last_step";

const ContestantHomePage = () => {
  const [step, setStep] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationRef = useRef(false);

  // Track if step transitions are in progress to prevent multiple calls
  const transitioningRef = useRef(false);
  const currentStepRef = useRef<number | null>(null);

  const user = tokenStorage.getUser();
  const gameEpisode = user?.game_episode;
  const { data: allContestants, isLoading } = useGetGameContestants(
    gameEpisode as number
  );

  // Update ref when step changes
  useEffect(() => {
    currentStepRef.current = step;
  }, [step]);

  // Helper function to get step from game stage
  const getStepFromGameStage = (gameStage: string) => {
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
  };

  // Helper function to get saved step from localStorage with episode validation
  const getSavedStep = () => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);

        // Check if saved game episode matches current user's game episode
        if (parsed?.gameEpisode !== gameEpisode) {
          console.log(
            `Saved game episode (${parsed?.gameEpisode}) doesn't match current episode (${gameEpisode}). Resetting to step 1.`
          );
          // Clear the invalid stored data
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          return null;
        }

        // Validate step range
        if (parsed.step >= 1 && parsed.step <= 6) {
          console.log(
            `Using saved step ${parsed.step} for episode ${gameEpisode}`
          );
          return parsed.step;
        }
      }
    } catch (error) {
      console.warn("Failed to parse saved step:", error);
      // Clear corrupted data
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    return null;
  };

  // Helper function to save step to localStorage
  const saveStep = (stepToSave: number) => {
    if (gameEpisode !== undefined) {
      try {
        const dataToSave = {
          step: stepToSave,
          gameEpisode,
          timestamp: Date.now(), // Optional: add timestamp for debugging
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
        console.log(`Saved step ${stepToSave} for episode ${gameEpisode}`);
      } catch (error) {
        console.warn("Failed to save step:", error);
      }
    }
  };

  // Helper function to reset to step 1 when episode mismatch is detected
  const resetToStep1 = (reason: string) => {
    console.log(`Resetting to step 1: ${reason}`);
    setStep(1);
    saveStep(1);
    setIsInitialized(true);
  };

  useEffect(() => {
    if (isLoading || !user || initializationRef.current) return;

    initializationRef.current = true;

    // Early validation: if no game episode, reset to step 1
    if (gameEpisode === undefined || gameEpisode === null) {
      resetToStep1("No game episode found for user");
      return;
    }

    const savedStep = getSavedStep();
    const gameStage = allContestants?.game?.stage;
    const gameStageStep = gameStage ? getStepFromGameStage(gameStage) : null;

    // Optional: Range map for stage step validation
    const STAGE_STEP_MAP: Record<string, number[]> = {
      STAGE_ONE: [1, 2, 3],
      STAGE_TWO: [4],
      STAGE_THREE: [5, 6],
    };

    const isStepInCurrentStage = (
      step: number | null,
      stage: string
    ): boolean => {
      if (!step || !stage) return false;
      return STAGE_STEP_MAP[stage]?.includes(step) ?? false;
    };

    // Priority: Use valid saved step within the current stage
    if (gameStage && gameStageStep !== null) {
      if (savedStep !== null && isStepInCurrentStage(savedStep, gameStage)) {
        console.log("Using saved step within current stage:", savedStep);
        setStep(savedStep);
        saveStep(savedStep);
      } else {
        if (savedStep !== null) {
          console.log(
            "Saved step invalid for current stage. Using stage step:",
            gameStageStep
          );
        }
        setStep(gameStageStep);
        saveStep(gameStageStep);
      }
      setIsInitialized(true);
      return;
    }

    // Fallback: If contestant data is available and user isn't eliminated
    if (allContestants?.data && user?.contestant_id) {
      const myContestant = allContestants.data.find(
        (c) => c.id === user.contestant_id
      );
      if (
        myContestant &&
        !myContestant?.is_eliminated &&
        gameStageStep !== null
      ) {
        console.log(
          "Setting step from game stage fallback:",
          gameStage,
          "->",
          gameStageStep
        );
        setStep(gameStageStep);
        saveStep(gameStageStep);
        setIsInitialized(true);
        return;
      }
    }

    // Default: Reset to step 1
    resetToStep1("No valid saved step or game stage found");
  }, [isLoading, allContestants?.data, user, gameEpisode]);

  // Save step changes to localStorage
  useEffect(() => {
    if (isInitialized && step !== null) {
      saveStep(step);
    }
  }, [step, isInitialized]);

  // Protected step change handler with debouncing
  const handleStepChange = useCallback((nextStep: number) => {
    // Prevent multiple rapid calls
    if (transitioningRef.current) {
      console.log("Step transition already in progress, ignoring call");
      return;
    }

    // Prevent calling with same step
    if (currentStepRef.current === nextStep) {
      console.log("Already on step", nextStep, ", ignoring call");
      return;
    }

    // Validate step range
    if (nextStep < 1 || nextStep > 6) {
      console.log("Invalid step:", nextStep);
      return;
    }

    console.log("Step changed:", currentStepRef.current, "->", nextStep);

    // Set transitioning flag
    transitioningRef.current = true;

    setStep(nextStep);

    // Clear transitioning flag after a short delay
    setTimeout(() => {
      transitioningRef.current = false;
    }, 500); // 500ms cooldown period
  }, []);

  // Memoized onNext handlers for each step to prevent unnecessary re-renders
  const onNextStep2 = useCallback(
    () => handleStepChange(2),
    [handleStepChange]
  );
  const onNextStep3 = useCallback(
    () => handleStepChange(3),
    [handleStepChange]
  );
  const onNextStep4 = useCallback(
    () => handleStepChange(4),
    [handleStepChange]
  );
  const onNextStep5 = useCallback(
    () => handleStepChange(5),
    [handleStepChange]
  );
  const onNextStep6 = useCallback(
    () => handleStepChange(6),
    [handleStepChange]
  );

  // Show loading state until properly initialized
  if (!isInitialized || step === null) {
    return (
      <div className="fixed top-0 right-0 m-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  const clearStoredSteps = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      console.log("Cleared stored steps");
      // Reset transitioning state
      transitioningRef.current = false;
      // Reset to step 1
      setStep(1);
    } catch (error) {
      console.warn("Failed to clear stored steps:", error);
    }
  };

  return (
    <div className="h-full relative">
      {/* Clear Steps Button - positioned at top right */}
      {/* <button
        onClick={clearStoredSteps}
        className="absolute top-4 right-4 !z-[999999999999999] bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
        title="Clear saved progress and restart from step 1"
      >
        Reset
      </button> */}

      {/* Debug info
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs z-50">
        Step: {step} | Episode: {gameEpisode} | Transitioning: {transitioningRef.current ? 'Yes' : 'No'}
      </div> */}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" className="h-full" {...motionProps}>
            <Stage1 onNext={onNextStep2} />
          </motion.div>
        )}
        {step === 2 && (
          <motion.div key="step2" className="h-full" {...motionProps}>
            <Hustle onNext={onNextStep3} />
          </motion.div>
        )}
        {step === 3 && (
          <motion.div key="step3" className="h-full" {...motionProps}>
            <QuestionScreen onNext={onNextStep4} />
          </motion.div>
        )}
        {step === 4 && (
          <motion.div key="step4" className="h-full" {...motionProps}>
            <QuestionTwoScreen onNext={onNextStep5} />
          </motion.div>
        )}
        {step === 5 && (
          <motion.div key="step5" className="h-full" {...motionProps}>
            <Stage3GetReadyPage onNext={onNextStep6} />
          </motion.div>
        )}
        {step === 6 && (
          <motion.div key="step6" className="h-full" {...motionProps}>
            <Stage3CardSelection />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
