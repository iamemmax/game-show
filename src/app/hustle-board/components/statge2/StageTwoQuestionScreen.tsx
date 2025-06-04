import Logo from "@/app/icons/Logo";
import Trophy from "@/app/icons/Trophy";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import NumberCardContainer from "@/app/shared/NumberContainer";
import { cn } from "@/utils/classNames";
import CheckIcon from "@/app/icons/CheckIcon";
import { tokenStorage } from "@/utils/auth";
import { GlowyStrokeText } from "@/components/core";
import { addCommasToNumber } from "@/utils";
import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy";
import { useMQTT } from "@/hooks/useMqttService";
import { useGetWalletBalance } from "@/app/components/stages/api/stage1/getbalance";
import FastestFingerResult from "@/app/components/stages/components/hustle/FastestFingerResult";
import HustleSideBar from "@/app/components/stages/components/hustle/HustleSideBar";
import HustleStages from "@/app/components/stages/components/hustle/HustleStages";
import StageOneTally from "@/app/components/stages/components/hustle/StageOneTally";
import StageTwoGetReadyStage from "./StageTwoGetReadyStage";
import { useParams } from "next/navigation";
import { useGetGameContestants } from "@/app/admin/misc/api";

type OptionKey = "option_a" | "option_b" | "option_c" | "option_d" | "N";

/**
 * Converts option format (e.g., "option_a") to letter format (e.g., "A")
 */
const convertOptionToLetter = (option: string | null): string => {
  if (!option) return "";
  const optionMap: Record<string, string> = {
    option_a: "A",
    option_b: "B",
    option_c: "C",
    option_d: "D",
    N: "N",
  };
  return optionMap[option] || "";
};

const ViewOnlyQuestionTwoScreen = () => {
  const { isConnected, onMessage } = useMQTT();
  const user = tokenStorage.getUser();
  const params = useParams()

  // Get wallet balances for display
  const { data: balanceData } = useGetWalletBalance(
    user?.game_episode as number
  );

  // State for display purposes only - no user interaction
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [allQuestionsCompleted, setAllQuestionsCompleted] = useState(false);
  const [showStage2Prep, setShowStage2Prep] = useState(true);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [mqttQuestionData, setMqttQuestionData] = useState<any>(null);
  const [mqttAnswerData, setMqttAnswerData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set());
  const [attemptedQuestions, setAttemptedQuestions] = useState<Set<number>>(new Set());
  const { refetch } = useGetGameContestants(
         Number(params?.episodeId)
      );

  // Timer effect - for display only
  useEffect(() => {
    if (!timerActive) return;

    if (timeLeft <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, timerActive]);

  // Function to check if a question has been completed
  const isQuestionCompleted = (questionIndex: number) => {
    return completedQuestions.has(questionIndex);
  };

  // Function to check if a question is currently active
  const isQuestionActive = (questionIndex: number) => {
    return mqttQuestionData?.question_index === questionIndex + 1; // Adding 1 because question_index is 1-based
  };

  // Function to check if a question has been attempted
  const isQuestionAttempted = (questionIndex: number) => {
    return attemptedQuestions.has(questionIndex);
  };

  // Handle timer start (from events)
  const handleStartTimer = () => {
    setTimerActive(true);
    setTimeLeft(10);
  };

  // Reset timer state for next question
  const resetTimerState = () => {
    setTimerActive(false);
    setTimeLeft(10);
  };

  const currentQuestionIdRef = useRef<string | null>(null);

  useEffect(() => {
    currentQuestionIdRef.current = currentQuestionId;
  }, [currentQuestionId]);

  // MQTT event listening
  useEffect(() => {
    if (!isConnected) return;

    const handler = (receivedMessage: any) => {
      console.log("📡 Received MQTT message:", receivedMessage);

      // Handle prep page event
      if (receivedMessage?.event === "game_s2_question_reveal") {
        console.log("✅ Processing game_s2_question_reveal");
        setShowStage2Prep(false);

        const payload = receivedMessage.payload || {};
        const questionData = payload.data || {};

        // Save full question info
        setMqttQuestionData(questionData?.question);

        // Reset related states
        resetTimerState();
        setCorrectAnswer(null);
        setMqttAnswerData(null);

        // Set current index and question ID
        const questionIndex = (questionData.question_index || 1);
        setCurrentQuestionIndex(questionIndex);
        
        const questionId = questionData?.question?.question_id || payload?.question_id;
        if (questionId) {
          setCurrentQuestionId(questionId.toString());
        }
      }

      // Handle question answer event
      if (receivedMessage?.event === "game_s2_question_answer") {
        const payload = receivedMessage.payload || {};
        const questionId = payload.question_id;

        if (questionId === currentQuestionIdRef?.current) {
          const answersData = payload.answers_data?.data;
          console.log("📊 Received answer data:", answersData);

          // Store the full answer data
          setMqttAnswerData(payload.answers_data?.data);

          if (answersData?.question?.correct_option) {
            // Set the correct answer
            setCorrectAnswer(answersData.question.correct_option);
            // Stop the timer
            setTimerActive(false);
            
            // Mark current question as completed
            setCompletedQuestions(prev => new Set([...prev, currentQuestionIndex]));
            // Also mark as attempted
            setAttemptedQuestions(prev => new Set([...prev, currentQuestionIndex]));
          }
        }
      }

      // Handle timer start event
      if (receivedMessage?.event === "game_s2_timer_start") {
        console.log("✅ Processing game_s2_timer_start");
        handleStartTimer();
      }

      // Handle timer end event - mark question as attempted when time elapses
      if (receivedMessage?.event === "game_s2_timer_end") {
        console.log("✅ Processing game_s2_timer_end");
        setTimerActive(false);
        // Mark current question as attempted when timer ends
        setAttemptedQuestions(prev => new Set([...prev, currentQuestionIndex]));
      }

      // Handle results reveal event
      if (receivedMessage?.event === "game_s2_results_reveal") {
        console.log("✅ Processing game_s2_results_reveal");
        setAllQuestionsCompleted(true);
      }

      if (receivedMessage?.event === "game_s2_debit_wallet") {
        refetch();
      }
    };

    console.log("🔄 Registering MQTT handler for view-only mode");
    onMessage(handler);

    return () => {
      if (isConnected) {
        console.log("🧹 Cleaning up MQTT message handler");
        onMessage(null);
      }
    };
  }, [isConnected, onMessage, currentQuestionIndex]);

  // Add effect to mark question as attempted when timer ends
  useEffect(() => {
    if (timeLeft <= 0 && timerActive) {
      setTimerActive(false);
      // Mark current question as attempted when timer ends
      setAttemptedQuestions(prev => new Set([...prev, currentQuestionIndex]));
    }
  }, [timeLeft, timerActive, currentQuestionIndex]);

  if (showStage2Prep) {
    return <StageTwoGetReadyStage />;
  }

  if (allQuestionsCompleted) {
    return <StageOneTally eliminationCount={2} removeCount={2} title={params?.episodeId ?"Hustle Board":"Stage 2"} />;
  }

  return (
    <div className="grid grid-cols-[1.2fr_5fr_1fr] h-full">
      {/* Left Sidebar */}
      <div className="flex flex-col justify-between">
        <div className="flex justify-center items-center h-3.5 w-full mt-8">
          <Logo />
        </div>
        <div>
          <HustleStages activeStage={2} />
        </div>
        <div className="pb-4">
          <Salary4LifeTrophy className="max-xl:h-[13.25rem]" />
        </div>
      </div>

      {/* Center Content */}
      <div className="flex flex-col justify-between items-center min-h-full">
        {/* Top section */}
        <div className="flex flex-col w-full items-center">
          <div className="w-full h-[100px] flex items-center justify-center">
            <HeaderTitleContainer
              backgroundColor="#791192"
              color="#ed99ff"
              text="Hustle Board"
              textGradientEnd="#8E17AA"
              textGradientStart="#8E17AA"
              borderGradientStart="#f712fc"
              borderGradientEnd="#e151fe"
              fontSize={45}
              fontFamily="Verdana"
              textStrokeColor="#a219c1"
              textStrokeWidth={4.4}
            />
          </div>

          <div className="relative w-full py-[2rem] 2xl:py-[2.5rem] max-xl:max-w-[46.5rem] 2xl:max-w-[65rem] px-6 -mt-3 rounded-[.875rem] 2xl:px-[3rem] overflow-hidden">
            {/* Animated border */}
            <div className="absolute inset-0">
              <motion.div
                className="w-[200%] h-[200%] absolute -left-1/2 -top-1/2"
                style={{
                  background: `conic-gradient(from 0deg at 50% 50%,
                    #d91fff 0deg,
                    #d91fff 120deg,
                    #00ffff 100deg,
                    #00ffff 240deg,
                    #FFD700 220deg,
                    #FFD700 360deg,
                    #d91fff 340deg
                  )`,
                }}
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 4,
                  ease: "linear",
                  repeat: Infinity,
                }}
              />
            </div>

            {/* Content container */}
            <div className="absolute inset-[8px] bg-[#13051E] rounded-[.675rem]" />
            <div className="relative">
              <div className="flex justify-between items-center">
                <div>
                  <GlowyStrokeText
                    strokeWidth={2}
                    strokeColor="#D91FFF"
                    glowColor="#13051E"
                    glowIntensity="low"
                    textclassName="text-[2.125rem] font-extrabold font-gilroyBold"
                    fillColor="#000"
                  >
                    Stage 2: Prove your hustle
                  </GlowyStrokeText>
                  <p className="text-sm font-normal text-[#D5B9FF]">
                    Spectator Mode - Watch the live game in progress
                  </p>
                </div>

                {timerActive && (
                  <div className="flex items-center justify-center bg-gradient-to-r from-amber-500 to-yellow-500 border-[2px] border-[#C76000] rounded-xl px-3 py-1.5 shadow-md">
                    <span
                      className="text-[20px] font-extrabold font-verdana text-white"
                      style={{
                        WebkitTextStroke: "1.5px #C76000",
                        textShadow: "0px 1px 2px rgba(199, 96, 0, 0.5)",
                      }}
                    >
                      {`0:${Math.max(0, timeLeft).toString().padStart(2, "0")}`}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid mt-5 gap-3 grid-cols-[1fr_3fr_1fr] items-start">
                {/* Question numbers sidebar - Updated to show attempted questions */}
                <div className="flex gap-2 flex-col">
                  {Array.from({ length: 8 }, (_, index) => {
                    const isCompleted = isQuestionCompleted(index);
                    const isActive = isQuestionActive(index);
                    const isAttempted = isQuestionAttempted(index);
                    
                    return (
                      <div key={index} className="">
                        <NumberCardContainer
                          text={
                            isCompleted ? (
                              <CheckIcon size={160} />
                            ) : (
                              index + 1
                            )
                          }
                          textColor={
                            isActive
                              ? "#FFFFFF"
                              : isCompleted
                                ? "#fff"
                                : isAttempted
                                  ? "#FFC125"  // Highlight attempted questions
                                  : "#F2C94C"
                          }
                          backgroundColor={
                            isActive
                              ? "#FEC124"
                              : isCompleted
                                ? "#04DA6A"
                                : isAttempted
                                  ? "#997416"  // Different background for attempted questions
                                  : "black"
                          }
                          width={45}
                          height={45}
                          active={isActive || isCompleted || isAttempted}
                          iconPosition={{ y: 33 }}
                          iconSize={30}
                        />
                      </div>
                    );
                  })}
                </div>

                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Question display section */}
                    <div className="border-[.3125rem] relative border-[#D71BFA] flex-col flex gap-4 px-[2.12rem] items-center justify-start py-[1rem] rounded-[1.5rem] bg-[#000000]">
                      <div className="">
                        <p className="bg-[#011B0D] rounded-10 px-3 py-2 text-xs text-[#04DA6A] font-outfit">
                          Question {currentQuestionIndex + 1}
                        </p>
                      </div>
                      <div className="">
                        <h2 className="text-white text-xl 2xl:text-2xl text-center font-gilroyMedium font-extrabold">
                          {mqttQuestionData?.question || "Waiting for question..."}
                        </h2>
                      </div>
                      <div className="flex justify-center items-center w-full gap-4">
                        <div className="bg-[#2A2000] flex justify-center items-center flex-col rounded-[12px] py-2 px-4 w-full">
                          <p className="text-sm font-outfit font-normal text-[#FFC125]">
                            Win amount
                          </p>
                          <GlowyStrokeText
                            strokeWidth={1}
                            strokeColor="#FFC125"
                            glowColor="#FFC125"
                            textclassName="text-[20px] text-white font-extrabold font-gilroyMedium text-center font-extrabold font-gilroyHeavy"
                            fillColor="#fff"
                            glowIntensity={"none"}
                          >
                            ₦
                            {addCommasToNumber(
                              Number(mqttQuestionData?.allocated_winning_amount || 0)
                            )}
                          </GlowyStrokeText>
                        </div>
                        <div className="bg-[#011B0D] flex justify-center items-center flex-col rounded-[12px] py-2 px-4 w-full">
                          <p className="text-sm font-outfit font-normal text-[#04DA6A]">
                            Capital:
                          </p>
                          <GlowyStrokeText
                            strokeWidth={1}
                            strokeColor="#04DA6A"
                            glowColor="#04DA6A"
                            glowIntensity="none"
                            textclassName="text-[20px] text-white font-extrabold font-gilroyMedium text-center font-extrabold font-gilroyHeavy"
                            fillColor="#fff"
                          >
                            ₦
                            {addCommasToNumber(
                              Number(
                                balanceData?.data?.balances?.find(
                                  (balance:any) => balance.contestant_id === user?.contestant_id
                                )?.actual_balance || 0
                              )
                            )}
                          </GlowyStrokeText>
                        </div>
                      </div>
                    </div>

                    {mqttQuestionData ? (
                      <>
                        {/* Answer options - Updated to highlight correct option */}
                        <div className="grid grid-cols-2 gap-[.625rem] mt-[.625rem]">
                          {(["option_a", "option_b", "option_c", "option_d"] as OptionKey[]).map(
                            (option, index) => {
                              const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
                              const isCorrect = correctAnswer === option;

                              return (
                                <div
                                  key={option}
                                  className={cn(
                                    "bg-[#000000] border-2 rounded-[.75rem] font-bold text-base font-gilroyBold px-4 py-[.5625rem] text-white text-left cursor-not-allowed",
                                    isCorrect 
                                      ? "bg-[#04DA6A] border-[#04DA6A] opacity-100" // Correct answer
                                      : correctAnswer && !isCorrect 
                                        ? "border-[#EB001B] opacity-60" // Wrong answer when correct is known
                                        : "border-[#D71BFA] opacity-60" // Default state
                                  )}
                                >
                                  {optionLetter}:
                                  <span
                                    className={cn(
                                      isCorrect ? "text-white font-bold" : "",
                                      correctAnswer && !isCorrect ? "text-[#EB001B]" : ""
                                    )}
                                    style={{
                                      marginLeft: "9px",
                                      WebkitTextStroke: isCorrect ? "1px #006400" : "",
                                    }}
                                  >
                                    {" "}
                                    {mqttQuestionData?.[option] || "..."}
                                  </span>
                                </div>
                              );
                            }
                          )}
                        </div>

                        {/* Status indicators */}
                        <div className="flex items-center gap-1 mt-7">
                          {correctAnswer && (
                            <div className="bg-[#04DA6A] px-4 py-2 rounded-lg ml-2">
                              <span className="text-white text-sm font-medium">
                                ✅ Correct Answer: {convertOptionToLetter(correctAnswer)}
                              </span>
                            </div>
                          )}
                          
                          {timeLeft <= 0 && !correctAnswer && (
                            <div className="bg-[#EB001B] px-4 py-2 rounded-lg ml-2">
                              <span className="text-white text-sm font-medium">
                                ⏱️ Time Elapsed - Waiting for correct answer
                              </span>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-center items-center h-full mt-4">
                        <div className="text-[#D5B9FF] text-lg">
                          {isConnected ? "Waiting for next question..." : "Connecting..."}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Results sidebar */}
                <div className="">
                  <FastestFingerResult
                    resultArray={mqttAnswerData}
                    mqttAnswerData={mqttAnswerData}
                    timeElapsed={timeLeft <= 0 || !timerActive}
                    currentQuestionId={currentQuestionId}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div>
        <HustleSideBar
          showEmptyCard={false}
          showHustlerCard={true}
          eliminated={2}
        />
      </div>
    </div>
  );
};

export default ViewOnlyQuestionTwoScreen;
