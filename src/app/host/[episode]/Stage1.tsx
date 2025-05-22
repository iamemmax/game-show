"use client"

import React, { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { TrapeziumButton } from "@/components/core/ButtonTrapezium"
import { toast } from "react-hot-toast"
import { type IGetHustleQuestionAPIResponse, useGetHustleQuestion } from "../misc/api"
import { GlowyStrokeText } from "@/components/core/GlowyText"

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
        fetchNextQuestion(
            { episode: gameId },
            {
                onSuccess: (data) => {
                    setCurrentQuestionData(data)
                    const questionId = data.data.question.questions.question_id.toString()

                    // Send the question data via MQTT to update all clients
                    sendGameMessage(`game_s1_question_reveal`, {
                        question_id: questionId,
                        data: data.data,
                    })

                    setLoading(false)
                    toast.success("Next question fetched successfully")
                },
                onError: (error) => {
                    setLoading(false)
                    toast.error("Failed to fetch next question")
                    console.error("Error fetching next question:", error)
                },
            },
        )
    }

    // Start the timer for the current question
    const startQuestionTimer = () => {
        if (!currentQuestionData) return

        const questionId = currentQuestionData.data.question.questions.question_id.toString()
        const startTime = new Date().toISOString()
        onTimerStart(questionId, startTime, "stage_1")

        sendGameMessage(`game_s1_timer_start_${currentQuestionData.data.question_index}`)

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

    return (
        <div className="w-full max-w-3xl mx-auto font-montserrat">
            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 text-[#ff00ff] animate-spin" />
                    <span className="ml-2 text-white">Loading question...</span>
                </div>
            )
                : currentQuestionData ?
                    (
                        <article className="bg-[#341D44] rounded-xl p-6 shadow-lg ">
                            <div className="mb-6">
                                <header className="flex justify-between items-center gap-6 mb-4">
                                    <section className="flex items-center gap-2">
                                        <div className="flex items-center justify-center bg-[#ff00ff]/20 rounded-full shrink-0 size-7 text-white font-bold">
                                            {currentQuestionData.data.question_index}
                                        </div>
                                        <p className="text-white text-xs">
                                            selected by:{" "}
                                            <span className="text-[#ff00ff] font-medium ">
                                                {currentQuestionData.data.question.contestant.contestant_name}
                                            </span>
                                        </p>
                                    </section>
                                    <div className="bg-[#ff00ff]/20 rounded-full px-2 py-0.5 text-sm  shrink-0 ">
                                        <GlowyStrokeText
                                            glowIntensity="none"
                                        >
                                            Booster: {currentQuestionData.data.question.questions.question_booster}
                                        </GlowyStrokeText>
                                    </div>
                                </header>

                                <h3 className="text-base font-semibold text-white my-6 text-center">{currentQuestionData.data.question.questions.question}</h3>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-[#462B58] px-4 py-2.5 rounded-xl text-sm">
                                        <span className="text-white/70 mr-2 font-medium">A:</span>
                                        <span className="text-white">{currentQuestionData.data.question.questions.option_a}</span>
                                    </div>
                                    <div className="bg-[#462B58] px-4 py-2.5 rounded-xl text-sm">
                                        <span className="text-white/70 mr-2 font-medium">B:</span>
                                        <span className="text-white">{currentQuestionData.data.question.questions.option_b}</span>
                                    </div>
                                    <div className="bg-[#462B58] px-4 py-2.5 rounded-xl text-sm">
                                        <span className="text-white/70 mr-2 font-medium">C:</span>
                                        <span className="text-white">{currentQuestionData.data.question.questions.option_c}</span>
                                    </div>
                                    <div className="bg-[#462B58] px-4 py-2.5 rounded-xl text-sm">
                                        <span className="text-white/70 mr-2 font-medium">D:</span>
                                        <span className="text-white">{currentQuestionData.data.question.questions.option_d}</span>
                                    </div>
                                </div>


                                {currentStageStep === "question_reveal" && (
                                    <div className="flex justify-center">
                                        <TrapeziumButton onClick={startQuestionTimer} size="sm" variant="green">
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
                        </article>
                    )
                    :
                    (
                        <div className="flex flex-col items-center justify-center h-40">
                            <p className="text-white mb-4">No question loaded yet</p>
                            <TrapeziumButton onClick={handleFetchNextQuestion} variant="orange">
                                FETCH NEXT QUESTION
                            </TrapeziumButton>
                        </div>
                    )}

            <div className="flex justify-center mt-6">
                {/* {!loading && !currentQuestionData && (
                    <TrapeziumButton onClick={handleFetchNextQuestion} variant="orange">
                        FETCH NEXT QUESTION
                    </TrapeziumButton>
                )} */}

                {!loading && currentQuestionData && currentStageStep === "questions" && (
                    <TrapeziumButton onClick={handleFetchNextQuestion} variant="orange">
                        FETCH NEXT QUESTION
                    </TrapeziumButton>
                )}
            </div>
        </div>
    )
}
