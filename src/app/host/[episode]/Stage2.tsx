"use client"

import { useState, useEffect } from "react"
import { CircleCheck, Loader2 } from "lucide-react"
import { TrapeziumButton } from "@/components/core/ButtonTrapezium"
import { toast } from "react-hot-toast"
import { useGetAllStage2Questions, useEndStageTwo, useNotifyBackendEndQuestionTimer } from "../misc/api"
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
    const {
        data: allQuestions,
        refetch: refetchQuestions,
        isLoading: isLoadingQuestions,
        // isRefetching: isRefetchingQuestions,
        error: questionsError,
    } = useGetAllStage2Questions(Number(gameId))
    const { mutate: endStageTwo } = useEndStageTwo()
    const { mutate: endTimer } = useNotifyBackendEndQuestionTimer()

    const [currentQuestionData, setCurrentQuestionData] = useState<Stage2Question | null>(null)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [timerActive, setTimerActive] = useState(false)
    const [timerSeconds, setTimerSeconds] = useState(10)
    const [questionsExhausted, setQuestionsExhausted] = useState(false)

    // Debug logging
    useEffect(() => {
        console.log("Stage2Questions Debug:", {
            allQuestions,
            currentQuestionIndex,
            isLoadingQuestions,
            questionsError,
            questionsLength: allQuestions?.data.proof_questions.length,
        })
    }, [allQuestions, currentQuestionIndex, isLoadingQuestions, questionsError])

    // Check if all questions are exhausted
    useEffect(() => {
        if (!isLoadingQuestions && allQuestions?.data.proof_questions) {
            // Only set exhausted if we have questions and current index exceeds the length
            if (allQuestions?.data.proof_questions.length > 0 && currentQuestionIndex >= allQuestions?.data.proof_questions.length) {
                setQuestionsExhausted(true)
            } else if (allQuestions?.data.proof_questions.length === 0) {
                // If no questions are available
                setQuestionsExhausted(true)
            } else {
                setQuestionsExhausted(false)
            }
        }
    }, [allQuestions, currentQuestionIndex, isLoadingQuestions])


    useEffect(() => {
        if (!isLoadingQuestions && questionsError) {
            if (questionsError && (questionsError as any).response.data.message === "No question found or all questions already asked") {
                setQuestionsExhausted(true)
            }
        }
    }, [questionsError])


    const handleRevealNextQuestion = () => {
        console.log("Revealing next question:", {
            allQuestions,
            currentQuestionIndex,
            questionsLength: allQuestions?.data.proof_questions.length,
        })

        if (!allQuestions?.data.proof_questions || allQuestions?.data.proof_questions.length === 0) {
            toast.error("No questions available")
            setQuestionsExhausted(true)
            return
        }

        if (currentQuestionIndex >= allQuestions?.data.proof_questions.length) {
            setQuestionsExhausted(true)
            return
        }

        const nextQuestion = allQuestions?.data.proof_questions[currentQuestionIndex].questions
        setCurrentQuestionData(nextQuestion)

        sendGameMessage(`game_s2_question_reveal`, {
            question_id: nextQuestion?.question_id.toString(),
            question_data: nextQuestion,
            question_index: currentQuestionIndex + 1,
        })

        toast.success(`Question ${currentQuestionIndex + 1} revealed`)
    }

    const handleRevealStage2Results = () => {
        endStageTwo(
            { episode: gameId },
            {
                onSuccess: (data) => {
                    toast.success("Stage 2 results revealed successfully")
                    setQuestionsExhausted(false)
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

        const questionId = currentQuestionData.question_id.toString()
        const startTime = new Date().toISOString()

        // Call the parent function to start timer
        onTimerStart(questionId, startTime, "stage_2")

        // Update UI to show timer is running
        sendGameMessage(`game_s2_timer_start_${currentQuestionIndex + 1}`)

        setTimerActive(true)
        setTimerSeconds(10)
    }

    // End the timer for the current question
    const endQuestionTimer = () => {
        if (!currentQuestionData) return

        const questionId = currentQuestionData.question_id.toString()

        endTimer({ question_id: questionId, stage: "2" },
            {
                onSuccess: () => {
                    sendGameMessage(`question_s2_time_elapsed`, {
                        question_id: questionId,
                    })

                    setTimerActive(false)

                    onQuestionComplete(currentQuestionData.question_id)

                    setCurrentQuestionIndex((prev) => prev + 1)

                    setCurrentQuestionData(null)

                    refetchQuestions()

                    toast.success("Timer ended, ready for next question")
                },
                onError: (error: any) => {
                    console.error("Error ending timer:", error)

                    if (error?.response?.data?.message === "Question Already Ended") {
                        setTimerActive(false)
                        onQuestionComplete(currentQuestionData.question_id)
                        setCurrentQuestionIndex((prev) => prev + 1)
                        setCurrentQuestionData(null)
                        refetchQuestions()
                    } else {
                        toast.error("Failed to end timer")
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
        console.log("Error loading questions:", (questionsError as any).response.data.message)
        return (
            <>
                {
                    (questionsError as any).response.data.message === "No question found or all questions already asked" ?
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
                            <TrapeziumButton onClick={() => refetchQuestions()} variant="orange">
                                RETRY
                            </TrapeziumButton>
                        </div>
                }
            </>
        )
    }

    return (
        <div className="w-full max-w-3xl mx-auto font-montserrat">
            <div className="mb-4 p-2 px-4 bg-[#341d44d5] rounded-xl text-xs text-white">
                <p>Questions loaded: {allQuestions?.data.proof_questions.length || 0}</p>
                <p>Current index: {currentQuestionIndex}</p>
                <p>Questions exhausted: {questionsExhausted.toString()}</p>
                <p>Current question data: {currentQuestionData ? "Yes" : "No"}</p>
            </div>

            {
                isLoadingQuestions ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="h-8 w-8 text-[#ff00ff] animate-spin" />
                        <span className="ml-2 text-white">Processing...</span>
                    </div>
                ) : (questionsExhausted && allQuestions?.data.proof_questions.length == 0) ? (
                    <div className="flex flex-col items-center justify-center mt-8">
                        <div className="text-center mb-4">
                            <p className="text-white mb-2">All Stage 2 questions completed!</p>
                            <p className="text-white/70 text-sm">Ready to reveal results</p>
                        </div>
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
                                        {9 - (allQuestions?.data.proof_questions?.length ?? 1)}
                                    </div>
                                    <p className="text-white text-xs">
                                        Question {9 - (allQuestions?.data.proof_questions?.length ?? 1)} of 8
                                    </p>
                                </section>
                                <div className="bg-[#ff00ff]/20 rounded-full px-2 py-0.5 text-[0.9rem] shrink-0">
                                    <GlowyStrokeText fillColor="#fff" glowIntensity="none">Winning Amount: {formatCurrency(currentQuestionData.allocated_winning_amount)}</GlowyStrokeText>
                                </div>
                            </header>

                            <h3 className="text-base font-semibold text-white my-6 text-center">{currentQuestionData.question}</h3>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-[#462B58] px-4 py-2.5 rounded-xl text-sm">
                                    <span className="text-white/70 mr-2 font-medium">A:</span>
                                    <span className="text-white">{currentQuestionData.option_a}</span>
                                    <span>
                                        {currentQuestionData.correct_option === "A" && (
                                            <span className="text-green-500 ml-2 font-bold">
                                                <CircleCheck className="size-6 inline" />
                                            </span>
                                        )}
                                    </span>
                                </div>
                                <div className="bg-[#462B58] px-4 py-2.5 rounded-xl text-sm">
                                    <span className="text-white/70 mr-2 font-medium">B:</span>
                                    <span className="text-white">{currentQuestionData.option_b}</span>
                                      <span>
                                        {currentQuestionData.correct_option === "B" && (
                                            <span className="text-green-500 ml-2 font-bold">
                                                <CircleCheck className="size-6 inline" />
                                            </span>
                                        )}
                                    </span>
                                </div>
                                <div className="bg-[#462B58] px-4 py-2.5 rounded-xl text-sm">
                                    <span className="text-white/70 mr-2 font-medium">C:</span>
                                    <span className="text-white">{currentQuestionData.option_c}</span>
                                      <span>
                                        {currentQuestionData.correct_option === "C" && (
                                            <span className="text-green-500 ml-2 font-bold">
                                                <CircleCheck className="size-6 inline" />
                                            </span>
                                        )}
                                    </span>
                                </div>
                                <div className="bg-[#462B58] px-4 py-2.5 rounded-xl text-sm">
                                    <span className="text-white/70 mr-2 font-medium">D:</span>
                                    <span className="text-white">{currentQuestionData.option_d}</span>
                                      <span>
                                        {currentQuestionData.correct_option === "D" && (
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
                        <p className="text-white/70 text-sm mb-4">{allQuestions?.data.proof_questions.length || 0} questions loaded</p>
                        {allQuestions?.data.proof_questions && allQuestions.data.proof_questions.length > 0 ? (
                            <TrapeziumButton onClick={handleRevealNextQuestion} variant="orange">
                                {currentQuestionIndex === 0 ? "REVEAL FIRST QUESTION" : "REVEAL NEXT QUESTION"}
                            </TrapeziumButton>
                        ) : (
                            <div className="text-center">
                                <p className="text-red-400 mb-2">No questions available</p>
                                <TrapeziumButton onClick={() => refetchQuestions()} variant="orange">
                                    RELOAD QUESTIONS
                                </TrapeziumButton>
                            </div>
                        )}
                    </div>
                )}

            {/* <div className="flex justify-center mt-6">
                {!loading && !currentQuestionData && !questionsExhausted && (allQuestions?.data.proof_questions?.length ?? 0) > 0 && (
                    <TrapeziumButton onClick={handleRevealNextQuestion} variant="orange">
                        {currentQuestionIndex === 0 ? "REVEAL FIRST QUESTION" : "REVEAL NEXT QUESTION"}
                    </TrapeziumButton>
                )}
            </div> */}
        </div>
    )
}
