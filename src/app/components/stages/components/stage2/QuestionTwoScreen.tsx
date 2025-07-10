import Logo from "@/app/icons/Logo";
import Trophy from "@/app/icons/Trophy";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import React, { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import NumberCardContainer from "@/app/shared/NumberContainer";
// import { questionArray } from "../mocks/sampleQuestion";
import { cn } from "@/utils/classNames";
import CheckIcon from "@/app/icons/CheckIcon";
import ErrorIcon from "@/app/icons/ErrorIcon";
import { tokenStorage } from "@/utils/auth";
import { Button, ErrorModal, GlowyStrokeText } from "@/components/core";
import GradientButton from "@/app/shared/GradientButton";
import { addCommasToNumber, formatAxiosErrorMessage } from "@/utils";
import { useErrorModalState } from "@/hooks";
import { AxiosError } from "axios";
import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy";
import { useMQTT } from "@/hooks/useMqttService";
import FastestFingerResult from "../hustle/FastestFingerResult";
import HustleSideBar from "../hustle/HustleSideBar";
import HustleStages from "../hustle/HustleStages";
import StageOneTally from "../hustle/StageOneTally";
import { useGetWalletBalance } from "../../api/stage1/getbalance";
// import { useGetAllStage2Questions } from "../../api/stage2/getQuestion2";
import { useAnswerStageTwoQuestion } from "../../api/stage2/answerStage2Question";
import Stage2GetReadyPage from "./Stage2GetReadyPage";
import { useGetGameContestants } from "@/app/admin/misc/api";
import GameResultModal from "../ResultBalnceModal";
import { formatAmount } from "@/utils/currency";

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
interface prop{
  onNext:()=>void
}
const QuestionTwoScreen = ({onNext}:prop) => {
  const {
    isErrorModalOpen,
    setErrorModalState,
    openErrorModalWithMessage,
    errorModalMessage,
  } = useErrorModalState();
  const { isConnected, onMessage, sendMessage } = useMQTT();
  // Add hook to publish MQTT messages
  // const { publishMessage } = usePublishMQTT();
  // Get user from storage
  const user = tokenStorage.getUser();

  // Get wallet balances to determine eliminated contestants
  const { data: balanceData, refetch: refetchBalance } = useGetWalletBalance(
    user?.game_episode as number
  );

  // Get stage 2 questions
  // const { data: questionData, isLoading } = useGetAllStage2Questions(
  //   user?.game_episode as number
  // );

  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<OptionKey | null>(null);
  const [attemptedOptions, setAttemptedOptions] = useState<AttemptedOption[]>(
    []
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [shouldFetchAnswer, setShouldFetchAnswer] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);

  const [timerActive, setTimerActive] = useState(false);
  const [allQuestionsCompleted, setAllQuestionsCompleted] = useState(false);
  const [showStage2Prep, setShowStage2Prep] = useState(true);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(
    null
  );
  // Add state for MQTT question data
  const [mqttQuestionData, setMqttQuestionData] = useState<any>(null);
  // Add state to track if we've sent the result message
  const [resultMessageSent, setResultMessageSent] = useState(false);
  // Add new state variables
  const [mqttAnswerData, setMqttAnswerData] = useState<any>(null);
  const [mqttAnswerResultData, setMqttAnsweResultData] =
    useState<any>(mqttAnswerData);
  // Add state to track attempted questions
  const [attemptedQuestions, setAttemptedQuestions] = useState<Set<number>>(
    new Set()
  );
  // Add state to track if answer has been received
  const [answerReceived, setAnswerReceived] = useState(false);
  const [openModals, setOpenModals] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [fontSize, setFontSize] = useState('text-xl 2xl:text-2xl');
  const textRef = useRef(null);



  // Timer effect
  useEffect(() => {
    // This is the critical guard - timer should not run if not active
    if (!timerActive) return;

    if (timeLeft <= 0) {
      setShouldFetchAnswer(true);

      if (!selectedOption && !isSubmitted) {
        setSelectedOption("N" as OptionKey);
        handleAutoSubmit();
      }

      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, selectedOption, isSubmitted, timerActive]);

  // Handle option selection - now just selects without checking correctness
  const handleOptionSelect = (option: OptionKey) => {
    // Only allow selection if timer is active and not submitted yet
    if (timerActive && !isSubmitted) {
      setSelectedOption(option);

      // Auto-submit immediately after selection
    }
  };

  const { mutate: handleAnswerStageTwoQuestion } = useAnswerStageTwoQuestion();
  const { refetch, isLoading } = useGetGameContestants(
    Number(user?.game_episode)
  );

  const handleSubmitAnswer = () => {
    if (!selectedOption || !mqttQuestionData) return;

    const answerLetter = convertOptionToLetter(selectedOption);
    const formattedTimestamp = new Date().toISOString();
    setIsSubmitted(true);
    // Don't set showNextButton here - wait for answer event

    // Mark current question as attempted
    // setAttemptedQuestions((prev) => new Set([...prev, currentQuestionIndex]));

    handleAnswerStageTwoQuestion(
      {
        contestant_id: user?.contestant_id,
        question_id: mqttQuestionData?.question_id,
        answer: answerLetter, // Use letter (A, B, C, D) instead of option_x
        timestamp: formattedTimestamp,
      },
      {
        onSuccess: () => {
          // Add to attempted options
          setAttemptedOptions([
            ...attemptedOptions,
            {
              option: selectedOption,
            },
          ]);

          // Set shouldFetchAnswer to true to fetch and display the answer
          setShouldFetchAnswer(true);

          // Revalidate the answer data
        },
        onError: (error) => {
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
    setResultMessageSent(false); // Reset the flag
    setAnswerReceived(false); // Reset answer received flag
  };

  // Function to check if a question has been attempted
  const isQuestionAttempted = (idx: number) => {
    return idx < currentQuestionIndex;
  };

  // Handle auto-submission when time elapses
  const handleAutoSubmit = () => {
    if (!mqttQuestionData) return;

    const formattedTimestamp = new Date().toISOString();
    setIsSubmitted(true);
    // Don't set showNextButton here - wait for answer event

    // Mark current question as attempted
    setAttemptedQuestions((prev) => new Set([...prev, currentQuestionIndex]));

    // Create submission data with "N" as the answer
  };

  // Auto-submit effect when both option and amount are selected
  useEffect(() => {
    if (selectedOption && !isSubmitted && timerActive && currentQuestionId) {
      handleSubmitAnswer();
    }
  }, [selectedOption, isSubmitted, timerActive, currentQuestionId]);

  const handleStartTimer = () => {
    setTimerActive(true);
    setGameStartTime(new Date()); // Reset game start time when timer starts
    setTimeLeft(10); // Reset timer to 10 seconds
  };

  // Add useEffect for MQTT message handling
  // Add useEffect for MQTT message handling

  const currentQuestionIdRef = useRef<string | null>(null);

  useEffect(() => {
    currentQuestionIdRef.current = currentQuestionId;
  }, [currentQuestionId]);

  useEffect(() => {
    if (!isConnected) return;

    const handler = (receivedMessage: any) => {
      // Handle prep page event
      if (receivedMessage?.event === "game_s2_question_reveal") {
        console.log("✅ Processing game_s1_question_reveal");
        setShowStage2Prep(false);

        const payload = receivedMessage.payload || {};
        const questionData = payload.data || {};

        // 1. Save full question info
        setMqttQuestionData(questionData?.question);

        // 2. Reset related states
        setSelectedOption(null);
        setIsSubmitted(false);
        resetTimerState();
        setResultMessageSent(false);
        setMqttAnswerData(null); // Clear previous answer data
        setCorrectAnswer(null);
        setOpenModals(false);
        setShowModal(false);

        // 3. Set current index and question ID
        setCurrentQuestionIndex(questionData?.index);
        const questionId = questionData?.question?.question_id;
        if (questionId) {
          setCurrentQuestionId(questionId.toString());
        }
      }

      // Fix 3: Update the MQTT message handler for game_s2_question_answer
      // Fix 3: Update the MQTT message handler for game_s2_question_answer
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
            setOpenModals(true);
            setShowModal(true);
            setMqttAnswerData(answersData);
          }

          // Refetch balance data
          refetchBalance();
          // Mark submitted and stop timer
          const correctOption =
            payload.data?.question?.correct_option 

          if (correctOption) {
            setCorrectAnswer(correctOption);
            setIsSubmitted(true);
            setTimerActive(false);
          }

          console.log("✅ Answer processing completed");
        } else {
          console.log("❌ Question ID mismatch:", {
            expected: currentQuestionIdStr,
            received: receivedQuestionIdStr,
          });
        }
      }
      // Handle timer start event
      if (receivedMessage?.event === "game_s2_timer_start") {
        // console.log("✅ Processing game_s2_timer_start");
        handleStartTimer();
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

    console.log("🔄 Registering MQTT handler");
    onMessage(handler);

    return () => {
      if (isConnected) {
        console.log("🧹 Cleaning up MQTT message handler");
        onMessage(null);
      }
    };
  }, [isConnected, onMessage, user?.contestant_id]);

  // Watch for answer data and publish event when available

  // Automatically refetch answer data when shouldFetchAnswer is true


  const getFontSizeClass = (textLength:number) => {
    if (textLength <= 30) {
      return 'text-xl 2xl:text-2xl'; // Large font for short questions
    } else if (textLength <= 60) {
      return 'text-lg 2xl:text-xl'; // Medium font for medium questions
    } else if (textLength <= 100) {
      return 'text-base 2xl:text-lg'; // Smaller font for longer questions
    } else {
      return 'text-sm 2xl:text-base'; // Smallest font for very long questions
    }
  };
useEffect(() => {
    const questionText = mqttQuestionData?.question || "Waiting for question...";
    const newFontSize = getFontSizeClass(questionText.length);
    setFontSize(newFontSize);
  }, [mqttQuestionData?.question]);

  useEffect(() => {
    // Only initialize game start time, but don't start the timer
    if (!gameStartTime) {
      setGameStartTime(new Date());
    }
  }, []);



  if (showStage2Prep) {
    return <Stage2GetReadyPage />;
  }
  if (allQuestionsCompleted) {
    return (
      <StageOneTally
        eliminationCount={2}
        removeCount={2}
        title="stage 2"
        activeState={2}
        onNext={()=>onNext}
      />
    );
  }

  // Timer effect

  return (
    <>
      <div className="grid grid-cols-[1.2fr_5fr_1fr] h-full ">
        {/* Left Sidebar */}
        <div className="flex flex-col justify-between">
          <div className="flex justify-center items-center h-3.5 w-full mt-8">
            <Logo />
          </div>
          <div>
            <HustleStages activeStage={2} />
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

            <div className="relative w-full py-[2rem] 2xl:py-[2.5rem] max-xl:max-w-[46.5rem] 2xl:max-w-[65rem] px-6 -mt-3 rounded-[.875rem] 2xl:px-[3rem] overflow-hidden">
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

              {/* Content container - increased border width from 5px to 8px for bolder appearance */}
              <div className="absolute inset-[8px] bg-[#13051E] rounded-[.675rem]" />
              <div className="relative">
                <div className="flex justify-between items-center ">
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

                <div className="grid mt-5 gap-3 grid-cols-[1fr_3fr_1fr] items-start">
                  <div className="flex gap-2 flex-col">
                    {/* Remove the mapping over selectedQuestions since we're not using it anymore */}
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
                              : isQuestionAttempted(index)
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
                          width={45}
                          height={45}
                          active={currentQuestionIndex > index}
                          iconPosition={{ y: 33 }}
                          iconSize={30}
                        />
                      </div>
                    ))}
                  </div>
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full ">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={`question-${currentQuestionIndex}-${mqttQuestionData?.question_id}`}
                            className={`border-[.3125rem] relative flex-col flex gap-4 px-[2.12rem] items-center justify-start py-[1rem] rounded-[1.5rem] bg-[#000000] ${
                              currentQuestionIndex > 4
                                ? "border-red-500"
                                : "border-[#D71BFA]"
                            }`}
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              scale: 1,
                              borderColor:
                                currentQuestionIndex > 4
                                  ? [
                                      "#ff0000",
                                      "#ff4444",
                                      "#cc0000",
                                      "#ff6666",
                                      "#990000",
                                      "#ff3333",
                                      "#ff0000",
                                    ]
                                  : "#D71BFA",
                              boxShadow:
                                currentQuestionIndex > 4
                                  ? [
                                      "0 0 20px #ff0000",
                                      "0 0 40px #ff4444",
                                      "0 0 25px #cc0000",
                                      "0 0 35px #ff6666",
                                      "0 0 30px #990000",
                                      "0 0 45px #ff3333",
                                      "0 0 20px #ff0000",
                                    ]
                                  : "0 0 10px rgba(215, 27, 250, 0.3)",
                            }}
                            exit={{ opacity: 0, y: -50, scale: 0.9 }}
                            transition={{
                              duration: 0.6,
                              ease: "easeInOut",
                              borderColor:
                                currentQuestionIndex > 4
                                  ? {
                                      duration: 0.5,
                                      repeat: Infinity,
                                      repeatType: "loop",
                                    }
                                  : { duration: 0.6 },
                              boxShadow:
                                currentQuestionIndex > 4
                                  ? {
                                      duration: 0.5,
                                      repeat: Infinity,
                                      repeatType: "loop",
                                    }
                                  : { duration: 0.6 },
                            }}
                          >
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2, duration: 0.4 }}
                            >
                              <p className="bg-[#011B0D] rounded-10 px-3 py-2 text-xs text-[#04DA6A] font-outfit">
                                Question {currentQuestionIndex}
                              </p>
                            </motion.div>

                            {/* <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3, duration: 0.5 }}
                            >
                              <h2 className="text-white text-xl 2xl:text-2xl text-center font-gilroyMedium font-extrabold">
                                {mqttQuestionData?.question ||
                                  "Waiting for question..."}
                              </h2>
                            </motion.div> */}

                            <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <h2 
        ref={textRef}
        className={`text-white ${fontSize} text-center font-gilroyMedium font-extrabold line-clamp-2`}
      >
        {mqttQuestionData?.question || "Waiting for question..."}
      </h2>
    </motion.div>

                            <motion.div
                              className="flex justify-center items-center w-full gap-4"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.4, duration: 0.4 }}
                            >
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
                                  {formatAmount(
                                    Number(
                                      mqttQuestionData?.allocated_winning_amount
                                    )
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
                                  {formatAmount(
                                    Number(
                                      balanceData?.data?.balances?.find(
                                        (balance) =>
                                          balance.contestant_id ===
                                          user?.contestant_id
                                      )?.actual_balance || 0
                                    )
                                  )}
                                </GlowyStrokeText>
                              </div>
                            </motion.div>
                          </motion.div>
                        </AnimatePresence>

                        {/* Also animate the options grid with AnimatePresence */}
                        <AnimatePresence mode="wait">
                          {mqttQuestionData ? (
                            <motion.div
                              key={`options-${currentQuestionIndex}-${mqttQuestionData?.question_id}`}
                              className="grid grid-cols-2 gap-[.625rem] mt-[.625rem]"
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
                                const showResult = isSubmitted && correctAnswer;
                                const isSelected = selectedOption === option;

                                return (
                                  <motion.button
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
                                      mqttAnswerData &&
                                        mqttQuestionData?.correct_option ===
                                          convertOptionToLetter(option)
                                        ? "!bg-[#04DA6A]/20 !border-[#04DA6A] !text-[#04DA6A] font-bold !opacity-100"
                                        : ""
                                    )}
                                    initial={{
                                      opacity: 0,
                                      x: index % 2 === 0 ? -20 : 20,
                                    }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{
                                      delay: 0.6 + index * 0.1,
                                      duration: 0.4,
                                      type: "spring",
                                      stiffness: 100,
                                    }}
                                    whileHover={
                                      !isSubmitted && timerActive
                                        ? {
                                            scale: 1.02,
                                            borderColor: "#FCCE19",
                                          }
                                        : {}
                                    }
                                    whileTap={
                                      !isSubmitted && timerActive
                                        ? { scale: 0.98 }
                                        : {}
                                    }
                                  >
                                    {optionLetter}:
                                    <span className="ml-2">
                                      {mqttQuestionData[option] || `...`}
                                    </span>
                                  </motion.button>
                                );
                              })}
                            </motion.div>
                          ) : (
                            <motion.div
                              key="loading"
                              className="flex justify-center items-center h-full mt-4"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {mqttAnswerData && (openModals || showModal) && (
                        <GameResultModal
                          key={`${user?.contestant_id}-${currentQuestionIndex}-${currentQuestionId}`}
                          isOpen={true} // Force to true since we're conditionally rendering
                          data={
                            currentQuestionIndex > 4
                              ? mqttAnswerResultData || mqttAnswerData
                              : mqttAnswerData
                          }
                          questions={mqttQuestionData}
                        />
                      )}
                    </>
                  )}
                  <div className="">
                    <FastestFingerResult
                      key={`${user?.contestant_id}-${currentQuestionIndex}-${currentQuestionId}`}
                      resultArray={
                        currentQuestionIndex > 4
                          ? mqttAnswerResultData || mqttAnswerData
                          : mqttAnswerData
                      }
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
            balanceData={balanceData}
            mqttAnswerData={
              currentQuestionIndex > 4 ? mqttAnswerResultData : mqttAnswerData
            }
          />
        </div>
      </div>

      {/* <ErrorModal
        isErrorModalOpen={isErrorModalOpen}
        setErrorModalState={() => {
          setErrorModalState(false);
        }}
        subheading={
          errorModalMessage || "Please check your inputs and try again."
        }
      ></ErrorModal> */}
    </>
  );
};

export default QuestionTwoScreen;
