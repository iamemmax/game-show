"use client"

import React, { useState } from "react"
import { CircleCheck, Loader2 } from "lucide-react"
import { TrapeziumButton } from "@/components/core/ButtonTrapezium"
import { toast } from "react-hot-toast"
import {
    type IGetHustleQuestionAPIResponse,
    useEndStageOne,
    useGetHustleQuestion,
    useGetHustleQuestionResult,
    useNotifyBackendEndQuestionTimer,
} from "../misc/api"
import { GlowyStrokeText } from "@/components/core/GlowyText"
import { FlipCountdown } from "@/components/core"

interface Stage1QuestionsProps {
    gameId: string | number
    onQuestionComplete: (questionId: number) => void
    onTimerStart: (questionId: string, startTime: string, questionType: string) => void
    sendGameMessage: (eventCode: string, data?: any) => Promise<void>
    currentStageStep: string
    lastAction?: string
}

export default function Stage1Questions({
    gameId,
    onQuestionComplete,
    onTimerStart,
    sendGameMessage,
    currentStageStep,
    lastAction
}: Stage1QuestionsProps) {
    const [loading, setLoading] = useState(false)
    const [currentQuestionData, setCurrentQuestionData] = useState<IGetHustleQuestionAPIResponse | null>(null)
    const [timerActive, setTimerActive] = useState(false)
    const [timerSeconds, setTimerSeconds] = useState(10)
    const [questionsExhausted, setQuestionsExhausted] = useState(false)
    const [sentAnswers, setSentAnswers] = useState<Set<string>>(new Set())

    const { mutate: fetchNextQuestion, data: hustleQuestionsData, isLoading } = useGetHustleQuestion()
    const { data: questionResultData, isLoading: isLoadingQuestionResultData, refetch: refetchQuestionResultData } = useGetHustleQuestionResult()
    const { mutate: endStageOne } = useEndStageOne()

    React.useEffect(() => {
        if (hustleQuestionsData) {
            setCurrentQuestionData(hustleQuestionsData)
            setLoading(false)
        }
    }, [hustleQuestionsData, isLoading])

    React.useEffect(() => {
        if (questionResultData && !isLoadingQuestionResultData) {
            sendGameMessage("game_s1_question_result_reveal", {
                question_id: currentQuestionData?.data.question.questions.question_id.toString(),
                data: questionResultData?.data,
            })
        }
    }, [refetchQuestionResultData, questionResultData, isLoadingQuestionResultData])

    const handleFetchNextQuestion = async () => {
        setLoading(true)
        fetchNextQuestion(
            { episode: gameId },
            {
                onSuccess: (data) => {
                    setCurrentQuestionData(data)
                    // Clear sent answers tracking when moving to next question
                    setSentAnswers(new Set())

                    const questionId = data.data.question.questions.question_id.toString()

                    sendGameMessage(`game_s1_question_reveal`, {
                        question_id: questionId,
                        data: data.data,
                    })

                    setLoading(false)
                    toast.success("Next question fetched successfully")
                },
                onError: (error: any) => {
                    console.log(error?.response?.data)
                    if (error?.response?.data?.code === "700") {
                        setQuestionsExhausted(true)
                    }
                    setLoading(false)
                    toast.error("Failed to fetch next question")
                    console.error("Error fetching next question:", error)
                },
            },
        )
    }


    const handleRevealStage1Result = () => {
        endStageOne(
            { episode: gameId },
            {
                onSuccess: (data) => {
                    toast.success("Stage 1 results revealed successfully")
                    setQuestionsExhausted(false)
                    sendGameMessage("game_s1_results_reveal", {
                        game_id: gameId,
                    })
                },
                onError: (error) => {
                    toast.error("Failed to reveal stage 1 results")
                    console.error("Error revealing stage 1 results:", error)
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
        sendGameMessage("game_s1_timer_start")

        // Start local timer
        setTimerActive(true)
        setTimerSeconds(10)
    }

    const { mutate: endTimer } = useNotifyBackendEndQuestionTimer()

    const endQuestionTimer = () => {
        if (!currentQuestionData) return

        const questionId = currentQuestionData.data.question.questions.question_id.toString()
        endTimer(
            { question_id: questionId, timestamp: new Date().toISOString() },
            {
                onSuccess: (data) => {
                    sendGameMessage(`game_s1_timer_end_${currentQuestionData.data.question_index}`, {
                        question_id: questionId,
                    })

                    sendGameMessage(`game_s1_question_answer`, {
                        question_id: questionId,
                        answers_data: data,
                        question_index: currentQuestionData.data.question_index,
                        show_modal: true,
                    })

                    setSentAnswers((prev) => new Set(prev).add(questionId))
                    setTimerActive(false)
                    onQuestionComplete(currentQuestionData.data.question.questions.question_id)
                },
                onError: (error: any) => {
                    toast.error("Failed to end timer")
                    console.error("Error ending timer:", error)

                    if (error?.response?.message == "Question Already Ended") {
                        setTimerActive(false)
                        onQuestionComplete(currentQuestionData.data.question.questions.question_id)
                    }
                },
            },
        )
    }

    return (
        <div className="w-full max-w-3xl mx-auto font-montserrat">
            {(loading || isLoadingQuestionResultData) ? (
                <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 text-[#ff00ff] animate-spin" />
                    <span className="ml-2 text-white">Loading question...</span>
                </div>
            ) : questionsExhausted ? (
                <div className="flex flex-col items-center justify-center mt-8">
                    <TrapeziumButton onClick={handleRevealStage1Result} variant="purple">
                        REVEAL STAGE RESULTS
                    </TrapeziumButton>
                </div>
            ) : currentQuestionData ? (
                <article className="bg-[#341D44] rounded-xl p-6 shadow-lg ">
                    <div className="mb-6">
                        <header className="flex justify-between items-center gap-6 mb-4">
                            <section className="flex items-center gap-2">
                                <div className="flex items-center justify-center bg-[#ff00ff]/20 rounded-full shrink-0 size-9 text-xl text-white font-bold">
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
                                <GlowyStrokeText glowIntensity="none">
                                    Booster: {currentQuestionData.data.question.questions.question_booster}
                                </GlowyStrokeText>
                            </div>
                        </header>

                        <h3 className="text-base font-semibold text-white my-6 text-center">
                            {currentQuestionData.data.question.questions.question}
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-[#462B58] px-4 py-2.5 rounded-xl text-sm">
                                <span className="text-white/70 mr-2 font-medium">A:</span>
                                <span className="text-white">{currentQuestionData.data.question.questions.option_a}</span>
                                <span>
                                    {currentQuestionData.data.question.questions.correct_option === "A" && (
                                        <span className="text-green-500 ml-2 font-bold">
                                            <CircleCheck className="size-6 inline" />
                                        </span>
                                    )}
                                </span>
                            </div>
                            <div className="bg-[#462B58] px-4 py-2.5 rounded-xl text-sm">
                                <span className="text-white/70 mr-2 font-medium">B:</span>
                                <span className="text-white">{currentQuestionData.data.question.questions.option_b}</span>
                                <span>
                                    {currentQuestionData.data.question.questions.correct_option === "B" && (
                                        <span className="text-green-500 ml-2 font-bold">
                                            <CircleCheck className="size-6 inline" />
                                        </span>
                                    )}
                                </span>
                            </div>
                            <div className="bg-[#462B58] px-4 py-2.5 rounded-xl text-sm">
                                <span className="text-white/70 mr-2 font-medium">C:</span>
                                <span className="text-white">{currentQuestionData.data.question.questions.option_c}</span>
                                <span>
                                    {currentQuestionData.data.question.questions.correct_option === "C" && (
                                        <span className="text-green-500 ml-2 font-bold">
                                            <CircleCheck className="size-6 inline" />
                                        </span>
                                    )}
                                </span>
                            </div>
                            <div className="bg-[#462B58] px-4 py-2.5 rounded-xl text-sm">
                                <span className="text-white/70 mr-2 font-medium">D:</span>
                                <span className="text-white">{currentQuestionData.data.question.questions.option_d}</span>
                                <span>
                                    {currentQuestionData.data.question.questions.correct_option === "D" && (
                                        <span className="text-green-500 ml-2 font-bold">
                                            <CircleCheck className="size-6 inline" />
                                        </span>
                                    )}
                                </span>
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
                                    {/* <div className="text-4xl font-bold text-white mb-4">{timerSeconds}</div> */}
                                    <FlipCountdown
                                        isActive={timerActive}
                                        seconds={timerSeconds}
                                        onComplete={() => {
                                            setTimerActive(false)

                                            // Send question answer data if available and not already sent
                                            const questionId = currentQuestionData.data.question.questions.question_id.toString()
                                            //   if (questinAnswer && !sentAnswers.has(questionId)) {
                                            //     sendGameMessage(`game_s1_question_answer`, {
                                            //       question_id: questionId,
                                            //       answers_data: questinAnswer.data,
                                            //       question_index: currentQuestionData.data.question_index,
                                            //     })

                                            //     // Mark this question as having its answers sent
                                            //     setSentAnswers((prev) => new Set(prev).add(questionId))
                                            //   }

                                            endQuestionTimer()
                                        }}
                                    />
                                    <TrapeziumButton onClick={endQuestionTimer} variant="blue" className="mt-4">
                                        END TIMER
                                    </TrapeziumButton>
                                </div>
                            </div>
                        )}
                    </div>
                </article>
            ) : (
                <div className="flex flex-col items-center justify-center h-40">
                    <p className="text-white mb-4">Welcome to Stage 1 Hustle Question</p>
                    <TrapeziumButton onClick={handleFetchNextQuestion} variant="orange">
                        FETCH FIRST QUESTION
                    </TrapeziumButton>
                </div>
            )}

            <div className="flex justify-center mt-6">
                {!loading && currentQuestionData && currentStageStep === "questions" && !questionsExhausted && (
                    <>
                        {
                            lastAction === "question_s1_time_elapsed" ? (
                                <TrapeziumButton onClick={() => refetchQuestionResultData()} variant="purple">
                                    REVEAL QUESTION RESULT
                                </TrapeziumButton>
                            ) : (
                                <TrapeziumButton onClick={handleFetchNextQuestion} variant="orange">
                                    FETCH NEXT QUESTION
                                </TrapeziumButton>
                            )
                        }
                    </>
                )}
            </div>
        </div>
    )
}
