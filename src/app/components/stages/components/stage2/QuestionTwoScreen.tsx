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
import { Button, ErrorModal, GlowyStrokeText } from "@/components/core";
import GradientButton from "@/app/shared/GradientButton";
import Image from "next/image";
import { useGetAllHustleQuestions } from "../../api/stage1/question/getHustleQuestion";
import { contestantImages, revealResults } from "../mocks/contestantImages";
import { addCommasToNumber, formatAxiosErrorMessage } from "@/utils";
import { useAnswerStageOneQuestion } from "../../api/stage1/question/answerQuestion";
import { useErrorModalState } from "@/hooks";
import { AxiosError } from "axios";
import { useGetQuestionAnswer } from "../../api/stage1/question/getQuestionAnswer";
import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy";
import { useMQTT } from "@/hooks/useMqttService";
import FastestFingerResult from "../hustle/FastestFingerResult";
import HustleSideBar from "../hustle/HustleSideBar";
import HustleStages from "../hustle/HustleStages";
import StageOneTally from "../hustle/StageOneTally";
import { processEliminatedContestants } from "@/utils/contestants";
import { useGetWalletBalance } from "../../api/stage1/getbalance";

// Add new interface for attempted options
interface AttemptedOption {
  option: string;
}

// Add type for option keys
type OptionKey = "option_a" | "option_b" | "option_c" | "option_d" | "N";

// Add helper function to convert option_x to letter A-D
const getOptionLetter = (option: OptionKey | null): string => {
  if (!option) return "";

  // If the option is already in the format "option_x"
  if (option.startsWith("option_")) {
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

const QuestionTwoScreen = () => {
  const {
    isErrorModalOpen,
    setErrorModalState,
    openErrorModalWithMessage,
    errorModalMessage,
  } = useErrorModalState();
  const { isConnected, onMessage } = useMQTT();
  // Get user from storage
  const user = tokenStorage.getUser();

  // Get wallet balances to determine eliminated contestants
  const { data: balanceData } = useGetWalletBalance(
    user?.game_episode as number
  );

  const { data: questionData, isLoading } = useGetAllHustleQuestions(
    user?.game_episode as number
  );

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

  // Array of available amounts to stake

  // Initialize with the question array data
  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);

  // Process questions to remove those from eliminated contestants
  useEffect(() => {
    if (
      Array.isArray(questionData?.data?.hustle_questions) && 
      balanceData?.data?.balances
    ) {
      // First, get the IDs of non-eliminated contestants (top performers)
      const topContestants = processEliminatedContestants(
        balanceData.data.balances,
        2, // Eliminate 2 contestants
        true // Remove them from the array
      ).map(contestant => contestant.contestant_id);
      
      
      // Filter questions to only include those from non-eliminated contestants
      const filteredQuestions = questionData.data.hustle_questions.filter(
        question => topContestants.includes(question.contestant?.contestant_id)
      );
      
      
      // Sort the filtered questions by hustle number
      const sortedData = [...filteredQuestions].sort((a, b) => {
        // Get hustle numbers with fallback to Infinity for missing values
        const hustleNumA = a.hustle_reveal?.hustle_number;
        const hustleNumB = b.hustle_reveal?.hustle_number;

        // Convert both values to numbers to ensure type-safe comparison
        const numA =
          typeof hustleNumA === "number"
            ? hustleNumA
            : typeof hustleNumA === "string"
              ? parseInt(hustleNumA, 10)
              : Infinity;

        const numB =
          typeof hustleNumB === "number"
            ? hustleNumB
            : typeof hustleNumB === "string"
              ? parseInt(hustleNumB, 10)
              : Infinity;

        // Now we can safely perform numeric subtraction
        return numA - numB;
      });

      // Debug logs
      console.log(
        "Sorted data by hustle_number:",
        sortedData.map(
          (q) =>
            `${q.hustle_reveal?.hustle_name}: ${q.hustle_reveal?.hustle_number}`
        )
      );

      setSelectedQuestions(sortedData);
    } 
  }, [questionData, balanceData]);

  useEffect(() => {
    // Only initialize game start time, but don't start the timer
    if (!gameStartTime) {
      setGameStartTime(new Date());
    }
  }, []);

  

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

  const { mutate: handleAnswerStageOneQuestion } = useAnswerStageOneQuestion();
  // Handle submit answer
  const { data: answerData } = useGetQuestionAnswer(
    shouldFetchAnswer
      ? (selectedQuestions[currentQuestionIndex]?.questions
          ?.question_id as number)
      : 0
  );
  const handleSubmitAnswer = () => {
    if (!selectedOption) return;

    const currentQuestion = selectedQuestions[currentQuestionIndex];
    const answerLetter = convertOptionToLetter(selectedOption);
    const formattedTimestamp = formatTimestamp(new Date());
    const formattedGameStartTime = formatTimestamp(gameStartTime as Date);
    setIsSubmitted(true);
    setShowNextButton(true); // Enable the Next button after submission

    handleAnswerStageOneQuestion(
      {
        contestant_id: user?.contestant_id,
        question_id: currentQuestion?.questions?.question_id,
        answer: answerLetter, // Use letter (A, B, C, D) instead of option_x
        amount_staked: selectedAmount,
        timestamp: formattedTimestamp,
        question_start_time: formattedGameStartTime, // Add game start time
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

    // Create submission data with "N" as the answer
    handleAnswerStageOneQuestion(
      {
        contestant_id: Number(user?.contestant_id),
        question_id: currentQuestion?.questions?.question_id,
        answer: "N", // "N" for No Answer
        amount_staked: selectedAmount,
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
    setTimerActive(true);
    setGameStartTime(new Date()); // Reset game start time when timer starts
    setTimeLeft(10); // Reset timer to 10 seconds
  };

  // Add useEffect for MQTT message handling
  useEffect(() => {
    if (isConnected) {
      const handler = (receivedMessage: any) => {
        console.log("Question screen received message:", receivedMessage);

        // Handle question reveal events (game_s2_question_reveal_1 to game_s2_question_reveal_12)
        if (
          receivedMessage?.event &&
          receivedMessage.event.startsWith("game_s2_question_reveal_")
        ) {
          const questionNumber =
            parseInt(receivedMessage.event.split("_").pop(), 10) - 1;
          if (
            !isNaN(questionNumber) &&
            questionNumber >= 0 &&
            questionNumber < selectedQuestions.length
          ) {
            setCurrentQuestionIndex(questionNumber);
            setSelectedOption(null);
            setIsSubmitted(false);
            resetTimerState();
          }
        }

        // Handle timer start events (game_s2_timer_start_1 to game_s2_timer_start_12)
        if (
          receivedMessage?.event &&
          receivedMessage.event.startsWith("game_s2_timer_start_")
        ) {
          const questionNumber =
            parseInt(receivedMessage.event.split("_").pop(), 10) - 1;
          if (
            !isNaN(questionNumber) &&
            currentQuestionIndex === questionNumber
          ) {
            handleStartTimer();
          }
        }

        if (receivedMessage?.event === "game_s2_results_reveal") {
          // Proceed to the next stage
          console.log(receivedMessage?.event);

          setAllQuestionsCompleted(true);
        }
      };

      // Register the message handler
      onMessage(handler);

      // Clean up function to remove the handler when component unmounts
      return () => {
        onMessage(null);
      };
    }
  }, [isConnected, onMessage, currentQuestionIndex, selectedQuestions.length]);

  return (
    <>
      {allQuestionsCompleted ? (
        <StageOneTally eliminationCount={2} removeCount={2}/> 
      ) : (
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

                  <div className="grid mt-5 gap-2 grid-cols-[1fr_3fr_1fr]">
                    <div className="flex flex-col">
                      {selectedQuestions?.map((contestant, idx: number) => (
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
                              width={40}
                              height={45}
                              active={
                                currentQuestionIndex === idx ||
                                isQuestionAttempted(idx)
                              }
                              iconPosition={{ y: 33 }}
                              iconSize={30}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              <div className="h-[1.3rem] w-[1.3rem]  relative">
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
                              {selectedQuestions[currentQuestionIndex]
                                ?.question_number || currentQuestionIndex + 1}
                            </p>
                          </div>
                          <div className="">
                            <h2 className="text-white text-xl 2xl:text-2xl text-center font-gilroyMedium font-extrabold">
                              {
                                selectedQuestions[currentQuestionIndex]
                                  ?.questions?.question
                              }
                            </h2>
                          </div>
                          <div className="flex justify-center items-center w-full gap-4">
                            <div className="bg-[#011B0D] flex justify-center items-center flex-col  rounded-[12px] py-2 px-4 w-full">
                              <p className="text-sm font-outfit font-normal text-[#04DA6A] ">
                                Win amount
                              </p>
                              <GlowyStrokeText
                                strokeWidth={1}
                                strokeColor="#04DA6A"
                                glowColor="#04DA6A"
                                textclassName="text-[20px]  text-white font-extrabold font-gilroyMedium text-center font-extrabold font-gilroyHeavy"
                                fillColor="#fff"
                                glowIntensity={"none"}
                              >
                                ₦
                                {addCommasToNumber(
                                  Number(
                                    selectedQuestions[
                                      currentQuestionIndex
                                    ]?.hustle_reveal?.hustle_amount
                                      .toFixed(0)
                                      ?.toLocaleString()
                                  )
                                )}
                              </GlowyStrokeText>
                            </div>
                            <div className="bg-[#011B0D] flex justify-center items-center flex-col rounded-[12px] py-2 px-4 w-full">
                              <p className="text-sm font-outfit font-normal text-[#04DA6A] ">
                                Capital:{" "}
                              </p>

                              <GlowyStrokeText
                                strokeWidth={1}
                                strokeColor="#04DA6A"
                                glowColor="#04DA6A"
                                glowIntensity="none"
                                textclassName="text-[20px]  text-white font-extrabold font-gilroyMedium text-center font-extrabold font-gilroyHeavy"
                                fillColor="#fff"
                              >
                                ₦
                                {addCommasToNumber(
                                  Number(
                                    selectedQuestions[
                                      currentQuestionIndex
                                    ]?.hustle_reveal?.hustle_amount
                                      .toFixed(0)
                                      ?.toLocaleString()
                                  )
                                )}
                              </GlowyStrokeText>
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
                                const optionLetter = String.fromCharCode(
                                  65 + index
                                ); // A, B, C, D
                                const currentQuestions =
                                  selectedQuestions[currentQuestionIndex]
                                    ?.questions || {};

                                return (
                                  <button
                                    key={option}
                                    onClick={() => handleOptionSelect(option)}
                                    disabled={!timerActive || isSubmitted}
                                    className={cn(
                                      "bg-[#000000] border-2 border-[#D71BFA] rounded-[.75rem] font-bold text-base font-gilroyBold px-4 py-[.5625rem] text-white text-left",
                                      selectedOption === option &&
                                        "bg-[#FCCE19] border-none text-[#745300]",
                                      (isSubmitted || !timerActive) &&
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
                                      {currentQuestions[option]}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Amount buttons, Submit and Next buttons */}
                            <div className="flex items-center gap-1  mt-7">
                              <div className="items-end justify-end">
                                {/* Submit button - only show if not submitted yet AND time hasn't elapsed */}
                                {!isSubmitted && (
                                  <Button
                                    className="p-0 bg-transparent"
                                    onClick={handleSubmitAnswer}
                                    disabled={
                                      !timerActive ||
                                      !selectedOption ||
                                      isSubmitted
                                    }
                                  >
                                    <GradientButton
                                      text="Submit"
                                      className={`uppercase ${!timerActive || !selectedOption ? "opacity-50" : ""}`}
                                      width={130}
                                    />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </>
                        ) : (
                          <p className="text-white mt-4">
                            Loading questions...
                          </p>
                        )}
                      </div>
                    )}
                    <div className="h-full flex w-full">
                      <FastestFingerResult
                        resultArray={answerData}
                        timeElapsed={timeLeft <= 0 || showNextButton}
                        length={4}
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

export default QuestionTwoScreen;
