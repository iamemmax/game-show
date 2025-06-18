import Logo from "@/app/icons/Logo";
import Trophy from "@/app/icons/Trophy";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import HustleStages from "./HustleStages";
import HustleSideBar from "./HustleSideBar";
import NumberCardContainer from "@/app/shared/NumberContainer";
import { cn } from "@/utils/classNames";
import CheckIcon from "@/app/icons/CheckIcon";
import { tokenStorage } from "@/utils/auth";
import { Button, Dialog, GlowyStrokeText } from "@/components/core";
import Image from "next/image";
import { useGetAllHustleQuestions } from "../../api/stage1/question/getHustleQuestion";
import { contestantImages } from "../mocks/contestantImages";
import { addCommasToNumber } from "@/utils";
import FastestFingerResult from "./FastestFingerResult";
import { useAnswerStageOneQuestion } from "../../api/stage1/question/answerQuestion";
import { AxiosError } from "axios";
import StageOneTally from "./StageOneTally";
import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy";
import { useMQTT } from "@/hooks/useMqttService";
import GetReadyScreen from "../GetReadyScreen";
import { useGetGameContestants } from "@/app/admin/misc/api/contestants";
import { useRouter } from "next/navigation";
import GameResultModal from "../ResultBalnceModal";

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

const QuestionScreen = () => {
  const { isConnected, onMessage } = useMQTT();
  const router = useRouter();
  // Get user from storage
  const user = tokenStorage.getUser();
  const [showEliminationModal, setShowEliminationModal] = useState(false);

  const { data: questionData, isLoading } = useGetAllHustleQuestions(
    user?.game_episode as number
  );
  // Get contestants data to check elimination status
  const { data: allContestants, refetch } = useGetGameContestants(
    user?.game_episode as number
  );

  // Check if current user is eliminated
  useEffect(() => {
    if (allContestants?.data && user?.contestant_id) {
      const currentContestant = allContestants.data.find(
        (contestant) => contestant.id === user.contestant_id
      );

      if (currentContestant?.is_eliminated) {
        setShowEliminationModal(true);
      }
    }
  }, [allContestants?.data, user?.contestant_id]);

  const { data: contestantData } = useGetGameContestants(
    user?.game_episode as number
  );
  // State declarations
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<OptionKey | null>(null);
  const [attemptedOptions, setAttemptedOptions] = useState<AttemptedOption[]>(
    []
  );
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null); // Changed to null initially
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [allQuestionsCompleted, setAllQuestionsCompleted] = useState(false);
  const [showPrepPage, setShowPrepPage] = useState(true);
  const [isOpen, setIsOpen] = useState<Record<number, boolean>>({}); // ✅ object where keys are contestant IDs

  // Add new state variables for user-specific bid amounts
  const [userBidAmounts, setUserBidAmounts] = useState<{
    [key: string]: number;
  }>({});
  const [mqttQuestionData, setMqttQuestionData] = useState<any>(null);

  // Add state to track correct answer
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);

  // Add new state variables
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(
    null
  );
  const [mqttAnswerData, setMqttAnswerData] = useState<any>(null);
  const [mqttAnswerBalanceData, setMqttAnsweBalanceData] = useState<any>(null);

  useEffect(() => {
    // Only initialize game start time, but don't start the timer
    if (!gameStartTime) {
      setGameStartTime(new Date());
    }
  }, []);

  // Function to handle amount selection - FIXED: Allow selection anytime except when time elapsed or submitted
  const handleAmountSelect = (amount: number) => {
    // Only prevent selection if time has elapsed or already submitted
    if (timeLeft > 0 && !isSubmitted) {
      // Find the exact key that matches the amount
      const exactKey = Object.keys(userBidAmounts).find(
        (key) => Math.abs(parseFloat(key) - amount) < 0.01
      );

      if (exactKey) {
        setSelectedAmount(parseFloat(exactKey));
      } else {
        // Fallback to using the amount directly
        setSelectedAmount(amount);

        // Try to find a close match
        const closestKey = Object.keys(userBidAmounts).reduce((prev, curr) => {
          return Math.abs(parseFloat(curr) - amount) <
            Math.abs(parseFloat(prev) - amount)
            ? curr
            : prev;
        });
      }
    }
  };
  // Auto-submit effect when both option and amount are selected
  useEffect(() => {
    if (
      selectedOption &&
      selectedAmount !== null &&
      !isSubmitted &&
      timerActive &&
      currentQuestionId
    ) {
      handleSubmitAnswer();
    }
  }, [
    selectedOption,
    selectedAmount,
    isSubmitted,
    timerActive,
    currentQuestionId,
  ]);

  // Timer effect
  useEffect(() => {
    // This is the critical guard - timer should not run if not active
    if (!timerActive) {
      return;
    }

    if (timeLeft <= 0) {
      setShowNextButton(true); // Enable the Next button

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

  const currentQuestionIdRef = useRef<string | null>(null);

  useEffect(() => {
    currentQuestionIdRef.current = currentQuestionId;
  }, [currentQuestionId]);

  useEffect(() => {
    if (!isConnected) return;

    const handler = (receivedMessage: any) => {
      // Handle prep page event
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
        setSelectedAmount(null); // Reset to null
        setIsSubmitted(false);
        resetTimerState();
        // setResultMessageSent(false);
        setMqttAnswerData(null);
        setCorrectAnswer(null);

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
          } else {
            setUserBidAmounts({});
          }
        }
      }

      if (receivedMessage?.event === "game_s1_question_answer") {
        const payload = receivedMessage.payload || {};
        const questionId = payload.question_id;

        if (questionId === currentQuestionIdRef?.current) {
          const answersData = payload.answers_data?.data;
          setMqttAnswerData(answersData); // Store for rendering modals
          setMqttAnsweBalanceData(answersData); // Store for rendering modals
          refetch();

          // Mark submitted and stop timer
          if (answersData?.question?.correct_option) {
            setCorrectAnswer(answersData.question.correct_option);
            setIsSubmitted(true);
            setShowNextButton(true);
            setTimerActive(false);

            // FIXED: Open modals for all contestants with a slight delay to ensure state is updated
            setTimeout(() => {
              const newOpenModals: Record<number, boolean> = {};
              if (answersData?.data && Array.isArray(answersData.data)) {
                answersData.data.forEach((c: any) => {
                  if (c?.contestant_id) {
                    newOpenModals[c.contestant_id] = true;
                  }
                });
                setTimeout(() => {
                  setIsOpen(newOpenModals);
                }, 7000); // 7 seconds
              }
            }, 100);
          }
        }
      }

      // Handle timer start event
      if (receivedMessage?.event === "game_s1_timer_start") {
        handleStartTimer();
      }

      // Handle results reveal event
      if (receivedMessage?.event === "game_s1_results_reveal") {
        setAllQuestionsCompleted(true);
      }
    };
    onMessage(handler);

    return () => {
      if (isConnected) {
        onMessage(null);
      }
    };
  }, [isConnected, onMessage, user?.contestant_id]);

  // Handle option selection - now just selects without checking correctness
  const handleOptionSelect = (option: OptionKey) => {
    // Only allow selection if timer is active and not submitted yet
    if (timerActive && !isSubmitted) {
      setSelectedOption(option);
      // Reset amount selection when option changes
      // setSelectedAmount(null);
    }
  };

  const { mutate: handleAnswerStageOneQuestion } = useAnswerStageOneQuestion();

  const handleSubmitAnswer = () => {
    if (!selectedOption || !currentQuestionId || selectedAmount === null)
      return;

    const answerLetter = convertOptionToLetter(selectedOption);
    const formattedTimestamp = new Date().toISOString();
    const formattedGameStartTime = formatTimestamp(gameStartTime as Date);
    setIsSubmitted(true);
    setShowNextButton(true); // Enable the Next button after submission

    // Find the exact string key from the backend that matches the selected amount
    const selectedAmountKey = Object.keys(userBidAmounts).find(
      (key) => Math.abs(parseFloat(key) - selectedAmount) < 0.01
    );

    // Use the exact key string from the backend (e.g., "15000.00")
    const amountToStake = selectedAmountKey || selectedAmount.toFixed(2);

    handleAnswerStageOneQuestion(
      {
        contestant_id: user?.contestant_id,
        question_id: Number(currentQuestionId),
        answer: answerLetter, // Use letter (A, B, C, D) instead of option_x
        amount_staked: amountToStake, // Send the exact key string from backend
        timestamp: formattedTimestamp,
        question_start_time: formattedGameStartTime, // Add game start time
      },
      {
        onSuccess: () => {
          console.log(
            "Successfully submitted answer for question ID:",
            currentQuestionId
          );
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
          // openErrorModalWithMessage(String(errorMessage));
        },
      }
    );
  };

  // Add this function to reset the timer state for the next question
  const resetTimerState = () => {
    setTimerActive(false);
    setTimeLeft(10);
    setShowNextButton(false);
    setSelectedAmount(null); // Reset to null
  };

  // Function to check if a question has been attempted
  const isQuestionAttempted = (idx: number) => {
    return mqttQuestionData?.question?.hustle_reveal?.hustle_number > idx;
  };

  // Handle auto-submission when time elapses
  const handleAutoSubmit = () => {
    if (!currentQuestionId) return;

    setIsSubmitted(true);
    setShowNextButton(true); // Enable the Next button after auto-submission
  };

  const handleStartTimer = () => {
    console.log("handleStartTimer called - activating timer");
    setTimerActive(true);
    setGameStartTime(new Date()); // Reset game start time when timer starts
    setTimeLeft(10); // Reset timer to 10 seconds
  };

  if (showPrepPage) {
    return <GetReadyScreen />;
  }

  if (allQuestionsCompleted) {
    return <StageOneTally eliminationCount={0} removeCount={0} />;
  }

  const contestantBalance = mqttAnswerData?.filter(
    (contestant: any) => contestant.contestant_id === user?.contestant_id
  );
  // const filterOption = (option:string)=>{
  // const filter = mqttAnswerData?.filter((res)=>res?.)
  // }
  //  console.log(mqttQuestionData?.question?.hustle_reveal?.hustle_number);

  return (
    <>
      {/* Elimination Modal */}
      {showEliminationModal && (
        <Dialog
          open={showEliminationModal}
          onOpenChange={setShowEliminationModal}
        >
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="bg-gradient-to-b from-[#980306] to-[#FE8E8E] p-1 rounded-xl max-w-md w-full">
              <div className="bg-[#13051E] rounded-lg p-6 flex flex-col items-center">
                <h2 className="text-2xl font-bold text-white mb-4">
                  You've Been Eliminated!
                </h2>
                <div className="mb-4">
                  <Trophy height={80} width={80} />
                </div>
                <p className="text-white text-center mb-6">
                  Unfortunately, your journey ends here. Thank you for
                  participating!
                </p>
                <Button
                  onClick={() => {
                    router.push("/login");
                    setShowEliminationModal(false);
                  }}
                  className="bg-[#D91FFF] hover:bg-[#b01ad3] text-white"
                >
                  Return to Login
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}

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

                <div className="grid mt-5 gap-3 grid-cols-[1fr_3fr_1fr]">
                  <div className="flex flex-col">
                    {questionData?.map((contestant, idx: number) => (
                      <div className="flex gap-2 items-center" key={idx}>
                        <div className="">
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
                            width={30}
                            height={35}
                            active={
                              mqttQuestionData?.question?.hustle_reveal?.hustle_number >
                                contestant?.hustle_number
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
                              {contestant?.contestant_name?.split(" ")[0]}
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
                    <div className="">
                      <div className="relative">
                        {/* Question display section */}
                        <div className="border-[.3125rem] relative border-[#D71BFA] flex-col flex gap-4 px-[2.12rem] items-center justify-start py-[1rem] rounded-[1.5rem] bg-[#000000]">
                          <div className="">
                            <p className="bg-[#011B0D] rounded-10 px-3 py-2 text-xs text-[#04DA6A] font-outfit">
                              Question{" "}
                              {mqttQuestionData?.question_index || "..."}
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
                            <div className="bg-[#011B0D] rounded-[12px] py-1 px-1 w-full">
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
                            <div className="bg-[#011B0D] rounded-[12px] py-2 px-4 w-full">
                              <p className="text-xs font-outfit font-normal text-[#04DA6A] ">
                                Capital:{" "}
                                <span
                                  className="text-lg text-white font-extrabold font-verdana text-center"
                                  style={{
                                    WebkitTextStroke: "1px #04DA6A",
                                    textShadow:
                                      "1px 2px 3px rgba(4, 218, 106, 0.4)",
                                  }}
                                >
                                  ₦
                                  {addCommasToNumber(
                                    Number(contestantBalance?.wallet_balance) ||
                                      Number(
                                        // Use wallet balance from MQTT data if available
                                        contestantData?.data?.find(
                                          (contestant: any) =>
                                            String(contestant.id) ===
                                            String(user?.contestant_id)
                                        )?.actual_balance
                                      )
                                  )}
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
                            const optionLetter = String.fromCharCode(
                              65 + index
                            ); // A, B, C, D
                            const currentQuestions =
                              mqttQuestionData?.question?.questions || {};
                            const showResult = isSubmitted && correctAnswer;
                            convertOptionToLetter(option);
                            const isSelected = selectedOption === option;

                            return (
                              <button
                                key={option}
                                onClick={() => handleOptionSelect(option)}
                                className={cn(
                                  "bg-[#000000] border-2 rounded-[.75rem] font-bold text-base font-gilroyBold px-4 py-[.5625rem] text-white text-left relative",
                                  !showResult && isSelected
                                    ? "bg-[#FCCE19] border-[#FCCE19] text-[#745300]"
                                    : "",
                                  isSubmitted ||
                                    !timerActive ||
                                    !mqttQuestionData?.question?.questions
                                    ? "opacity-70 cursor-not-allowed"
                                    : "",
                                  // mqttAnswerData &&
                                  //   isSelected &&
                                  //   !isCorrect &&
                                  //   "bg-[#FF3B30]/20 border-[#FF3B30] text-[#FF3B30] font-bold",
                                  mqttAnswerData &&
                                    currentQuestions?.correct_option ===
                                      convertOptionToLetter(option)
                                    ? "!bg-[#04DA6A]/20 !border-[#04DA6A] !text-[#04DA6A] font-bold !opacity-100"
                                    : ""
                                )}
                              >
                                {optionLetter}:
                                <span className="ml-2">
                                  {currentQuestions[option] || `...`}
                                </span>
                                {/* Optional: Show checkmark for correct */}
                              </button>
                            );
                          })}
                        </div>
                        {/* Amount buttons section */}
                        <div className="flex flex-col items-start gap-1 mt-4">
<p className="text-white text-xs pb-1 font-gilroyMedium">Select wager amount</p>
                          <div className="flex items-center w-full">
                            <div className="flex flex-1 items-center">
                              <div className="flex gap-2">
                                {userBidAmounts &&
                                Object.keys(userBidAmounts).length > 0 ? (
                                  // Map through the bid amounts
                                  Object.entries(userBidAmounts).map(
                                    ([amountKey, bidValue], index) => {
                                      const amount =
                                        Number.parseFloat(amountKey);

                                      return (
                                        <div
                                          key={index}
                                          className="flex flex-col items-center"
                                        >
                                          <Button
                                            onClick={() =>
                                              handleAmountSelect(amount)
                                            }
                                            disabled={
                                              timeLeft <= 0 || // Disable when time has elapsed
                                              isSubmitted // Disable when already submitted
                                            }
                                            className={`px-4 py-3 rounded-lg text-base font-bold transition-all ${
                                              selectedAmount === amount
                                                ? "bg-[#04DA6A] text-black"
                                                : "bg-[#011B0D] text-[#04DA6A] border-dashed border-[0.5px] border-[#04DA6A]"
                                            }
  ${
    timeLeft <= 0 || isSubmitted // Only disable styling when time elapsed or submitted
      ? "opacity-50 cursor-not-allowed"
      : "hover:bg-[#035D2E] hover:text-white"
  }`}
                                          >
                                            ₦
                                            {amount.toLocaleString(undefined, {
                                              minimumFractionDigits: 0,
                                              maximumFractionDigits: 0,
                                            })}
                                          </Button>

                                          {selectedAmount === amount && (
                                            <div className="text-xs text-[#04DA6A] mt-1 font-bold">
                                              ₦
                                              {Number(bidValue).toLocaleString(
                                                undefined,
                                                {
                                                  minimumFractionDigits: 0,
                                                  maximumFractionDigits: 0,
                                                }
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    }
                                  )
                                ) : (
                                  // Show waiting message if no bid amounts are available yet
                                  <div className="text-white text-sm">
                                    Waiting for bid options from host...
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* {mqttAnswerData?.map((contestant: any) => ( */}
                      {mqttAnswerData && (
                        <GameResultModal
                          key={user?.contestant_id}
                          isOpen={!!mqttAnswerData}
                          data={mqttAnswerData}
                          questions={mqttQuestionData?.question?.questions}
                          // setIsOpen={setIsOpen}
                        />
                      )}
                      {/* ))} */}
                    </div>
                  )}
                  {/* Pass mqttAnswerData and currentQuestionId to FastestFingerResult */}
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
            mqttAnswerData={mqttAnswerBalanceData}
            // mqttAnswerBalanceData={mqttAnswerBalanceData}
          />
        </div>
      </div>
    </>
  );
};

export default QuestionScreen;
