"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, Trophy, AlertCircle, Play, Radio, CheckCircle, Clock, Award, Zap, X, Loader2 } from "lucide-react"
import { Button, Card, CardContent, CardHeader, CardTitle, GlowyStrokeText } from "@/components/core"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/core/Tabs"
import { convertKebabAndSnakeToTitleCase } from "@/utils/strings"
import { cn } from "@/utils/classNames"
import { GAME_STATUSES_ENUMS } from "@/utils/enums"
import toast from "react-hot-toast"
import { useMQTT } from "@/hooks/useMqttService"
import { useGetGameContestants } from "@/app/admin/misc/api"
import { useGetAllHustleQuestions } from "@/app/components/stages/api/stage1/question/getHustleQuestion"
// import { useGetAllStage2Questions } from "@/app/components/stages/api/stage2/getQuestion2"
import { useNotifyBackendStartQuestionTimer } from "../misc/api"
import { useGetAllStage2Questions } from "@/app/host/misc/api"

export default function HostPage() {
    const params = useParams()
    const gameId = params.episode as string
    const { data: allStage1Questions, isLoading: isLoadingHustleQuestions } = useGetAllHustleQuestions(Number(gameId))
    const { data: allStage2Questions, isLoading: isLoadingStage2Questions } = useGetAllStage2Questions(Number(gameId))
    const { mutate: notifyBackendStartTimer } = useNotifyBackendStartQuestionTimer()


    const { isConnected, sendMessage, onMessage } = useMQTT()
    const [activeStage, setActiveStage] = useState<string>("stage1")
    const [gameState, setGameState] = useState<{
        currentStage: string;
        status: string;
        lastAction: string;
        currentQuestion: number;
        contestants: any[];
    }>({
        currentStage: "",
        status: "",
        lastAction: "",
        currentQuestion: 0,
        contestants: [],
    })
    const [isSending, setIsSending] = useState(false)
    const [messageLog, setMessageLog] = useState<Array<{ type: string; message: string; timestamp: string }>>([])

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
    }, [isConnected, onMessage])

    // Initialize game data when contestants data is loaded
    useEffect(() => {
        if (contestantsData) {
            setGameState((prevState) => ({
                ...prevState,
                currentStage: contestantsData.game.stage,
                status: contestantsData.game.status,
                contestants: contestantsData.data,
            }))

            // Set active tab based on current stage
            if (contestantsData.game.stage.includes("STAGE_1")) {
                setActiveStage("stage1")
            } else if (contestantsData.game.stage.includes("STAGE_2")) {
                setActiveStage("stage2")
            } else if (contestantsData.game.stage.includes("STAGE_3")) {
                setActiveStage("stage3")
            } else if (contestantsData.game.stage.includes("STAGE_4")) {
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
                refetchContestants();
                toast.success(`Sent: ${eventCode}`)

                // Update local game state
                if (eventCode === "game_start") {
                    setGameState((prev) => ({ ...prev, status: "IN_PROGRESS", lastAction: "game_start" }))
                } else if (eventCode === "game_end") {
                    setGameState((prev) => ({ ...prev, status: "IS_COMPLETED", lastAction: "game_end" }))
                } else {
                    setGameState((prev) => ({ ...prev, lastAction: eventCode }))
                }

                // For question events, update current question
                if (eventCode.includes("question_reveal")) {
                    const questionNumber = Number.parseInt(eventCode.split("_").pop() || "0")
                    setGameState((prev) => ({ ...prev, currentQuestion: questionNumber }))
                }
            } catch (error) {
                console.error("Failed to send message:", error)
                toast.error("Failed to send message")
            } finally {
                setIsSending(false)
            }
        },
        [isConnected, sendMessage, gameId],
    )

    // Game control functions
    const startGame = () => sendGameMessage("game_start")
    const endGame = () => sendGameMessage("game_end")
    console.log(allStage1Questions?.data?.hustle_questions)

    // Stage 1 functions
    const initStage1 = () => sendGameMessage("game_s1_init", { start_time: new Date().toISOString() })
    const endTimerHustlePick = () => sendGameMessage("game_s1_hustle_pick_time_elapse")
    const revealHustles = () => sendGameMessage("game_s1_hustle_reveal")
    const prepStage1Questions = (num: number) => sendGameMessage("game_s1_questions_prep", { question_id: allStage1Questions?.data?.hustle_questions[num - 1]?.questions.question_id })
    const prepStage2Questions = (num: number) => sendGameMessage("game_s1_questions_prep", { question_id: allStage2Questions?.data.proof_questions[num - 1]?.questions.question_id })
    const revealStage1Question = (n: number) => {
        sendGameMessage(`game_s1_question_reveal_${n}`, {question_id: allStage1Questions?.data?.hustle_questions[n - 1]?.questions.question_id?.toString() || "",});
        if (n == 1) {
            prepStage1Questions(1)
        }
    }
    const startStage1Timer = (n: number) => {
        sendGameMessage(`game_s1_timer_start_${n}`);
        notifyBackendStartTimer({
            question_id: allStage1Questions?.data?.hustle_questions[n - 1]?.questions.question_id?.toString() || "",
            start_time: new Date().toISOString(),
            question_type: "stage_1",
        })
    }

    const endStage1Timer = () => sendGameMessage(`question_s1_time_elapsed`)
    const showStage1Results = () => sendGameMessage("game_s1_results_reveal")

    // Stage 2 functions
    const initStage2 = () => sendGameMessage("game_s2_init")
    const prepStage2 = () => sendGameMessage("game_s2_prep")
    const revealStage2Question = (n: number) => sendGameMessage(`game_s2_question_reveal`)
    const startStage2Timer = (n: number) => sendGameMessage(`game_s2_timer_start_${n}`)
    const showStage2Results = () => sendGameMessage("game_s2_results_reveal")

    // Stage 3 functions
    const initStage3 = () => sendGameMessage("game_s3_init")
    const prepStage3 = () => sendGameMessage("game_s3_prep")
    const showStage3Results = () => sendGameMessage("game_s3_results_reveal")

    // Stage 4 functions
    const prepStage4 = () => sendGameMessage("game_s4_prep")
    const revealStage4Picks = (n: number) => sendGameMessage(`game_s4_picks_reveal_${n}`)
    const showStage4Results = () => sendGameMessage("game_s4_results_reveal")

    // Generate question buttons for stages 1 and 2
    const renderQuestionButtons = (stage: string, count: number) => {
        return Array.from({ length: count }, (_, i) => i + 1).map((num) => (
            <div key={`${stage}_q${num}`} className="flex flex-col gap-1 items-center">
                <div className="text-xs text-gray-300">Q{num}</div>
                <div className="flex gap-1">
                    <Button
                        variant="outlined"
                        onClick={() => (stage === "S1" ? revealStage1Question(num) : revealStage2Question(num))}
                        className="border-[#ff00ff]/30 text-white hover:bg-[#3a2a45] hover:text-white"
                    >
                        <Radio className="h-3 w-3 mr-1" />
                        Reveal
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => (stage === "S1" ? startStage1Timer(num) : startStage2Timer(num))}
                        className="border-[#ff00ff]/30 text-white hover:bg-[#3a2a45] hover:text-white"
                    >
                        <Clock className="h-3 w-3 mr-1" />
                        Start Timer
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => {
                            if (stage == "S1") {

                                endStage1Timer()
                                setTimeout(() => {
                                    prepStage1Questions(num)
                                }, 500);
                            }
                            else {

                                endStage1Timer()
                                setTimeout(() => {
                                    prepStage1Questions(num)
                                }, 500);
                                prepStage2Questions(num)
                            }

                        }}
                        className="border-[#ff00ff]/30 text-white hover:bg-[#3a2a45] hover:text-white"
                    >
                        <Clock className="h-3 w-3 mr-1" />
                        End Timer
                    </Button>
                </div>
            </div >
        ))
    }

    return (
        <div className="min-h-screen bg-[#1a0b25] text-white">
            <div className="container mx-auto py-8 px-4">
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/admin" className="text-primary hover:text-[#ff00ff] transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <Trophy className="h-8 w-8 text-primary" />
                        <GlowyStrokeText textclassName="text-[4xl]" strokeWidth={2} strokeColor="#ff00ff" glowColor="#ff00ff">
                            Host Panel - Game {gameId}
                        </GlowyStrokeText>
                    </div>
                </div>

                {isLoadingContestants ? (
                    <div className="text-center py-12">Loading game data...</div>
                ) : !contestantsData ? (
                    <div className="text-center py-12 text-gray-400">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-[#ff00ff]" />
                        <p>Game data not found or error loading data.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                            {/* Game Status Card */}
                            <Card className="border-[#ff00ff]/20 bg-[#2a1a35]/80 backdrop-blur-sm">
                                <CardHeader className="border-b border-[#ff00ff]/20 pb-4">
                                    <CardTitle className="text-xl text-primary">Game Status</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="grid gap-4">
                                        <div className="p-4 rounded-lg bg-[#3a2a45] border border-[#ff00ff]/20">
                                            <div className="text-sm text-gray-300">Connection Status</div>
                                            <div className="flex items-center gap-1.5 font-medium mt-1">
                                                <div
                                                    className={`size-3 rounded-full ${isConnected ? "bg-[#00ff00] animate-pulse" : "bg-[#ff0000]"}`}
                                                ></div>
                                                {isConnected ? "Connected" : "Disconnected"}
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-lg bg-[#3a2a45] border border-[#ff00ff]/20">
                                            <div className="text-sm text-gray-300">Game Status</div>
                                            <div className="flex items-center gap-1.5 font-medium mt-1">
                                                <div
                                                    className={cn(
                                                        "size-3 rounded-full font-medium",
                                                        gameState.status === "IN_PROGRESS"
                                                            ? "bg-[#d400ff] animate-pulse"
                                                            : gameState.status === "IS_COMPLETED"
                                                                ? "bg-[#00ff00]"
                                                                : "bg-[#ff0000]",
                                                    )}
                                                ></div>
                                                {GAME_STATUSES_ENUMS[gameState.status] || "Not Started"}
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-lg bg-[#3a2a45] border border-[#ff00ff]/20">
                                            <div className="text-sm text-gray-300">Current Stage</div>
                                            <div className="font-medium mt-1">
                                                {convertKebabAndSnakeToTitleCase(gameState.currentStage) || "Not Started"}
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-lg bg-[#3a2a45] border border-[#ff00ff]/20">
                                            <div className="text-sm text-gray-300">Last Action</div>
                                            <div className="font-medium mt-1 text-sm">{gameState.lastAction || "None"}</div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <Button
                                                onClick={startGame}
                                                disabled={isSending || gameState.status === "IN_PROGRESS"}
                                                className="bg-gradient-to-r from-primary to-[#ff00ff] hover:opacity-90 transition-opacity"
                                            >
                                                <Play className="h-4 w-4 mr-2" />
                                                Start Game
                                            </Button>
                                            <Button
                                                onClick={endGame}
                                                disabled={isSending || gameState.status !== "IN_PROGRESS"}
                                                className="bg-gradient-to-r from-[#ff0000] to-[#ff00ff] hover:opacity-90 transition-opacity"
                                            >
                                                <X className="h-4 w-4 mr-2" />
                                                End Game
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Contestants Card */}
                            <Card className="border-[#ff00ff]/20 bg-[#2a1a35]/80 backdrop-blur-sm lg:col-span-2">
                                <CardHeader className="border-b border-[#ff00ff]/20 pb-4">
                                    <CardTitle className="text-xl text-primary">Contestants</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {gameState.contestants.map((contestant: any) => (
                                            <div key={contestant.id} className="p-3 rounded-lg bg-[#3a2a45] border border-[#ff00ff]/20">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="p-1.5 rounded-full bg-primary/20 text-primary">
                                                        <Trophy className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{contestant.name || "Unassigned"}</div>
                                                        <div className="text-xs text-gray-300">
                                                            {convertKebabAndSnakeToTitleCase(contestant.constestant_attr)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-sm font-medium">Balance: ₦{contestant.final_pot || 0}</div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Game Controls */}
                        <Card className="border-[#ff00ff]/20 bg-[#2a1a35]/80 backdrop-blur-sm mb-6">
                            <CardHeader className="border-b border-[#ff00ff]/20 pb-4">
                                <CardTitle className="text-xl text-primary">Game Controls</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <Tabs value={activeStage} onValueChange={setActiveStage}>
                                    <TabsList className="bg-[#3a2a45] border border-[#ff00ff]/20 mb-4">
                                        <TabsTrigger
                                            value="stage1"
                                            className="data-[state=active]:bg-primary data-[state=active]:text-white"
                                        >
                                            Stage 1
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="stage2"
                                            className="data-[state=active]:bg-primary data-[state=active]:text-white"
                                        >
                                            Stage 2
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="stage3"
                                            className="data-[state=active]:bg-primary data-[state=active]:text-white"
                                        >
                                            Stage 3
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="stage4"
                                            className="data-[state=active]:bg-primary data-[state=active]:text-white"
                                        >
                                            Stage 4
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* Stage 1 Controls */}
                                    <TabsContent value="stage1">
                                        <div className="grid gap-4">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                                <Button
                                                    onClick={initStage1}
                                                    disabled={isSending}
                                                    className="bg-[#3a2a45] hover:bg-[#4a3a55] border border-[#ff00ff]/20"
                                                >
                                                    <Play className="h-4 w-4 mr-2" />
                                                    Initialize Stage 1
                                                </Button>
                                                <Button
                                                    onClick={endTimerHustlePick}
                                                    disabled={isSending}
                                                    className="bg-[#3a2a45] hover:bg-[#4a3a55] border border-[#ff00ff]/20"
                                                >
                                                    <Clock className="h-4 w-4 mr-2" />
                                                    End Hustle Pick Timer
                                                </Button>
                                                <Button
                                                    onClick={revealHustles}
                                                    disabled={isSending}
                                                    className="bg-[#3a2a45] hover:bg-[#4a3a55] border border-[#ff00ff]/20"
                                                >
                                                    <Zap className="h-4 w-4 mr-2" />
                                                    Reveal Hustles
                                                </Button>
                                                <Button
                                                    onClick={() => prepStage1Questions(1)}
                                                    disabled={isSending}
                                                    className="bg-[#3a2a45] hover:bg-[#4a3a55] border border-[#ff00ff]/20"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Prep Questions
                                                </Button>
                                            </div>

                                            <div className="p-4 rounded-lg bg-[#3a2a45] border border-[#ff00ff]/20">
                                                <h3 className="text-sm font-medium mb-3">Stage 1 Questions</h3>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid- gap-3">
                                                    {renderQuestionButtons("S1", 12)}
                                                </div>
                                            </div>

                                            <Button
                                                onClick={showStage1Results}
                                                disabled={isSending}
                                                className="bg-gradient-to-r from-primary to-[#ff00ff] hover:opacity-90 transition-opacity"
                                            >
                                                <Award className="h-4 w-4 mr-2" />
                                                Show Stage 1 Results
                                            </Button>
                                        </div>
                                    </TabsContent>

                                    {/* Stage 2 Controls */}
                                    <TabsContent value="stage2">
                                        <div className="grid gap-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                <Button
                                                    onClick={initStage2}
                                                    disabled={isSending}
                                                    className="bg-[#3a2a45] hover:bg-[#4a3a55] border border-[#ff00ff]/20"
                                                >
                                                    <Play className="h-4 w-4 mr-2" />
                                                    Initialize Stage 2
                                                </Button>
                                                <Button
                                                    onClick={prepStage2}
                                                    disabled={isSending}
                                                    className="bg-[#3a2a45] hover:bg-[#4a3a55] border border-[#ff00ff]/20"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Prep Stage 2
                                                </Button>
                                            </div>

                                            <div className="p-4 rounded-lg bg-[#3a2a45] border border-[#ff00ff]/20">
                                                <h3 className="text-sm font-medium mb-3">Stage 2 Questions</h3>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                    {renderQuestionButtons("S2", 8)}
                                                </div>
                                            </div>

                                            <Button
                                                onClick={showStage2Results}
                                                disabled={isSending}
                                                className="bg-gradient-to-r from-primary to-[#ff00ff] hover:opacity-90 transition-opacity"
                                            >
                                                <Award className="h-4 w-4 mr-2" />
                                                Show Stage 2 Results
                                            </Button>
                                        </div>
                                    </TabsContent>

                                    {/* Stage 3 Controls */}
                                    <TabsContent value="stage3">
                                        <div className="grid gap-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                <Button
                                                    onClick={initStage3}
                                                    disabled={isSending}
                                                    className="bg-[#3a2a45] hover:bg-[#4a3a55] border border-[#ff00ff]/20"
                                                >
                                                    <Play className="h-4 w-4 mr-2" />
                                                    Initialize Stage 3
                                                </Button>
                                                <Button
                                                    onClick={prepStage3}
                                                    disabled={isSending}
                                                    className="bg-[#3a2a45] hover:bg-[#4a3a55] border border-[#ff00ff]/20"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Prep Stage 3
                                                </Button>
                                            </div>

                                            <div className="p-4 rounded-lg bg-[#3a2a45] border border-[#ff00ff]/20">
                                                <h3 className="text-sm font-medium mb-3">Dud/Opportunity Selection</h3>
                                                <p className="text-sm text-gray-300 mb-3">
                                                    Contestants will select Dud or Opportunity cards. The system will automatically handle the
                                                    selections.
                                                </p>
                                            </div>

                                            <Button
                                                onClick={showStage3Results}
                                                disabled={isSending}
                                                className="bg-gradient-to-r from-primary to-[#ff00ff] hover:opacity-90 transition-opacity"
                                            >
                                                <Award className="h-4 w-4 mr-2" />
                                                Show Stage 3 Results
                                            </Button>
                                        </div>
                                    </TabsContent>

                                    {/* Stage 4 Controls */}
                                    <TabsContent value="stage4">
                                        <div className="grid gap-4">
                                            <Button
                                                onClick={prepStage4}
                                                disabled={isSending}
                                                className="bg-[#3a2a45] hover:bg-[#4a3a55] border border-[#ff00ff]/20"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Prep Stage 4
                                            </Button>

                                            <div className="p-4 rounded-lg bg-[#3a2a45] border border-[#ff00ff]/20">
                                                <h3 className="text-sm font-medium mb-3">Number Match Picks</h3>
                                                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                                    {Array.from({ length: 6 }, (_, i) => i + 1).map((num) => (
                                                        <Button
                                                            key={`pick_${num}`}
                                                            onClick={() => revealStage4Picks(num)}
                                                            disabled={isSending}
                                                            className="bg-[#3a2a45] hover:bg-[#4a3a55] border border-[#ff00ff]/20"
                                                        >
                                                            Reveal Pick {num}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>

                                            <Button
                                                onClick={showStage4Results}
                                                disabled={isSending}
                                                className="bg-gradient-to-r from-primary to-[#ff00ff] hover:opacity-90 transition-opacity"
                                            >
                                                <Award className="h-4 w-4 mr-2" />
                                                Show Final Results
                                            </Button>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>

                        {/* Message Log */}
                        <Card className="border-[#ff00ff]/20 bg-[#2a1a35]/80 backdrop-blur-sm">
                            <CardHeader className="border-b border-[#ff00ff]/20 pb-4">
                                <CardTitle className="text-xl text-primary">Message Log</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="h-64 overflow-y-auto p-3 bg-[#1a0b25] rounded-lg border border-[#ff00ff]/20 text-sm font-mono">
                                    {messageLog.length === 0 ? (
                                        <div className="text-gray-400 text-center py-4">No messages yet</div>
                                    ) : (
                                        messageLog.map((log, index) => (
                                            <div key={index} className={`mb-2 ${log.type === "sent" ? "text-[#00ff00]" : "text-[#ff00ff]"}`}>
                                                [{log.timestamp}] {log.type === "sent" ? "SENT" : "RECEIVED"}: {log.message}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Loading Overlay */}
            {isSending && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[#2a1a35] p-6 rounded-lg flex flex-col items-center">
                        <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                        <div className="text-white">Sending message...</div>
                    </div>
                </div>
            )}
        </div>
    )
}
