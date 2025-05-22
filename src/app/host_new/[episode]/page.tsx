"use client"

import { useParams } from "next/navigation"
import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { AlertCircle, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { useMQTT } from "@/hooks/useMqttService"
import { useGetGameContestants } from "@/app/admin/misc/api"
import { useGetAllHustleQuestions } from "@/app/components/stages/api/stage1/question/getHustleQuestion"
import { useGetAllStage2Questions } from "@/app/components/stages/api/stage2/getQuestion2"
import { useNotifyBackendStartQuestionTimer } from "../misc/api"
import { TrapeziumButton } from "@/components/core/ButtonTrapezium"

export default function HostPage() {
    const params = useParams()
    const gameId = params.episode as string
    const { data: allStage1Questions, isLoading: isLoadingHustleQuestions } = useGetAllHustleQuestions(Number(gameId))
    const { data: allStage2Questions, isLoading: isLoadingStage2Questions } = useGetAllStage2Questions(Number(gameId))
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
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const hustlePickTimerRef = useRef<NodeJS.Timeout | null>(null)
    const questionTimerRef = useRef<NodeJS.Timeout | null>(null)

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

    // Timer effect
    useEffect(() => {
        if (timerActive) {
            timerRef.current = setInterval(() => {
                setTimerSeconds((prev) => {
                    if (prev === 0) {
                        if (timerMinutes === 0) {
                            // Timer completed
                            setTimerActive(false)
                            clearInterval(timerRef.current as NodeJS.Timeout)
                            return 0
                        } else {
                            setTimerMinutes((prevMin) => prevMin - 1)
                            return 59
                        }
                    } else {
                        return prev - 1
                    }
                })
            }, 1000)
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [timerActive, timerMinutes])

    // Auto-end hustle pick timer after 60 seconds when stage 1 is initialized
    useEffect(() => {
        if (gameState.currentStage === "STAGE_1" && gameState.currentStageStep === "hustle_pick") {
            // Clear any existing timer
            if (hustlePickTimerRef.current) {
                clearTimeout(hustlePickTimerRef.current)
            }

            // Start 60 second timer for hustle pick
            setTimerMinutes(1)
            setTimerSeconds(0)
            setTimerActive(true)

            hustlePickTimerRef.current = setTimeout(() => {
                endTimerHustlePick()
                setTimerActive(false)
                // toast.info("Hustle pick time elapsed automatically")
            }, 60000) // 60 seconds
        }

        return () => {
            if (hustlePickTimerRef.current) {
                clearTimeout(hustlePickTimerRef.current)
            }
        }
    }, [gameState.currentStage, gameState.currentStageStep])

    // Auto-end question timer after 15 seconds when a question timer starts
    useEffect(() => {
        if (gameState.currentStageStep === "timer_running") {
            // Clear any existing timer
            if (questionTimerRef.current) {
                clearTimeout(questionTimerRef.current)
            }

            // Start 15 second timer for questions
            setTimerMinutes(0)
            setTimerSeconds(15)
            setTimerActive(true)

            questionTimerRef.current = setTimeout(() => {
                endStage1Timer()
                endStage2Timer()
                setTimerActive(false)
                // toast.info("Question time elapsed automatically")
            }, 15000) // 15 seconds
        }

        return () => {
            if (questionTimerRef.current) {
                clearTimeout(questionTimerRef.current)
            }
        }
    }, [gameState.currentStageStep])

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
                } else if (eventCode.includes("game_s1_question_reveal")) {
                    const questionNumber = Number.parseInt(eventCode.split("_").pop() || "0")
                    setGameState((prev) => ({
                        ...prev,
                        currentQuestion: questionNumber,
                        lastAction: eventCode,
                        currentStageStep: "question_reveal",
                    }))
                } else if (eventCode.includes("game_s1_timer_start") || eventCode.includes("game_s2_timer_start")) {
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
                } else if (eventCode === "game_s2_init") {
                    setGameState((prev) => ({
                        ...prev,
                        currentStage: "STAGE_2",
                        lastAction: "game_s2_init",
                        currentStageStep: "init",
                    }))
                } else if (eventCode === "game_s2_prep") {
                    setGameState((prev) => ({
                        ...prev,
                        lastAction: "game_s2_prep",
                        currentStageStep: "questions",
                        showQuestions: true,
                    }))
                } else if (eventCode.includes("game_s2_question_reveal")) {
                    const questionNumber = Number.parseInt(eventCode.split("_").pop() || "0")
                    setGameState((prev) => ({
                        ...prev,
                        currentQuestion: questionNumber,
                        lastAction: eventCode,
                        currentStageStep: "question_reveal",
                    }))
                } else if (eventCode === "game_s2_results_reveal") {
                    setGameState((prev) => ({
                        ...prev,
                        lastAction: "game_s2_results_reveal",
                        currentStageStep: "results",
                        currentStage: "STAGE_2_COMPLETE",
                    }))
                } else if (eventCode === "game_s3_init") {
                    setGameState((prev) => ({
                        ...prev,
                        currentStage: "STAGE_3",
                        lastAction: "game_s3_init",
                        currentStageStep: "init",
                    }))
                } else if (eventCode === "game_s3_results_reveal") {
                    setGameState((prev) => ({
                        ...prev,
                        lastAction: "game_s3_results_reveal",
                        currentStageStep: "results",
                        currentStage: "STAGE_3_COMPLETE",
                    }))
                } else if (eventCode === "game_s4_prep") {
                    setGameState((prev) => ({
                        ...prev,
                        currentStage: "STAGE_4",
                        lastAction: "game_s4_prep",
                        currentStageStep: "init",
                    }))
                } else if (eventCode.includes("game_s4_picks_reveal")) {
                    const pickNumber = Number.parseInt(eventCode.split("_").pop() || "0")
                    setGameState((prev) => ({
                        ...prev,
                        currentQuestion: pickNumber,
                        lastAction: eventCode,
                        currentStageStep: "pick_reveal",
                    }))
                } else if (eventCode === "game_s4_results_reveal") {
                    setGameState((prev) => ({
                        ...prev,
                        lastAction: "game_s4_results_reveal",
                        currentStageStep: "results",
                        currentStage: "GAME_COMPLETE",
                    }))
                } else {
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
    const prepStage1Questions = (num: number) =>
        sendGameMessage("game_s1_questions_prep", {
            question_id: allStage1Questions?.data?.hustle_questions[num - 1]?.questions.question_id,
        })
    const revealStage1Question = (n: number, ) => {
        sendGameMessage(`game_s1_question_reveal_${n}`, {
            question_id: allStage1Questions?.data?.hustle_questions[n - 1]?.questions.question_id?.toString() || "",
        })
        setGameState((prev) => ({
            ...prev,
            currentQuestion: n,
            lastAction: `game_s1_question_reveal_${n}`,
            currentStageStep: "question_reveal",
        }))
    }
    const startStage1Timer = (n: number) => {
        sendGameMessage(`game_s1_timer_start_${n}`)
        notifyBackendStartTimer({
            question_id: allStage1Questions?.data?.hustle_questions[n - 1]?.questions.question_id?.toString() || "",
            start_time: new Date().toISOString(),
            question_type: "stage_1",
        })
    }
    // Replace the endStage1Timer function with this updated version
    const endStage1Timer = () => {
        // Get the current question ID from the allStage1Questions data
        const currentQuestionId = allStage1Questions?.data?.hustle_questions[gameState.currentQuestion - 1]?.questions.question_id?.toString() || ""

        // Send the message with the question_id in the payload
        sendGameMessage(`question_s1_time_elapsed`, {
            question_id: currentQuestionId,
        })      
    }
    
    const endStage2Timer = () => {
        // Get the current question ID from the allStage1Questions data
        const currentQuestionId =
            allStage2Questions?.questions[gameState.currentQuestion - 1]?.question_id?.toString() || ""

        // Send the message with the question_id in the payload
        sendGameMessage(`question_s2_time_elapsed`, {
            question_id: currentQuestionId,
        })

        // After ending the timer, prepare the next question if not at the end
        const nextQuestionNumber = gameState.currentQuestion + 1
        if (nextQuestionNumber <= 10) {
            // Assuming 10 questions total in Stage 1
            setTimeout(() => {
                prepStage2Questions(nextQuestionNumber)
                // toast.info(`Preparing question ${nextQuestionNumber}`)
            }, 1000) // Small delay before preparing next question
        }
    }

    const showStage1Results = () => {
        sendGameMessage("game_s1_results_reveal")
    }

    // Stage 2 functions
    const initStage2 = () => sendGameMessage("game_s2_init")
    const prepStage2 = () => sendGameMessage("game_s2_prep")
    const prepStage2Questions = (num: number) =>
        sendGameMessage("game_s2_questions_prep", {
            question_id: allStage2Questions?.questions[num - 1]?.question_id,
        })
    const revealStage2Question = (n: number) => {
        // sendGameMessage(`game_s2_question_reveal_${n}`)
        sendGameMessage(`game_s2_question_reveal_${n}`, {
            question_id: allStage2Questions?.questions[n - 1]?.question_id?.toString() || "",
        })
        setGameState((prev) => ({
            ...prev,
            currentQuestion: n,
            lastAction: `game_s2_question_reveal_${n}`,
            currentStageStep: "question_reveal",
        }))
    }
    const startStage2Timer = (n: number) => {
        sendGameMessage(`game_s2_timer_start_${n}`)
        notifyBackendStartTimer({
            question_id: allStage2Questions?.questions[n - 1]?.question_id?.toString() || "",
            start_time: new Date().toISOString(),
            question_type: "stage_2",
        })
    }
    const showStage2Results = () => sendGameMessage("game_s2_results_reveal")

    // Stage 3 functions
    const initStage3 = () => sendGameMessage("game_s3_init")
    const prepStage3 = () => sendGameMessage("game_s3_prep")
    const showStage3Results = () => sendGameMessage("game_s3_results_reveal")

    // Stage 4 functions
    const prepStage4 = () => sendGameMessage("game_s4_prep")
    const revealStage4Picks = (n: number) => sendGameMessage(`game_s4_picks_reveal_${n}`)
    const showStage4Results = () => sendGameMessage("game_s4_results_reveal")

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
                            <TrapeziumButton onClick={() => prepStage1Questions(1)} variant="orange">
                                PREP QUESTIONS
                            </TrapeziumButton>
                        </div>
                    </div>
                )
            } else if (currentStageStep === "questions" && gameState.showQuestions) {
                return (
                    <div className="flex flex-col items-center">
                        <p className="text-white mb-4">Show Question</p>
                        <div className="grid grid-cols-5 gap-2 mb-4">

                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                                <QuestionButton
                                    key={`q_${num}`}
                                    number={num}
                                    onClick={() => revealStage1Question(num)}
                                    active={gameState.currentQuestion === num}
                                />
                            ))}
                        </div>
                        <div className="flex justify-center gap-4 mt-4">
                            <TrapeziumButton onClick={() => showStage1Results()} variant="purple">
                                REVEAL STAGE TALLY
                            </TrapeziumButton>
                        </div>
                    </div>
                )
            } else if (currentStageStep === "question_reveal") {
                return (
                    <div className="flex justify-center gap-4">
                        <TrapeziumButton onClick={() => startStage1Timer(gameState.currentQuestion)} color="green">
                            START
                        </TrapeziumButton>
                    </div>
                )
            } else if (currentStageStep === "timer_running") {
                return (
                    <div className="flex justify-center">
                        <TrapeziumButton onClick={endStage1Timer} variant="blue">
                            END TIMER
                        </TrapeziumButton>
                    </div>
                )
            } else if (currentStageStep === "results") {
                return (
                    <div className="flex flex-col items-center mt-8">
                        <div className="flex justify-center mb-4">
                            <img src="/images/trophy.png" alt="Trophy" className="w-20 h-20" />
                        </div>
                        <p className="text-white mb-4">Proceed to stage 2</p>
                        <TrapeziumButton onClick={initStage2} color="orange">
                            START STAGE 2
                        </TrapeziumButton>
                    </div>
                )
            }
        } else if (currentStage.includes("STAGE_2")) {
            if (currentStageStep === "init") {
                return (
                    <div className="flex justify-center gap-4">
                        <TrapeziumButton onClick={initStage2} color="green">
                            INITIALIZE STAGE 2
                        </TrapeziumButton>
                        <TrapeziumButton onClick={prepStage2} color="yellow">
                            PREP STAGE 2
                        </TrapeziumButton>
                    </div>
                )
            } else if (currentStageStep === "questions" && gameState.showQuestions) {
                return (
                    <div className="flex flex-col items-center">
                        <p className="text-white mb-4">Show Question</p>
                        <div className="grid grid-cols-4 gap-2 mb-4">
                            {[1,2,3,4,5,6,7,8].map((num) => (
                                <QuestionButton
                                    key={`q_${num}`}
                                    number={num}
                                    onClick={() => revealStage2Question(num)}
                                    active={gameState.currentQuestion === num}
                                />
                            ))}
                        </div>
                        <div className="flex justify-center gap-4 mt-4">
                            <TrapeziumButton onClick={() => showStage2Results()} color="purple">
                                REVEAL STAGE TALLY
                            </TrapeziumButton>
                        </div>
                    </div>
                )
            }

            else if (currentStageStep === "question_reveal") {
                return (
                    <div className="flex justify-center gap-4">
                        <TrapeziumButton onClick={() => startStage2Timer(gameState.currentQuestion)} color="green">
                            START
                        </TrapeziumButton>
                    </div>
                )
            } else if (currentStageStep === "timer_running") {
                return (
                    <div className="flex justify-center">
                        <TrapeziumButton onClick={endStage2Timer} variant="blue">
                            END TIMER
                        </TrapeziumButton>
                    </div>
                )
            } else if (currentStageStep === "results") {
                return (
                    <div className="flex flex-col items-center mt-8">
                        <div className="flex justify-center mb-4">
                            <img src="/images/trophy.png" alt="Trophy" className="w-20 h-20" />
                        </div>
                        <p className="text-white mb-4">Proceed to stage 2</p>
                        <TrapeziumButton onClick={initStage2} color="orange">
                            START STAGE 2
                        </TrapeziumButton>
                    </div>
                )
            }
        }



        else if (currentStageStep === "results") {
            return (
                <div className="flex flex-col items-center mt-8">
                    <div className="flex justify-center mb-4">
                        <img src="/images/trophy.png" alt="Trophy" className="w-20 h-20" />
                    </div>
                    <p className="text-white mb-4">Proceed to stage 3</p>
                    <TrapeziumButton onClick={initStage3} color="orange">
                        START STAGE 3
                    </TrapeziumButton>
                </div>
            )

        } else if (currentStage.includes("STAGE_3")) {
            if (currentStageStep === "init") {
                return (
                    <div className="flex justify-center">
                        <TrapeziumButton onClick={() => showStage3Results()} color="yellow">
                            SELECT OPPORTUNITY
                        </TrapeziumButton>
                    </div>
                )
            } else if (currentStageStep === "results") {
                return (
                    <div className="flex flex-col items-center mt-8">
                        <div className="flex justify-center mb-4">
                            <img src="/images/trophy.png" alt="Trophy" className="w-20 h-20" />
                        </div>
                        <p className="text-white mb-4">Proceed to final stage</p>
                        <TrapeziumButton onClick={prepStage4} color="orange">
                            START STAGE 4
                        </TrapeziumButton>
                    </div>
                )
            }
        } else if (currentStage.includes("STAGE_4")) {
            if (currentStageStep === "init") {
                return (
                    <div className="flex justify-center">
                        <TrapeziumButton onClick={() => showStage4Results()} color="yellow">
                            REVEAL FINAL STAGE VIEW
                        </TrapeziumButton>
                    </div>
                )
            } else if (currentStageStep === "results") {
                return (
                    <div className="flex justify-center">
                        <TrapeziumButton onClick={endGame} color="red">
                            END GAME
                        </TrapeziumButton>
                    </div>
                )
            }
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

    // Format timer display
    const formatTime = (value: number) => {
        return value < 10 ? `0${value}` : `${value}`
    }

    return (
        <div className="min-h-screen bg-[#1a0b25] text-white">
            {/* Header */}
            <header className="bg-[#2a1a35] border-b border-[#ff00ff]/20">
                <div className="container mx-auto py-4 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <img src="/images/hustle-logo.png" alt="The Hustle" className="h-10" />
                        <nav className="hidden md:flex gap-8">
                            <Link href="/dashboard" className="text-white/70 hover:text-white transition-colors">
                                Dashboard
                            </Link>
                            <Link href="/episodes" className="text-white/70 hover:text-white transition-colors">
                                Episodes
                            </Link>
                            <Link href="/contestants" className="text-white/70 hover:text-white transition-colors">
                                Contestants
                            </Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-white/70 hover:text-white">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>
                        </button>
                        <button className="text-white/70 hover:text-white">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                        </button>
                        <div className="bg-[#ff00ff]/20 rounded-full p-1">
                            <img src="/placeholder.svg?height=32&width=32" alt="User" className="w-8 h-8 rounded-full" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Breadcrumb */}
            <div className="bg-[#2a1a35]/50 py-2 px-4">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-white/70">
                        <Link href="/dashboard" className="hover:text-white">
                            Dashboard
                        </Link>
                        <span>/</span>
                        <span className="text-white">Gameplay Control Panel</span>
                    </div>
                    <div className="bg-[#3a2a45] px-4 py-1 rounded-md text-sm">Gameplay Control Panel</div>
                </div>
            </div>

            {isLoadingContestants ? (
                <div className="flex items-center justify-center h-[70vh]">
                    <div className="flex flex-col items-center">
                        <Loader2 className="h-12 w-12 text-[#ff00ff] animate-spin mb-4" />
                        <p className="text-white/70">Loading game data...</p>
                    </div>
                </div>
            ) : !contestantsData ? (
                <div className="flex items-center justify-center h-[70vh]">
                    <div className="flex flex-col items-center">
                        <AlertCircle className="h-16 w-16 text-[#ff00ff] mb-4" />
                        <p className="text-white/70">Game data not found or error loading data.</p>
                    </div>
                </div>
            ) : (
                <main className="container mx-auto py-8 px-4">
                    <div className="flex flex-col items-center">
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

                        {/* Stage Navigation */}
                        <div className="flex justify-center gap-6 mb-8">
                            <StageTab label="Stage 1" active={gameState.currentStage.includes("STAGE_1")} onClick={() => { }} />
                            <StageTab label="Stage 2" active={gameState.currentStage.includes("STAGE_2")} onClick={() => { }} />
                            <StageTab label="Stage 3" active={gameState.currentStage.includes("STAGE_3")} onClick={() => { }} />
                            <StageTab label="Stage 4" active={gameState.currentStage.includes("STAGE_4")} onClick={() => { }} />
                        </div>

                        {/* Contestants */}
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

                        {/* Timer */}
                        <div className="mb-8">
                            <div className="flex gap-4">
                                <div className="text-center">
                                    <div className="text-xs text-white/70 mb-1">MINUTES</div>
                                    <div className="bg-[#1a0b25] w-32 h-24 flex items-center justify-center text-6xl font-bold">
                                        {formatTime(timerMinutes)}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs text-white/70 mb-1">SECONDS</div>
                                    <div className="bg-[#1a0b25] w-32 h-24 flex items-center justify-center text-6xl font-bold">
                                        {formatTime(timerSeconds)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stage-specific buttons */}
                        {getStageButtons()}
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

type QuestionButtonProps = {
    number: number
    onClick: () => void
    active?: boolean
}

const QuestionButton = ({ number, onClick, active = false }: QuestionButtonProps) => {
    return (
        <button
            onClick={onClick}
            className={`w-12 h-10 rounded ${active ? "bg-[#ff6600]" : "bg-[#3a2a45]"} 
                      border border-[#ff00ff]/30 text-white font-bold
                      hover:bg-[#ff00ff]/50 transition-colors`}
        >
            {number}
        </button>
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
