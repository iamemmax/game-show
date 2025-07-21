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
import { GameSynchroniser } from "@/components/gameplay/Heartbeat";
import { UNIVERSAL_GAME_STEPS, UniversalGameStep } from "@/constants";
import GetHustleBoardReadyScreen from "../components/GettHustleBoardReadyScreen";
import HustleBoardStageTallyPage from "../components/HustleBoardStageTally";
import StageTwoGetReadyStage from "../components/statge2/StageTwoGetReadyStage";
import { useMQTT } from "@/hooks/useMqttService";
import { LastStepStorage } from "@/lib/lastStep";
import Stage3CardSelectionScreens from "../components/stage3/Stage3CardSelectionScreen";

const LOCAL_STORAGE_KEY = "hustle_board_last_step";

const ContestantHomePage = () => {
  const params = useParams()
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationRef = useRef(false);

  // Track if step transitions are in progress to prevent multiple calls
  const transitioningRef = useRef(false);
  const currentStepRef = useRef<number | null>(null);

  const gameEpisode = params?.episodeId;
  const { data: allContestants, isLoading } = useGetGameContestants(
    Number(gameEpisode)
  );
  const { addMessageListener, removeMessageListener, isConnected } = useMQTT()


  useEffect(() => {
    // Add message listener for game sync events
    const handleMQTTMessage = (message: any) => {
      if (message?.topic.includes("/game-sync")) return
      console.log(message.payload)
      if (message.payload.source === "host") {
        console.log(message, "Hustleboard received message from host");
        LastStepStorage.setLastStep({
          step: message.event,
          gameEpisode: Array.isArray(gameEpisode) ? gameEpisode[0] : gameEpisode,
        });
        updateGameStateFromUniversalStep(message.event as UniversalGameStep);
      }
    };

    if (isConnected) {
      addMessageListener(handleMQTTMessage);
    }

    return () => {
      removeMessageListener(handleMQTTMessage);
    };

  }, [addMessageListener, removeMessageListener])




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






  // Protected step change handler with debouncing
  const handleStepChange = useCallback((nextStep: number) => {
    // Set transitioning flag
    transitioningRef.current = true;

    // Clear transitioning flag after a short delay
    setTimeout(() => {
      transitioningRef.current = false;
    }, 500); // 500ms cooldown period
  }, []);








  /////////////////////////////////////////////////
  /////////////////////////////////////////////////
  /////////////////////////////////////////////////
  /////////////////////////////////////////////////
  /////////////////////////////////////////////////
  /////////////////////////////////////////////////
  /////////////////////////////////////////////////
  /////////////////////////////////////////////////
  /////////////////////////////////////////////////
  /////////////////////////////////////////////////
  /////////////////////////////////////////////////
  /////////////////////////////////////////////////
  const { data: contestantsData, isLoading: isLoadingContestants } = useGetGameContestants(Number(gameEpisode))


  // Initialize game data when contestants data is loaded
  useEffect(() => {
    if (!gameEpisode) {
      return;
    }
    if (!isLoadingContestants && contestantsData) {
      initializationRef.current = true;

      const savedStep = LastStepStorage.getLastStep();

      setGameState((prevState) => ({
        ...prevState,
        currentStage: contestantsData.game.stage || "STAGE_ONE",
        status: contestantsData.game.status,
        contestants: contestantsData.data,
      }))

      // Set active tab based on current stage
      if (contestantsData.game.stage?.includes("STAGE_ONE")) {
        if (contestantsData.game.status == "IN_ACTIVE") {
          setGameState((prevState) => ({
            ...prevState,
            currentStageStep: "start",
          }))
          setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.GAME_SETUP)
        }
        else {
          setCurrentUniversalStep(savedStep?.step || UNIVERSAL_GAME_STEPS.STAGE1_INIT)
          updateGameStateFromUniversalStep(savedStep?.step || UNIVERSAL_GAME_STEPS.STAGE1_INIT)
        }
      } else if (contestantsData.game.stage?.includes("STAGE_TWO")) {
        setCurrentUniversalStep(savedStep?.step || UNIVERSAL_GAME_STEPS.STAGE2_INIT)
        updateGameStateFromUniversalStep(savedStep?.step || UNIVERSAL_GAME_STEPS.STAGE2_INIT)
      } else if (contestantsData.game.stage?.includes("STAGE_THREE")) {
        setCurrentUniversalStep(savedStep?.step || UNIVERSAL_GAME_STEPS.STAGE3_INIT)
        updateGameStateFromUniversalStep(savedStep?.step || UNIVERSAL_GAME_STEPS.STAGE3_INIT)
      } else if (contestantsData.game.stage?.includes("STAGE_FOUR")) {
        setCurrentUniversalStep(savedStep?.step || UNIVERSAL_GAME_STEPS.STAGE4_INIT)
        updateGameStateFromUniversalStep(savedStep?.step || UNIVERSAL_GAME_STEPS.STAGE4_INIT)
      }
      setIsInitialized(true);

    }
  }, [contestantsData, isLoadingContestants, isLoading, gameEpisode]);

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
          currentStage: "STAGE_ONE",
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
          currentStage: "STAGE_TWO",
          currentStageStep: "prep_questions",
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
      case UNIVERSAL_GAME_STEPS.STAGE3_PICKS_START:
        setGameState((prev) => ({
          ...prev,
          currentStage: "STAGE_THREE",
          currentStageStep: "dud_or_pass_picks_start",
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


  if (!isInitialized || currentUniversalStep === null) {
    return (
      <div className="fixed top-0 right-0 m-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

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

        {
          gameState.currentStage.includes("STAGE_ONE") && (
            <>
              {
                (
                  gameState.currentStageStep === "init" ||
                  gameState.currentStageStep === "hustle_pick" ||
                  gameState.currentStageStep === "start"
                ) && (
                  <motion.div key={"number-pick"} className="h-full" {...motionProps}>
                    <HustleBoardNumberPicks />
                  </motion.div>
                )
              }
              {
                (
                  gameState.currentStageStep === "hustle_reveal"
                ) && (
                  <motion.div key={gameState.currentStageStep} className="h-full" {...motionProps}>
                    <ReviewHustle />
                  </motion.div>
                )
              }

              {
                (
                  gameState.currentStageStep === "prep_questions" ||
                  gameState.currentStageStep === "questions" ||
                  gameState.currentStageStep === "question_reveal" ||
                  gameState.currentStageStep === "timer_running" ||
                  gameState.currentStageStep === "bids_reveal" ||
                  gameState.currentStageStep === "question_result_reveal"
                )
                && (
                  <motion.div key={"question-section"} className="h-full" {...motionProps}>
                    <Stage1QuestionScreen />
                  </motion.div>
                )
              }
              {
                (
                  gameState.currentStageStep === "results"
                )
                && (
                  <motion.div key={gameState.currentStageStep} className="h-full" {...motionProps}>
                    <HustleBoardStageTallyPage
                      eliminationCount={0}
                      removeCount={0}
                      activeState={1}

                    />
                  </motion.div>
                )
              }

            </>
          )
        }
        {
          gameState.currentStage.includes("STAGE_TWO") && (
            <>
              {
                (
                  gameState.currentStageStep === "init"
                )
                && (
                  <motion.div key={gameState.currentStageStep} className="h-full" {...motionProps}>
                    <HustleBoardStageTallyPage
                      eliminationCount={0}
                      removeCount={0}
                      activeState={1}

                    />
                  </motion.div>
                )
              }
              {
                (
                  gameState.currentStageStep === "prep_questions"
                ) && (
                  <motion.div key={gameState.currentStageStep} className="h-full" {...motionProps}>
                    <StageTwoGetReadyStage />

                  </motion.div>
                )
              }
              {
                (
                  gameState.currentStageStep === "questions" ||
                  gameState.currentStageStep === "question_reveal" ||
                  gameState.currentStageStep === "timer_running"
                )
                && (
                  <motion.div key={"question-section"} className="h-full" {...motionProps}>
                    <ViewOnlyQuestionTwoScreen />
                  </motion.div>
                )
              }
              {
                (
                  gameState.currentStageStep === "results"
                )
                && (
                  <motion.div key={"stage-2-results"} className="h-full" {...motionProps}>
                    <HustleBoardStageTallyPage
                      eliminationCount={2}
                      removeCount={2}
                      title={"Hustle Board"}
                      activeState={2}
                    />
                  </motion.div>
                )
              }
            </>
          )
        }
        {
          gameState.currentStage.includes("STAGE_THREE") && (
            <>
              {
                (
                  gameState.currentStageStep === "init"
                )
                && (
                  <motion.div key={gameState.currentStageStep} className="h-full" {...motionProps}>
                    <HustleBoardStageTallyPage
                      eliminationCount={0}
                      removeCount={0}
                      activeState={2}

                    />
                  </motion.div>
                )
              }
              {
                (
                  gameState.currentStageStep === "game_s3_prep"
                ) && (
                  <motion.div key={gameState.currentStageStep} className="h-full" {...motionProps}>
                    <Stage3BoardGetReadyPage />
                  </motion.div>
                )
              }
              {
                (
                  gameState.currentStageStep === "dud_or_pass_picks_start"
                ) && (
                  <motion.div key={gameState.currentStageStep} className="h-full" {...motionProps}>
                    <Stage3CardSelectionScreens />
                  </motion.div>
                )
              }
             
              {
                (
                  gameState.currentStageStep === "results"
                )
                && (
                  <motion.div key={"stage-2-results"} className="h-full" {...motionProps}>
                    <HustleBoardStageTallyPage
                      eliminationCount={2}
                      removeCount={2}
                      title={"Hustle Board"}
                      activeState={2}
                    />
                  </motion.div>
                )
              }
            </>
          )
        }

{/*        
        {step === 6 && (
          <motion.div key="step6" className="h-full" {...motionProps}>
            <RafflePickReveal />
          </motion.div>
        )} */}

      </AnimatePresence>


      <GameSynchroniser
        gameId={gameEpisode! as string}
        participantId={`audience-${gameEpisode}`}
        participantType="audience"
        participantName="Game Audience"
        currentScreen={gameState.currentStageStep || "init"}
        currentStep={currentUniversalStep}
        gameStage={gameState.currentStage || contestantsData?.game?.stage || "STAGE_ONE"}
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

export default ContestantHomePage;
