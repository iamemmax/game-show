import Logo from "@/app/icons/Logo";
import Trophy from "@/app/icons/Trophy";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import HustleStages from "./HustleStages";
import HustleSideBar from "./HustleSideBar";
import NumberCardContainer from "@/app/shared/NumberContainer";
// import { questionArray } from "../mocks/sampleQuestion";
import { cn } from "@/utils/classNames";
import CheckIcon from "@/app/icons/CheckIcon";
import ErrorIcon from "@/app/icons/ErrorIcon";
import { tokenStorage } from "@/utils/auth";
import { Button, ErrorModal, GlowyStrokeText } from "@/components/core";
import GradientButton from "@/app/shared/GradientButton";
import Image from "next/image";
import { useGetAllHustleQuestions } from "../../api/stage1/question/getHustleQuestion";
import { contestantImages, revealResults } from "../mocks/contestantImages";
import { addCommasToNumber, formatAxiosErrorMessage } from "@/utils";
import FastestFingerResult from "./FastestFingerResult";
import { useAnswerStageOneQuestion } from "../../api/stage1/question/answerQuestion";
import { useErrorModalState } from "@/hooks";
import { AxiosError } from "axios";
import { useGetQuestionAnswer } from "../../api/stage1/question/getQuestionAnswer";
import StageOneTally from "./StageOneTally";
import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy";
import { useMQTT } from "@/hooks/useMqttService";
import { ContestantSpend, QuestionS1SpendEvent } from "./types";
import { useGetWalletBalance } from "../../api/stage1/getbalance";
import { set } from "date-fns";
import GetReadyScreen from "../GetReadyScreen";
// Add debug log to track component imports
console.log("GetReadyScreen imported in QuestionScreen");

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

/**
 * Formats a date to the format YYYY-MM-DD:HH:MM:SS
 * @param date The date to format
 * @returns The formatted date string
 */
const formatTimestamp = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}:${hours}:${minutes}:${seconds}`;
};

interface Contestant {
  contestant_id: number;
  contestant_name: string;
  wallet_balance: number;
  max_question_spend: number;
  spend_breakdown: Record<string, number>;
}
const QuestionScreen = () => {
  const {
    isErrorModalOpen,
    setErrorModalState,
    openErrorModalWithMessage,
    errorModalMessage,
  } = useErrorModalState();
  const { isConnected, onMessage } = useMQTT();
  // Get user from storage
  const user = tokenStorage.getUser();

  const { data: questionData, isLoading } = useGetAllHustleQuestions(
    user?.game_episode as number
  );

  // Add wallet balance query
  const { data: dataBalance } = useGetWalletBalance(
    user?.game_episode as number
  );


  // State declarations
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<OptionKey | null>(null);
  const [attemptedOptions, setAttemptedOptions] = useState<AttemptedOption[]>([]);
  const [selectedAmount, setSelectedAmount] = useState(10000); // Default selected amount
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const [shouldFetchAnswer, setShouldFetchAnswer] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [allQuestionsCompleted, setAllQuestionsCompleted] = useState(false);
const [showPrepPage, setShowPrepPage] = useState(true);

 
  // Add new state variables for user-specific bid amounts
  const [userBidAmounts, setUserBidAmounts] = useState<{
    [key: string]: number;
  }>({});
  const [mqttQuestionData, setMqttQuestionData] = useState<any>(null);



  // Also update questionIdToSubmit when we receive MQTT question data



  useEffect(() => {
    // Only initialize game start time, but don't start the timer
    if (!gameStartTime) {
      setGameStartTime(new Date());
    }
  }, []);

  // Function to handle amount selection
  const handleAmountSelect = (amount: number) => {
    console.log("handleAmountSelect called with amount:", amount);

    // Only allow selection if timer is active and not submitted yet
    if (timerActive && !isSubmitted && timeLeft > 0) {
      // Find the exact key that matches the amount
      const exactKey = Object.keys(userBidAmounts).find(
        key => Math.abs(parseFloat(key) - amount) < 0.01
      );

      if (exactKey) {
        console.log("Found exact key:", exactKey, "with value:", userBidAmounts[exactKey]);
        setSelectedAmount(parseFloat(exactKey));
        // setSelectedBidValue(userBidAmounts[exactKey]);
      } else {
        console.warn("No exact key found for amount:", amount);
        // Fallback to using the amount directly
        setSelectedAmount(amount);

        // Try to find a close match
        const closestKey = Object.keys(userBidAmounts).reduce((prev, curr) => {
          return Math.abs(parseFloat(curr) - amount) < Math.abs(parseFloat(prev) - amount)
            ? curr
            : prev;
        });

        if (closestKey) {
          console.log("Using closest key:", closestKey, "with value:", userBidAmounts[closestKey]);
          // setSelectedBidValue(userBidAmounts[closestKey]);
        }
      }
    }
  };

  // Timer effect
  useEffect(() => {
    // This is the critical guard - timer should not run if not active
    if (!timerActive) {
      return;
    }


    if (timeLeft <= 0) {
      setShowNextButton(true); // Enable the Next button
      setShouldFetchAnswer(true);

      if (!selectedOption && !isSubmitted) {
        console.log("No option selected, auto-submitting with 'N'");
        setSelectedOption("N" as OptionKey);
        handleAutoSubmit();
      }

      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [timeLeft, selectedOption, isSubmitted, timerActive]);






  useEffect(() => {
    if (!isConnected) return;


    const handler = (receivedMessage: any) => {

      try {
        // Handle prep page event
      

        // Handle question reveal event
        if (receivedMessage?.event === "game_s1_question_reveal") {
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

          // 3. Set current index and question ID
          setCurrentQuestionIndex((questionData.question_index || 1) - 1);
          const questionId =
            questionData?.question?.questions?.question_id || payload?.question_id;
          if (questionId) {
            // setQuestionIdToSubmit(Number(questionId));
          }

          // 4. Extract and save user's spend breakdown
          if (spendBreakdown && user?.contestant_id) {
            const userData = Array.isArray(spendBreakdown)
              ? spendBreakdown.find(
                  (contestant: any) =>
                    String(contestant.contestant_id) === String(user.contestant_id)
                )
              : spendBreakdown;


            if (userData?.spend_breakdown) {
              setUserBidAmounts(userData.spend_breakdown);

              const bidKeys = Object.keys(userData.spend_breakdown);
              if (bidKeys.length > 0) {
                const firstAmount = parseFloat(bidKeys[0]);
                // const firstBidValue = userData.spend_breakdown[bidKeys[0]];
                setSelectedAmount(firstAmount);
                // setSelectedBidValue(firstBidValue);
              }
            } else {
              setUserBidAmounts({});
              console.warn("⚠️ No spend_breakdown found for user");
            }
          }
        }

        // Handle other events...
        if (receivedMessage.event?.startsWith("game_s1_timer_start")) {
          console.log("⏱️ Timer start event received");
          handleStartTimer();
        }

        if (receivedMessage.event === "game_s1_results_reveal") {
          console.log("📊 Results reveal event received");
          setAllQuestionsCompleted(true);
        }
      } catch (error) {
        console.error("❌ Error processing MQTT message:", error);
      }
    };

    onMessage(handler);

    return () => {
      console.log("Cleaning up MQTT message handler");
      onMessage(null);
    };
  }, [isConnected, onMessage, user?.contestant_id]);


  // Handle option selection - now just selects without checking correctness
  const handleOptionSelect = (option: OptionKey) => {
    // Only allow selection if timer is active and not submitted yet
    if (timerActive && !isSubmitted) {
      setSelectedOption(option);
    }
  };

  const { mutate: handleAnswerStageOneQuestion } = useAnswerStageOneQuestion();
  // Handle submit answer
  const { data: answerData } = useGetQuestionAnswer(
    shouldFetchAnswer
      ? (mqttQuestionData?.question?.questions?.question_id as number)
      : 0
  );
  const handleSubmitAnswer = () => {
    if (!selectedOption) return;

    const answerLetter = convertOptionToLetter(selectedOption);
    const formattedTimestamp = Date.now().toString();
    const formattedGameStartTime = formatTimestamp(gameStartTime as Date);
    setIsSubmitted(true);
    setShowNextButton(true); // Enable the Next button after submission

    // Find the exact string key from the backend that matches the selected amount
    const selectedAmountKey = Object.keys(userBidAmounts).find(
      key => Math.abs(parseFloat(key) - selectedAmount) < 0.01
    );

    // Use the exact key string from the backend (e.g., "15000.00")
    const amountToStake = selectedAmountKey || selectedAmount.toFixed(2);

    // Get the question ID to submit - prioritize MQTT data, then fall back to selected questions
    const questionId = mqttQuestionData?.question?.questions?.question_id ;

    handleAnswerStageOneQuestion(
      {
        contestant_id: user?.contestant_id,
        question_id: questionId,
        answer: answerLetter, // Use letter (A, B, C, D) instead of option_x
        amount_staked: amountToStake, // Send the exact key string from backend
        timestamp: formattedTimestamp,
        question_start_time: formattedGameStartTime, // Add game start time
      },
      {
        onSuccess: () => {
          console.log("Successfully submitted answer for question ID:", questionId);
          // Add to attempted options
          setAttemptedOptions([
            ...attemptedOptions,
            {
              option: selectedOption,
            },
          ]);
        },
        onError: (error) => {
          console.error("Error submitting answer:", error);
          const errorMessage = formatAxiosErrorMessage(error as AxiosError);
          openErrorModalWithMessage(String(errorMessage));
        },
      }
    );
  };

  // Add this function to reset the timer state for the next question
  const resetTimerState = () => {
    setTimerActive(false);
    setTimeLeft(10);
    setShowNextButton(false);
    setShouldFetchAnswer(false);
    setSelectedAmount(10000); // Reset to default amount
  };

  // Function to check if a question has been attempted
  const isQuestionAttempted = (idx: number) => {
    return idx < currentQuestionIndex;
  };

  // Handle auto-submission when time elapses
  const handleAutoSubmit = () => {
    const formattedTimestamp = formatTimestamp(new Date());
    const formattedGameStartTime = formatTimestamp(gameStartTime as Date);
    setIsSubmitted(true);
    setShowNextButton(true); // Enable the Next button after auto-submission

    // Find the exact string key from the backend that matches the selected amount
    const selectedAmountKey = Object.keys(userBidAmounts).find(
      key => Math.abs(parseFloat(key) - selectedAmount) < 0.01
    );

    // Use the exact key string from the backend (e.g., "15000.00")
    const amountToStake = selectedAmountKey || selectedAmount.toFixed(2);

    // Get the question ID to submit - prioritize MQTT data, then fall back to selected questions
    const questionId = mqttQuestionData?.question?.questions?.question_id
    console.log("Auto-submitting answer for question ID:", questionId);

    // Create submission data with "N" as the answer
    handleAnswerStageOneQuestion(
      {
        contestant_id: Number(user?.contestant_id),
        question_id: questionId,
        answer: "N", // "N" for No Answer
        amount_staked: amountToStake, // Send the exact key string from backend
        timestamp: formattedTimestamp,
        question_start_time: formattedGameStartTime, // Add game start time
      },
      {
        onSuccess: () => {
          // Add to attempted options with "N" option
          setAttemptedOptions([
            ...attemptedOptions,
            {
              option: "N" as OptionKey,
            },
          ]);
        },
        onError: (error) => {
          const errorMessage = formatAxiosErrorMessage(error as AxiosError);
          openErrorModalWithMessage(String(errorMessage));
        },
      }
    );
  };

  const handleStartTimer = () => {
    console.log("handleStartTimer called - activating timer");
    setTimerActive(true);
    setGameStartTime(new Date()); // Reset game start time when timer starts
    setTimeLeft(10); // Reset timer to 10 seconds
  };


  // Add debug log before rendering
  console.log("Rendering QuestionScreen component with states:", {
    showPrepPage,
    allQuestionsCompleted,
    isConnected
  });

  if(showPrepPage){
    console.log("Rendering GetReadyScreen");
    return <GetReadyScreen />;
  }

  if (allQuestionsCompleted) {
    console.log("Rendering StageOneTally");
    return <StageOneTally eliminationCount={0} removeCount={0} />;
  }

  console.log("Rendering main question screen");

    return (
      <>

          <div className="grid grid-cols-[1.2fr_5fr_1fr] h-full ">
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

                <div className="relative w-full py-[2rem] 2xl:py-[2.5rem] max-xl:max-w-[46.5rem] 2xl:max-w-[60rem] px-6 -mt-3 rounded-[.875rem] 2xl:px-[3rem] overflow-hidden">
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
                        <h2 className="text-[2.75rem] font-extrabold outline-text text-black">
                          Stage 1: Prove your hustle
                        </h2>
                        <p className="text-sm font-normal text-[#D5B9FF]">
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

                    <div className="grid mt-5 gap-2 grid-cols-[1fr_3fr_1fr]">
                      <div className="flex flex-col">
                        {questionData?.data?.hustle_questions?.map((contestant, idx: number) => (
                          <div className="flex gap-2 items-center" key={idx}>
                            <div className="">
                              <NumberCardContainer
                                text={
                                  isQuestionAttempted(idx) ? (
                                    <CheckIcon size={160} />
                                  ) : (
                                    contestant?.hustle_reveal?.hustle_number
                                  )
                                }
                                textColor={
                                  mqttQuestionData?.question_index === idx
                                    ? "#FFFFFF"
                                    : isQuestionAttempted(idx)
                                      ? "#fff"
                                      : "#F2C94C"
                                }
                                backgroundColor={
                                  mqttQuestionData?.question_index === idx
                                    ? "#FEC124"
                                    : isQuestionAttempted(idx)
                                      ? "#04DA6A"
                                      : "black"
                                }
                                width={30}
                                height={35}
                                active={
                                  mqttQuestionData?.question_index === idx ||
                                  isQuestionAttempted(idx)
                                }
                                iconPosition={{ y: 33 }}
                                iconSize={30}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-2">
                                <div className="h-[1.2rem] w-[1.2rem]  relative">
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
                                  strokeWidth={3}
                                  strokeColor="#7E3CE0"
                                  glowColor="#04DA6A"
                                  textclassName="text-xs  text-white font-extrabold font-gilroyBold text-center font-extrabold font-gilroyHeavy"
                                  fillColor="#fff"
                                  glowIntensity={"none"}
                                >
                                  {
                                    contestant?.contestant?.contestant_name?.split(
                                      " "
                                    )[0]
                                  }
                                </GlowyStrokeText>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {isLoading ? (
                        <div className="flex justify-center items-center h-full ">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                        </div>
                      ) : (
                        <div className="relative">
                          {/* Question display section */}
                          <div className="border-[.3125rem] relative border-[#D71BFA] flex-col flex gap-4 px-[2.12rem] items-center justify-start py-[1rem] rounded-[1.5rem] bg-[#000000]">
                            <div className="">
                              <p className="bg-[#011B0D] rounded-10 px-3 py-2 text-xs text-[#04DA6A] font-outfit">
                                Question {mqttQuestionData?.question_index || "..."}
                              </p>
                            </div>
                            <div className="">
                              {mqttQuestionData?.question?.questions?.question ? (
                                <h2 className="text-white text-xl 2xl:text-2xl text-center font-gilroyMedium font-extrabold">
                                  {mqttQuestionData.question.questions.question}
                                </h2>
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
                                    textShadow: "0px 2px 4px rgba(4, 218, 106, 0.5)",
                                  }}
                                >
                                  {mqttQuestionData?.question?.questions?.question_booster || "..."}{" "}
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
                              <div className="bg-[#011B0D] rounded-[12px] py-2 px-4 w-full">
                                <p className="text-xs font-outfit font-normal text-[#04DA6A] ">
                                  Capital:{" "}
                                  <span
                                    className="text-lg text-white font-extrabold font-verdana text-center"
                                    style={{
                                      WebkitTextStroke: "1px #04DA6A",
                                      textShadow: "1px 2px 3px rgba(4, 218, 106, 0.4)",
                                    }}
                                  >
                                    ₦
                                    {addCommasToNumber(
                                      Number(
                                        // Use wallet balance from MQTT data if available
                                        mqttQuestionData?.spend_breakdown?.find(
                                          (contestant: any) => String(contestant.contestant_id) === String(user?.contestant_id)
                                        )?.wallet_balance  ||
                                        0
                                      )
                                    )}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Options display */}
                          <div className="grid grid-cols-2 gap-[.625rem] mt-[.625rem]">
                            {(["option_a", "option_b", "option_c", "option_d"] as OptionKey[]).map(
                              (option, index) => {
                                const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
                                const currentQuestions = mqttQuestionData?.question?.questions || {};

                                return (
                                  <button
                                    key={option}
                                    onClick={() => handleOptionSelect(option)}
                                    disabled={!timerActive || isSubmitted || !mqttQuestionData?.question?.questions}
                                    className={cn(
                                      "bg-[#000000] border-2 border-[#D71BFA] rounded-[.75rem] font-bold text-base font-gilroyBold px-4 py-[.5625rem] text-white text-left",
                                      selectedOption === option &&
                                        "bg-[#FCCE19] border-none text-[#745300]",
                                      (isSubmitted || !timerActive || !mqttQuestionData?.question?.questions) &&
                                        "opacity-70 cursor-not-allowed"
                                    )}
                                  >
                                    {optionLetter}:
                                    <span
                                      className={`${selectedOption === option ? "text-white font-bold" : ""}`}
                                      style={{
                                        marginLeft: "9px",
                                        WebkitTextStroke:
                                          selectedOption === option
                                            ? "1px #C76000"
                                            : "",
                                      }}
                                    >
                                      {" "}
                                      {currentQuestions[option] || `...`}
                                    </span>
                                  </button>
                                );
                              }
                            )}
                          </div>

                          {/* Amount buttons section */}
                          <div className="flex flex-col items-start gap-1 mt-7">
                            <div className="flex items-center w-full">
                              <div className="flex flex-1 items-center">
                                <div className="flex gap-2">
                                  {userBidAmounts && Object.keys(userBidAmounts).length > 0 ? (
                                    // Map through the bid amounts
                                    Object.entries(userBidAmounts).map(([amountKey, bidValue], index) => {
                                      const amount = parseFloat(amountKey);

                                      return (
                                        <div
                                          key={index}
                                          className="flex flex-col items-center"
                                        >
                                          <Button
                                            onClick={() => handleAmountSelect(amount)}
                                            disabled={
                                              !timerActive ||
                                              isSubmitted ||
                                              timeLeft <= 0 ||
                                              !mqttQuestionData?.question?.questions
                                            }
                                            className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                              selectedAmount === amount
                                                ? "bg-[#04DA6A] text-black"
                                                : "bg-[#011B0D] text-[#04DA6A] border-dashed border-[0.5px] border-[#04DA6A]"
                                            }
                                         ${
                                           !timerActive ||
                                           isSubmitted ||
                                           timeLeft <= 0 ||
                                           !mqttQuestionData?.question?.questions
                                             ? "opacity-50 cursor-not-allowed"
                                             : "hover:bg-[#035D2E] hover:text-white"
                                         }
                                        `}
                                            >
                                              ₦
                                              {amount.toLocaleString(
                                                undefined,
                                                {
                                                  minimumFractionDigits:0,
                                                  maximumFractionDigits:0,
                                                }
                                              )}
                                            </Button>

                                            {selectedAmount === amount && (
                                              <div className="text-xs text-[#04DA6A] mt-1 font-bold">
                                                ₦
                                                {Number(bidValue).toLocaleString(
                                                  undefined,
                                                  {
                                                    minimumFractionDigits:0,
                                                    maximumFractionDigits:0,
                                                  }
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })
                                    ) : (
                                      // Show waiting message if no bid amounts are available yet
                                      <div className="text-white text-sm">
                                        Waiting for bid options from host...
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="items-end justify-end">
                                  {/* Submit button - only show if not submitted yet AND time hasn't elapsed AND we have question data */}
                                  {!isSubmitted && mqttQuestionData?.question?.questions && (
                                    <Button
                                      className="p-0 bg-transparent"
                                      onClick={handleSubmitAnswer}
                                      disabled={
                                        !timerActive ||
                                        !selectedOption ||
                                        isSubmitted ||
                                        !userBidAmounts ||
                                        Object.keys(userBidAmounts).length === 0 ||
                                        !mqttQuestionData?.question?.questions
                                      }
                                    >
                                      <GradientButton
                                        text="Submit"
                                        className={`uppercase ${!timerActive || !selectedOption || !userBidAmounts || Object.keys(userBidAmounts).length === 0 || !mqttQuestionData?.question?.questions ? "opacity-50" : ""}`}
                                        width={130}
                                      />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="h-full w-full">
                          <FastestFingerResult
                            resultArray={answerData}
                            timeElapsed={timeLeft <= 0 || showNextButton}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div>
                <HustleSideBar showEmptyCard={false} showHustlerCard={true} eliminated={0} />
              </div>
            </div>

          <ErrorModal
            isErrorModalOpen={isErrorModalOpen}
            setErrorModalState={() => {
              setErrorModalState(false);
            }}
            subheading={
              errorModalMessage || "Please check your inputs and try again."
            }
          ></ErrorModal>
        </>
      );

    }



export default QuestionScreen;
