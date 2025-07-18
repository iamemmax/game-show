"use client"

import { useParams } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { AlertCircle, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { useMQTT, useMQTTMultiSend } from "@/hooks/useMqttService" // Import useMQTTTopic
import { useGetGameContestants, useHandleHustlePickTimeElapse } from "@/app/admin/misc/api"
import { useEndStageThree, useInitStage2, useNotifyBackendStartQuestionTimer, useStartGame } from "../misc/api"
import { TrapeziumButton } from "@/components/core/ButtonTrapezium"
import Stage1Questions from "./Stage1"
import Stage2Questions from "./Stage2"
import Stage4 from "./Stage4"
import { UNIVERSAL_GAME_STEPS, UniversalGameStep } from "@/constants"
import { GameSynchroniser } from "@/components/gameplay/Heartbeat"

export default function HostPage() {
    const params = useParams()
    const gameId = params.episode as string
    const { mutate: notifyBackendStartTimer } = useNotifyBackendStartQuestionTimer()
    const { isConnected, sendMessage } = useMQTT()
    const { sendToMultipleTopics } = useMQTTMultiSend()
    const [activeStage, setActiveStage] = useState<string>("stage1")
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
        currentStageStep: "setup",
    })
    const [isSending, setIsSending] = useState(false)
    const [messageLog, setMessageLog] = useState<Array<{ type: string; message: string; timestamp: string }>>([])

    const {
        data: contestantsData,
        isLoading: isLoadingContestants,
        refetch: refetchContestants,
    } = useGetGameContestants(Number.parseInt(gameId))

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
    }, []) // Empty dependency array means this runs once on mount and cleans up on unmount

    // Update game state based on universal step
    const updateGameStateFromUniversalStep = (step: UniversalGameStep) => {
        switch (step) {
            case UNIVERSAL_GAME_STEPS.GAME_SETUP:
                setGameState((prev) => ({
                    ...prev,
                    status: "IN_PROGRESS",
                    currentStage: "STAGE_ONE",
                    currentStageStep: "setup",
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
                setActiveStage("stage2")
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
                setActiveStage("stage3")
                break
            case UNIVERSAL_GAME_STEPS.STAGE4_INIT:
                setGameState((prev) => ({
                    ...prev,
                    currentStage: "STAGE_FOUR",
                    currentStageStep: "init",
                }))
                setActiveStage("stage4")
                break
            default:
                break
        }
    }

    // Initialize game data when contestants data is loaded
    useEffect(() => {
        if (!isLoadingContestants && contestantsData) {
            console.log(contestantsData.game.stage, "game stage in contestantsData")
            setGameState((prevState) => ({
                ...prevState,
                currentStage: contestantsData.game.stage || "STAGE_ONE",
                status: contestantsData.game.status,
                contestants: contestantsData.data,
            }))

            // Set currentUniversalStep based on fetched data, or default to GAME_SETUP
            const initialUniversalStep = UNIVERSAL_GAME_STEPS.GAME_SETUP
            
            // Set active tab based on current stage
            if (contestantsData.game.stage?.includes("STAGE_ONE")) {
                setActiveStage("stage1")
                setCurrentUniversalStep(initialUniversalStep) 
                updateGameStateFromUniversalStep(initialUniversalStep)
            } else if (contestantsData.game.stage?.includes("STAGE_TWO")) {
                setActiveStage("stage2")
                setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE2_INIT)
                updateGameStateFromUniversalStep(UNIVERSAL_GAME_STEPS.STAGE2_INIT)

            } else if (contestantsData.game.stage?.includes("STAGE_THREE")) {
                setActiveStage("stage3")
                setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE3_INIT)
                updateGameStateFromUniversalStep(UNIVERSAL_GAME_STEPS.STAGE3_INIT)
            } else if (contestantsData.game.stage?.includes("STAGE_FOUR")) {
                setActiveStage("stage4")
                setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE4_INIT)
                updateGameStateFromUniversalStep(UNIVERSAL_GAME_STEPS.STAGE4_INIT)
            }
        }
    }, [contestantsData, isLoadingContestants])

    // Send message helper function
    const sendGameMessage = useCallback(
        async (eventCode: string, data: any = {}) => {
            if (!isConnected) {
                toast.error("Not connected to server")
                return
            }
            setIsSending(true)
            try {
                const message = {
                    event: eventCode,
                    payload: {
                        game_episode: Number.parseInt(gameId),
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
                await sendToMultipleTopics(message, [
                    `/game-sync/${gameId}`,
                    `/test/topic/local`,
                ])
            
                // Update local game state and universal step based on action
                updateLocalStateAfterAction(eventCode)
            } catch (error) {
                console.error("Failed to send message:", error)
                toast.error("Failed to send message")
            } finally {
                setIsSending(false)
            }
        },
        [isConnected, sendMessage, gameId, refetchContestants, updateGameStateFromUniversalStep, setCurrentUniversalStep],
    )

    // Update local state after sending an action
    const updateLocalStateAfterAction = (eventCode: string) => {
        if (!eventCode) return

        if (eventCode === "game_start") {
            setGameState((prev) => ({
                ...prev,
                status: "IN_PROGRESS",
                lastAction: "game_start",
                currentStage: "STAGE_ONE",
                currentStageStep: "init",
            }))
            setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE1_INIT)
        } else if (eventCode === "game_end") {
            setGameState((prev) => ({ ...prev, status: "IS_COMPLETED", lastAction: "game_end" }))
            setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.GAME_END)
        } else if (eventCode === "game_s1_init") {
            setGameState((prev) => ({
                ...prev,
                currentStage: "STAGE_ONE",
                lastAction: "game_s1_init",
                currentStageStep: "hustle_pick",
            }))
            setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE1_HUSTLE_PICK)
        } else if (eventCode === "game_s1_hustle_pick_time_elapse") {
            setGameState((prev) => ({
                ...prev,
                lastAction: "game_s1_hustle_pick_time_elapse",
                currentStageStep: "hustle_reveal",
            }))
            setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE1_HUSTLE_REVEAL)
        } else if (eventCode === "game_s1_hustle_reveal") {
            setGameState((prev) => ({
                ...prev,
                lastAction: "game_s1_hustle_reveal",
                currentStageStep: "prep_questions",
            }))
            setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE1_QUESTIONS_PREP)
        } else if (eventCode === "game_s1_questions_prep") {
            setGameState((prev) => ({
                ...prev,
                lastAction: "game_s1_questions_prep",
                currentStageStep: "questions",
                showQuestions: true,
            }))
            setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE1_QUESTIONS)
        } else if (eventCode == "game_s1_question_reveal") {
            const questionNumber = Number.parseInt(eventCode.split("_").pop() || "0")
            setGameState((prev) => ({
                ...prev,
                currentQuestion: questionNumber,
                lastAction: eventCode,
                currentStageStep: "question_reveal",
            }))
            setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE1_QUESTION_REVEAL)
        } else if (eventCode.includes("game_s1_timer_start")) {
            setGameState((prev) => ({
                ...prev,
                lastAction: eventCode,
                currentStageStep: "timer_running",
            }))
            setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE1_TIMER_RUNNING)
        } else if (eventCode === "question_s1_time_elapsed") {
            setGameState((prev) => ({
                ...prev,
                lastAction: "question_s1_time_elapsed",
                currentStageStep: "questions",
            }))
            setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE1_QUESTIONS)
        } else if (eventCode === "game_s1_question_bids_reveal") {
            setGameState((prev) => ({
                ...prev,
                lastAction: eventCode,
                currentStageStep: "questions",
            }))
            setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE1_BIDS_REVEAL)
        } else if (eventCode === "game_s1_question_answer") {
            setGameState((prev) => ({
                ...prev,
                lastAction: eventCode,
                currentStageStep: "questions",
            }))
            setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE1_QUESTION_RESULT_REVEAL)
        } else if (eventCode === "game_s1_results_reveal") {
            setGameState((prev) => ({
                ...prev,
                lastAction: "game_s1_results_reveal",
                currentStageStep: "init",
                currentStage: "STAGE_TWO",
            }))
            setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE2_INIT)
        } else if (eventCode === "game_s2_init") {
            setGameState((prev) => ({
                ...prev,
                lastAction: "game_s2_init",
                currentStageStep: "prep_questions",
            }))
            setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE2_PREP)
        } else if (eventCode === "game_s2_prep") {
            setGameState((prev) => ({
                ...prev,
                lastAction: "game_s2_questions_prep",
                currentStageStep: "questions",
                showQuestions: true,
            }))
            setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE2_QUESTIONS)
        } else if (eventCode == "game_s2_question_reveal") {
            const questionNumber = Number.parseInt(eventCode.split("_").pop() || "0")
            setGameState((prev) => ({
                ...prev,
                currentQuestion: questionNumber,
                lastAction: eventCode,
                currentStageStep: "question_reveal",
            }))
            setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE2_QUESTION_REVEAL)
        } else if (eventCode.includes("game_s2_timer_start")) {
            setGameState((prev) => ({
                ...prev,
                lastAction: eventCode,
                currentStageStep: "timer_running",
            }))
            setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE2_TIMER_RUNNING)
        } else if (eventCode === "question_s2_time_elapsed") {
            setGameState((prev) => ({
                ...prev,
                lastAction: "question_s2_time_elapsed",
                currentStageStep: "questions",
            }))
            setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE2_QUESTIONS)
        } else if (eventCode === "game_s2_question_options_select_reveal") {
            setGameState((prev) => ({
                ...prev,
                lastAction: eventCode,
                currentStageStep: "questions",
            }))
            setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE2_OPTIONS_REVEAL)
        } else if (eventCode === "game_s2_results_reveal") {
            setGameState((prev) => ({
                ...prev,
                lastAction: "game_s2_results_reveal",
                currentStageStep: "init",
                currentStage: "STAGE_THREE",
            }))
            setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE3_INIT)
        } else if (eventCode === "game_s3_init") {
            setGameState((prev) => ({
                ...prev,
                lastAction: "game_s3_init",
                currentStageStep: "prep_dud_opportunity_pick",
            }))
            setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE3_PREP)
        } else if (eventCode === "game_s3_prep") {
            setGameState((prev) => ({
                ...prev,
                lastAction: "game_s3_dud_opportunity_prep",
                currentStageStep: "start_dud_opportunity_pick",
                showQuestions: true,
            }))
            setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE3_PICKS_START)
        } else if (eventCode === "game_s3_start") {
            setGameState((prev) => ({
                ...prev,
                lastAction: "start_dud_opportunity_pick",
                currentStageStep: "game_s3_end",
                showQuestions: true,
            }))
            setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE3_END)
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
            { game_episode: gameId },
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
                            currentStage: "STAGE_ONE",
                            currentStageStep: "init",
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
            { game_episode: gameId },
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
        // Logic to handle when a question is completed
        console.log(`Question ${questionId} completed`)
        // Update game state to show we're ready for the next question
        setGameState((prev) => ({
            ...prev,
            currentStageStep: "questions",
        }))

    }

    //////////////////////////////
    //////////////////////////////
    ////////    Stage 2 functions
    //////////////////////////////
    //////////////////////////////

    const { mutate: handleInitStage2 } = useInitStage2()
    const initStage2 = () => {
        handleInitStage2(
            { game_episode: gameId },
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
            { episode: gameId },
            {
                onSuccess() {
                    sendGameMessage("game_s3_prep", {
                        episode: gameId,
                    })
                    sendGameMessage("game_s3_end")
                    setGameState((prev) => ({
                        ...prev,
                        currentStage: "STAGE_FOUR",
                        currentStageStep: "init",
                    }))
                    setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE4_INIT)
                },
                onError(error) {
                    console.error("Error ending stage 3:", error)
                    toast.error("Failed to end stage 3")
                },
            },
        )
    }

    const getStageInfo = () => {
        if (gameState.currentStage.includes("STAGE_ONE")) {
            return { title: "Stage 1", subtitle: "STARTUP CAPITAL" }
        } else if (gameState.currentStage.includes("STAGE_TWO")) {
            return { title: "Stage 2", subtitle: "OPPORTUNITY" }
        } else if (gameState.currentStage.includes("STAGE_THREE")) {
            return { title: "Stage 3", subtitle: "DUD OR OPPORTUNITY" }
        } else if (gameState.currentStage.includes("STAGE_FOUR")) {
            return { title: "Stage 4", subtitle: "FINAL ROUND" }
        }
        return { title: "Game Setup", subtitle: "PREPARE TO START" }
    }

    const getStageButtons = () => {
        const { currentStage, currentStageStep } = gameState

        /////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////
        //////////////// Stage ONE
        /////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////

        if (currentStage.includes("STAGE_ONE")) {
            if (currentStageStep === "setup") {
                return (
                    <div className="flex justify-center">
                        <TrapeziumButton onClick={startGame} color="green" data-remote-target="true">
                            START GAME
                        </TrapeziumButton>
                    </div>
                )
            } else if (currentStageStep === "start") {
                return (
                    <div className="flex justify-center">
                        <TrapeziumButton onClick={startGame} color="green" data-remote-target="true">
                            START EPISODE
                            {isStartingGame && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                        </TrapeziumButton>
                    </div>
                )
            } else if (currentStageStep === "init") {
                return (
                    <div className="flex justify-center">
                        <TrapeziumButton onClick={initStage1} variant="green" data-remote-target="true">
                            INITIALIZE HUSTLE PICK
                        </TrapeziumButton>
                    </div>
                )
            } else if (currentStageStep === "hustle_pick") {
                return (
                    <div className="flex justify-center">
                        <TrapeziumButton onClick={endTimerHustlePick} variant="yellow" data-remote-target="true">
                            END HUSTLE PICK TIMER
                        </TrapeziumButton>
                    </div>
                )
            } else if (currentStageStep === "hustle_reveal") {
                return (
                    <div className="flex justify-center">
                        <TrapeziumButton onClick={revealHustles} variant="blue" data-remote-target="true">
                            REVEAL HUSTLE
                        </TrapeziumButton>
                    </div>
                )
            } else if (currentStageStep === "prep_questions") {
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
            } else if (currentStageStep === "results") {
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
        else if (currentStage.includes("STAGE_TWO")) {
            if (currentStageStep === "init") {
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
            } else if (currentStageStep === "prep_questions") {
                return (
                    <div className="flex justify-center">
                        <TrapeziumButton onClick={prepStage2Questions} variant="green" data-remote-target="true">
                            PREP STAGE 2
                        </TrapeziumButton>
                    </div>
                )
            } else if (currentStageStep === "results") {
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
        else if (currentStage.includes("STAGE_THREE")) {
            if (currentStageStep === "init") {
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
            } else if (currentStageStep === "prep_dud_opportunity_pick") {
                return (
                    <div className="flex justify-center">
                        <TrapeziumButton onClick={prepStage3Picks} variant="green" data-remote-target="true">
                            PREP STAGE 3
                        </TrapeziumButton>
                    </div>
                )
            } else if (currentStageStep === "start_dud_opportunity_pick") {
                return (
                    <div className="flex justify-center">
                        <TrapeziumButton onClick={startStage3Picks} variant="yellow" data-remote-target="true">
                            START DUD/PASS PICK
                        </TrapeziumButton>
                    </div>
                )
            } else if (currentStageStep === "game_s3_end") {
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
        else if (currentStage.includes("STAGE_FOUR")) {
            if (currentStageStep === "init") {
                return (
                    <div className="flex justify-center mt-8">
                        <div className="text-center">
                            <div className="flex justify-center items-center">
                                <img src="/images/question-badge.png" alt="Question" className="w-20 h-20" />
                            </div>
                            <p className="text-white mb-4">Prep Stage 4 Questions</p>
                            {/* <TrapeziumButton onClick={initStage2} variant="orange">
                              INITIALIZE STAGE 2
                          </TrapeziumButton> */}
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
    console.log(gameState.currentStageStep, "current stage step in host page")
    console.log(currentUniversalStep, "current universal step in host page")


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
                            Step: {currentUniversalStep}
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

                        {/* Contestants */}
                        {!(
                            gameState.currentStage.includes("STAGE_ONE") &&
                            (gameState.currentStageStep === "questions" ||
                                gameState.currentStageStep === "question_reveal" ||
                                gameState.currentStageStep === "timer_running")
                        ) && (
                                <div className="flex justify-center gap-4 mb-8">
                                    {gameState.contestants.map((contestant, index) => (
                                        <div key={contestant.id} className="relative">
                                            <div className="w-24 h-32 bg-gradient-to-b from-[#9c4dcc] to-[#6a2a8c] clip-path-contestant"></div>
                                        </div>
                                    ))}
                                </div>
                            )}

                        {/* Stage-specific buttons */}
                        {getStageButtons()}

                        {/* Stage 1 Questions Component */}
                        {gameState.currentStage.includes("STAGE_ONE") &&
                            (gameState.currentStageStep === "questions" ||
                                gameState.currentStageStep === "question_reveal" ||
                                gameState.currentStageStep === "bids_reveal" ||
                                gameState.currentStageStep === "timer_running") && (
                                <Stage1Questions
                                    gameId={gameId}
                                    onQuestionComplete={handleQuestionComplete}
                                    onTimerStart={handleTimerStart}
                                    sendGameMessage={sendGameMessage}
                                    currentStageStep={gameState.currentStageStep}
                                    lastAction={currentUniversalStep}
                                />
                            )}

                        {/* Stage 2 Questions Component */}
                        {gameState.currentStage.includes("STAGE_TWO") &&
                            (gameState.currentStageStep === "questions" ||
                                gameState.currentStageStep === "question_reveal" ||
                                gameState.currentStageStep === "timer_running") && (
                                <Stage2Questions
                                    gameId={gameId}
                                    onQuestionComplete={handleQuestionComplete}
                                    onTimerStart={handleTimerStart}
                                    sendGameMessage={sendGameMessage}
                                    currentStageStep={gameState.currentStageStep}
                                    lastAction={gameState.lastAction}
                                />
                            )}

                        {/* Stage 4 Component */}
                        {gameState.currentStage.includes("STAGE_FOUR") && <Stage4 />}
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
                gameId={gameId}
                participantId={`host-${gameId}`}
                participantType="host"
                participantName="Game Host"
                currentScreen={gameState.currentStageStep}
                currentStep={currentUniversalStep}
                gameStage={gameState.currentStage || contestantsData?.game.stage || "STAGE_ONE"}
                setCurrentUniversalStep={setCurrentUniversalStep}
                updateGameStateFromUniversalStep={updateGameStateFromUniversalStep}
            />
        </div>
    )
}
