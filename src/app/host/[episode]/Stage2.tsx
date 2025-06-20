"use client"

import { useState, useEffect } from "react"
import { CircleCheck, Loader2 } from "lucide-react"
import { TrapeziumButton } from "@/components/core/ButtonTrapezium"
import { toast } from "react-hot-toast"
import { useGetAllStage2Questions, useEndStageTwo, useNotifyBackendEndQuestionTimer, useGetProofQuestion, IGetProofQuestionAPIResponse } from "../misc/api"
import { GlowyStrokeText } from "@/components/core/GlowyText"
import { FlipCountdown } from "@/components/core"
import { Stage2Question } from "../misc/types"
import { formatCurrency } from "@/utils"



interface Stage2QuestionsProps {
    gameId: string | number
    onQuestionComplete: (questionId: number) => void
    onTimerStart: (questionId: string, startTime: string, questionType: string) => void
    sendGameMessage: (eventCode: string, data?: any) => Promise<void>
    currentStageStep: string
}

export default function Stage2Questions({
    gameId,
    onQuestionComplete,
    onTimerStart,
    sendGameMessage,
    currentStageStep,
}: Stage2QuestionsProps) {

    const { mutate: endStageTwo } = useEndStageTwo()
    const { mutate: endTimer } = useNotifyBackendEndQuestionTimer()


    const {
        mutate: fetchNextQuestion,
        data: hustleQuestionsData,
        isLoading: isLoadingQuestions,
        error: questionsError,
    } = useGetProofQuestion()

    const [loading, setLoading] = useState(false)
    const [currentQuestionData, setCurrentQuestionData] = useState<IGetProofQuestionAPIResponse | null>(null)

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [timerActive, setTimerActive] = useState(false)
    const [timerSeconds, setTimerSeconds] = useState(10)
    const [questionsExhausted, setQuestionExhausted] = useState(false)

    const handleFetchNextQuestion = async () => {
        setLoading(true)
        fetchNextQuestion(
            { episode: gameId },
            {
                onSuccess: (data) => {
                    setCurrentQuestionData(data)
                    // Clear sent answers tracking when moving to next question

                    const questionId = data.data.question.question_id.toString()

                    sendGameMessage(`game_s2_question_reveal`, {
                        question_id: questionId,
                        data: data.data,
                    })

                    setLoading(false)
                    toast.success("Next question fetched successfully")
                },
                onError: (error: any) => {
                    console.log(error?.response?.data)
                    if (error?.response?.data?.code === "700") {
                        setQuestionExhausted(true)
                    }
                    setLoading(false)
                    toast.error("Failed to fetch next question")
                    console.error("Error fetching next question:", error)
                },
            },
        )
    }




    const handleRevealStage2Results = () => {
        endStageTwo(
            { episode: gameId },
            {
                onSuccess: (data) => {
                    toast.success("Stage 2 results revealed successfully")
                    setQuestionExhausted(false)
                    setCurrentQuestionIndex(0)
                    setCurrentQuestionData(null)
                    sendGameMessage("game_s2_results_reveal", {
                        game_id: gameId,
                    })
                },
                onError: (error) => {
                    toast.error("Failed to reveal stage 2 results")
                    console.error("Error revealing stage 2 results:", error)
                },
            },
        )
    }


    // Start the timer for the current question
    const startQuestionTimer = () => {
        if (!currentQuestionData) return

        const questionId = currentQuestionData.data.question.question_id.toString()
        const startTime = new Date().toISOString()

        // Call the parent function to start timer
        onTimerStart(questionId, startTime, "stage_2")

        // Update UI to show timer is running
        sendGameMessage(`game_s2_timer_start`)

        setTimerActive(true)
        setTimerSeconds(10)
    }


    const endQuestionTimer = () => {
        if (!currentQuestionData) return

        const questionId = currentQuestionData.data.question.question_id.toString()
        endTimer(
            { question_id: questionId, timestamp: new Date().toISOString(), stage:'2'  },
            {
                onSuccess: (data) => {
                    sendGameMessage(`game_s2_timer_end_${currentQuestionData.data.index}`, {
                        question_id: questionId,
                    })

                    sendGameMessage(`game_s2_question_answer`, {
                        question_id: questionId,
                        answers_data: data,
                        question_index: currentQuestionData.data.index,
                        show_modal: currentQuestionData.data.index  > 4 ? false : true,
                    })

                    setTimerActive(false)
                    onQuestionComplete(currentQuestionData.data.question.question_id)
                },
                onError: (error: any) => {
                    toast.error("Failed to end timer")
                    console.error("Error ending timer:", error)

                    if (error?.response?.message == "Question Already Ended") {
                        setTimerActive(false)
                        onQuestionComplete(currentQuestionData.data.question.question_id)
                    }
                },
            },
        )
    }




    if (isLoadingQuestions) {
        return (
            <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 text-[#ff00ff] animate-spin" />
                <span className="ml-2 text-white">Loading questions...</span>
            </div>
        )
    }

    if (questionsError) {
        console.log("Error :", questionsError)
        console.log("Error loading questions:", (questionsError as any).response.data.message)
        return (
            <>
                {
                    (questionsError as any).response.data.code === "700" ?
                        <div className="flex flex-col items-center justify-center mt-8">
                            <div className="text-center mb-4">
                                <p className="text-white mb-2">All Stage 2 questions completed!</p>
                                <p className="text-white/70 text-sm">Ready to reveal results</p>
                            </div>
                            <TrapeziumButton onClick={handleRevealStage2Results} variant="purple">
                                REVEAL STAGE RESULTS
                            </TrapeziumButton>
                        </div>
                        :
                        <div className="flex flex-col items-center justify-center h-40">
                            <p className="text-red-400 mb-4">Error loading questions</p>
                            <p className="text-white/70 text-sm mb-4">{(questionsError as any).message}</p>
                            <TrapeziumButton onClick={handleFetchNextQuestion} variant="orange">
                                RETRY
                            </TrapeziumButton>
                        </div>
                }
            </>
        )
    }

    return (
        <div className="w-full max-w-3xl mx-auto font-montserrat">
            {
                loading ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="h-8 w-8 text-[#ff00ff] animate-spin" />
                        <span className="ml-2 text-white">Loading question...</span>
                    </div>
                ) : questionsExhausted ? (
                    <div className="flex flex-col items-center justify-center mt-8">
                        <TrapeziumButton onClick={handleRevealStage2Results} variant="purple">
                            REVEAL STAGE RESULTS
                        </TrapeziumButton>
                    </div>
                ) : currentQuestionData ? (
                    <article className="bg-[#341D44] rounded-xl p-6 shadow-lg">
                        <div className="mb-6">
                            <header className="flex justify-between items-center gap-6 mb-4">
                                <section className="flex items-center gap-2">
                                    <div className="flex items-center justify-center bg-[#ff00ff]/20 rounded-full shrink-0 size-9 text-xl text-white font-bold">
                                        {currentQuestionData.data.index ?? 1}
                                    </div>
                                    <p className="text-white text-xs">
                                        Question {currentQuestionData.data.index} of 8
                                    </p>
                                </section>
                                <div className="bg-[#ff00ff]/20 rounded-full px-2 py-0.5 text-[0.9rem] shrink-0">
                                    <GlowyStrokeText fillColor="#fff" glowIntensity="none">Winning Amount: {formatCurrency(currentQuestionData.data.question.allocated_winning_amount)}</GlowyStrokeText>
                                </div>
                            </header>

                            <h3 className="text-base font-semibold text-white my-6 text-center">{currentQuestionData.data.question.question}</h3>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-[#462B58] px-4 py-2.5 rounded-xl text-sm">
                                    <span className="text-white/70 mr-2 font-medium">A:</span>
                                    <span className="text-white">{currentQuestionData.data.question.option_a}</span>
                                    <span>
                                        {currentQuestionData.data.question.correct_option === "A" && (
                                            <span className="text-green-500 ml-2 font-bold">
                                                <CircleCheck className="size-6 inline" />
                                            </span>
                                        )}
                                    </span>
                                </div>
                                <div className="bg-[#462B58] px-4 py-2.5 rounded-xl text-sm">
                                    <span className="text-white/70 mr-2 font-medium">B:</span>
                                    <span className="text-white">{currentQuestionData.data.question.option_b}</span>
                                    <span>
                                        {currentQuestionData.data.question.correct_option === "B" && (
                                            <span className="text-green-500 ml-2 font-bold">
                                                <CircleCheck className="size-6 inline" />
                                            </span>
                                        )}
                                    </span>
                                </div>
                                <div className="bg-[#462B58] px-4 py-2.5 rounded-xl text-sm">
                                    <span className="text-white/70 mr-2 font-medium">C:</span>
                                    <span className="text-white">{currentQuestionData.data.question.option_c}</span>
                                    <span>
                                        {currentQuestionData.data.question.correct_option === "C" && (
                                            <span className="text-green-500 ml-2 font-bold">
                                                <CircleCheck className="size-6 inline" />
                                            </span>
                                        )}
                                    </span>
                                </div>
                                <div className="bg-[#462B58] px-4 py-2.5 rounded-xl text-sm">
                                    <span className="text-white/70 mr-2 font-medium">D:</span>
                                    <span className="text-white">{currentQuestionData.data.question.option_d}</span>
                                    <span>
                                        {currentQuestionData.data.question.correct_option === "D" && (
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
                                        <FlipCountdown
                                            isActive={timerActive}
                                            seconds={timerSeconds}
                                            onComplete={() => {
                                                endQuestionTimer()
                                                // setTimerActive(false)
                                            }}
                                        />
                                        <TrapeziumButton onClick={endQuestionTimer} variant="blue" className="mt-6">
                                            END TIMER
                                        </TrapeziumButton>
                                    </div>
                                </div>
                            )}
                        </div>
                    </article>
                ) : (
                    <div className="flex flex-col items-center justify-center h-40">
                        <p className="text-white mb-4">Welcome to Stage 2 Questions</p>
                        {
                            <TrapeziumButton onClick={handleFetchNextQuestion} variant="orange">
                                "REVEAL FIRST QUESTION"
                            </TrapeziumButton>
                        }
                    </div>
                )}

            <div className="flex justify-center mt-6">
                {!loading && currentQuestionData && currentStageStep === "questions" && !questionsExhausted && (
                    <TrapeziumButton onClick={handleFetchNextQuestion} variant="orange">
                        FETCH NEXT QUESTION
                    </TrapeziumButton>
                )}
            </div>

        </div>
    )
}
