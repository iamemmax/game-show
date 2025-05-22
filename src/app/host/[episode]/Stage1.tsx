"use client"

import React, { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { TrapeziumButton } from "@/components/core/ButtonTrapezium"
import { toast } from "react-hot-toast"
import { IGetHustleQuestionAPIResponse, useGetHustleQuestion } from "../misc/api"



interface Stage1QuestionsProps {
    gameId: string | number
    onQuestionComplete: (questionId: number) => void
    onTimerStart: (questionId: string, startTime: string, questionType: string) => void
    sendGameMessage: (eventCode: string, data?: any) => Promise<void>
    currentQuestion: number
    currentStageStep: string
}

export default function Stage1Questions({
    gameId,
    onQuestionComplete,
    onTimerStart,
    sendGameMessage,
    currentQuestion,
    currentStageStep,
}: Stage1QuestionsProps) {
    const [loading, setLoading] = useState(false)
    const [currentQuestionData, setCurrentQuestionData] = useState<IGetHustleQuestionAPIResponse | null>(null)
    const [timerActive, setTimerActive] = useState(false)
    const [timerSeconds, setTimerSeconds] = useState(15)

    const { mutate: fetchNextQuestion, data: hustleQuestionsData, isLoading } = useGetHustleQuestion(gameId)
    React.useEffect(() => {
        if (hustleQuestionsData) {
            setCurrentQuestionData(hustleQuestionsData)
            setLoading(false)
        }
    }, [hustleQuestionsData, isLoading])

    const handleFetchNextQuestion = async () => {
        setLoading(true)
        fetchNextQuestion({ episode: gameId },
            {
                onSuccess: (data) => {
                    setCurrentQuestionData(data)
                    setLoading(false)
                    toast.success("Next question fetched successfully")
                },
                onError: (error) => {
                    setLoading(false)
                    toast.error("Failed to fetch next question")
                    console.error("Error fetching next question:", error)
                },
            }
        )
    }


    // Start the timer for the current question
    const startQuestionTimer = () => {
        if (!currentQuestionData) return

        const questionId = currentQuestionData.data.question.questions.question_id.toString()
        const startTime = new Date().toISOString()

        // Call the parent function to start timer
        onTimerStart(questionId, startTime, "stage_1")

        // Update UI to show timer is running
        sendGameMessage(`game_s1_timer_start_${currentQuestion}`)

        // Start local timer
        setTimerActive(true)
        setTimerSeconds(15)
    }

    // End the timer for the current question
    const endQuestionTimer = () => {
        if (!currentQuestionData) return

        const questionId = currentQuestionData.data.question.questions.question_id.toString()

        // Call the parent function to end timer
        sendGameMessage(`question_s1_time_elapsed`, {
            question_id: questionId,
        })

        // Update UI to show timer is stopped
        setTimerActive(false)

        // Mark this question as complete
        onQuestionComplete(currentQuestionData.data.question.questions.question_id)
    }

    // Timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null

        if (timerActive) {
            interval = setInterval(() => {
                setTimerSeconds((prev) => {
                    if (prev <= 1) {
                        // Timer completed
                        clearInterval(interval as NodeJS.Timeout)
                        setTimerActive(false)
                        endQuestionTimer()
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [timerActive])

    // Reveal the current question
    const revealQuestion = () => {
        if (!currentQuestionData) return

        const questionId = currentQuestionData.data.question.questions.question_id.toString()

        sendGameMessage(`game_s1_question_reveal_${currentQuestion}`, {
            question_id: questionId,
        })
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 text-[#ff00ff] animate-spin" />
                    <span className="ml-2 text-white">Loading question...</span>
                </div>
            ) : currentQuestionData ? (
                <div className="bg-[#2a1a35] rounded-lg p-6 shadow-lg border border-[#ff00ff]/20">
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center">
                                <div className="bg-[#ff00ff]/20 rounded-full p-1 mr-2">
                                    <span className="text-white font-bold">Q{currentQuestionData.data.question_index}</span>
                                </div>
                                <h3 className="text-xl font-bold text-white">{currentQuestionData.data.question.questions.question}</h3>
                            </div>
                            <div className="bg-[#ff00ff]/20 rounded-full px-3 py-1">
                                <span className="text-white font-bold">
                                    Booster: {currentQuestionData.data.question.questions.question_booster}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-[#3a2a45] p-4 rounded-lg">
                                <span className="text-white/70 mr-2">A:</span>
                                <span className="text-white">{currentQuestionData.data.question.questions.option_a}</span>
                            </div>
                            <div className="bg-[#3a2a45] p-4 rounded-lg">
                                <span className="text-white/70 mr-2">B:</span>
                                <span className="text-white">{currentQuestionData.data.question.questions.option_b}</span>
                            </div>
                            <div className="bg-[#3a2a45] p-4 rounded-lg">
                                <span className="text-white/70 mr-2">C:</span>
                                <span className="text-white">{currentQuestionData.data.question.questions.option_c}</span>
                            </div>
                            <div className="bg-[#3a2a45] p-4 rounded-lg">
                                <span className="text-white/70 mr-2">D:</span>
                                <span className="text-white">{currentQuestionData.data.question.questions.option_d}</span>
                            </div>
                        </div>

                        <div className="bg-[#1a0b25] p-4 rounded-lg mb-6">
                            <h4 className="text-white font-bold mb-2">Contestant Info</h4>
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-[#ff00ff]/20 flex items-center justify-center mr-3">
                                    <span className="text-white font-bold">
                                        {currentQuestionData.data.question.contestant.contestant_attr.split("_")[1]}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-white font-medium">
                                        {currentQuestionData.data.question.contestant.contestant_name}
                                    </p>
                                    <p className="text-white/70 text-sm">
                                        ID: {currentQuestionData.data.question.contestant.contestant_id}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {currentStageStep === "question_reveal" && (
                            <div className="flex justify-center">
                                <TrapeziumButton onClick={startQuestionTimer} variant="green">
                                    START TIMER
                                </TrapeziumButton>
                            </div>
                        )}

                        {currentStageStep === "timer_running" && (
                            <div className="flex justify-center">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-white mb-4">{timerSeconds}</div>
                                    <TrapeziumButton onClick={endQuestionTimer} variant="blue">
                                        END TIMER
                                    </TrapeziumButton>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-40">
                    <p className="text-white mb-4">No question loaded yet</p>
                    <TrapeziumButton onClick={handleFetchNextQuestion} variant="orange">
                        FETCH NEXT QUESTION
                    </TrapeziumButton>
                </div>
            )}

            {/* Spending breakdown section */}
            {currentQuestionData && (
                <div className="mt-8 bg-[#2a1a35] rounded-lg p-6 shadow-lg border border-[#ff00ff]/20">
                    <h3 className="text-xl font-bold text-white mb-4">Spending Breakdown</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {currentQuestionData.data.spend_breakdown.map((contestant) => (
                            <div key={contestant.contestant_id} className="bg-[#3a2a45] p-4 rounded-lg">
                                <div className="flex items-center mb-2">
                                    <div className="w-8 h-8 rounded-full bg-[#ff00ff]/20 flex items-center justify-center mr-2">
                                        <span className="text-white text-xs font-bold">{contestant.contestant_id}</span>
                                    </div>
                                    <p className="text-white font-medium">{contestant.contestant_name}</p>
                                </div>
                                <div className="text-sm">
                                    <p className="text-white/70">
                                        Balance: ₦{contestant.wallet_balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                    </p>
                                    <p className="text-white/70">
                                        Max Spend: ₦{contestant.max_question_spend.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                    </p>
                                    <p className="text-white/70">Booster: {contestant.booster}</p>
                                </div>
                                <div className="mt-2 pt-2 border-t border-white/10">
                                    <p className="text-white/70 text-xs mb-1">Spend Options:</p>
                                    <div className="grid grid-cols-2 gap-1 text-xs">
                                        {Object.entries(contestant.spend_breakdown).map(([base, boosted], index) => (
                                            <div key={index} className="bg-[#1a0b25] p-1 rounded">
                                                <span className="text-white/70">
                                                    ₦{Number.parseFloat(base).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                                </span>
                                                <span className="text-white"> → </span>
                                                <span className="text-white">
                                                    ₦{boosted.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-center mt-6">
                {!loading &&
                    currentQuestionData &&
                    currentStageStep !== "question_reveal" &&
                    currentStageStep !== "timer_running" && (
                        <TrapeziumButton onClick={revealQuestion} variant="purple">
                            REVEAL QUESTION
                        </TrapeziumButton>
                    )}

                {!loading && !currentQuestionData && (
                    <TrapeziumButton onClick={handleFetchNextQuestion} variant="orange">
                        FETCH NEXT QUESTION
                    </TrapeziumButton>
                )}
            </div>
        </div>
    )
}


