

"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import Hustle from "./components/stages/components/hustle/Hustle";
import QuestionScreen from "./components/stages/components/hustle/QuestionScreen";
import { tokenStorage } from "@/utils/auth";
import { TEpisodeInfo, useGetGameContestants } from "./admin/misc/api";
import QuestionTwoScreen from "./components/stages/components/stage2/QuestionTwoScreen";
import Stage3GetReadyPage from "./components/stages/components/stage3/Stage3GetReadyPage";
import Stage3CardSelection from "./components/stages/components/stage3/Stage3CardSelection";
import Stage1 from "./components/stages/components/hustle/Stage1";
import { getStageFromStep, UNIVERSAL_GAME_STEPS, UniversalGameStep } from "@/constants";
import { LastStepStorage } from "@/lib/lastStep";
import { useMQTT } from "@/hooks/useMqttService";
import StageOneTally from "./components/stages/components/hustle/StageOneTally";
import { GameSynchroniser } from "@/components/gameplay/Heartbeat";
import ContestantStage4 from "./components/stages/components/stage4/Stage4";


const ContestantHomePage = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationRef = useRef(false);



  const user = tokenStorage.getUser();
  const gameEpisode = user?.game_episode;
  const { data: allContestants, isLoading } = useGetGameContestants(
    gameEpisode as number
  );
  const [gameState, setGameState] = useState<TEpisodeInfo>({
    game_episode: Number(gameEpisode),
    game_nick: "",
    status: "IN_ACTIVE",
    stage: "STAGE_ONE",
    reveal_step_count: "SINGLE",
    lastAction: "",
    showQuestions: false,
    step: UNIVERSAL_GAME_STEPS.GAME_SETUP,
    finale_type: "GRAND_PRIZE",
    is_golden_match_active: false
  });




  const { addMessageListener, removeMessageListener, isConnected } = useMQTT()

  useEffect(() => {
    const handleMQTTMessage = (message: any) => {
      if (message?.topic.includes("/game-sync")) return
      if (message.payload.source === "host" && Number(message.payload.game_episode as string) === Number(gameEpisode)) {
        console.log(message, "Contestant received message from host");
        setGameState((prev) => ({
          ...prev,
          step: message.event as string,
          stage: getStageFromStep(message.event)
        }))
        LastStepStorage.setLastStep({
          step: message.event,
          gameEpisode: Array.isArray(gameEpisode) ? gameEpisode[0] : gameEpisode,
        });

      }
    };

    if (isConnected) {
      addMessageListener(handleMQTTMessage);
    }

    return () => {
      removeMessageListener(handleMQTTMessage);
    };

  }, [addMessageListener, removeMessageListener])


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
  const { data: contestantsData, isLoading: isLoadingContestants } =
    useGetGameContestants(Number(gameEpisode));

  // Initialize game data when contestants data is loaded
  useEffect(() => {
    if (!gameEpisode) {
      return;
    }
    if (!isLoadingContestants && contestantsData) {
      initializationRef.current = true;

      const savedStep = LastStepStorage.getLastStep();
      console.log("Saved Step:", savedStep);

      const savedStepStage = getStageFromStep(savedStep?.step || UNIVERSAL_GAME_STEPS.GAME_START);

      if (savedStepStage !== contestantsData.game.stage) {
        console.log("Stage mismatch, resetting step to init");
        LastStepStorage.setLastStep({
          step: UNIVERSAL_GAME_STEPS.GAME_START,
          gameEpisode: String(gameEpisode),
        });
      }
      else {
        console.log("Stage matches, using saved step");
        LastStepStorage.setLastStep({
          step: savedStep?.step || UNIVERSAL_GAME_STEPS.GAME_START,
          gameEpisode: String(gameEpisode),
        });
        setGameState((prevState) => ({
          ...prevState,
          step: savedStep?.step || UNIVERSAL_GAME_STEPS.GAME_START,
          stage: contestantsData.game.stage || "STAGE_ONE",
          game_episode: Number(gameEpisode),
          game_nick: contestantsData.game.game_nick || "",
          status: contestantsData.game.status || "IN_ACTIVE",
          reveal_step_count: contestantsData.game.reveal_step_count || "SINGLE",
        }));
      }

      setIsInitialized(true);
    }
  }, [contestantsData, isLoadingContestants, isLoading, gameEpisode]);



  // Show loading state until properly initialized
  if (!isInitialized) {
    return (
      <div className="fixed top-0 right-0 m-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
      </div>
    );
  }


  return (
    <div className="h-full relative">
      {/* <div className="z-[500] absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-sm">
        Stage: {gameState.stage},  Step: {gameState.step}
      </div> */}

      <AnimatePresence mode="wait">

        {
          gameState.stage.includes("STAGE_ONE") && (
            <>

              {(
                gameState.step === UNIVERSAL_GAME_STEPS.GAME_SETUP ||
                gameState.step === UNIVERSAL_GAME_STEPS.GAME_START ||
                gameState.step === UNIVERSAL_GAME_STEPS.STAGE1_INIT ||
                gameState.step === UNIVERSAL_GAME_STEPS.STAGE1_HUSTLE_PICK ||
                gameState.step === UNIVERSAL_GAME_STEPS.STAGE1_HUSTLE_PICK_TIME_ELAPSE
              ) && (
                  <motion.div key={"number-pick"} className="h-full" {...motionProps}>
                    <Stage1 />
                  </motion.div>
                )
              }
              {
                (
                  gameState.step === UNIVERSAL_GAME_STEPS.STAGE1_HUSTLE_REVEAL
                ) && (
                  <motion.div key={gameState.step} className="h-full" {...motionProps}>
                    <Hustle />
                  </motion.div>
                )
              }

              {
                (
                  (
                    gameState.step === UNIVERSAL_GAME_STEPS.STAGE1_QUESTIONS_PREP ||
                    gameState.step === UNIVERSAL_GAME_STEPS.STAGE1_QUESTIONS ||
                    gameState.step === UNIVERSAL_GAME_STEPS.STAGE1_QUESTION_REVEAL ||
                    gameState.step === UNIVERSAL_GAME_STEPS.STAGE1_TIMER_RUNNING ||
                    gameState.step === UNIVERSAL_GAME_STEPS.STAGE1_BIDS_REVEAL ||
                    gameState.step === UNIVERSAL_GAME_STEPS.STAGE1_QUESTION_RESULT_REVEAL
                  )
                )
                && (
                  <motion.div key={"question-section"} className="h-full" {...motionProps}>
                    <QuestionScreen />
                  </motion.div>
                )
              }
              {
                (
                  gameState.step === UNIVERSAL_GAME_STEPS.STAGE1_RESULTS
                )
                && (
                  <motion.div key={"game_s1_results_reveal"} className="h-full" {...motionProps}>
                    <StageOneTally
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
          gameState.stage.includes("STAGE_TWO") && (
            <>
              {
                (
                  gameState.step === UNIVERSAL_GAME_STEPS.STAGE2_INIT
                )
                && (
                  <motion.div key={"game_s1_results_reveal"} className="h-full" {...motionProps}>
                    <StageOneTally
                      eliminationCount={0}
                      removeCount={0}
                      activeState={1}
                    />
                  </motion.div>
                )
              }

              {
                (
                  (
                    gameState.step === UNIVERSAL_GAME_STEPS.STAGE2_PREP ||
                    gameState.step === UNIVERSAL_GAME_STEPS.STAGE2_QUESTIONS ||
                    gameState.step === UNIVERSAL_GAME_STEPS.STAGE2_QUESTION_REVEAL ||
                    gameState.step === UNIVERSAL_GAME_STEPS.STAGE2_TIMER_RUNNING ||
                    gameState.step === UNIVERSAL_GAME_STEPS.STAGE2_QUESTION_RESULT_REVEAL ||
                    gameState.step === UNIVERSAL_GAME_STEPS.STAGE2_OPTIONS_SELECT_REVEAL
                  )
                )
                && (
                  <motion.div key={gameState.step === UNIVERSAL_GAME_STEPS.STAGE2_PREP ? "prep-questions" : "question-section"} className="h-full" {...motionProps}>
                    <QuestionTwoScreen />
                  </motion.div>
                )
              }
              {
                (
                  gameState.step === UNIVERSAL_GAME_STEPS.STAGE2_RESULTS
                )
                && (
                  <motion.div key={"stage-2-results"} className="h-full" {...motionProps}>
                    <StageOneTally
                      eliminationCount={2}
                      removeCount={2}
                      title="stage 2"
                      activeState={2}
                    />
                  </motion.div>
                )
              }
            </>
          )
        }

        {
          gameState.stage.includes("STAGE_THREE") && (
            <>
              {
                (
                  gameState.step === UNIVERSAL_GAME_STEPS.STAGE2_RESULTS ||
                  gameState.step === UNIVERSAL_GAME_STEPS.STAGE3_INIT
                )
                && (
                  <motion.div key={"stage-2-results"} className="h-full" {...motionProps}>
                    <StageOneTally
                      eliminationCount={2}
                      removeCount={2}
                      title="stage 2"
                      activeState={2}
                    />
                  </motion.div>
                )
              }
              {
                (
                  gameState.step === UNIVERSAL_GAME_STEPS.STAGE3_PREP
                ) && (
                  <motion.div key={gameState.step} className="h-full" {...motionProps}>
                    <Stage3GetReadyPage />
                  </motion.div>
                )
              }
              {
                (
                  gameState.step === UNIVERSAL_GAME_STEPS.STAGE3_PICKS_START ||
                  gameState.step === UNIVERSAL_GAME_STEPS.STAGE3_END
                ) && (
                  <motion.div key={"card-selection-stage"} className="h-full" {...motionProps}>
                    <Stage3CardSelection />
                  </motion.div>
                )
              }


            </>
          )
        }
        {
          gameState.stage.includes("STAGE_FOUR") && (
            <>
              {
                (
                  gameState.step === UNIVERSAL_GAME_STEPS.STAGE4_INIT
                )
                && (
                  <motion.div key={"stage-4-init"} className="h-full" {...motionProps}>
                    <ContestantStage4 />
                  </motion.div>
                )
              }
              S
            </>
          )
        }

      </AnimatePresence>

      <GameSynchroniser
        gameId={String(gameEpisode!)}
        participantId={`contestant-${user?.contestant_id}`}
        participantType="contestant"
        participantName={user?.name || "Contestant"}
        gameState={gameState}
        setGameState={setGameState}
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
