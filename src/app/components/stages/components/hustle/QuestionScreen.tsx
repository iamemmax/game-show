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

// Add new interface for attempted options
interface AttemptedOption {
  option: string;
}


type SpendBreakdown = {
  [key: string]: number; // e.g. "3333.33": 9999.99
};

type ContestantSpend = {
  contestant_id: number;
  contestant_name: string | null;
  wallet_balance: number;
  max_question_spend: number;
  booster: string;
  spend_breakdown: SpendBreakdown;
};

type QuestionS1SpendEvent = {
  event: "question_s1_spend";
  payload: ContestantSpend[];
};

// Add type for option keys
type OptionKey = "option_a" | "option_b" | "option_c" | "option_d" | "N";

// Add helper function to convert option_x to letter A-D
const getOptionLetter = (option: OptionKey | null): string => {
  if (!option) return '';
  
  // If the option is already in the format "option_x"
  if (option.startsWith('option_')) {
    // Extract the last character and convert to uppercase
    return option.charAt(option.length - 1).toUpperCase();
  }
  
  // If the option is already a letter, return it as is
  return option.toUpperCase();
};

/**
 * Converts option format (e.g., "option_a") to letter format (e.g., "A")
 * @param option The option in format "option_a", "option_b", etc.
 * @returns The corresponding letter "A", "B", etc. or empty string if invalid
 */
const convertOptionToLetter = (option: string | null): string => {
  if (!option) return '';
  
  // Simple mapping for option to letter
  const optionMap: Record<string, string> = {
    'option_a': 'A',
    'option_b': 'B',
    'option_c': 'C',
    'option_d': 'D',
    'N': 'N'  // Add mapping for "N"
  };
  
  return optionMap[option] || '';
};

/**
 * Formats a date to the format YYYY-MM-DD:HH:MM:SS
 * @param date The date to format
 * @returns The formatted date string
 */
const formatTimestamp = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}:${hours}:${minutes}:${seconds}`;
};

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

  const {data: questionData,isLoading} = useGetAllHustleQuestions(user?.game_episode as number);
  // const questionArray = questionData?.data?.hustle_questions || [];
  
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
  const [bidAmount, setBidAmount] = useState<QuestionS1SpendEvent>();
  
  // Add new state variables for user-specific bid amounts
  const [userBidAmounts, setUserBidAmounts] = useState<{[key: string]: number}>({});
  const [userMaxQuestionSpend, setUserMaxQuestionSpend] = useState<number>(0);
  const [userBooster, setUserBooster] = useState<string>("");
  const [selectedBidValue, setSelectedBidValue] = useState<number>(0);
  
  // Array of available amounts to stake
  const amountOptions = [ 10000, 20000, 30000, 50000];

  // Initialize with the question array data
  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);
  
  // Type-safe sorting code that handles string or number hustle_number values
  useEffect(() => {
    if (Array.isArray(questionData?.data?.hustle_questions)) {
      const sortedData = [...questionData.data.hustle_questions].sort((a, b) => {
      // Get hustle numbers with fallback to Infinity for missing values
      const hustleNumA = a.hustle_reveal?.hustle_number;
      const hustleNumB = b.hustle_reveal?.hustle_number;
      
      // Convert both values to numbers to ensure type-safe comparison
      const numA = typeof hustleNumA === 'number' ? hustleNumA : 
      (typeof hustleNumA === 'string' ? parseInt(hustleNumA, 10) : Infinity);
      
      const numB = typeof hustleNumB === 'number' ? hustleNumB : 
      (typeof hustleNumB === 'string' ? parseInt(hustleNumB, 10) : Infinity);
      
      // Now we can safely perform numeric subtraction
      return numA - numB;
    });
    
    // Debug logs
    console.log('Sorted data by hustle_number:', sortedData.map(q => 
      `${q.hustle_reveal?.hustle_name}: ${q.hustle_reveal?.hustle_number}`
    ));
    
    setSelectedQuestions(sortedData);
  } else {
    console.warn("hustle_questions is not an array or is undefined");
  }
}, [questionData]);

  useEffect(() => {
    // Only initialize game start time, but don't start the timer
    if (!gameStartTime) {
      setGameStartTime(new Date());
    }
  }, []);

  // Function to handle amount selection
  const handleAmountSelect = (amount: number) => {
    // Only allow selection if timer is active and not submitted yet
    if (timerActive && !isSubmitted && timeLeft > 0) {
      setSelectedAmount(amount);
      
      // Set the corresponding bid value
      if (userBidAmounts[amount.toFixed(2)]) {
        setSelectedBidValue(userBidAmounts[amount.toFixed(2)]);
      } else {
        // Try with different decimal precision
        const amountKey = Object.keys(userBidAmounts).find(
          key => Math.abs(parseFloat(key) - amount) < 0.01
        );
        
        if (amountKey) {
          setSelectedBidValue(userBidAmounts[amountKey]);
        }
      }
    }
  };

  // Timer effect
  useEffect(() => {
    // This is the critical guard - timer should not run if not active
    if (!timerActive) return;
    
    if (timeLeft <= 0) {
      setShowNextButton(true); // Enable the Next button
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
    }
  };
  
  
  const {mutate: handleAnswerStageOneQuestion} = useAnswerStageOneQuestion();
  // Handle submit answer
  const { data: answerData } = useGetQuestionAnswer(
    shouldFetchAnswer ? (selectedQuestions[currentQuestionIndex]?.questions?.question_id as number) : 0
  );
  const handleSubmitAnswer = () => {
    if (!selectedOption) return;
    
    const currentQuestion = selectedQuestions[currentQuestionIndex];
    const answerLetter = convertOptionToLetter(selectedOption);
    const formattedTimestamp = formatTimestamp(new Date());
    const formattedGameStartTime = formatTimestamp(gameStartTime as Date);
    setIsSubmitted(true);
    setShowNextButton(true); // Enable the Next button after submission

    // Use the actual bid value if available, otherwise use the selected amount
    const amountToStake = selectedBidValue > 0 ? selectedBidValue : selectedAmount;

    handleAnswerStageOneQuestion({
      contestant_id: user?.contestant_id,
      question_id: currentQuestion?.questions?.question_id,
      answer: answerLetter, // Use letter (A, B, C, D) instead of option_x
      amount_staked: amountToStake,
      timestamp: formattedTimestamp,
      question_start_time: formattedGameStartTime, // Add game start time
    },{
      onSuccess: () => {
        // Add to attempted options
        setAttemptedOptions([
          ...attemptedOptions,
          {
            option: selectedOption,
          },
        ]);
      },
      onError: (error) => {
        const errorMessage = formatAxiosErrorMessage(error as AxiosError);
        openErrorModalWithMessage(String(errorMessage));
      },
    });
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
    const currentQuestion = selectedQuestions[currentQuestionIndex];
    const formattedTimestamp = formatTimestamp(new Date());
    const formattedGameStartTime = formatTimestamp(gameStartTime as Date);
    setIsSubmitted(true);
    setShowNextButton(true); // Enable the Next button after auto-submission

    // Use the actual bid value if available, otherwise use the selected amount
    const amountToStake = selectedBidValue > 0 ? selectedBidValue : selectedAmount;

    // Create submission data with "N" as the answer
    handleAnswerStageOneQuestion({
      contestant_id: Number(user?.contestant_id),
      question_id: currentQuestion?.questions?.question_id,
      answer: "N", // "N" for No Answer
      amount_staked: amountToStake,
      timestamp: formattedTimestamp,
      question_start_time: formattedGameStartTime, // Add game start time
    },{
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
    });
  };

  const handleStartTimer = () => {
    setTimerActive(true);
    setGameStartTime(new Date()); // Reset game start time when timer starts
    setTimeLeft(10); // Reset timer to 10 seconds
  };

  // Add useEffect for MQTT message handling
  useEffect(() => {
    if (isConnected) {
      const handler = (receivedMessage: any) => {
        console.log("Question screen received message:", receivedMessage);
        
        // Handle question reveal events (game_s1_question_reveal_1 to game_s1_question_reveal_12)
        if (receivedMessage?.event && receivedMessage.event.startsWith("game_s1_question_reveal_")) {
          const questionNumber = parseInt(receivedMessage.event.split("_").pop(), 10) - 1;
          if (!isNaN(questionNumber) && questionNumber >= 0 && questionNumber < selectedQuestions.length) {
            setCurrentQuestionIndex(questionNumber);
            setSelectedOption(null);
            setIsSubmitted(false);
            resetTimerState();
          }
        }
        
        // Handle timer start events (game_s1_timer_start_1 to game_s1_timer_start_12)
        if (receivedMessage?.event && receivedMessage.event.startsWith("game_s1_timer_start_")) {
          const questionNumber = parseInt(receivedMessage.event.split("_").pop(), 10) - 1;
          if (!isNaN(questionNumber) && currentQuestionIndex === questionNumber) {
            handleStartTimer();
          }
        }

        if (receivedMessage?.event === "game_s1_results_reveal") {
          // Proceed to the next stage
          console.log(receivedMessage?.event);
          
          setAllQuestionsCompleted(true);
        }
        
        // Handle bid amount data
        if (receivedMessage?.event === "question_s1_spend") {
          setBidAmount(receivedMessage as QuestionS1SpendEvent);
          
          // Find the current user's bid data
          const currentUserId = user?.contestant_id;
          const userData = receivedMessage?.payload?.find(
            (contestant: ContestantSpend) => contestant.contestant_id === currentUserId
          );
          
          if (userData) {
            // Store the user's bid amounts
            setUserBidAmounts(userData.spend_breakdown);
            setUserMaxQuestionSpend(userData.max_question_spend);
            setUserBooster(userData.booster);
            
            // Set default selected amount to the first amount
            const bidKeys = Object?.keys(userData.spend_breakdown);
            if (bidKeys.length > 0) {
              const firstKey = bidKeys[0];
              setSelectedAmount(parseFloat(firstKey));
              setSelectedBidValue(userData.spend_breakdown[firstKey]);
            }
          }
        }
      };
      
      // Register the message handler
      onMessage(handler);
      
      // Clean up function to remove the handler when component unmounts
      return () => {
        onMessage(null);
      };
    }
  }, [isConnected, onMessage, currentQuestionIndex, selectedQuestions.length, user?.contestant_id]);



  
  return (
    <>
    {allQuestionsCompleted ? (
      <StageOneTally />
    ) : (
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
            <Salary4LifeTrophy className="max-xl:h-[13.25rem]"/>
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
                      Select minimum of 2 number to determine the trivia questions
                      for this round
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
                 ) 
                
                 
                 }
                </div>

                <div className="grid mt-5 gap-2 grid-cols-[1fr_3fr_1fr]">
                  <div className="flex flex-col">
                    {selectedQuestions?.map((contestant, idx: number) => (
                      <div className="flex gap-2 items-center" key={idx}>
                        <div className="">
                          <NumberCardContainer
                            text={isQuestionAttempted(idx)?<CheckIcon size={160}/>: contestant?.hustle_reveal?.hustle_number}
                            textColor={
                              currentQuestionIndex === idx
                                ? "#FFFFFF"
                                : isQuestionAttempted(idx)
                                  ? "#fff"
                                  : "#F2C94C"
                            }
                            backgroundColor={
                              currentQuestionIndex === idx
                                ? "#FEC124"
                                : isQuestionAttempted(idx)
                                  ? "#04DA6A"
                                  : "black"
                            }
                            width={30}
                            height={35}
                            active={
                              currentQuestionIndex === idx ||
                              isQuestionAttempted(idx)
                            }
                            iconPosition={{y:33}}
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
                      <div className="border-[.3125rem] relative border-[#D71BFA] flex-col flex gap-4 px-[2.12rem] items-center justify-start py-[1rem] rounded-[1.5rem] bg-[#000000]">
                        <div className="">
                          <p className="bg-[#011B0D] rounded-10 px-3 py-2 text-xs text-[#04DA6A] font-outfit">
                            Question{" "}
                            {
                              selectedQuestions[currentQuestionIndex]
                                ?.question_number || (currentQuestionIndex + 1)
                            }
                          </p>
                        </div>
                        <div className="">
                          <h2 className="text-white text-xl 2xl:text-2xl text-center font-gilroyMedium font-extrabold">
                            {
                              selectedQuestions[currentQuestionIndex]?.questions?.question 
                            }
                          </h2>
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
                              {
                                selectedQuestions[currentQuestionIndex]?.questions?.question_booster 
                              }{" "}
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
                              ₦{addCommasToNumber(Number(selectedQuestions[currentQuestionIndex]?.hustle_reveal?.hustle_amount.toFixed(0)?.toLocaleString()))}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {selectedQuestions.length > 0 ? (
                        <>
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
                              const currentQuestions = selectedQuestions[currentQuestionIndex]?.questions || {};
                              
                              return (
                                <button
                                  key={option}
                                  onClick={() => handleOptionSelect(option)}
                                  disabled={!timerActive || isSubmitted}
                                  className={cn(
                                    "bg-[#000000] border-2 border-[#D71BFA] rounded-[.75rem] font-bold text-base font-gilroyBold px-4 py-[.5625rem] text-white text-left",
                                    selectedOption === option &&
                                      "bg-[#FCCE19] border-none text-[#745300]",
                                    (isSubmitted || !timerActive) && "opacity-70 cursor-not-allowed"
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
                                    {currentQuestions[option]}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Amount buttons, Submit and Next buttons */}
                          <div className="flex items-center gap-1 mt-7">
                            <div className="flex flex-1 items-center">
                              <div className="flex gap-2">
                                {Object?.keys(userBidAmounts).length > 0 && (
                                  // Use user-specific bid amounts if available
                                  Object?.keys(userBidAmounts).map((amountKey: string) => {
                                    const amount = parseFloat(amountKey);
                                    const bidValue = userBidAmounts[amountKey];
                                    
                                    return (
                                      <div key={amountKey} className="flex flex-col items-center">
                                        <Button
                                          onClick={() => handleAmountSelect(amount)}
                                          disabled={!timerActive || isSubmitted || timeLeft <= 0}
                                          className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            selectedAmount === amount
                                              ? "bg-[#04DA6A] text-black"
                                              : "bg-[#011B0D] text-[#04DA6A] border-dashed border-[0.5px] border-[#04DA6A]"
                                          }
                                           ${
                                            !timerActive || isSubmitted || timeLeft <= 0
                                              ? "opacity-50 cursor-not-allowed"
                                              : "hover:bg-[#035D2E] hover:text-white"
                                          }
                                          `}
                                        >
                                          ₦{amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                        </Button>
                                        
                                        {selectedAmount === amount && (
                                          <div className="text-xs text-[#04DA6A] mt-1 font-bold">
                                            ₦{bidValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                            
                              {/* Display booster if available
                              {userBooster && (
                                <div className="bg-[#011B0D] rounded-lg px-2 py-1 mr-2">
                                  <span className="text-xs text-[#04DA6A] font-bold">
                                    Booster: {userBooster}
                                  </span>
                                </div>
                              )} */}
                            
                            <div className="items-end justify-end">
                              {/* Submit button - only show if not submitted yet AND time hasn't elapsed */}
                              {!isSubmitted && (
                                <Button
                                  className="p-0 bg-transparent"
                                  onClick={handleSubmitAnswer}
                                  disabled={!timerActive || !selectedOption || isSubmitted}
                                >
                                  <GradientButton
                                    text="Submit"
                                    className={`uppercase ${(!timerActive || !selectedOption) ? 'opacity-50' : ''}`}
                                    width={130}
                                  />
                                </Button>
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-white mt-4">Loading questions...</p>
                      )}
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
          <HustleSideBar showEmptyCard={false} showHustlerCard={true} />
        </div>
      </div>
    )}
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
};

export default QuestionScreen;
