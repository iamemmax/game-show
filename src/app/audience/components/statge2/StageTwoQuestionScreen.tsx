import Logo from "@/app/icons/Logo";
import Trophy from "@/app/icons/Trophy";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import React, { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
import ErrorIcon from "@/app/icons/ErrorIcon";
import { formatAmount } from "@/utils/currency";
import HustleBoardStageTallyPage from "../HustleBoardStageTally";
import HustleBoardModal from "../modals/HustleBoardModal";
import HustleRevealResult from "../modals/HustleRevealResult";
import HustleQuestionAnswerModal from "../modals/HustleQuestionAnswer";
import AnimatedText from "@/app/shared/AnimatedText";
import Image from "next/image";
import { contestantImages } from "@/app/components/stages/components/mocks/contestantImages";

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

interface prop {
  onNext: () => void;
}
const ViewOnlyQuestionTwoScreen = ({ onNext }: prop) => {
  const { isConnected, addMessageListener, removeMessageListener } = useMQTT();
  const params = useParams();

  // Get wallet balances for display
  const { data: balanceData, refetch: refetchBalance } = useGetWalletBalance(
    Number(params?.episodeId)
  );

  // State for display purposes only - no user interaction
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [allQuestionsCompleted, setAllQuestionsCompleted] = useState(false);
  const [showStage2Prep, setShowStage2Prep] = useState(true);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(
    null
  );
  const [mqttQuestionData, setMqttQuestionData] = useState<any>(null);
  const [mqttAnswerData, setMqttAnswerData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [attemptedQuestions, setAttemptedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [selectedOption, setSelectedOption] = useState<OptionKey | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [currentQuestionAnswerData, setCurrentQuestionAnswerData] = useState<
    any | null
  >(null);
  
// Add these new state variables after the existing state declarations
const [questionStartTime, setQuestionStartTime] = useState<number | null>(null);
const [contestantTimestamps, setContestantTimestamps] = useState<{[contestantId: string]: number}>({});
const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);


  const { refetch, data:contestantData } = useGetGameContestants(Number(params?.episodeId));
  const [mqttAnswerResultData, setMqttAnsweResultData] =
    useState<any>(mqttAnswerData);
     const [contestantOption, setContestantOption] = useState<{
        [contestantId: string]: {
          contestant_id: string;
          contestant_name: string;
          selected_option: string;
          is_selected: boolean;
          timestamp: string;
          question_id?: string;
        };
      }>({});

  // Timer effect - for display only

  const playOptionSelectedSound = () => {
  try {
    const audio = new Audio("/sounds/select-option.mp3");
    audio.volume = 0.7; // Adjust volume as needed
    audio.play().catch(console.error);
  } catch (error) {
    console.error("Error playing option selected sound:", error);
  }
}
useEffect(() => {
  let interval: NodeJS.Timeout;
  
  if (timerActive && timeLeft > 0) {
    interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setTimerActive(false);
          // Mark current question as attempted when timer ends
          setAttemptedQuestions(prevAttempted => new Set([...prevAttempted, currentQuestionIndex]));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }
  
  return () => {
    if (interval) clearInterval(interval);
  };
}, [timerActive, timeLeft, currentQuestionIndex]);

// Update the real-time timestamp counting useEffect
useEffect(() => {
  let interval: NodeJS.Timeout;
  
  if (timerActive && questionStartTime) {
    interval = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - questionStartTime) / 1000;
      setCurrentTimestamp(Math.min(elapsed, 10)); // Cap at 10 seconds
    }, 100); // Update every 100ms for smooth counting
  }
  
  return () => {
    if (interval) clearInterval(interval);
  };
}, [timerActive, questionStartTime]);

// Update the handleStartTimer function
const handleStartTimer = () => {
  setTimerActive(true);
  setTimeLeft(10); // Start countdown from 10
  const startTime = Date.now();
  setQuestionStartTime(startTime);
  setCurrentTimestamp(0);
  // Clear previous timestamps when new question starts
  setContestantTimestamps({});
};

// Update the resetTimerState function
const resetTimerState = () => {
  setTimerActive(false);
  setTimeLeft(10); // Reset to 10 seconds
  setQuestionStartTime(null);
  setContestantTimestamps({});
  setCurrentTimestamp(0);
};

const isQuestionAttempted = (idx: number) => {
    return idx < currentQuestionIndex;
  };

  const isCorrectOption = (option: OptionKey): boolean => {
    if (!correctAnswer) return false;
    return convertOptionToLetter(option) === correctAnswer;
  };
  const currentQuestionIdRef = useRef<string | null>(null);

  useEffect(() => {
    currentQuestionIdRef.current = currentQuestionId;
  }, [currentQuestionId]);

  // MQTT event listening
  useEffect(() => {
    if (!isConnected) return;

    const handleMQTTMessage = ( receivedMessage: any) => {
      // console.log("📡 Received MQTT message:", receivedMessage);

      // Handle prep page event
      if (receivedMessage?.event === "game_s2_question_reveal") {
        setShowStage2Prep(false);

        const payload = receivedMessage.payload || {};
        const questionData = payload.data || {};

        // Save full question info
        setMqttQuestionData(questionData?.question);

        // Reset related states
        resetTimerState();
        setCorrectAnswer(null);
        setMqttAnswerData(null);
        setShowResultModal(false);
        setCurrentQuestionAnswerData(null);
          setContestantOption({});
        // Set current index and question ID
        setCurrentQuestionIndex(questionData?.index);

        const questionId = questionData?.question?.question_id;
        if (questionId) {
          setCurrentQuestionId(questionId.toString());
        }
      }

      if (receivedMessage?.event === "game_s2_question_options_select_reveal") {
        const payload = receivedMessage.payload || {};
        const questionId = payload?.answers_data?.question?.question_id;

        if (
          questionId?.toString() === currentQuestionIdRef?.current?.toString()
        ) {
          const answersData = payload?.answers_data?.answers;
          setCurrentQuestionAnswerData(answersData);
          setShowResultModal(true);
        }
      }

      // Handle question answer event
      if (receivedMessage?.event === "game_s2_question_answer") {
        const payload = receivedMessage.payload || {};
        const questionId = payload.question_id;
        const shouldShowModal = payload?.show_modal;

        // FIXED: Compare questionId properly (convert to string if needed)
        const currentQuestionIdStr = currentQuestionIdRef?.current?.toString();
        const receivedQuestionIdStr = questionId?.toString();

        if (receivedQuestionIdStr === currentQuestionIdStr) {
          const answersData = payload?.data?.answers;
          

          // Update answer data for all questions
          setMqttAnswerData(answersData);
          // FIXED: For elimination questions (index > 4), set result data separately
          if (currentQuestionIndex > 4) {
            setMqttAnsweResultData(answersData);
            setMqttAnswerData(answersData);
          }

          // FIXED: Always update modal states when shouldShowModal is true
          if (shouldShowModal) {
            setMqttAnswerData(answersData);
          }

          // Refetch balance data
          refetchBalance();
          // Mark submitted and stop timer
          const correctOption = payload?.data?.question?.correct_option;

          if (correctOption) {
            setCorrectAnswer(correctOption);
            setTimerActive(false);
          }

          console.log("✅ Answer processing completed");
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
  setTimeLeft(0); // Set timer to 0 when it ends
  
  // Mark current question as attempted when timer ends
  setAttemptedQuestions(
    (prev) => new Set([...prev, currentQuestionIndex])
  );
  
  // Set timestamp to 10.000 for contestants who didn't answer
  setContestantOption(prevOpt => {
    const updatedOpt = { ...prevOpt };
    
    // Get remaining contestants for current question
    remainingContestants?.forEach(contestant => {
      const contestantId = contestant.id;
      const existingOption = updatedOpt[contestantId];
      
      // If contestant didn't answer or didn't select an option
      if (!existingOption || !existingOption.is_selected) {
        updatedOpt[contestantId] = {
          contestant_id: String(contestantId),
          contestant_name: String(contestant.name),
          selected_option: existingOption?.selected_option || '',
          is_selected: false,
          timestamp: "10.000", // 10 seconds for non-answered
          question_id: String(currentQuestionId),
        };
      }
    });
    
    return updatedOpt;
  });
}

      // Handle results reveal event
      if (receivedMessage?.event === "game_s2_results_reveal") {
        console.log("✅ Processing game_s2_results_reveal");
        setAllQuestionsCompleted(true);
      }

      if (receivedMessage?.event === "game_s2_debit_wallet") {
        refetch();
      }
  // Update the contestant_selected_option handler in the MQTT useEffect
if (receivedMessage?.event === "contestant_selected_option") {
  const payload = receivedMessage.payload || {};
  const {
    contestant_id,
    contestant_name,
    selected_option,
    is_selected,
    timestamp,
    question_id,
  } = payload;

  if (contestant_id && contestant_name && selected_option !== undefined) {
    // Only update options for the current question
    if (question_id === currentQuestionId) {
      // Play sound effect for option selection
      playOptionSelectedSound();
      
      // Calculate timestamp if timer is active and question has started
      let calculatedTimestamp = 0;
      if (questionStartTime && is_selected) {
        const answerTime = Date.now();
        calculatedTimestamp = (answerTime - questionStartTime) / 1000; // Convert to seconds
        
        // Store the timestamp for this contestant
        setContestantTimestamps(prev => ({
          ...prev,
          [contestant_id]: calculatedTimestamp
        }));
      }
      
      setContestantOption((prevOpt) => {
        const updatedBids = {
          ...prevOpt,
          [contestant_id]: {
            contestant_id,
            contestant_name,
            selected_option,
            is_selected,
            timestamp: calculatedTimestamp.toFixed(3), // Store calculated timestamp with 3 decimal places
            question_id,
          },
        };

        return updatedBids;
      });
    }
  }
}
 if (receivedMessage?.event === "clear_all_options") {
        setContestantOption({});
      }
    };

    console.log("🔄 Registering MQTT handler for view-only mode");
     if (isConnected) {
      addMessageListener(handleMQTTMessage);
    }

    return () => {
      removeMessageListener(handleMQTTMessage);
    };
  }, [isConnected, addMessageListener, removeMessageListener, currentQuestionIndex]);

  // Add effect to mark question as attempted when timer ends
  useEffect(() => {
    if (timeLeft <= 0 && timerActive) {
      setTimerActive(false);
      // Mark current question as attempted when timer ends
      setAttemptedQuestions((prev) => new Set([...prev, currentQuestionIndex]));
    }
  }, [timeLeft, timerActive, currentQuestionIndex]);

  const [fontSize, setFontSize] = useState("text-4xl 2xl:text-5xl");
  const textRef = useRef(null);

  const getFontSizeClass = (textLength: number) => {
    if (textLength <= 30) {
      return "text-4xl 2xl:text-5xl"; // Large font for short questions
    } else if (textLength <= 60) {
      return "text-3xl 2xl:text-4xl"; // Medium font for medium questions
    } else if (textLength <= 100) {
      return "text-2xl 2xl:text-3xl"; // Smaller font for longer questions
    } else {
      return "text-xl 2xl:text-2xl"; // Smallest font for very long questions
    }
  };

  useEffect(() => {
    const questionText =
      mqttQuestionData?.question || "Waiting for question...";
    const newFontSize = getFontSizeClass(questionText.length);
    setFontSize(newFontSize);
  }, [mqttQuestionData?.question]);

  if (showStage2Prep) {
    return <StageTwoGetReadyStage />;
  }

  if (allQuestionsCompleted) {
    return (
      <HustleBoardStageTallyPage
        eliminationCount={2}
        removeCount={2}
        title={"Hustle Board"}
        activeState={2}
        onNext={() => onNext}
      />
    );
  }

  const  remainingContestants = contestantData?.data?.filter(
    (contestant) => contestant.eliminated_stage === null
  );

  return (
    <div className="grid grid-cols-[1fr_5fr_1fr] h-full">
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

          <div className="relative w-full py-[2rem] 2xl:py-[2.5rem]  px-6 -mt-3 rounded-[.875rem] 2xl:px-[3rem] overflow-hidden">
            {/* Animated border */}
            <div className="absolute inset-0">
              <motion.div
                className="w-[200%] h-[200%] absolute -left-1/2 -top-1/2"
                style={{
                  background:
                    currentQuestionIndex > 4
                      ? `conic-gradient(from 0deg at 50% 50%,
                     #ff0000 0deg,
                     #ff4444 120deg,
                     #cc0000 240deg,
                     #ff0000 360deg
                   )`
                      : `conic-gradient(from 0deg at 50% 50%,
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
                  duration: currentQuestionIndex > 5 ? 2 : 4, // Faster rotation in danger zone
                  ease: "linear",
                  repeat: Infinity,
                }}
              />
            </div>

            <div className="absolute inset-0">
              <motion.div
                className="w-[200%] h-[200%] absolute -left-1/2 -top-1/2"
                style={{
                  background:
                    currentQuestionIndex > 4
                      ? `conic-gradient(from 0deg at 50% 50%,
                                   #ff0000 0deg, #ff0000 10deg,
                                   #8b0000 10deg, #8b0000 20deg,
                                   #ff4444 20deg, #ff4444 30deg,
                                   #cc0000 30deg, #cc0000 40deg,
                                   #ff6666 40deg, #ff6666 50deg,
                                   #990000 50deg, #990000 60deg,
                                   #ff3333 60deg, #ff3333 70deg,
                                   #b30000 70deg, #b30000 80deg,
                                   #ff1111 80deg, #ff1111 90deg,
                                   #660000 90deg, #660000 100deg,
                                   #ff5555 100deg, #ff5555 110deg,
                                   #aa0000 110deg, #aa0000 120deg,
                                   #ff2222 120deg, #ff2222 130deg,
                                   #770000 130deg, #770000 140deg,
                                   #ff7777 140deg, #ff7777 150deg,
                                   #dd0000 150deg, #dd0000 160deg,
                                   #ff0000 160deg, #ff0000 170deg,
                                   #440000 170deg, #440000 180deg,
                                   #ff8888 180deg, #ff8888 190deg,
                                   #ee0000 190deg, #ee0000 200deg,
                                   #ff1111 200deg, #ff1111 210deg,
                                   #550000 210deg, #550000 220deg,
                                   #ff4444 220deg, #ff4444 230deg,
                                   #bb0000 230deg, #bb0000 240deg,
                                   #ff9999 240deg, #ff9999 250deg,
                                   #880000 250deg, #880000 260deg,
                                   #ff3333 260deg, #ff3333 270deg,
                                   #ff0000 270deg, #ff0000 280deg,
                                   #330000 280deg, #330000 290deg,
                                   #ff6666 290deg, #ff6666 300deg,
                                   #cc0000 300deg, #cc0000 310deg,
                                   #ff2222 310deg, #ff2222 320deg,
                                   #990000 320deg, #990000 330deg,
                                   #ff5555 330deg, #ff5555 340deg,
                                   #ff0000 340deg, #ff0000 360deg
                                 )`
                      : `conic-gradient(from 0deg at 50% 50%,
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
                  ...(currentQuestionIndex > 4 && {
                    filter: [
                      "brightness(1) saturate(1)",
                      "brightness(1.5) saturate(1.5)",
                      "brightness(0.8) saturate(1.2)",
                      "brightness(1.3) saturate(1.8)",
                      "brightness(1) saturate(1)",
                    ],
                  }),
                }}
                transition={{
                  duration: currentQuestionIndex > 5 ? 2 : 4,
                  ease: "linear",
                  repeat: Infinity,
                  ...(currentQuestionIndex > 4 && {
                    filter: {
                      duration: 0.3,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatType: "reverse",
                    },
                  }),
                }}
              />
            </div>

            {/* Content container */}
            <div className="absolute inset-[8px] bg-[#13051E] rounded-[.675rem]" />
            <div className="relative">
              <div className="flex justify-between w-full items-center">
                <div className="flex w-full justify-center items-center">
                  <GlowyStrokeText
                    strokeWidth={2}
                    strokeColor="#D91FFF"
                    glowColor="#13051E"
                    glowIntensity="low"
                    textclassName="text-[2.5rem] font-extrabold font-gilroyBold"
                    fillColor="#000"
                  >
                    Stage 2: Prove your hustle
                  </GlowyStrokeText>
                  {/* <p className="text-sm font-normal text-[#D5B9FF]">
                    Spectator Mode - Watch the live game in progress
                  </p> */}
                </div>

                {timerActive && (
                  <div className="flex items-center justify-center bg-gradient-to-r from-amber-500 to-yellow-500 border-[2px] border-[#C76000] rounded-xl px-3 py-1.5 shadow-md">
                    <span
                      className="text-[40px] font-extrabold font-verdana text-white"
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

              <div className="grid mt-5 gap-14 grid-cols-[1fr_3fr_1fr] items-start">
                {/* Question numbers sidebar - Updated to show attempted questions */}
               
            <div className="flex flex-col gap-4 w-full">
  {remainingContestants?.slice(0,2)?.map((contestant, index: number) => {
  const contestantSelection = contestantOption[contestant?.id];
  const hasSelected = contestantSelection?.is_selected && contestantSelection?.selected_option;
  
  // Calculate display timestamp
  let displayTimestamp = "0.000";
  
  if (hasSelected && contestantSelection?.timestamp) {
    // Contestant has answered - show their frozen timestamp
    displayTimestamp = contestantSelection.timestamp;
  } else if (timerActive && questionStartTime) {
    // Timer is active and contestant hasn't answered - show live counting
    displayTimestamp = currentTimestamp.toFixed(3);
  } else if (!timerActive && !hasSelected) {
    // Timer ended and contestant didn't answer
    displayTimestamp = "0.00";
  }
    
    return (
      <div
        key={`left-${contestant?.id}`}
        className={`flex items-start flex-col gap-3 rounded-lg px-6 py-4 font-gilroyMedium transition-all duration-300 ${
          hasSelected 
            ? 'bg-[#04DA6A] text-white' 
            : 'bg-[#160036] text-white'
        }`}
      >
        <div className="flex items-center gap-2">
          <p className="text-2xl">{contestant.name?.split(" ")[0]} </p>
          {hasSelected && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ 
                scale: 1, 
                rotate: 0,
                transition: {
                  type: "spring",
                  stiffness: 200,
                  damping: 10
                }
              }}
              className="ml-auto"
            >
              <CheckIcon size={24} />
            </motion.div>
          )}
        </div>
       
        <p className="text-white text-opacity-70 text-base">
          Status:
          <span className="text-white text-opacity-100">
            {hasSelected ? " answered" : " "}
          </span>
        </p>
        <p className="text-white text-opacity-70 text-base">
          Timestamp:
          <span className="text-white text-opacity-100">
            {displayTimestamp}s
          </span>
        </p>
      </div>
    );
  })}
</div>
               

<>

                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      {/* Question display section */}
                      <motion.div
                        className={`border-[.3125rem] relative flex-col flex gap-4 px-[2.12rem] items-center justify-start py-[3rem] rounded-[1.5rem] bg-[#000000] ${
                          currentQuestionIndex > 4
                            ? "border-red-500"
                            : "border-[#D71BFA]"
                        }`}
                        animate={
                          currentQuestionIndex > 4
                            ? {
                                borderColor: [
                                  "#ff0000",
                                  "#ff4444",
                                  "#cc0000",
                                  "#ff6666",
                                  "#990000",
                                  "#ff3333",
                                  "#ff0000",
                                ],
                                boxShadow: [
                                  "0 0 20px #ff0000",
                                  "0 0 40px #ff4444",
                                  "0 0 25px #cc0000",
                                  "0 0 35px #ff6666",
                                  "0 0 30px #990000",
                                  "0 0 45px #ff3333",
                                  "0 0 20px #ff0000",
                                ],
                                scale: [1, 1.02, 1, 1.01, 1],
                              }
                            : {}
                        }
                        transition={
                          currentQuestionIndex > 4
                            ? {
                                duration: 0.5,
                                ease: "easeInOut",
                                repeat: Infinity,
                                repeatType: "loop",
                              }
                            : {}
                        }
                      >
                        <div>
                          <p className="bg-[#011B0D] rounded-10 px-3 py-2 text-2xl text-[#04DA6A] font-outfit">
                            Question {currentQuestionIndex}
                          </p>
                        </div>

                        <AnimatePresence mode="wait">
                          <div className="py-4 pb-8">
                          <AnimatedText text={mqttQuestionData?.question ||
                              "Waiting for question..."}
                              
                              />

                          </div>
                          {/* <motion.h2
                            key={mqttQuestionData?.question}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ duration: 0.6 }}
                            className={cn(
                              `text-white ${fontSize} text-center mb-10 font-gilroyMedium font-extrabold`
                            )}
                            ref={textRef}
                          >
                            {mqttQuestionData?.question ||
                              "Waiting for question..."}
                          </motion.h2> */}
                        </AnimatePresence>

                        <div className="flex absolute -bottom-11 justify-center items-center w-full gap-4">
                          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 border-[2px] border-[#C76000] flex justify-center gap-y-0 space-y-0 items-center flex-col rounded-[12px] py-2 px-[5rem]">
                            <p className="text-xl block font-outfit font-normal text-[#1E1E1E]">
                              Win amount
                            </p>
                            <GlowyStrokeText
                              strokeWidth={2}
                              strokeColor="#C76000"
                              glowColor="#C76000"
                              textclassName="text-[40px] block -my-2 text-white font-extrabold font-gilroyBold text-center font-extrabold font-gilroyHeavy"
                              fillColor="#1E1E1E"
                              glowIntensity={"none"}
                            >
                              ₦
                              {formatAmount(
                                Number(
                                  mqttQuestionData?.allocated_winning_amount ||
                                    0
                                )
                              )}
                            </GlowyStrokeText>
                          </div>
                        </div>
                      </motion.div>

                      <AnimatePresence mode="wait">
                        {mqttQuestionData ? (
                          <motion.div
                            key={`options-${currentQuestionIndex}-${mqttQuestionData?.question_id}`}
                            className="grid grid-cols-2 gap-[1.625rem] mt-[5.625rem]"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
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
                              const isCorrect = isCorrectOption(option);
                              const isSelected = selectedOption === option;
                              const showResult = correctAnswer;

                              return (
                                <motion.button
                                  key={option}
                                  variants={{
                                    hidden: {
                                      opacity: 0,
                                      y: 50,
                                      scale: 0.8,
                                      rotateX: -15,
                                    },
                                    visible: {
                                      opacity: 1,
                                      y: 0,
                                      scale: 1,
                                      rotateX: 0,
                                      transition: {
                                        type: "spring",
                                        stiffness: 100,
                                        damping: 15,
                                        duration: 0.6,
                                      },
                                    },
                                  }}
                                  whileHover={
                                    timerActive &&
                                    mqttQuestionData?.question?.questions
                                      ? {
                                          scale: 1.03,
                                          y: -3,
                                          transition: { duration: 0.2 },
                                        }
                                      : {}
                                  }
                                  whileTap={
                                    timerActive &&
                                    mqttQuestionData?.question?.questions
                                      ? { scale: 0.98 }
                                      : {}
                                  }
                                  animate={
                                    isSelected && !showResult
                                      ? {
                                          scale: [1, 1.05, 1],
                                          transition: {
                                            duration: 0.3,
                                            ease: "easeInOut",
                                          },
                                        }
                                      : showResult && isCorrect
                                        ? {
                                            scale: [1, 1.08, 1.02],
                                            backgroundColor: [
                                              "#04DA6A20",
                                              "#04DA6A40",
                                              "#04DA6A20",
                                            ],
                                            transition: {
                                              duration: 0.8,
                                              ease: "easeInOut",
                                            },
                                          }
                                        : showResult && isSelected && !isCorrect
                                          ? {
                                              x: [-2, 2, -2, 2, 0],
                                              transition: {
                                                duration: 0.5,
                                                ease: "easeInOut",
                                              },
                                            }
                                          : {}
                                  }
                                  className={cn(
                                    "bg-[#000000] border-2 border-[#D71BFA] rounded-[.75rem] font-bold text-2xl font-gilroyBold px-4 py-[1.5625rem] text-white text-left relative transition-all duration-300 transform-gpu",
                                    !showResult && isSelected
                                      ? "bg-[#FCCE19] border-[#FCCE19] text-[#745300]"
                                      : "",
                                    !timerActive ||
                                      !mqttQuestionData?.question?.questions
                                      ? "opacity-70 cursor-not-allowed"
                                      : "hover:shadow-lg",
                                    mqttAnswerData &&
                                      mqttQuestionData?.correct_option ===
                                        convertOptionToLetter(option)
                                      ? "!bg-[#04DA6A]/20 !border-[#04DA6A] !text-[#04DA6A] font-bold !opacity-100"
                                      : ""
                                  )}
                                >
                                  <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{
                                      delay: 0.2 + index * 0.1,
                                      duration: 0.4,
                                    }}
                                    className="text-current"
                                  >
                                    {optionLetter}:
                                  </motion.span>

                                  <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                      delay: 0.3 + index * 0.1,
                                      duration: 0.5,
                                      type: "spring",
                                      stiffness: 80,
                                    }}
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
                                    {mqttQuestionData?.[option] || "..."}
                                  </motion.span>

                                  {/* Correct answer indicator */}
                                  <AnimatePresence>
                                    {isCorrect && showResult && (
                                      <motion.div
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{
                                          scale: 1,
                                          rotate: 0,
                                          transition: {
                                            type: "spring",
                                            stiffness: 200,
                                            damping: 10,
                                            delay: 0.2,
                                          },
                                        }}
                                        exit={{ scale: 0, opacity: 0 }}
                                      >
                                        <div className="bg-[#04DA6A] rounded-full p-1">
                                          <CheckIcon size={16} />
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>

                                  {/* Incorrect answer indicator */}
                                  <AnimatePresence>
                                    {!isCorrect && showResult && (
                                      <motion.div
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                        initial={{ scale: 0, rotate: 180 }}
                                        animate={{
                                          scale: 1,
                                          rotate: 0,
                                          transition: {
                                            type: "spring",
                                            stiffness: 200,
                                            damping: 10,
                                            delay: 0.2,
                                          },
                                        }}
                                        exit={{ scale: 0, opacity: 0 }}
                                      >
                                        <div className="bg-[#FF3B30] rounded-full p-1">
                                          <ErrorIcon />
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.button>
                              );
                            })}
                          </motion.div>
                        ) : (
                          <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex justify-center items-center h-full mt-4"
                          >
                            <div className="text-[#D5B9FF] text-lg">
                              {isConnected
                                ? "Waiting for next question..."
                                : "Connecting..."}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {showResultModal && (
                      <HustleQuestionAnswerModal
                        booster={mqttQuestionData?.question_booster}
                        showBooster={false}
                        currentQuestionOptions={{
                          option_a: mqttQuestionData?.option_a,
                          option_b: mqttQuestionData?.option_b,
                          option_c: mqttQuestionData?.option_c,
                          option_d: mqttQuestionData?.option_d,
                        }}
                        questionIndex={currentQuestionIndex}
                        correctAnswer={
                          correctAnswer || mqttQuestionData?.correct_option
                        }
                        question={mqttQuestionData?.question}
                        currentQuestionAnswerData={currentQuestionAnswerData}
                        currentQuestion={mqttQuestionData}
                        mqttAnswerData={mqttAnswerData}
                        showBid={false}
                        // allocatedWinningAmount={mqttQuestionData?.allocated_winning_amount}
                      />
                    )}
    
                    {/* Results sidebar */}
                    {/* <div className="">
                      <FastestFingerResult
                        resultArray={mqttAnswerData}
                        mqttAnswerData={mqttAnswerData}
                        timeElapsed={timeLeft <= 0 || !timerActive}
                        currentQuestionId={currentQuestionId}
                        
                      />
                    </div> */}
                  </>
                )}
</>
  

 <div className="flex flex-col gap-4 w-full">
  {remainingContestants?.slice(-2)?.map((contestant, index: number) => {
  const contestantSelection = contestantOption[contestant?.id];
  const hasSelected = contestantSelection?.is_selected && contestantSelection?.selected_option;
  
  // Calculate display timestamp
  let displayTimestamp = "0.000";
  
  if (hasSelected && contestantSelection?.timestamp) {
    // Contestant has answered - show their frozen timestamp
    displayTimestamp = contestantSelection.timestamp;
  } else if (timerActive && questionStartTime) {
    // Timer is active and contestant hasn't answered - show live counting
    displayTimestamp = currentTimestamp.toFixed(3);
  } else if (!timerActive && !hasSelected) {
    // Timer ended and contestant didn't answer
    displayTimestamp = "0.000";
  }
    
    return (
      <div
        key={`left-${contestant?.id}`}
        className={`flex items-start flex-col gap-3 rounded-lg px-6 py-4 font-gilroyMedium transition-all duration-300 ${
          hasSelected 
            ? 'bg-[#04DA6A] text-white' 
            : 'bg-[#160036] text-white'
        }`}
      >
        <div className="flex items-center gap-2">
          <p className="text-2xl">{contestant.name?.split(" ")[0]} </p>
          {hasSelected && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ 
                scale: 1, 
                rotate: 0,
                transition: {
                  type: "spring",
                  stiffness: 200,
                  damping: 10
                }
              }}
              className="ml-auto"
            >
              <CheckIcon size={24} />
            </motion.div>
          )}
        </div>
       
        <p className="text-white text-opacity-70 text-base">
          Status:
          <span className="text-white text-opacity-100">
            {hasSelected ? " answered" : " "}
          </span>
        </p>
        <p className="text-white text-opacity-70 text-base">
          Timestamp:
          <span className="text-white text-opacity-100">
            {displayTimestamp}s
          </span>
        </p>
      </div>
    );
  })}
</div>

  {/*  */}
              </div>
               <div className="flex w-full justify-center items-center mt-10 gap-[2rem]  ">
                  {Array.from({ length: 8 }, (_, index) => (
                    <div className="" key={index}>
                      <NumberCardContainer
                        // text={index + 1}
                        text={
                          isQuestionAttempted(index + 1) ? (
                            <CheckIcon size={160} />
                          ) : (
                            index + 1
                          )
                        }
                        textColor={
                          currentQuestionIndex === index + 1
                            ? "#FFFFFF"
                            : isQuestionAttempted(index + 1)
                              ? "#fff"
                              : "#F2C94C"
                        }
                        backgroundColor={
                          currentQuestionIndex === index + 1
                            ? "#FEC124"
                            : isQuestionAttempted(index + 1)
                              ? "#04DA6A"
                              : "black"
                        }
                        width={65}
                        height={65}
                        active={currentQuestionIndex > index + 1}
                        iconPosition={{ y: 33 }}
                        iconSize={30}
                      />
                    </div>
                  ))}
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
          balanceData={balanceData}
          mqttAnswerData={
            currentQuestionIndex > 4 ? mqttAnswerResultData : mqttAnswerData
          }
        />
      </div>
    </div>
  );
};

export default ViewOnlyQuestionTwoScreen;
