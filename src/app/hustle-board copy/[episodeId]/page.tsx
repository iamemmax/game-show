"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { tokenStorage } from "@/utils/auth";
import { useParams } from "next/navigation";
import { useGetGameContestants } from "@/app/admin/misc/api";
import HustleBoardNumberPicks from "../components/HustleBoardNumberPicks";
import ReviewHustle from "../components/ReviewHustle";
import Stage1QuestionScreen from "../components/Stage1QuestionScreen";
import ViewOnlyQuestionTwoScreen from "../components/statge2/StageTwoQuestionScreen";
import Stage3BoardGetReadyPage from "../components/stage3/Stage3GetReadyScreen";
import Stage4BoardGetReadyPage from "../components/stage4/ShowStage4Prep";
import RafflePickReveal from "../components/stage4/RafflePickReveal";
import { UNIVERSAL_GAME_STEPS, UniversalGameStep } from "@/constants";
import { GameSynchroniser } from "@/components/gameplay/Heartbeat";

const LOCAL_STORAGE_KEY = "hustle_board_last_step";

const HustleBoard = () => {
  const params = useParams()
  const [step, setStep] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationRef = useRef(false);

  // Track if step transitions are in progress to prevent multiple calls
  const transitioningRef = useRef(false);
  const currentStepRef = useRef<number | null>(null);

  const gameEpisode = params?.episodeId;
  const { data: allContestants, isLoading } = useGetGameContestants(
    Number(gameEpisode)
  );

  const [currentUniversalStep, setCurrentUniversalStep] = useState<UniversalGameStep>(UNIVERSAL_GAME_STEPS.GAME_SETUP)
  const [gameState, setGameState] = useState<{
    currentStage: string
    status: string
    lastAction: string
    currentQuestion: number
    contestants: any[]
    showQuestions: boolean
    currentStageStep: string
  }>({
    currentStage: "STAGE_ONE",
    status: "",
    lastAction: "",
    currentQuestion: 0,
    contestants: [],
    showQuestions: false,
    currentStageStep: "init",
  })

  const updateGameStateFromUniversalStep = (step: UniversalGameStep) => {
    switch (step) {
      case UNIVERSAL_GAME_STEPS.GAME_SETUP:
        setGameState((prev) => ({
          ...prev,
          status: "IN_PROGRESS",
          currentStage: "STAGE_ONE",
          currentStageStep: "init",
        }))
        break
      case UNIVERSAL_GAME_STEPS.GAME_START:
        setGameState((prev) => ({
          ...prev,
          status: "IN_PROGRESS",
          currentStage: "STAGE_ONE",
          currentStageStep: "start",
        }))
        break
      case UNIVERSAL_GAME_STEPS.STAGE1_INIT:
        setGameState((prev) => ({
          ...prev,
          currentStage: "STAGE_ONE",
          currentStageStep: "init",
        }))
        break
      case UNIVERSAL_GAME_STEPS.STAGE1_HUSTLE_PICK:
        setGameState((prev) => ({
          ...prev,
          currentStageStep: "hustle_pick",
          currentStage: "STAGE_ONE",
        }))
        break
      case UNIVERSAL_GAME_STEPS.STAGE1_HUSTLE_REVEAL:
        setGameState((prev) => ({
          ...prev,
          currentStageStep: "hustle_reveal",
          currentStage: "STAGE_ONE",
        }))
        break
      case UNIVERSAL_GAME_STEPS.STAGE1_QUESTIONS_PREP:
        setGameState((prev) => ({
          ...prev,
          currentStageStep: "prep_questions",
          currentStage: "STAGE_ONE",
        }))
        break
      case UNIVERSAL_GAME_STEPS.STAGE1_QUESTIONS:
        setGameState((prev) => ({
          ...prev,
          currentStageStep: "questions",
          showQuestions: true,
          currentStage: "STAGE_ONE",
        }))
        break
      case UNIVERSAL_GAME_STEPS.STAGE1_QUESTION_REVEAL:
        setGameState((prev) => ({
          ...prev,
          currentStageStep: "question_reveal",
          currentStage: "STAGE_ONE",
        }))
        break
      case UNIVERSAL_GAME_STEPS.STAGE1_TIMER_RUNNING:
        setGameState((prev) => ({
          ...prev,
          currentStageStep: "timer_running",
          currentStage: "STAGE_ONE",
        }))
        break
      case UNIVERSAL_GAME_STEPS.STAGE1_BIDS_REVEAL:
        setGameState((prev) => ({
          ...prev,
          currentStageStep: "bids_reveal",
          currentStage: "STAGE_ONE",
        }))
        break
      case UNIVERSAL_GAME_STEPS.STAGE1_RESULTS:
        setGameState((prev) => ({
          ...prev,
          currentStageStep: "results",
        }))
        break
      case UNIVERSAL_GAME_STEPS.STAGE2_INIT:
        setGameState((prev) => ({
          ...prev,
          currentStage: "STAGE_TWO",
          currentStageStep: "init",

        }))
        break
      case UNIVERSAL_GAME_STEPS.STAGE2_PREP:
        setGameState((prev) => ({
          ...prev,
          currentStageStep: "prep_questions",
          currentStage: "STAGE_TWO",
        }))
        break
      case UNIVERSAL_GAME_STEPS.STAGE2_QUESTIONS:
        setGameState((prev) => ({
          ...prev,
          currentStageStep: "questions",
          showQuestions: true,
        }))
        break
      case UNIVERSAL_GAME_STEPS.STAGE3_INIT:
        setGameState((prev) => ({
          ...prev,
          currentStage: "STAGE_THREE",
          currentStageStep: "init",
        }))
        break
      case UNIVERSAL_GAME_STEPS.STAGE4_INIT:
        setGameState((prev) => ({
          ...prev,
          currentStage: "STAGE_FOUR",
          currentStageStep: "init",
        }))
        break
      default:
        break
    }
  }
  //   const { data: allContestants, isLoading } = useGetGameContestants(
  //     Number(params?.episodeId)
  //   );

  //   const gameStage = allContestants?.game?.stage;


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
      case "STAGE_FOUR":
        return 6;
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
    if (isLoading || !gameEpisode || initializationRef.current) return;

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
    if (allContestants?.data && gameEpisode) {
      const myContestant = allContestants.data.find(
        (c) => c.is_eliminated === false
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
  }, [isLoading, allContestants?.data, gameEpisode]);

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
            <HustleBoardNumberPicks onNext={onNextStep2} />
          </motion.div>
        )}
        {step === 2 && (
          <motion.div key="step2" className="h-full" {...motionProps}>
            <ReviewHustle onNext={onNextStep3} />
          </motion.div>
        )}
        {step === 3 && (
          <motion.div key="step3" className="h-full" {...motionProps}>
            <Stage1QuestionScreen onNext={onNextStep4} />
          </motion.div>
        )}
        {step === 4 && (
          <motion.div key="step4" className="h-full" {...motionProps}>
            <ViewOnlyQuestionTwoScreen onNext={onNextStep5} />
          </motion.div>
        )}
        {step === 5 && (
          <motion.div key="step5" className="h-full" {...motionProps}>
            <Stage3BoardGetReadyPage onNext={onNextStep6} />
            {/* <RafflePickReveal /> */}
          </motion.div>
        )}
        {step === 6 && (
          <motion.div key="step6" className="h-full" {...motionProps}>
            <RafflePickReveal />
          </motion.div>
        )}
      </AnimatePresence>

      <GameSynchroniser
        participantId={`audience-${gameEpisode}`}
        participantType="audience"
        participantName="Game Audience"
        currentScreen={gameState.currentStageStep || "init"}
        currentStep={currentUniversalStep}
        gameStage={gameState.currentStage || allContestants?.game.stage || "STAGE_ONE"}
        setCurrentUniversalStep={setCurrentUniversalStep}
        updateGameStateFromUniversalStep={updateGameStateFromUniversalStep}
      />
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

export default HustleBoard;
