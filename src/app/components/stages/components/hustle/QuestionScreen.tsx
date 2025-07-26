import Logo from "@/app/icons/Logo";
import Trophy from "@/app/icons/Trophy";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import React, { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
import GameResultModal, { mqttDatum } from "../ResultBalnceModal";
import {
  amountButtonVariants,
  optionVariants,
  questionElementVariants,
  questionVariants,
} from "../animation/animateQuestions";
import { formatAmount } from "@/utils/currency";
import EliminatedModal from "@/app/shared/EliminatedModal";
import { getDynamicFontSize } from "@/app/shared/getFunctionSize";

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
  const {
    isConnected,
    addMessageListener,
    removeMessageListener,
    sendMessage,
  } = useMQTT();
  const router = useRouter();

  // Get user from storage - this should always be called
  const user = tokenStorage.getUser();

  // All hook calls should be at the top level, before any conditional logic
  const [showEliminationModal, setShowEliminationModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<OptionKey | null>(null);
  const [attemptedOptions, setAttemptedOptions] = useState<AttemptedOption[]>(
    []
  );
  const [showBidPrompt, setShowBidPrompt] = useState(false);
  const [animatedCapital, setAnimatedCapital] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [allQuestionsCompleted, setAllQuestionsCompleted] = useState(false);
  const [showPrepPage, setShowPrepPage] = useState(true);
  const [isOpen, setIsOpen] = useState<Record<number, boolean>>({});
  const [questionKey, setQuestionKey] = useState<string>("initial");
  const [userBidAmounts, setUserBidAmounts] = useState<{
    [key: string]: number;
  }>({});
  const [mqttQuestionData, setMqttQuestionData] = useState<any>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(
    null
  );
  const [mqttAnswerData, setMqttAnswerData] = useState<mqttDatum[] | null>(
    null
  );
  const [mqttAnswerBalanceData, setMqttAnsweBalanceData] = useState<any>(null);
  // Add these state declarations at the top of your component with the other useState declarations

  const [contestantOptions, setContestantOptions] = useState<{
    [key: string]: any;
  }>({});
  const currentQuestionIdRef = useRef<string | null>(null);

  // API hooks - ensure these are called consistently
  const { data: questionData, isLoading } = useGetAllHustleQuestions(
    user?.game_episode as number
  );

  const { data: allContestants, refetch } = useGetGameContestants(
    user?.game_episode as number
  );

  // const { data: contestantData, refetch: refechUser } = useGetGameContestants(
  //   user?.game_episode as number
  // );

  const { mutate: handleAnswerStageOneQuestion } = useAnswerStageOneQuestion();

  // FIXED: Move all useEffect hooks here, ensuring they're always called

  // 1. Initialize game start time effect
  useEffect(() => {
    if (!gameStartTime) {
      setGameStartTime(new Date());
    }
  }, [gameStartTime]); // Added gameStartTime to dependency array

  // 2. Check elimination status effect
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

  // 3. Auto-submit effect
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

  // 4. Timer effect
  useEffect(() => {
    if (!timerActive) {
      return;
    }

    if (timeLeft <= 0) {
      setShowNextButton(true);

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
  }, [timeLeft, selectedOption, isSubmitted, timerActive]); // Removed functions from deps

  // 5. Current question ID ref effect
  useEffect(() => {
    currentQuestionIdRef.current = currentQuestionId;
  }, [currentQuestionId]);

  // Calculate contestant balance
  const contestantBalance = mqttAnswerData?.find(
    (contestant: any) => contestant.contestant_id === user?.contestant_id
  );
  // Fixed calculateRemainingCapital function
  const calculateRemainingCapital = () => {
    // When MQTT answer data is available, use the latest wallet balance directly
    if (mqttAnswerData && contestantBalance?.wallet_balance !== undefined) {
      return Number(contestantBalance.wallet_balance);
    }

    // Fallback to contestant data for initial balance
    const baseCapital = Number(
      allContestants?.data?.find(
        (contestant: any) =>
          String(contestant.id) === String(user?.contestant_id)
      )?.actual_balance || 0
    );

    // Only apply deduction if we haven't received MQTT answer data yet
    const deduction = selectedAmount || 0;
    return Math.max(0, baseCapital - deduction);
  };

  useEffect(() => {
    if (!isConnected) return;

    const handleMQTTMessage = (receivedMessage: any) => {
      // Handle prep page event
      if (receivedMessage?.event === "game_s1_question_reveal") {
        setShowPrepPage(false);

        const payload = receivedMessage.payload || {};
        const questionData = payload.data || {};
        const spendBreakdown =
          questionData.spend_breakdown ||
          payload.spend_breakdown ||
          payload.data?.spend_breakdown;

        setMqttQuestionData(questionData);
        setQuestionKey(`question-${questionData.question_index || Date.now()}`);
        setShowBidPrompt(true);

        // Reset all question-related state
        setSelectedOption(null);
        setSelectedAmount(null);
        setIsSubmitted(false);
        resetTimerState();
        setMqttAnswerData(null);
        setCorrectAnswer(null);

        setCurrentQuestionIndex(questionData.question_index || 1);
        const questionId =
          questionData?.question?.question?.question_id || payload?.question_id;
        if (questionId) {
          setCurrentQuestionId(questionId.toString());
        }

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

        // MODIFIED: Send empty bid data to completely clear all bids for new question
        const clearAllBidsData = {
          event: "clear_all_bids",
          payload: {},
        };
        const clearAllOptionData = {
          event: "clear_all_options",
          payload: {},
        };

        sendMessage(clearAllBidsData);
        sendMessage(clearAllOptionData);
      }

      // ADD THIS: Handle contestant option selection
      if (receivedMessage?.event === "contestant_selected_option") {
        const optionData = receivedMessage.payload;
        console.log(
          `Received option selection: ${optionData.contestant_name} selected ${optionData.selected_option}`
        );

        setContestantOptions((prev) => ({
          ...prev,
          [optionData.contestant_id]: {
            ...optionData,
            timestamp: optionData.timestamp || new Date().toISOString(),
          },
        }));
      }

      // ALSO ADD THIS: Handle clearing all options
      if (receivedMessage?.event === "clear_all_options") {
        setContestantOptions({});
      }

      // FIXED: Enhanced answer handling section
      if (receivedMessage?.event === "game_s1_question_answer") {
        const payload = receivedMessage.payload || {};
        const questionId = payload?.data?.question?.question_id;

        if (
          questionId?.toString() === currentQuestionIdRef?.current?.toString()
        ) {
          const answersData = payload?.data?.answers;

          // Set the answer data first
          setMqttAnswerData(answersData);
          setMqttAnsweBalanceData(answersData);

          // Refetch contestant data
          refetch();

          // CRITICAL FIX: Update animated capital immediately with new balance
          if (answersData && user?.contestant_id) {
            const updatedContestant = answersData?.find(
              (contestant: any) =>
                contestant.contestant_id?.toString() ===
                user?.contestant_id?.toString()
            );

            if (updatedContestant?.wallet_balance !== undefined) {
              // Set the animated capital directly to the new balance from MQTT
              setAnimatedCapital(Number(updatedContestant.wallet_balance));
            }
          }

          if (payload?.question?.correct_option) {
            setCorrectAnswer(answersData.question.correct_option);
            setIsSubmitted(true);
            setShowNextButton(true);
            setTimerActive(false);

            setTimeout(() => {
              const newOpenModals: Record<number, boolean> = {};
              if (answersData?.data && Array.isArray(answersData)) {
                answersData?.forEach((c: any) => {
                  if (c?.contestant_id) {
                    newOpenModals[c.contestant_id] = true;
                  }
                });
                setTimeout(() => {
                  setIsOpen(newOpenModals);
                }, 7000);
              }
            }, 100);
          }
        }
      }

      if (receivedMessage?.event === "game_s1_timer_start") {
        handleStartTimer();
      }

      if (receivedMessage?.event === "game_s1_results_reveal") {
        setAllQuestionsCompleted(true);
      }
    };

    if (isConnected) {
      addMessageListener(handleMQTTMessage);
    }

    return () => {
      removeMessageListener(handleMQTTMessage);
    };
  }, [
    isConnected,
    addMessageListener,
    removeMessageListener,
    user?.contestant_id,
    refetch,
    // Added this missing dependency
  ]);

  // Updated animated capital effect with better dependency management
  useEffect(() => {
    const targetCapital = calculateRemainingCapital();

    // If this is the initial load or we have new MQTT data, set immediately
    if (animatedCapital === 0 || mqttAnswerData) {
      setAnimatedCapital(targetCapital);
      return;
    }

    const startCapital = animatedCapital;
    const difference = targetCapital - startCapital;

    if (difference === 0) return;

    const duration = 800;
    const steps = 30;
    const stepValue = difference / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const newValue = startCapital + stepValue * currentStep;

      if (currentStep >= steps) {
        setAnimatedCapital(targetCapital);
        clearInterval(interval);
      } else {
        setAnimatedCapital(Math.round(newValue));
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [
    selectedAmount,
    mqttAnswerData, // This will trigger when new answer data arrives
    allContestants,
    user?.contestant_id,
  ]); //

  // 3. Update the animated capital effect to depend on wallet balance changes
  useEffect(() => {
    const targetCapital = calculateRemainingCapital();

    if (animatedCapital === 0) {
      setAnimatedCapital(targetCapital);
      return;
    }

    const startCapital = animatedCapital;
    const difference = targetCapital - startCapital;

    if (difference === 0) return;

    const duration = 800;
    const steps = 30;
    const stepValue = difference / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const newValue = startCapital + stepValue * currentStep;

      if (currentStep >= steps) {
        setAnimatedCapital(targetCapital);
        clearInterval(interval);
      } else {
        setAnimatedCapital(Math.round(newValue));
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [
    selectedAmount,
    contestantBalance,
    allContestants,
    user?.contestant_id,
    mqttAnswerData,
  ]); //

  const handleAmountSelect = (amount: number) => {
    if (timeLeft > 0 && !isSubmitted) {
      const exactKey = Object.keys(userBidAmounts).find(
        (key) => Math.abs(parseFloat(key) - amount) < 0.01
      );

      if (exactKey) {
        setSelectedAmount(parseFloat(exactKey));
      } else {
        setSelectedAmount(amount);
      }

      setShowBidPrompt(false);

      // Publish bid amount to leaderboard screen
      publishBidAmount(amount);
    }
  };

  // 1. CONTESTANT SCREEN - Enhanced publishBidAmount function (around line 150)
  const publishBidAmount = async (amount: number) => {
    if (!user?.contestant_id || !user?.name) return;

    const bidData = {
      event: "contestant_bid_selected",
      payload: {
        contestant_id: user.contestant_id,
        contestant_name: user.name,
        bid_amount: amount,
        timestamp: new Date().toISOString(),
        question_id: currentQuestionId,
        game_episode: user.game_episode,
        remaining_capital: calculateRemainingCapital() - amount,
        bid_percentage: ((amount / calculateRemainingCapital()) * 100).toFixed(
          1
        ),
      },
    };

    // console.log("Publishing bid amount:", bidData);

    // Publish to MQTT for leaderboard screen to listen
    await sendMessage(bidData);
  };
  // Updated publishOption function (around line 390)
  // const publishOption = async (option: string) => {
  //   if (!user?.contestant_id || !user?.name) return;

  //   const optionData = {
  //     event: "contestant_selected_option",
  //     payload: {
  //       contestant_id: user.contestant_id,
  //       contestant_name: user.name,
  //       is_selected: true,
  //       selected_option: option, // Added the actual selected option
  //       timestamp: new Date().toISOString(),
  //       question_id: currentQuestionId,
  //       game_episode: user.game_episode,
  //     },
  //   };

  //   console.log("Publishing selected option:", optionData);

  //   // Publish to MQTT for leaderboard screen to listen
  //   await sendMessage(optionData);
  // };

  // Updated handleOptionSelect function (around line 410)
  const handleOptionSelect = (option: OptionKey) => {
    if (timerActive && !isSubmitted) {
      setSelectedOption(option);

      // Publish the selected option immediately when user selects it
      const answerLetter = convertOptionToLetter(option);
      // publishOption(answerLetter);
    }
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption || !currentQuestionId || selectedAmount === null)
      return;

    const answerLetter = convertOptionToLetter(selectedOption);
    // publishOption(answerLetter);
    const formattedTimestamp = new Date().toISOString();
    const formattedGameStartTime = formatTimestamp(gameStartTime as Date);
    setIsSubmitted(true);
    setShowNextButton(true);

    const selectedAmountKey = Object.keys(userBidAmounts).find(
      (key) => Math.abs(parseFloat(key) - selectedAmount) < 0.01
    );

    const amountToStake = selectedAmountKey || selectedAmount.toFixed(2);

    handleAnswerStageOneQuestion(
      {
        contestant_id: user?.contestant_id,
        question_id: Number(currentQuestionId),
        answer: answerLetter,
        amount_staked: amountToStake,
        timestamp: formattedTimestamp,
        question_start_time: formattedGameStartTime,
      },
      {
        onSuccess: () => {
          console.log(
            "Successfully submitted answer for question ID:",
            currentQuestionId
          );
          setAttemptedOptions([
            ...attemptedOptions,
            {
              option: selectedOption,
            },
          ]);
        },
        onError: (error) => {
          console.error("Error submitting answer:", error);
        },
      }
    );
  };

  const resetTimerState = () => {
    setTimerActive(false);
    setTimeLeft(10);
    setShowNextButton(false);
    setSelectedAmount(null);
  };

  const isQuestionAttempted = (idx: number) => {
    return mqttQuestionData?.question?.hustle_reveal?.hustle_number > idx;
  };

  const handleAutoSubmit = () => {
    if (!currentQuestionId) return;
    setIsSubmitted(true);
    setShowNextButton(true);
  };

  const handleStartTimer = () => {
    // console.log("handleStartTimer called - activating timer");
    setTimerActive(true);
    setShowBidPrompt(false);
    setGameStartTime(new Date());
    setTimeLeft(10);
  };
  const getContestantInfo = (id: number) => {
    const allconstestant = allContestants?.data?.find(
      (contestant) => contestant?.id === id
    );
    return allconstestant;
  };
  // Early returns should come AFTER all hooks are called
  if (showPrepPage) {
    return <GetReadyScreen />;
  }
  console.log(questionData);
  

const text = "At every buzzing Lagos owambe, the DJ’s playlist feels random, but it’s all planned. From old-school jams to trending street anthems, there’s a pattern to when he drops each banger, shifting energy levels to control the dance floor and signal when it’s time to spray cash. What is a classic strategy DJs use to trigger money rain?"

const getBoosterOwner = (id:string)=>{
  const getOwner = questionData?.find((contestant) => String(contestant?.contestant_id) === id);
  return getOwner
}
  return (
    <>
      {/* Elimination Modal */}
      {showEliminationModal && (
        <EliminatedModal
          setShowEliminationModal={setShowEliminationModal}
          showEliminationModal={showEliminationModal}
          balance={Number(
            getContestantInfo(Number(user?.contestant_id))?.actual_balance
          )}
          image_url={String(
            getContestantInfo(Number(user?.contestant_id))
              ?.contestant_photo_url ?? "/"
          )}
        />
      )}
 

      <div className="grid grid-cols-[1.2fr_5fr_1fr] items-start   h-full">
        {/* Left Sidebar */}
        <div className="flex flex-col justify-between h-full">
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
        <div className="flex flex-col justify-between items-center h-full">
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
               

                <div className="grid  gap-6 w-full grid-cols-[5rem_1fr_8rem] items-start">
                  <div className="flex max-w-[1rem]  gap-4 flex-col">
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
                              mqttQuestionData?.question?.hustle_reveal
                                ?.hustle_number === contestant?.hustle_number
                                ? "#FFFFFF"
                                : isQuestionAttempted(contestant?.hustle_number)
                                  ? "#fff"
                                  : "#F2C94C"
                            }
                            backgroundColor={
                              mqttQuestionData?.question?.hustle_reveal
                                ?.hustle_number === contestant?.hustle_number
                                ? "#FEC124"
                                : isQuestionAttempted(contestant?.hustle_number)
                                  ? "#04DA6A"
                                  : "black"
                            }
                            width={40}
                            height={50}
                            active={
                              mqttQuestionData?.question?.hustle_reveal
                                ?.hustle_number > contestant?.hustle_number
                            }
                            iconPosition={{ y: 33 }}
                            iconSize={30}
                          />
                        </div>
                        
                        {/* <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <div className="h-[1.2rem] w-[1.2rem]  relative">
                              <Image
                                alt="User avatar"
                                src={
                                  contestant?.contestant_photo_url ??
                                  "/images/userImage.png"
                                }
                                fill
                                className="object-cover rounded-full"
                              />
                            </div>
<div className=" max-w-[100px] overflow-hidden whitespace-nowrap truncate">
  <GlowyStrokeText
    strokeWidth={3}
    strokeColor="#7E3CE0"
    glowColor="#04DA6A"
    textclassName="text-xs text-white font-extrabold font-gilroyBold text-center font-gilroyHeavy"
    fillColor="#fff"
    glowIntensity="none"
  >
    {contestant?.contestant_name?.split(" ")[0]} 
  </GlowyStrokeText>
</div>

                          </div>
                        </div> */}
                      </div>
                    ))}
                  </div>
                  <>
                    {isLoading ? (
                      <div className="flex justify-center items-center h-full ">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                      </div>
                    ) : (
                      <div className="">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={questionKey} // This triggers re-animation when question changes
                            variants={questionVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="relative"
                          >
                            {/* Question display section */}
                            <motion.div
                              variants={questionElementVariants}
                              className="border-[.3125rem] relative border-[#D71BFA] flex-col flex gap-4 px-[2.12rem] items-center justify-start py-[1rem] rounded-[1.5rem] bg-[#000000]"
                            >
                             <div className="flex items-center gap-x-4">
                              
                               <motion.div
                                variants={questionElementVariants}
                                className=""
                              >
                                <p className="text-base bg-[#011B0D] rounded-10 px-3 py-2 font-outfit font-normal text-[#04DA6A]"
                                      style={{
                                        WebkitTextStroke: "0px",
                                        textShadow: "none",
                                      }}>
                                 Question{" "}
                                  {mqttQuestionData?.question_index || "..."}
                                </p>
                              </motion.div>
                               <motion.div
                                variants={questionElementVariants}
                                className=""
                              >
                                <p   className="text-base bg-[#011B0D] rounded-10 px-3 py-2 font-outfit font-normal text-[#04DA6A]"
                                      style={{
                                        WebkitTextStroke: "0px",
                                        textShadow: "none",
                                      }}>
                               {mqttQuestionData?.question?.contestant?.contestant_name} {" "}
                                  {mqttQuestionData?.question?.question
                                  ?.owner_booster}
                                </p>
                              </motion.div>

                              {/* <div className="bg-[#011B0D] rounded-[12px] py-1  w-full">
                                  <p
                                    className="text-[25px] text-white font-extrabold font- text-center"
                                   
                                    >
                                        {mqttQuestionData?.question?.contestant?.contestant_name} {" "}
                                    
                                    <span className=""  style={{
                                      WebkitTextStroke: "2px #04DA6A",
                                      textShadow:
                                        "0px 2px 4px rgba(4, 218, 106, 0.5)",
                                      }}>
                                     
                                    </span>
                                    {mqttQuestionData?.question?.question
                                  ?.owner_booster}
                                    
                                  </p>
                                </div> */}
                             </div>

                            <motion.div variants={questionElementVariants} className="">
      {mqttQuestionData?.question?.question?.question ? (
        <h2 className={`text-white text-center font-gilroyMedium font-extrabold ${getDynamicFontSize(mqttQuestionData?.question?.question?.question, "question")}`}>
          {mqttQuestionData?.question?.question?.question}
        </h2>
      ) : (
        <h2 className="text-white text-xl 2xl:text-2xl text-center font-gilroyMedium font-extrabold">
          Waiting for question from host...
        </h2>
      )}
    </motion.div>

                              <motion.div
                                variants={questionElementVariants}
                                className="flex justify-center items-center w-full gap-2"
                              >
                                <div className="bg-[#011B0D] rounded-[12px] py-1  w-full">
                                  <p
                                    className="text-[25px] text-white font-extrabold font- text-center"
                                    style={{
                                      WebkitTextStroke: "2px #04DA6A",
                                      textShadow:
                                        "0px 2px 4px rgba(4, 218, 106, 0.5)",
                                    }}
                                  >
                                    {mqttQuestionData?.question?.question
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

                                <div className="bg-[#011B0D] flex items-center justify-center rounded-[12px] py-2 px-2 w-full">
                                  <p className="text-xs font-outfit items-center font-normal text-[#04DA6A]">
                                    Capital:{" "}
                                    <span
                                      className="text-lg font-extrabold font-verdana text-center"
                                      style={{
                                        WebkitTextStroke: "1px #04DA6A",
                                        textShadow:
                                          "1px 2px 3px rgba(4, 218, 106, 0.4)",
                                      }}
                                    >
                                      ₦
                                      {/* {mqttAnswerData ?? formatAmount(Number(contestantBalance?.wallet_balance))} */}
                                      {formatAmount(animatedCapital) ||
                                        formatAmount(
                                          calculateRemainingCapital()
                                        )}
                                      {/* {addCommasToNumber(animatedCapital || calculateRemainingCapital())} */}
                                    </span>
                                  </p>
                                </div>
                              </motion.div>
                            </motion.div>

                            {/* Options display with animation and overlay */}
                            <motion.div
                              variants={questionElementVariants}
                              className="relative mt-[.625rem]"
                            >
                              {/* Options Grid */}
                              <div
                                className={cn(
                                  "grid grid-cols-2 gap-[.625rem]",
                                  selectedAmount
                                    ? "opacity-100"
                                    : "opacity-40 pointer-events-none"
                                )}
                              >
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
                                    mqttQuestionData?.question?.question || {};
                                  const showResult =
                                    isSubmitted && correctAnswer;
                                  convertOptionToLetter(option);
                                  const isSelected = selectedOption === option;

                                  return (
                                    <motion.button
                                      key={option}
                                      custom={index}
                                      variants={optionVariants}
                                      initial="initial"
                                      animate="animate"
                                      whileHover="hover"
                                      whileTap="tap"
                                      onClick={() => handleOptionSelect(option)}
                                      className={cn(
                                        "border rounded-[.75rem] font-bold text-base font-gilroyBold px-4 py-[.5625rem] text-left relative", // No transitions - instant feedback
                                        // Default background/text
                                        "bg-black text-white",

                                        // Selected state (before result) - immediate visual feedback
                                        !showResult && isSelected
                                          ? "bg-[#FCCE19] border-[#FCCE19] text-[#745300]"
                                          : "border-[#d91fff]",

                                        // Grayed out when submitted, timer ended, or no questions
                                        isSubmitted ||
                                          !timerActive ||
                                          !mqttQuestionData?.question?.question
                                          ? "opacity-70 pointer-events-none"
                                          : "",

                                        // Correct answer highlight after submission
                                        mqttAnswerData &&
                                          currentQuestions?.correct_option ===
                                            convertOptionToLetter(option)
                                          ? "!bg-[#003218] !border-[#04DA6A] !text-[#04DA6A] font-bold !opacity-100"
                                          : ""
                                      )}
                                    >
                                      {optionLetter}:
                                      <span className={`ml-2 ${getDynamicFontSize(currentQuestions[option], "option")}`}>
                                        {currentQuestions[option] || `...`}
                                      </span>
                                    </motion.button>
                                  );
                                })}
                              </div>
                            </motion.div>

                            {/* Amount buttons section with animation */}
                            <motion.div
                              variants={questionElementVariants}
                              className="flex flex-col items-start gap-1 mt-4"
                            >
                              <p className="text-white text-xs pb-1 font-gilroyMedium">
                                Select bid amount
                              </p>
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
                                            <motion.div
                                              key={index}
                                              custom={index}
                                              variants={amountButtonVariants}
                                              initial="initial"
                                              animate="animate"
                                              className="flex flex-col items-center"
                                            >
                                              <motion.div
                                                whileHover="hover"
                                                whileTap="tap"
                                                variants={amountButtonVariants}
                                              >
                                                <Button
                                                  onClick={() =>
                                                    handleAmountSelect(amount)
                                                  }
                                                  disabled={
                                                    timeLeft <= 0 || // Disable when time has elapsed
                                                    isSubmitted // Disable when already submitted
                                                  }
                                                  className={`px-3 py-2 rounded-lg text-base font-bold transition-all ${
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
                                                  {(
                                                    Math.ceil(
                                                      Number(amount) / 100
                                                    ) * 100
                                                  ).toLocaleString()}
                                                  {/* {formatAmount(amount)} */}
                                                  {/* {amount.toLocaleString(
                                                  undefined,
                                                  {
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 0,
                                                  }
                                                )} */}
                                                </Button>
                                              </motion.div>

                                              {selectedAmount === amount && (
                                                <motion.div
                                                  initial={{
                                                    opacity: 0,
                                                    y: 10,
                                                  }}
                                                  animate={{ opacity: 1, y: 0 }}
                                                  className="text-xs text-[#04DA6A] mt-1 font-bold"
                                                >
                                                  ₦
                                                  {(
                                                    Math.ceil(
                                                      Number(bidValue) / 100
                                                    ) * 100
                                                  ).toLocaleString()}
                                                </motion.div>
                                              )}
                                            </motion.div>
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
                            </motion.div>
                          </motion.div>
                        </AnimatePresence>

                        {/* {mqttAnswerData?.map((contestant: any) => ( */}
                        {mqttAnswerData && (
                          <GameResultModal
                            key={user?.contestant_id}
                            isOpen={!!mqttAnswerData}
                            data={mqttAnswerData}
                            questions={mqttQuestionData?.question?.question}
                            // setIsOpen={setIsOpen}
                          />
                        )}
                        {/* ))} */}
                      </div>
                    )}
                  </>
                  {/* Pass mqttAnswerData and currentQuestionId to FastestFingerResult */}
                  <div className="flex flex-col gap-y-3 ">
                     
                     <div className="flex justify-end items-center">
                      <div className="flex justify-between items-center">
                  {/* <div>
                    <h2 className="text-[2.75rem] font-extrabold outline-text text-black"></h2>
                    <GlowyStrokeText
                      className="text-[2rem] font-extrabold"
                      glowColor="D91FFF"
                      glowIntensity="low"
                      fillColor="black"
                      strokeColor="#d91fff"
                      strokeWidth={2}
                    >
                      Stage 1:Hustle kick off
                    </GlowyStrokeText>
                  </div> */}

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
                  {/* Bid Prompt Overlay */}
                  {showBidPrompt && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className=" inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-[.75rem]"
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.05, 1],
                          boxShadow: [
                            "0 0 20px rgba(255, 193, 37, 0.5)",
                            "0 0 40px rgba(255, 193, 37, 0.8)",
                            "0 0 20px rgba(255, 193, 37, 0.5)",
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="bg-gradient-to-r from-[#FFC125] via-[#FFCC11] to-[#C23A00] p-4 rounded-xl border-4 w-full border-[#FFC125] shadow-2xl"
                      >
                        <div className="text-center">
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{
                              duration: 0.5,
                              repeat: Infinity,
                              repeatDelay: 1,
                            }}
                            className="text-2xl "
                          ></motion.div>
                          <p className="text-black text-lg font-extrabold font-gilroyBold">
                            Lock Your Hustle
                          </p>
                          {/* <p className="text-black/80 text-sm font-medium mt-1">
                                      Choose your answer & wager amount
                                    </p> */}
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </div>
                     </div>
                    <FastestFingerResult
                      resultArray={mqttAnswerData}
                      mqttAnswerData={mqttAnswerData}
                      timeElapsed={timeLeft <= 0 || showNextButton}
                      currentQuestionId={currentQuestionId}
                      width={100}

                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="h-full">
          <HustleSideBar
            showEmptyCard={false}
            showHustlerCard={true}
            eliminated={0}
            mqttAnswerData={mqttAnswerBalanceData}
            balanceData={null}
            // mqttAnswerBalanceData={mqttAnswerBalanceData}
          />
        </div>
      </div>
    </>
  );
};

export default QuestionScreen;
