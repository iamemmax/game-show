"use client"

import { useParams } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { AlertCircle, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { useMQTT } from "@/hooks/useMqttService"
import { useGetGameContestants } from "@/app/admin/misc/api"
import { useNotifyBackendStartQuestionTimer } from "../misc/api"
import { TrapeziumButton } from "@/components/core/ButtonTrapezium"
import Stage1Questions from "./Stage1"

export default function HostPage() {
    const params = useParams()
    const gameId = params.episode as string
    const { mutate: notifyBackendStartTimer } = useNotifyBackendStartQuestionTimer()

    const { isConnected, sendMessage, onMessage } = useMQTT()
    const [activeStage, setActiveStage] = useState<string>("stage1")
    const [gameState, setGameState] = useState<{
        currentStage: string
        status: string
        lastAction: string
        currentQuestion: number
        contestants: any[]
        showQuestions: boolean
        currentStageStep: string
    }>({
        currentStage: "STAGE_1",
        status: "",
        lastAction: "",
        currentQuestion: 0,
        contestants: [],
        showQuestions: false,
        currentStageStep: "init",
    })
    const [isSending, setIsSending] = useState(false)
    const [messageLog, setMessageLog] = useState<Array<{ type: string; message: string; timestamp: string }>>([])

    // Timer state
    const [timerSeconds, setTimerSeconds] = useState(0)
    const [timerMinutes, setTimerMinutes] = useState(0)
    const [timerActive, setTimerActive] = useState(false)

    const {
        data: contestantsData,
        isLoading: isLoadingContestants,
        refetch: refetchContestants,
    } = useGetGameContestants(Number.parseInt(gameId))

    // Handle incoming messages
    useEffect(() => {
        const handleMessage = (message: any) => {
            console.log("Received message:", message)

            // Add to message log
            setMessageLog((prev) => [
                ...prev,
                {
                    type: "received",
                    message: JSON.stringify(message),
                    timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
                },
            ])

            // Update game state based on message
            if (message.event === "game_general_update") {
                setGameState((prevState) => ({
                    ...prevState,
                    ...message.payload,
                }))
            }

            // Show toast notification
            toast.success(`Received: ${message.event || "Message"}`)
        }

        if (isConnected) {
            onMessage(handleMessage)
            refetchContestants()
        }

        return () => {
            if (isConnected) {
                onMessage(null)
            }
        }
    }, [isConnected, onMessage, refetchContestants])

    // Initialize game data when contestants data is loaded
    useEffect(() => {
        if (contestantsData) {
            setGameState((prevState) => ({
                ...prevState,
                currentStage: contestantsData.game.stage || "STAGE_1",
                status: contestantsData.game.status,
                contestants: contestantsData.data,
            }))

            // Set active tab based on current stage
            if (contestantsData.game.stage?.includes("STAGE_1")) {
                setActiveStage("stage1")
            } else if (contestantsData.game.stage?.includes("STAGE_2")) {
                setActiveStage("stage2")
            } else if (contestantsData.game.stage?.includes("STAGE_3")) {
                setActiveStage("stage3")
            } else if (contestantsData.game.stage?.includes("STAGE_4")) {
                setActiveStage("stage4")
            }
        }
    }, [contestantsData])

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

                await sendMessage(message)
                refetchContestants()
                toast.success(`Sent: ${eventCode}`)

                // Update local game state based on action
                if (eventCode === "game_start") {
                    setGameState((prev) => ({
                        ...prev,
                        status: "IN_PROGRESS",
                        lastAction: "game_start",
                        currentStage: "STAGE_1",
                        currentStageStep: "init",
                    }))
                } else if (eventCode === "game_end") {
                    setGameState((prev) => ({ ...prev, status: "IS_COMPLETED", lastAction: "game_end" }))
                } else if (eventCode === "game_s1_init") {
                    setGameState((prev) => ({
                        ...prev,
                        currentStage: "STAGE_1",
                        lastAction: "game_s1_init",
                        currentStageStep: "hustle_pick",
                    }))
                } else if (eventCode === "game_s1_hustle_pick_time_elapse") {
                    setGameState((prev) => ({
                        ...prev,
                        lastAction: "game_s1_hustle_pick_time_elapse",
                        currentStageStep: "hustle_reveal",
                    }))
                } else if (eventCode === "game_s1_hustle_reveal") {
                    setGameState((prev) => ({
                        ...prev,
                        lastAction: "game_s1_hustle_reveal",
                        currentStageStep: "prep_questions",
                    }))
                } else if (eventCode === "game_s1_questions_prep") {
                    setGameState((prev) => ({
                        ...prev,
                        lastAction: "game_s1_questions_prep",
                        currentStageStep: "questions",
                        showQuestions: true,
                    }))
                } else if (eventCode == "game_s1_question_reveal") {
                    const questionNumber = Number.parseInt(eventCode.split("_").pop() || "0")
                    setGameState((prev) => ({
                        ...prev,
                        currentQuestion: questionNumber,
                        lastAction: eventCode,
                        currentStageStep: "question_reveal",
                    }))
                } else if (eventCode.includes("game_s1_timer_start")) {
                    setGameState((prev) => ({
                        ...prev,
                        lastAction: eventCode,
                        currentStageStep: "timer_running",
                    }))
                } else if (eventCode === "question_s1_time_elapsed") {
                    setGameState((prev) => ({
                        ...prev,
                        lastAction: "question_s1_time_elapsed",
                        currentStageStep: "questions",
                    }))
                } else if (eventCode === "game_s1_results_reveal") {
                    setGameState((prev) => ({
                        ...prev,
                        lastAction: "game_s1_results_reveal",
                        currentStageStep: "results",
                        currentStage: "STAGE_1_COMPLETE",
                    }))
                }
                // Add other stage handlers here...
                else {
                    setGameState((prev) => ({ ...prev, lastAction: eventCode }))
                }
            } catch (error) {
                console.error("Failed to send message:", error)
                toast.error("Failed to send message")
            } finally {
                setIsSending(false)
            }
        },
        [isConnected, sendMessage, gameId, refetchContestants],
    )

    // Game control functions
    const startGame = () => sendGameMessage("game_start")
    const endGame = () => sendGameMessage("game_end")

    // Stage 1 functions
    const initStage1 = () => sendGameMessage("game_s1_init", { start_time: new Date().toISOString() })
    const endTimerHustlePick = () => sendGameMessage("game_s1_hustle_pick_time_elapse")
    const revealHustles = () => sendGameMessage("game_s1_hustle_reveal")
    const prepStage1Questions = () => sendGameMessage("game_s1_questions_prep")
    const showStage1Results = () => sendGameMessage("game_s1_results_reveal")

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

    // Handle timer start
    const handleTimerStart = (questionId: string, startTime: string, questionType: string) => {
        notifyBackendStartTimer({
            question_id: questionId,
            start_time: startTime,
            question_type: questionType,
        })
    }

    // Helper to get current stage title and subtitle
    const getStageInfo = () => {
        if (gameState.currentStage.includes("STAGE_1")) {
            return { title: "Stage 1", subtitle: "STARTUP CAPITAL" }
        } else if (gameState.currentStage.includes("STAGE_2")) {
            return { title: "Stage 2", subtitle: "OPPORTUNITY" }
        } else if (gameState.currentStage.includes("STAGE_3")) {
            return { title: "Stage 3", subtitle: "DUD OR OPPORTUNITY" }
        } else if (gameState.currentStage.includes("STAGE_4")) {
            return { title: "Stage 4", subtitle: "FINAL ROUND" }
        }
        return { title: "Game Setup", subtitle: "PREPARE TO START" }
    }

    // Get stage-specific buttons based on current stage and step
    const getStageButtons = () => {
        const { currentStage, currentStageStep } = gameState

        if (currentStage.includes("STAGE_1")) {
            if (currentStageStep === "init") {
                return (
                    <div className="flex justify-center">
                        <TrapeziumButton onClick={initStage1} variant="green">
                            INITIALIZE STAGE
                        </TrapeziumButton>
                    </div>
                )
            } else if (currentStageStep === "hustle_pick") {
                return (
                    <div className="flex justify-center">
                        <TrapeziumButton onClick={endTimerHustlePick} variant="yellow">
                            END HUSTLE PICK TIMER
                        </TrapeziumButton>
                    </div>
                )
            } else if (currentStageStep === "hustle_reveal") {
                return (
                    <div className="flex justify-center">
                        <TrapeziumButton onClick={revealHustles} variant="blue">
                            REVEAL HUSTLE
                        </TrapeziumButton>
                    </div>
                )
            } else if (currentStageStep === "prep_questions") {
                return (
                    <div className="flex justify-center mt-8">
                        <div className="text-center">
                            <div className="flex justify-center mb-2">
                                <img src="/images/question-badge.png" alt="Question" className="w-20 h-20" />
                            </div>
                            <p className="text-white mb-4">Prep Stage 1 Questions</p>
                            <TrapeziumButton onClick={prepStage1Questions} variant="orange">
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
                        <TrapeziumButton onClick={() => sendGameMessage("game_s2_init")} color="orange">
                            START STAGE 2
                        </TrapeziumButton>
                    </div>
                )
            }

            // For questions, question_reveal, and timer_running steps,
            // we'll use the Stage1Questions component
            return null
        }

        // Default - game not started
        return (
            <div className="flex justify-center">
                <TrapeziumButton onClick={startGame} color="green">
                    START GAME
                </TrapeziumButton>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#1a0b25] text-white">


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
                    <div className="flex flex-col items-center h-full">
                        {/* Stage Title */}
                        <div className="relative w-80 h-32 flex items-center justify-center mb-8">
                            <img
                                src="/images/stage-scroll.png"
                                alt="Stage"
                                className="absolute inset-0 w-full h-full object-contain"
                            />
                            <div className="relative text-center">
                                <h2 className="text-3xl font-serif text-[#5c2800]">{getStageInfo().title}</h2>
                                <p className="text-sm font-bold text-[#5c2800]">{getStageInfo().subtitle}</p>
                            </div>
                        </div>


                        {/* Contestants */}
                        {!(
                            gameState.currentStage.includes("STAGE_1") &&
                            (gameState.currentStageStep === "questions" ||
                                gameState.currentStageStep === "question_reveal" ||
                                gameState.currentStageStep === "timer_running")
                        ) && (
                                <div className="flex justify-center gap-4 mb-8">
                                    {gameState.contestants.map((contestant, index) => (
                                        <div key={contestant.id} className="relative">
                                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#ff00ff] mb-2">
                                                <img
                                                    src={`/placeholder.svg?height=64&width=64&text=${index + 1}`}
                                                    alt={contestant.name || "Contestant"}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="w-24 h-32 bg-gradient-to-b from-[#9c4dcc] to-[#6a2a8c] clip-path-contestant">
                                                {/* Contestant bar */}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                        {/* Stage-specific buttons */}
                        {getStageButtons()}

                        {/* Stage 1 Questions Component */}
                        {gameState.currentStage.includes("STAGE_1") &&
                            (gameState.currentStageStep === "questions" ||
                                gameState.currentStageStep === "question_reveal" ||
                                gameState.currentStageStep === "timer_running") && (
                                <Stage1Questions
                                    gameId={gameId}
                                    onQuestionComplete={handleQuestionComplete}
                                    onTimerStart={handleTimerStart}
                                    sendGameMessage={sendGameMessage}
                                    currentQuestion={gameState.currentQuestion}
                                    currentStageStep={gameState.currentStageStep}
                                />
                            )}

                        {/* Show results button for Stage 1 */}
                        {gameState.currentStage.includes("STAGE_1") && gameState.currentStageStep === "questions" && (
                            <div className="mt-8">
                                <TrapeziumButton onClick={showStage1Results} variant="purple">
                                    REVEAL STAGE RESULTS
                                </TrapeziumButton>
                            </div>
                        )}
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
        </div>
    )
}

type StageTabProps = {
    label: string
    active?: boolean
    onClick: () => void
}

const StageTab = ({ label, active = false, onClick }: StageTabProps) => {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 ${active ? "text-white" : "text-white/50"} 
                font-medium hover:text-white transition-colors`}
        >
            {label}
        </button>
    )
}
