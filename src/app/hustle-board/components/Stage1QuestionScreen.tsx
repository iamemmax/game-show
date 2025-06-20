import Logo from "@/app/icons/Logo";
import Trophy from "@/app/icons/Trophy";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import NumberCardContainer from "@/app/shared/NumberContainer";
// import { questionArray } from "../mocks/sampleQuestion";
import { cn } from "@/utils/classNames";
import CheckIcon from "@/app/icons/CheckIcon";
import ErrorIcon from "@/app/icons/ErrorIcon";
import { tokenStorage } from "@/utils/auth";
import { GlowyStrokeText } from "@/components/core";
import Image from "next/image";
import { useErrorModalState } from "@/hooks";
import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy";
import { useMQTT } from "@/hooks/useMqttService";
import { useGetGameContestants } from "@/app/admin/misc/api/contestants";
// import { Dialog } from "@/components/ui/dialog";
import { useParams, useRouter } from "next/navigation";
import StageOneTally from "@/app/components/stages/components/hustle/StageOneTally";
import HustleSideBar from "@/app/components/stages/components/hustle/HustleSideBar";
import HustleStages from "@/app/components/stages/components/hustle/HustleStages";
import { contestantImages } from "@/app/components/stages/components/mocks/contestantImages";
import GetHustleBoardReadyScreen from "./GettHustleBoardReadyScreen";
import { useGetAllHustleQuestions } from "@/app/components/stages/api/stage1/question/getHustleQuestion";
// import { useGetQuestionAnswer } from "@/app/components/stages/api/stage1/question/getQuestionAnswer";
import FastestFingerResult from "@/app/components/stages/components/hustle/FastestFingerResult";

// Add debug log to track component imports

// Add new interface for attempted options
interface AttemptedOption {
  option: string;
}

// Add type for option keys
type OptionKey = "option_a" | "option_b" | "option_c" | "option_d" | "N";

/**
 * Converts option format (e.g., "option_a") to letter format (e.g., "A")
 * @param option The option in format "option_a", "option_b", etc.
 * @returns The corresponding letter "A", "B", etc. or empty string if invalid
 */
const convertOptionToLetter = (option: string | null): string => {
  if (!option) return "";

  // Simple mapping for option to letter
  const optionMap: Record<string, string> = {
    option_a: "A",
    option_b: "B",
    option_c: "C",
    option_d: "D",
    N: "N", // Add mapping for "N"
  };

  return optionMap[option] || "";
};

interface Contestant {
  contestant_id: number;
  contestant_name: string;
  wallet_balance: number;
  max_question_spend: number;
  spend_breakdown: Record<string, number>;
}

const Stage1QuestionScreen = () => {

  const { isConnected, onMessage } = useMQTT();
  const router = useRouter();
  const params = useParams();

  // Get user from storage
  const user = tokenStorage.getUser();

  // Get contestants data to check elimination status
  const { data: contestantData } = useGetGameContestants(
    Number(params?.episodeId)
  );

  // Always call hooks at the top level, even if the result is conditionally used
  const { data: questionData, isLoading } = useGetAllHustleQuestions(
    Number(params?.episodeId)
  );

  // State declarations at the top level
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<OptionKey | null>(null);
  const [attemptedOptions, setAttemptedOptions] = useState<AttemptedOption[]>(
    []
  );
  const [selectedAmount, setSelectedAmount] = useState(10000); // Default selected amount
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const [shouldFetchAnswer, setShouldFetchAnswer] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [allQuestionsCompleted, setAllQuestionsCompleted] = useState(false);
  const [showPrepPage, setShowPrepPage] = useState(true);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [mqttQuestionData, setMqttQuestionData] = useState<any>(null);
  const [mqttAnswerData, setMqttAnswerData] = useState<any>(null);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(
    null
  );
  const [resultMessageSent, setResultMessageSent] = useState(false);
  const [showEliminationModal, setShowEliminationModal] = useState(false);

  // Add new state variables for user-specific bid amounts
  const [userBidAmounts, setUserBidAmounts] = useState<{
    [key: string]: number;
  }>({});

  // Add refs for timer management
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentQuestionIdRef = useRef<string | null>(null);

  // FIXED: Move all useEffect hooks to the top level, before any conditional returns

  // FIXED: Add timer countdown effect
  useEffect(() => {
    // Clear any existing timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // Start countdown if timer is active
    if (timerActive && timeLeft > 0) {
      console.log(`⏱️ Starting timer countdown from ${timeLeft} seconds`);

      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1;
          console.log(`⏱️ Timer countdown: ${newTime} seconds remaining`);

          // Auto-submit when timer reaches 0
          if (newTime <= 0) {
            console.log("⏱️ Timer expired, auto-submitting");
            setTimerActive(false);
            setIsSubmitted(true);
            setShouldFetchAnswer(true);
            return 0;
          }

          return newTime;
        });
      }, 1000);
    }

    // Cleanup function
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [timerActive, timeLeft]);

  // Effect for current question ID ref
  useEffect(() => {
    currentQuestionIdRef.current = currentQuestionId;
  }, [currentQuestionId]);

  // MQTT message handling effect
  useEffect(() => {
    if (!isConnected) return;

    const handler = (receivedMessage: any) => {
      console.log("Main page received message:", receivedMessage?.event);
      // Handle question reveal event
      if (receivedMessage?.event === "game_s1_question_reveal") {
        console.log("📝 Processing question reveal event");
        setShowPrepPage(false);

        const payload = receivedMessage.payload || {};
        const questionData = payload.data || {};
        const spendBreakdown =
          questionData.spend_breakdown ||
          payload.spend_breakdown ||
          payload.data?.spend_breakdown;

        // 1. Save full question info
        setMqttQuestionData(questionData);

        // 2. Reset related states
        setSelectedOption(null);
        setIsSubmitted(false);
        resetTimerState();
        setResultMessageSent(false);
        setMqttAnswerData(null);

        // 3. Set current index and question ID
        setCurrentQuestionIndex(questionData.question_index || 1);
        const questionId =
          questionData?.question?.questions?.question_id ||
          payload?.question_id;
        if (questionId) {
          setCurrentQuestionId(questionId.toString());
        }

        // 4. Extract and save user's spend breakdown
        if (spendBreakdown && user?.contestant_id) {
          const userData = Array.isArray(spendBreakdown)
            ? spendBreakdown.find(
                (contestant: any) =>
                  String(contestant.contestant_id) ===
                  String(user.contestant_id)
              )
            : spendBreakdown;

          if (userData?.spend_breakdown) {
            setUserBidAmounts(userData.spend_breakdown);

            const bidKeys = Object.keys(userData.spend_breakdown);
            if (bidKeys.length > 0) {
              const firstAmount = parseFloat(bidKeys[0]);
              setSelectedAmount(firstAmount);
            }
          } else {
            setUserBidAmounts({});
            console.warn("⚠️ No spend_breakdown found for user");
          }
        }
      }

      if (receivedMessage?.event === "game_s1_question_answer") {
        const payload = receivedMessage.payload || {};
        const questionId = payload.question_id;

        // Use ref instead of state
        if (questionId === currentQuestionIdRef?.current) {
          const answersData = payload.answers_data?.data;

          // Store the full answer data for use in FastestFingerResult
          setMqttAnswerData(answersData);

          if (answersData?.question?.correct_option) {
            // Set the correct answer
            setCorrectAnswer(answersData.question.correct_option);

            // Mark the question as submitted to show results
            setIsSubmitted(true);
            setShowNextButton(true);
            setTimerActive(false); // Stop the timer

            // Refetch contestant data to update balances
            // refetch();
          }
        }
      }

      // Handle timer start event
      if (receivedMessage.event === "game_s1_timer_start") {
        handleStartTimer();
      }

      // Handle results reveal event
      if (receivedMessage.event === "game_s1_results_reveal") {
        console.log("📊 Results reveal event received");
        setAllQuestionsCompleted(true);
      }
    };

    onMessage(handler);

    return () => {
      console.log("Cleaning up MQTT message handler");
      onMessage(null);
    };
  }, [isConnected, onMessage, user?.contestant_id]);

  // Reset the result message sent flag when a new question is received
  useEffect(() => {
    if (mqttQuestionData) {
      setResultMessageSent(false);
    }
  }, [mqttQuestionData?.question?.questions?.question_id]);

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Helper function to check if an option is correct - this is not a hook, so it can be defined anywhere
  const isCorrectOption = (option: OptionKey): boolean => {
    if (!correctAnswer) return false;
    return convertOptionToLetter(option) === correctAnswer;
  };

  // Handle option selection - now just selects without checking correctness
  const handleOptionSelect = (option: OptionKey) => {
    // Only allow selection if timer is active and not submitted yet
    if (timerActive && !isSubmitted) {
      console.log(`🎯 Option selected: ${option}`);
      setSelectedOption(option);
    }
  };

  // FIXED: Add this function to reset the timer state for the next question
  const resetTimerState = () => {
    console.log("🔄 Resetting timer state");
    setTimerActive(false);
    setTimeLeft(10);
    setShowNextButton(false);
    setShouldFetchAnswer(false);

    // Clear any existing timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  // Function to check if a question has been attempted
  const isQuestionAttempted = (idx: number) => {
    return mqttQuestionData?.question?.hustle_reveal?.hustle_number < idx;
  };

  // FIXED: Enhanced handleStartTimer function
  const handleStartTimer = () => {
    // Clear any existing timer first
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // Reset and start timer
    setTimeLeft(10); // Reset timer to 10 seconds
    setTimerActive(true);
    setGameStartTime(new Date()); // Reset game start time when timer starts
    setIsSubmitted(false); // Ensure we can make selections
  };

  // FIXED: Now all conditional returns come AFTER all hooks have been called
  if (showPrepPage) {
    return <GetHustleBoardReadyScreen />;
  }

if (allQuestionsCompleted) {
    return <StageOneTally eliminationCount={0} removeCount={0} />;
  }


  return (
    <>
      <div className="grid grid-cols-[1fr_5fr_1fr] h-full ">
        {/* Left Sidebar */}
        <div className="flex flex-col justify-between">
          <div className="flex justify-center items-center h-3.5 w-full mt-8">
            <Logo />
          </div>
          <div>
            <HustleStages />
          </div>
          <div className="pb-4 ">
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
                text="Pick-Pad"
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

            <div className="relative w-full py-[2rem] 2xl:py-[2.5rem]  px-6 -mt-3 rounded-[.875rem] 2xl:px-[3rem] overflow-hidden">
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

              {/* Content container - increased border width from 5px to 8px for bolder appearance */}
              <div className="absolute inset-[8px] bg-[#13051E] rounded-[.675rem]" />
              <div className="relative">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-[3.75rem] font-extrabold outline-text text-black">
                      Stage 1: Prove your hustle
                    </h2>
                    <p className="text-xl font-normal text-[#D5B9FF]">
                      Select minimum of 2 number to determine the trivia
                      questions for this round
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

                <div className="grid mt-8 gap-2 grid-cols-[1fr_3fr_1fr]">
                  <div className="flex flex-col">
                    {questionData?.map(
                      (contestant, idx: number) => (
                        <div className="flex gap-2 items-center" key={idx}>
                          <div className="select-none">
                            <NumberCardContainer
                              text={
                                isQuestionAttempted(contestant?.hustle_number) ? (
                                  <CheckIcon size={160} />
                                ) : (
                                  contestant?.hustle_number
                                )
                              }
                              textColor={
                                mqttQuestionData?.question?.hustle_reveal?.hustle_number ===
                                contestant?.hustle_number
                                  ? "#FFFFFF"
                                  : isQuestionAttempted(contestant?.hustle_number)
                                    ? "#fff"
                                    : "#F2C94C"
                              }
                              backgroundColor={
                                mqttQuestionData?.question?.hustle_reveal?.hustle_number ===
                                contestant?.hustle_number
                                  ? "#FEC124"
                                  : isQuestionAttempted(contestant?.hustle_number)
                                    ? "#04DA6A"
                                    : "black"
                              }
                              width={54}
                              height={64}
                              active={
                                mqttQuestionData?.question?.hustle_reveal?.hustle_number ===
                                  contestant?.hustle_number ||
                                isQuestionAttempted(idx)
                              }
                              iconPosition={{ y: 33 }}
                              iconSize={30}
                              className="select-none"
                            />
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-4">
                              <div className="h-[2rem] w-[2rem]  relative">
                                <Image
                                  alt="User avatar"
                                  src={
                                    contestantImages[idx] ||
                                    "/images/userImage.png"
                                  }
                                  fill
                                  className="object-cover rounded-full"
                                />
                              </div>

                              <GlowyStrokeText
                                strokeWidth={2}
                                strokeColor="#7E3CE0"
                                glowColor="#13051e"
                                textclassName="text-base  text-white font-extrabold font-gilroyBold text-center font-extrabold font-gilroyHeavy"
                                fillColor="#fff"
                                glowIntensity={"none"}
                              >
                                {
                                  contestant?.contestant_name?.split(
                                    " "
                                  )[0]
                                }
                              </GlowyStrokeText>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full ">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Question display section */}
                      <div className="border-[.3125rem] relative border-[#D71BFA] flex-col flex gap-4 px-[2.12rem] items-center justify-start py-[3rem] rounded-[1.5rem] bg-[#000000]">
                        <div className="">
                          <p className="bg-[#011B0D] rounded-10 px-3 py-2  text-[#04DA6A] font-outfit">
                            Question {mqttQuestionData?.question_index || "..."}
                          </p>
                        </div>
                        <div className="">
                          {mqttQuestionData?.question?.questions?.question ? (
                            <p className="text-white text-xl 2xl:text-[3rem] leading-[4rem] text-center font-gilroyMedium font-extrabold">
                              {mqttQuestionData.question.questions.question}
                            </p>
                          ) : (
                            <h2 className="text-white text-xl 2xl:text-2xl text-center font-gilroyMedium font-extrabold">
                              Waiting for question from host...
                            </h2>
                          )}
                        </div>
                        <div className="flex justify-center items-center w-full gap-4">
                          <div className="bg-[#011B0D] rounded-[12px] py-1 px-4 max-xl:max-w-[130px] w-full">
                            <p
                              className="text-[25px] text-white font-extrabold font- text-center"
                              style={{
                                WebkitTextStroke: "2px #04DA6A",
                                textShadow:
                                  "0px 2px 4px rgba(4, 218, 106, 0.5)",
                              }}
                            >
                              {mqttQuestionData?.question?.questions
                                ?.question_booster || "..."}{" "}
                              <span
                                className="text-base font-outfit font-normal text-[#04DA6A]"
                                style={{
                                  WebkitTextStroke: "0px",
                                  textShadow: "none",
                                }}
                              >
                                Booster
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Options display */}
                      <div className="grid grid-cols-2 gap-[.625rem] mt-[.625rem]">
                        {(
                          [
                            "option_a",
                            "option_b",
                            "option_c",
                            "option_d",
                          ] as OptionKey[]
                        ).map((option, index) => {
                          const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
                          const currentQuestions =
                            mqttQuestionData?.question?.questions || {};
                          const isCorrect = isCorrectOption(option);
                          const isSelected = selectedOption === option;
                          const showResult = isSubmitted && correctAnswer;

                          return (
                            <button
                              key={option}
                              onClick={() => handleOptionSelect(option)}
                              disabled={
                                !timerActive ||
                                isSubmitted ||
                                !mqttQuestionData?.question?.questions
                              }
                              className={cn(
                                "bg-[#000000] border-2 border-[#D71BFA] cursor-none rounded-[.75rem] font-bold text-base font-gilroyBold px-4 py-[1.5625rem] text-white text-left relative",
                                selectedOption === option &&
                                  !showResult &&
                                  "bg-[#FCCE19] border-none text-[#745300]",

                                mqttAnswerData &&
                                  currentQuestions?.correct_option ===
                                    convertOptionToLetter(option)
                                  ? "!bg-[#04DA6A]/20 !border-[#04DA6A] !text-[#04DA6A] font-bold !opacity-100"
                                  : "",

                                (isSubmitted ||
                                  !timerActive ||
                                  !mqttQuestionData?.question?.questions) &&
                                  "opacity-70 cursor-not-allowed"
                              )}
                            >
                              {optionLetter}:
                              <span
                                className={cn(
                                  "ml-2",
                                  selectedOption === option && !showResult
                                    ? "text-white font-bold"
                                    : "",
                                  isCorrect && showResult
                                    ? "text-[#04DA6A] font-bold"
                                    : "",
                                  isSelected && !isCorrect && showResult
                                    ? "text-[#FF3B30] font-bold"
                                    : ""
                                )}
                                style={{
                                  WebkitTextStroke:
                                    selectedOption === option && !showResult
                                      ? "1px #C76000"
                                      : "",
                                }}
                              >
                                {" "}
                                {currentQuestions[option] || `...`}
                              </span>
                              {/* Correct answer indicator */}
                              {isCorrect && showResult && (
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                  <div className="bg-[#04DA6A] rounded-full p-1">
                                    <CheckIcon size={16} />
                                  </div>
                                </div>
                              )}
                              {/* Incorrect answer indicator */}
                              {isSelected && !isCorrect && showResult && (
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                  <div className="bg-[#FF3B30] rounded-full p-1">
                                    <ErrorIcon />
                                  </div>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <div className="h-full w-full">
                    <FastestFingerResult
                      resultArray={mqttAnswerData}
                      mqttAnswerData={mqttAnswerData}
                      timeElapsed={timeLeft <= 0 || showNextButton}
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
            eliminated={0}
            mqttAnswerData={mqttAnswerData}
          />
        </div>
      </div>
    </>
  );
};

export default Stage1QuestionScreen;
