"use client"

import { useParams } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { AlertCircle, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { useMQTT, useMQTTMultiSend } from "@/hooks/useMqttService" // Import useMQTTTopic
import { TEpisodeInfo, useGetGameContestants, useHandleHustlePickTimeElapse } from "@/app/admin/misc/api"
import { useEndStageThree, useInitStage2, useInitStageFour, useNotifyBackendStartQuestionTimer, useStartGame } from "../misc/api"
import { TrapeziumButton } from "@/components/core/ButtonTrapezium"
import Stage1Questions from "./Stage1"
import Stage2Questions from "./Stage2"
import Stage4 from "./Stage4"
import { getStageFromStep, STEP_PROGRESSION, UNIVERSAL_GAME_STEPS, UniversalGameStep } from "@/constants"
import { GameSynchroniser } from "@/components/gameplay/Heartbeat"
import { LastStepStorage } from "@/lib/lastStep"

export default function HostPage() {
    const params = useParams()
    const gameEpisode = params.episode as string
    const { mutate: notifyBackendStartTimer } = useNotifyBackendStartQuestionTimer()
    const { isConnected, sendMessage } = useMQTT()
    const {
        data: contestantsData,
        isLoading: isLoadingContestants,
        refetch: refetchContestants,
    } = useGetGameContestants(Number.parseInt(gameEpisode))

    const [gameState, setGameState] = useState<TEpisodeInfo>({
        game_episode: Number(gameEpisode),
        game_nick: contestantsData?.game.game_nick || "",
        status: "IN_ACTIVE",
        stage: "STAGE_ONE",
        reveal_step_count: "SINGLE",
        lastAction: "",
        showQuestions: false,
        step: UNIVERSAL_GAME_STEPS.GAME_SETUP,
    });

    const [isSending, setIsSending] = useState(false)
    const [messageLog, setMessageLog] = useState<Array<{ type: string; message: string; timestamp: string }>>([])


    // Add keyboard event listener for the remote
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Check for right arrow key or page down key
            if (event.key === "ArrowRight" || event.key === "PageDown") {
                event.preventDefault() // Prevent default scroll behavior
                // Find the currently visible button that should respond to the remote
                const targetButton = document.querySelector<HTMLButtonElement>('[data-remote-target="true"]')
                if (targetButton) {
                    targetButton.click() // Programmatically click the button
                }
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => {
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [])

    // Initialize game data when contestants data is loaded
    useEffect(() => {
        if (!gameEpisode) {
            return;
        }
        if (!isLoadingContestants && contestantsData) {

            const savedStep = LastStepStorage.getLastStep();
            const START_POINT = contestantsData.game.status === "IN_PROGRESS" ? UNIVERSAL_GAME_STEPS.GAME_START : UNIVERSAL_GAME_STEPS.GAME_SETUP
            console.log("Saved Step:", savedStep);
            if (!savedStep || savedStep?.gameEpisode !== gameEpisode) {
                console.log("Game episode mismatch, resetting last step");
                LastStepStorage.setLastStep({
                    step: UNIVERSAL_GAME_STEPS.GAME_SETUP,
                    gameEpisode: gameEpisode as string,
                });
            }
            const savedStepStage = getStageFromStep(savedStep?.step || UNIVERSAL_GAME_STEPS.GAME_START);

            if (savedStepStage !== contestantsData.game.stage) {
                console.log("Stage mismatch, resetting step to init");
                LastStepStorage.setLastStep({
                    step: START_POINT,
                    gameEpisode: gameEpisode as string,
                });
            }
            else {
                console.log("Stage matches, using saved step");
                LastStepStorage.setLastStep({
                    step: savedStep?.step || START_POINT,
                    gameEpisode: gameEpisode as string,
                });
                setGameState((prevState) => ({
                    ...prevState,
                    step: savedStep?.step || START_POINT,
                    stage: contestantsData.game.stage || "STAGE_ONE",
                    game_episode: Number(gameEpisode),
                    game_nick: contestantsData.game.game_nick || "",
                    status: contestantsData.game.status || "IN_ACTIVE",
                    reveal_step_count: contestantsData.game.reveal_step_count || "SINGLE",
                }));
            }

        }
    }, [contestantsData, isLoadingContestants, gameEpisode]);



    // Send message helper function
    const sendGameMessage = useCallback(
        async (eventCode: string, data: any = {}) => {
            if (!isConnected) {
                toast.error("Not connected to server")
                return
            }
            setIsSending(true)
            LastStepStorage.setLastStep({
                step: eventCode,
                gameEpisode: gameEpisode,

            })
            setGameState((prev) => ({
                ...prev,
                step: eventCode,
                stage: getStageFromStep(eventCode as UniversalGameStep)
            }))
            try {
                const message = {
                    event: eventCode,
                    payload: {
                        game_episode: Number.parseInt(gameEpisode),
                        current_universal_step: eventCode,
                        new_universal_step: eventCode,
                        source: "host",
                        ...data,
                    },
                }
                // Add to message log
                setMessageLog((prev) => [
                    ...prev,
                    {
                        type: "sent",
                        message: JSON.stringify(message),
                        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
                    },
                ])

                sendMessage(message)

                // Update local game state and universal step based on action
                updateLocalStateAfterAction(eventCode)
            } catch (error) {
                console.error("Failed to send message:", error)
                toast.error("Failed to send message")
            } finally {
                setIsSending(false)
            }
        },
        [isConnected, sendMessage, gameEpisode, refetchContestants],
    )

    // Update local state after sending an action
    const updateLocalStateAfterAction = (eventCode: string) => {
        if (!eventCode) return

        if (eventCode === "game_setup") {
            setGameState((prev) => ({
                ...prev,
                status: "IN_PROGRESS",
                lastAction: eventCode,
                stage: "STAGE_ONE",
                step: "game_start",
            }))
        } else if (eventCode === "game_start") {
            setGameState((prev) => ({
                ...prev,
                status: "IN_PROGRESS",
                lastAction: eventCode,
                stage: "STAGE_ONE",
                step: "game_s1_init",
            }))
        } else if (eventCode === "game_end") {
            setGameState((prev) => ({ ...prev, status: "IS_COMPLETED", lastAction: eventCode }))
        } else if (eventCode === "game_s1_init") {
            setGameState((prev) => ({
                ...prev,
                stage: "STAGE_ONE",
                lastAction: eventCode,
                step: UNIVERSAL_GAME_STEPS.STAGE1_HUSTLE_PICK,
            }))
        } else if (eventCode === "game_s1_hustle_pick_time_elapse") {
            setGameState((prev) => ({
                ...prev,
                lastAction: eventCode,
                step: STEP_PROGRESSION[UNIVERSAL_GAME_STEPS.STAGE1_HUSTLE_PICK_TIME_ELAPSE]!,
            }))
        } else if (eventCode === "game_s1_hustle_reveal") {
            setGameState((prev) => ({
                ...prev,
                lastAction: eventCode,
                step: STEP_PROGRESSION[UNIVERSAL_GAME_STEPS.STAGE1_HUSTLE_REVEAL]!,
            }))
        } else if (eventCode === "game_s1_questions_prep") {
            setGameState((prev) => ({
                ...prev,
                lastAction: eventCode,
                step: STEP_PROGRESSION[UNIVERSAL_GAME_STEPS.STAGE1_QUESTIONS_PREP]!,
                showQuestions: true,
            }))
        }
        else if (eventCode.includes("game_s1_timer_start")) {
            setGameState((prev) => ({
                ...prev,
                lastAction: eventCode,
                step: UNIVERSAL_GAME_STEPS.STAGE1_TIMER_RUNNING,
            }))
        } 
        else if (eventCode.includes("game_s1_question_bids_reveal")) {
            setGameState((prev) => ({
                ...prev,
                lastAction: eventCode,
                step: UNIVERSAL_GAME_STEPS.STAGE1_BIDS_REVEAL,
            }))
        } 
        else if (eventCode === "question_s1_time_elapsed") {
            setGameState((prev) => ({
                ...prev,
                lastAction: eventCode,
                step: UNIVERSAL_GAME_STEPS.STAGE1_QUESTION_RESULT_REVEAL,
            }))
        } else if (eventCode === "game_s1_question_answer") {
            setGameState((prev) => ({
                ...prev,
                lastAction: eventCode,
                step: UNIVERSAL_GAME_STEPS.STAGE1_QUESTIONS,
            }))
        } else if (eventCode === "game_s1_results_reveal") {
            setGameState((prev) => ({
                ...prev,
                lastAction: eventCode,
                stage: "STAGE_TWO",
                step: UNIVERSAL_GAME_STEPS.STAGE2_INIT,
            }))
        } else if (eventCode === "game_s2_init") {
            setGameState((prev) => ({
                ...prev,
                lastAction: eventCode,
                step: STEP_PROGRESSION[UNIVERSAL_GAME_STEPS.STAGE2_INIT]!,
            }))
        } else if (eventCode === "game_s2_prep") {
            setGameState((prev) => ({
                ...prev,
                lastAction: eventCode,
                step: STEP_PROGRESSION[UNIVERSAL_GAME_STEPS.STAGE2_PREP]!,
                showQuestions: true,
            }))
        } else if (eventCode == "game_s2_question_reveal") {
            const questionNumber = Number.parseInt(eventCode.split("_").pop() || "0")
            setGameState((prev) => ({
                ...prev,
                currentQuestion: questionNumber,
                lastAction: eventCode,
                step: UNIVERSAL_GAME_STEPS.STAGE2_QUESTION_REVEAL,
            }))
        } else if (eventCode.includes("game_s2_timer_start")) {
            setGameState((prev) => ({
                ...prev,
                lastAction: eventCode,
                step: UNIVERSAL_GAME_STEPS.STAGE2_TIMER_RUNNING,
            }))
        } else if (eventCode === "question_s2_time_elapsed") {
            setGameState((prev) => ({
                ...prev,
                lastAction: eventCode,
                step: UNIVERSAL_GAME_STEPS.STAGE2_QUESTIONS,
            }))
        } else if (eventCode === "game_s2_question_options_select_reveal") {
            setGameState((prev) => ({
                ...prev,
                lastAction: eventCode,
                step: UNIVERSAL_GAME_STEPS.STAGE2_QUESTION_RESULT_REVEAL,
            }))
        } else if (eventCode == "game_s2_question_answer") {
            setGameState((prev) => ({
                ...prev,
                lastAction: eventCode,
                step: UNIVERSAL_GAME_STEPS.STAGE2_QUESTIONS,
            }))
        } else if (eventCode === "game_s2_results_reveal") {
            setGameState((prev) => ({
                ...prev,
                lastAction: eventCode,
                step: UNIVERSAL_GAME_STEPS.STAGE3_INIT,
                stage: "STAGE_THREE",
            }))
        } else if (eventCode === "game_s3_init") {
            setGameState((prev) => ({
                ...prev,
                lastAction: eventCode,
                step: UNIVERSAL_GAME_STEPS.STAGE3_PREP,
            }))
        } else if (eventCode === "game_s3_prep") {
            setGameState((prev) => ({
                ...prev,
                lastAction: UNIVERSAL_GAME_STEPS.STAGE3_PICKS_START,
                step: UNIVERSAL_GAME_STEPS.STAGE3_PICKS_START,
                showQuestions: true,
            }))
        } else if (eventCode === "game_s3_start") {
            setGameState((prev) => ({
                ...prev,
                lastAction: eventCode,
                step: UNIVERSAL_GAME_STEPS.STAGE3_END,
                showQuestions: true,
            }))
        } else if (eventCode === "game_s3_end") {
            setGameState((prev) => ({
                ...prev,
                lastAction: eventCode,
                step: UNIVERSAL_GAME_STEPS.STAGE4_INIT,
                showQuestions: true,
            }))
        }
        // Add other stage handlers here...
        else {
            setGameState((prev) => ({ ...prev, lastAction: eventCode }))
        }
    }

    // Game control functions
    const { mutate: gameStartMutation, isLoading: isStartingGame } = useStartGame()
    const startGame = () => {
        gameStartMutation(
            { game_episode: gameEpisode },
            {
                onSuccess() {
                    sendGameMessage("game_start", { start_time: new Date().toISOString() })
                },
                onError(error) {
                    console.error("Error starting game:", error)
                    if ((error as any).response.data.message.includes("already in progress")) {
                        setGameState((prev) => ({
                            ...prev,
                            status: "IN_PROGRESS",
                            stage: "STAGE_ONE",
                            step: UNIVERSAL_GAME_STEPS.GAME_START,
                        }))
                        refetchContestants()
                    }
                    toast.error("Failed to start game")
                },
            },
        )
    }
    const endGame = () => sendGameMessage("game_end")

    //////////////////////////////
    //////////////////////////////
    ////////    Stage 1 functions
    //////////////////////////////
    //////////////////////////////

    const initStage1 = () => sendGameMessage("game_s1_init", { start_time: new Date().toISOString() })
    const { mutate: handleTimeElapse } = useHandleHustlePickTimeElapse()
    const endTimerHustlePick = () => {
        handleTimeElapse(
            { game_episode: gameEpisode },
            {
                onSuccess() {
                    sendGameMessage("game_s1_hustle_pick_time_elapse")
                },
            },
        )
    }
    const revealHustles = () => sendGameMessage("game_s1_hustle_reveal")
    const prepStage1Questions = () => sendGameMessage("game_s1_questions_prep")

    // Handle question completion
    const handleQuestionComplete = (questionId: number) => {
        console.log(`Question ${questionId} completed`)
        // setGameState((prev) => ({
        //     ...prev,
        //     step: gameState.stage == "STAGE_ONE" ? UNIVERSAL_GAME_STEPS.STAGE1_QUESTIONS : UNIVERSAL_GAME_STEPS.STAGE2_QUESTIONS
        // }))

    }

    //////////////////////////////
    //////////////////////////////
    ////////    Stage 2 functions
    //////////////////////////////
    //////////////////////////////

    const { mutate: handleInitStage2 } = useInitStage2()
    const initStage2 = () => {
        handleInitStage2(
            { game_episode: gameEpisode },
            {
                onSuccess() {
                    sendGameMessage("game_s2_init", { start_time: new Date().toISOString() })
                },
                onError(error) {
                    console.error("Error initializing stage 2:", error)
                    toast.error("Failed to initialize stage 2")
                },
            },
        )
    }
    const prepStage2Questions = () => sendGameMessage("game_s2_prep")

    // Handle timer start
    const handleTimerStart = (questionId: string, startTime: string, questionType: string) => {
        notifyBackendStartTimer({
            question_id: questionId,
            start_time: startTime,
            question_type: questionType,
        })
    }

    //////////////////////////////
    //////////////////////////////
    ////////    Stage 3 functions
    //////////////////////////////
    //////////////////////////////

    const initStage3 = () => sendGameMessage("game_s3_init", { start_time: new Date().toISOString() })
    const prepStage3Picks = () => sendGameMessage("game_s3_prep")
    const startStage3Picks = () => sendGameMessage("game_s3_start")
    const { mutate: endStageThree, isLoading: isEndingStage3 } = useEndStageThree()
    const handleEndStageThree = () => {
        endStageThree(
            { episode: gameEpisode },
            {
                onSuccess() {
                    // sendGameMessage("game_s3_prep", {
                    //     episode: gameEpisode,
                    // })
                    sendGameMessage("game_s3_end")
                    setGameState((prev) => ({
                        ...prev,
                        stage: "STAGE_FOUR",
                        step: UNIVERSAL_GAME_STEPS.STAGE4_INIT
                    }))
                },
                onError(error) {
                    console.error("Error ending stage 3:", error)
                    if (
                        typeof error === "object" &&
                        error !== null &&
                        "response" in error &&
                        typeof (error as any).response === "object" &&
                        (error as any).response !== null &&
                        "data" in (error as any).response &&
                        typeof (error as any).response.data === "object" &&
                        (error as any).response.data !== null &&
                        "message" in (error as any).response.data &&
                        (error as any).response.data.message === "Stage already ended"
                    ) {
                        toast.error("Failed to end stage 3")
                    }

                    if ((error as any).response.data.message == "Stage already ended") {
                        sendGameMessage("game_s3_end")
                    }
                    setGameState((prev) => ({
                        ...prev,
                        stage: "STAGE_FOUR",
                        step: UNIVERSAL_GAME_STEPS.STAGE4_INIT
                    }))
                },
            },
        )
    }


    //////////////////////////////
    //////////////////////////////
    ////////    Stage 4 functions
    //////////////////////////////
    //////////////////////////////

    const { mutate: handleInitStage4 } = useInitStageFour()
    const initStage4 = () => {
        handleInitStage4(
            { episode: gameEpisode },
            {
                onSuccess() {
                    sendGameMessage("game_s4_init", { start_time: new Date().toISOString() })
                },
                onError(error) {
                    console.error("Error initializing stage 4:", error)
                    toast.error("Failed to initialize stage 4")
                },
            },
        )
    }


    const getStageButtons = () => {
        const { stage, step } = gameState

        /////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////
        //////////////// Stage ONE
        /////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////

        if (stage.includes("STAGE_ONE")) {
            if (step === UNIVERSAL_GAME_STEPS.GAME_SETUP) {
                return (
                    <div className="flex justify-center">
                        <TrapeziumButton onClick={startGame} color="green" data-remote-target="true">
                            START EPISODE
                            {isStartingGame && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                        </TrapeziumButton>
                    </div>
                )
            } 
             else if (step === UNIVERSAL_GAME_STEPS.GAME_START  || step === UNIVERSAL_GAME_STEPS.STAGE1_INIT) {
                return (
                    <div className="flex justify-center">
                        <TrapeziumButton onClick={initStage1} variant="green" data-remote-target="true">
                            INITIALIZE HUSTLE PICK
                        </TrapeziumButton>
                    </div>
                )
            }
             else if (step === UNIVERSAL_GAME_STEPS.STAGE1_HUSTLE_PICK) {
                return (
                    <div className="flex justify-center">
                        <TrapeziumButton onClick={endTimerHustlePick} variant="yellow" data-remote-target="true">
                            END HUSTLE PICK TIMER
                        </TrapeziumButton>
                    </div>
                )
            } else if (step === UNIVERSAL_GAME_STEPS.STAGE1_HUSTLE_REVEAL) {
                return (
                    <div className="flex justify-center">
                        <TrapeziumButton onClick={revealHustles} variant="blue" data-remote-target="true">
                            REVEAL HUSTLE
                        </TrapeziumButton>
                    </div>
                )
            } else if (step === UNIVERSAL_GAME_STEPS.STAGE1_QUESTIONS_PREP) {
                return (
                    <div className="flex justify-center mt-8">
                        <div className="text-center">
                            <div className="flex justify-center items-center">
                                <img src="/images/question-badge.png" alt="Question" className="w-20 h-20" />
                            </div>
                            <p className="text-white mb-4">Prep Stage 1 Questions</p>
                            <TrapeziumButton onClick={prepStage1Questions} variant="orange" data-remote-target="true">
                                PREP QUESTIONS
                            </TrapeziumButton>
                        </div>
                    </div>
                )
            } else if (step === "results") {
                return (
                    <div className="flex flex-col items-center mt-8">
                        <div className="flex justify-center mb-4">
                            <img src="/images/trophy.png" alt="Trophy" className="w-20 h-20" />
                        </div>
                        <p className="text-white mb-4">Proceed to stage 2</p>
                        <TrapeziumButton onClick={initStage2} color="orange" data-remote-target="true">
                            INITIALIZE STAGE 2
                        </TrapeziumButton>
                    </div>
                )
            }
            return null
        }

        /////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////
        //////////////// Stage TWO
        /////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////
        else if (stage.includes("STAGE_TWO")) {
            if (step === UNIVERSAL_GAME_STEPS.STAGE2_INIT) {
                return (
                    <div className="flex justify-center mt-8">
                        <div className="text-center">
                            <div className="flex justify-center items-center">
                                <img src="/images/question-badge.png" alt="Question" className="w-20 h-20" />
                            </div>
                            <p className="text-white mb-4">Prep Stage 2 Questions</p>
                            <TrapeziumButton onClick={initStage2} variant="orange" data-remote-target="true">
                                INITIALIZE STAGE 2
                            </TrapeziumButton>
                        </div>
                    </div>
                )
            } else if (step === UNIVERSAL_GAME_STEPS.STAGE2_PREP) {
                return (
                    <div className="flex justify-center">
                        <TrapeziumButton onClick={prepStage2Questions} variant="green" data-remote-target="true">
                            PREP STAGE 2
                        </TrapeziumButton>
                    </div>
                )
            } else if (step === UNIVERSAL_GAME_STEPS.STAGE2_RESULTS) {
                return (
                    <div className="flex flex-col items-center mt-8">
                        <div className="flex justify-center mb-4">
                            <img src="/images/trophy.png" alt="Trophy" className="w-20 h-20" />
                        </div>
                        <p className="text-white mb-4">Proceed to stage 3</p>
                        <TrapeziumButton onClick={initStage3} color="orange" data-remote-target="true">
                            INITIALIZE STAGE 3
                        </TrapeziumButton>
                    </div>
                )
            }
            return null
        }

        /////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////
        //////////////// Stage THREE
        /////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////
        else if (stage.includes("STAGE_THREE")) {
            if (step === "game_s3_init" || step === "setup") {
                return (
                    <div className="flex justify-center mt-8">
                        <div className="text-center">
                            <div className="flex justify-center items-center">
                                <img src="/images/question-badge.png" alt="Question" className="w-20 h-20" />
                            </div>
                            <p className="text-white mb-4">Prep Stage 3 Questions</p>
                            <TrapeziumButton onClick={initStage3} variant="orange" data-remote-target="true">
                                INITIALIZE STAGE 3
                            </TrapeziumButton>
                        </div>
                    </div>
                )
            } else if (step === UNIVERSAL_GAME_STEPS.STAGE3_PREP) {
                return (
                    <div className="flex justify-center">
                        <TrapeziumButton onClick={prepStage3Picks} variant="green" data-remote-target="true">
                            PREP STAGE 3
                        </TrapeziumButton>
                    </div>
                )
            } else if (step === UNIVERSAL_GAME_STEPS.STAGE3_PICKS_START) {
                return (
                    <div className="flex justify-center">
                        <TrapeziumButton onClick={startStage3Picks} variant="yellow" data-remote-target="true">
                            START DUD/PASS PICK
                        </TrapeziumButton>
                    </div>
                )
            } else if (step === UNIVERSAL_GAME_STEPS.STAGE3_END) {
                return (
                    <div className="flex justify-center">
                        <TrapeziumButton onClick={handleEndStageThree} variant="yellow" data-remote-target="true">
                            END STAGE 3{isEndingStage3 && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                        </TrapeziumButton>
                    </div>
                )
            }
            return null
        }

        /////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////
        //////////////// Stage FOUR
        /////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////
        else if (stage.includes("STAGE_FOUR")) {
            if (step === UNIVERSAL_GAME_STEPS.STAGE4_INIT) {
                return (
                    <div className="flex justify-center mt-8">
                        <div className="text-center">
                            <div className="flex justify-center items-center">
                                <img src="/images/question-badge.png" alt="Question" className="w-20 h-20" />
                            </div>
                            <TrapeziumButton onClick={initStage4} variant="orange">
                                INITIALIZE STAGE 4
                            </TrapeziumButton>
                        </div>
                    </div>
                )
            }
        }

        // Default - game not started
        return (
            <div className="flex justify-center">
                <TrapeziumButton onClick={startGame} color="green" data-remote-target="true">
                    START GAME
                </TrapeziumButton>
            </div>
        )
    }
    console.log(gameState.step, "current stage step in host page")

    const getStageInfo = () => {
        if (gameState.stage.includes("STAGE_ONE")) {
            return { title: "Stage 1", subtitle: "STARTUP CAPITAL" }
        } else if (gameState.stage.includes("STAGE_TWO")) {
            return { title: "Stage 2", subtitle: "OPPORTUNITY" }
        } else if (gameState.stage.includes("STAGE_THREE")) {
            return { title: "Stage 3", subtitle: "DUD OR OPPORTUNITY" }
        } else if (gameState.stage.includes("STAGE_FOUR")) {
            return { title: "Stage 4", subtitle: "FINAL ROUND" }
        }
        return { title: "Game Setup", subtitle: "PREPARE TO START" }
    }





    return (
        <div className="min-h-screen bg-[#1a0b25] text-white bg-[url('/images/host-bg.png')] bg-no-repeat bg-contain bg-center">
            {isLoadingContestants ? (
                <div className="flex flex-col items-center justify-center h-dvh">
                    <Loader2 className="h-12 w-12 text-[#ff00ff] animate-spin mb-4" />
                    <p className="text-white/70">Loading game data...</p>
                </div>
            ) : !contestantsData ? (
                <div className="flex items-center justify-center h-dvh">
                    <div className="flex flex-col items-center">
                        <AlertCircle className="h-16 w-16 text-[#ff00ff] mb-4" />
                        <p className="text-white/70">Game data not found or error loading data.</p>
                    </div>
                </div>
            ) : (
                <main className="container mx-auto py-8 px-4 h-dvh">
                    <div className="flex flex-col items-center h-full justify-center">
                        {/* Universal Step Indicator */}
                        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-sm">
                            Step: {gameState.step}
                        </div>

                        {/* Stage Title */}
                        <div className="relative w-80 h-28 flex items-center justify-center mb-8">
                            <img
                                src="/images/stage-scroll.png"
                                alt="Stage"
                                className="absolute inset-0 w-full h-full object-contain"
                            />
                            <div className="relative text-center z-[5]">
                                <h2 className="text-2xl font-platypi font-semibold text-[#5D1F26]">{getStageInfo().title}</h2>
                                <p className="text-xs font-montserrat font-bold text-black uppercase">{getStageInfo().subtitle}</p>
                            </div>
                        </div>


                        {/* Stage-specific buttons */}
                        {getStageButtons()}

                        {/* Stage 1 Questions Component */}
                        {gameState.stage.includes("STAGE_ONE") &&
                            (
                                (
                                    gameState.step === UNIVERSAL_GAME_STEPS.STAGE1_QUESTIONS ||
                                    gameState.step === UNIVERSAL_GAME_STEPS.STAGE1_QUESTION_REVEAL ||
                                    gameState.step === UNIVERSAL_GAME_STEPS.STAGE1_TIMER_RUNNING ||
                                    gameState.step === UNIVERSAL_GAME_STEPS.STAGE1_BIDS_REVEAL ||
                                    gameState.step === UNIVERSAL_GAME_STEPS.STAGE1_QUESTION_RESULT_REVEAL
                                )
                            ) && (
                                <Stage1Questions
                                    gameEpisode={gameEpisode}
                                    onQuestionComplete={handleQuestionComplete}
                                    onTimerStart={handleTimerStart}
                                    sendGameMessage={sendGameMessage}
                                    step={gameState.step}
                                    lastAction={gameState.step}
                                    contestantsData={contestantsData}
                                    isLoadingContestants={isLoadingContestants}

                                />
                            )}

                        {/* Stage 2 Questions Component */}
                        {gameState.stage.includes("STAGE_TWO") &&
                            (
                                (
                                    gameState.step === UNIVERSAL_GAME_STEPS.STAGE2_QUESTIONS ||
                                    gameState.step === UNIVERSAL_GAME_STEPS.STAGE2_QUESTION_REVEAL ||
                                    gameState.step === UNIVERSAL_GAME_STEPS.STAGE2_TIMER_RUNNING ||
                                    gameState.step === UNIVERSAL_GAME_STEPS.STAGE2_QUESTION_RESULT_REVEAL ||
                                    gameState.step === UNIVERSAL_GAME_STEPS.STAGE2_OPTIONS_SELECT_REVEAL
                                )
                            ) && (
                                <Stage2Questions
                                    gameEpisode={gameEpisode}
                                    onQuestionComplete={handleQuestionComplete}
                                    onTimerStart={handleTimerStart}
                                    sendGameMessage={sendGameMessage}
                                    step={gameState.step}
                                    lastAction={gameState.lastAction}
                                />
                            )
                        }


                        {/* Stage 4 Component */}
                        {gameState.stage.includes("STAGE_FOUR") && <Stage4 />}
                    </div>
                </main>
            )}

            {/* Loading Overlay */}
            {isSending && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[#2a1a35] p-6 rounded-lg flex flex-col items-center">
                        <Loader2 className="h-8 w-8 text-[#ff00ff] animate-spin mb-2" />
                        <div className="text-white">Sending message...</div>
                    </div>
                </div>
            )}

            {/* Enhanced Heartbeat Component */}
            <GameSynchroniser
                gameId={gameEpisode}
                participantId={`host-${gameEpisode}`}
                participantType="host"
                participantName="Game Host"
                gameState={gameState}
                setGameState={setGameState}
            />
        </div>
    )
}
