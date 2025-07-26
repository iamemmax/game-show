"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { TEpisodeInfo, useGetGameContestants } from "@/app/admin/misc/api";
import HustleBoardNumberPicks from "../components/HustleBoardNumberPicks";
import ReviewHustle from "../components/ReviewHustle";
import Stage1QuestionScreen from "../components/Stage1QuestionScreen";
import ViewOnlyQuestionTwoScreen from "../components/statge2/StageTwoQuestionScreen";
import Stage3BoardGetReadyPage from "../components/stage3/Stage3GetReadyScreen";
import RafflePickReveal from "../components/stage4/RafflePickReveal";
import { GameSynchroniser } from "@/components/gameplay/Heartbeat";
import { getStageFromStep, UNIVERSAL_GAME_STEPS, UniversalGameStep } from "@/constants";
import HustleBoardStageTallyPage from "../components/HustleBoardStageTally";
import { useMQTT } from "@/hooks/useMqttService";
import { LastStepStorage } from "@/lib/lastStep";
import Stage3CardSelectionScreens from "../components/stage3/Stage3CardSelectionScreen";
import WelcomeUserStory from "../components/WelcomeUserStory";


const HustleBoardPage = () => {
  const params = useParams();
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationRef = useRef(false);


  const gameEpisode = params?.episodeId;
  const { data: allContestants, isLoading } = useGetGameContestants(
    Number(gameEpisode)
  );
  const { addMessageListener, removeMessageListener, isConnected } = useMQTT();

  useEffect(() => {
    // Add message listener for game sync events
    const handleMQTTMessage = (message: any) => {
      if (message?.topic.includes("/game-sync")) return;
      if (message.payload.source === "host" && Number(message.payload.game_episode as string) === Number(gameEpisode)) {
        console.log(
          "host received message from host:", message
        )
        setGameState((prev) => ({
          ...prev,
          step: message.event as string,
          stage: getStageFromStep(message.event)
        }))
        LastStepStorage.setLastStep({
          step: message.event,
          gameEpisode: Array.isArray(gameEpisode)
            ? gameEpisode[0]
            : gameEpisode,
        });
      }
    };

    if (isConnected) {
      addMessageListener(handleMQTTMessage);
    }

    return () => {
      removeMessageListener(handleMQTTMessage);
    };
  }, [addMessageListener, removeMessageListener]);







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
      const savedStepStage = getStageFromStep(savedStep?.step || UNIVERSAL_GAME_STEPS.GAME_START);

      if (savedStepStage !== contestantsData.game.stage) {
        LastStepStorage.setLastStep({
          step: UNIVERSAL_GAME_STEPS.GAME_SETUP,
          gameEpisode: gameEpisode as string,
        });
      }
      else {
        LastStepStorage.setLastStep({
          step: savedStep?.step || UNIVERSAL_GAME_STEPS.GAME_START,
          gameEpisode: gameEpisode as string,
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


  const [gameState, setGameState] = useState<TEpisodeInfo>({
    game_episode: Number(gameEpisode),
    game_nick: "",
    status: "IN_ACTIVE",
    stage: "STAGE_ONE",
    reveal_step_count: "SINGLE",
    lastAction: "",
    showQuestions: false,
    step: UNIVERSAL_GAME_STEPS.GAME_SETUP,
  });



  if (!isInitialized || gameState.step === null) {
    return (
      <div className="fixed top-0 right-0 m-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="h-full relative">


      <AnimatePresence mode="wait">
        {gameState.stage.includes("STAGE_ONE") && (
          <>
            {(
              gameState.step === UNIVERSAL_GAME_STEPS.GAME_SETUP
            ) && (
                <motion.div
                  key={"welcome-user-story"}
                  className="h-full"
                  {...motionProps}
                >
                  <WelcomeUserStory />
                </motion.div>
              )}
            {(
              (
                gameState.step === UNIVERSAL_GAME_STEPS.GAME_START ||
                gameState.step === UNIVERSAL_GAME_STEPS.STAGE1_INIT ||
                gameState.step === UNIVERSAL_GAME_STEPS.STAGE1_HUSTLE_PICK ||
                gameState.step === UNIVERSAL_GAME_STEPS.STAGE1_HUSTLE_PICK_TIME_ELAPSE
              )) && (
                <motion.div
                  key={"number-pick"}
                  className="h-full"
                  {...motionProps}
                >
                  <HustleBoardNumberPicks />
                </motion.div>
              )
            }
            {gameState.step === UNIVERSAL_GAME_STEPS.STAGE1_HUSTLE_REVEAL && (
              <motion.div
                key={gameState.step}
                className="h-full"
                {...motionProps}
              >
                <ReviewHustle />
              </motion.div>
            )}

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
              ) && (
                <motion.div
                  key={"question-section"}
                  className="h-full"
                  {...motionProps}
                >
                  <Stage1QuestionScreen />
                </motion.div>
              )}
            {gameState.step === UNIVERSAL_GAME_STEPS.STAGE1_RESULTS && (
              <motion.div
                key={gameState.step}
                className="h-full"
                {...motionProps}
              >
                <HustleBoardStageTallyPage
                  eliminationCount={0}
                  removeCount={0}
                  activeState={1}
                  title={"Hustle Board"}
                />
              </motion.div>
            )}
          </>
        )}
        {gameState.stage.includes("STAGE_TWO") && (
          <>
            {gameState.step === UNIVERSAL_GAME_STEPS.STAGE2_INIT && (
              <motion.div
                key={gameState.step}
                className="h-full"
                {...motionProps}
              >
                <HustleBoardStageTallyPage
                  eliminationCount={0}
                  removeCount={0}
                  activeState={1}
                  title={"Hustle Board"}
                />
              </motion.div>
            )}

            {(
              (
                gameState.step === UNIVERSAL_GAME_STEPS.STAGE2_PREP ||
                gameState.step === UNIVERSAL_GAME_STEPS.STAGE2_QUESTIONS ||
                gameState.step === UNIVERSAL_GAME_STEPS.STAGE2_QUESTION_REVEAL ||
                gameState.step === UNIVERSAL_GAME_STEPS.STAGE2_TIMER_RUNNING ||
                gameState.step === UNIVERSAL_GAME_STEPS.STAGE2_QUESTION_RESULT_REVEAL ||
                gameState.step === UNIVERSAL_GAME_STEPS.STAGE2_OPTIONS_SELECT_REVEAL
              )
            ) && (
                <motion.div
                  key={
                    gameState.step === UNIVERSAL_GAME_STEPS.STAGE2_PREP
                      ? "stage-2-prep"
                      : "question-section"
                  }
                  className="h-full"
                  {...motionProps}
                >
                  <ViewOnlyQuestionTwoScreen />
                </motion.div>
              )}
            {gameState.step === UNIVERSAL_GAME_STEPS.STAGE2_RESULTS && (
              <motion.div
                key={"stage-2-results"}
                className="h-full"
                {...motionProps}
              >
                <HustleBoardStageTallyPage
                  eliminationCount={2}
                  removeCount={2}
                  title={"Hustle Board"}
                  activeState={2}
                />
              </motion.div>
            )}
          </>
        )}
        {gameState.stage.includes("STAGE_THREE") && (
          <>
            {gameState.step === UNIVERSAL_GAME_STEPS.STAGE2_RESULTS && (
              <motion.div
                key={gameState.step}
                className="h-full"
                {...motionProps}
              >
                <HustleBoardStageTallyPage
                  eliminationCount={0}
                  removeCount={0}
                  activeState={2}
                  title={"Hustle Board"}
                />
              </motion.div>
            )}
            {gameState.step === UNIVERSAL_GAME_STEPS.STAGE3_PREP && (
              <motion.div
                key={gameState.step}
                className="h-full"
                {...motionProps}
              >
                <Stage3BoardGetReadyPage />
              </motion.div>
            )}
            {gameState.step === UNIVERSAL_GAME_STEPS.STAGE3_PICKS_START && (
              <motion.div
                key={gameState.step}
                className="h-full"
                {...motionProps}
              >
                <Stage3CardSelectionScreens />
              </motion.div>
            )}


          </>
        )}
        {gameState.stage.includes("STAGE_FOUR") && (
          <>
            <motion.div key="step6" className="h-full" {...motionProps}>
              <RafflePickReveal />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <GameSynchroniser
        gameId={gameEpisode! as string}
        participantId={`audience-${gameEpisode}`}
        participantType="audience"
        participantName="Game Audience"
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

export default HustleBoardPage;
