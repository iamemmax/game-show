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

  // Initialize with the question array data
  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);

  // State declarations
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

  // Add new state variables for user-specific bid amounts
  const [userBidAmounts, setUserBidAmounts] = useState<{
    [key: string]: number;
  }>({});

  // Add a direct console log when the component mounts to check initial state
  useEffect(() => {
    console.log("Component mounted, initial userBidAmounts:", userBidAmounts);
  }, []);

  const [selectedBidValue, setSelectedBidValue] = useState<number>(0);

  // Add state to track the current question ID from MQTT events
  // const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(null);

  // Add a derived state for the question ID to submit
  const [questionIdToSubmit, setQuestionIdToSubmit] = useState<number | null>(
    null
  );

  // Add a new state to store the question data from MQTT events
  const [mqttQuestionData, setMqttQuestionData] = useState<any>(null);

  // Update questionIdToSubmit whenever currentQuestionIndex changes
  useEffect(() => {
    if (
      selectedQuestions.length > 0 &&
      currentQuestionIndex >= 0 &&
      currentQuestionIndex < selectedQuestions.length
    ) {
      const currentQuestion = selectedQuestions[currentQuestionIndex];
      if (currentQuestion?.questions?.question_id) {
        const newQuestionId = currentQuestion.questions.question_id;
        console.log(
          "Updating questionIdToSubmit from current question:",
          newQuestionId
        );
        setQuestionIdToSubmit(newQuestionId);
      }
    }
  }, [currentQuestionIndex, selectedQuestions]);

  // Also update questionIdToSubmit when we receive MQTT question data
  useEffect(() => {
    if (mqttQuestionData?.question?.questions?.question_id) {
      const newQuestionId = mqttQuestionData.question.questions.question_id;
      console.log("Updating questionIdToSubmit from MQTT data:", newQuestionId);
      setQuestionIdToSubmit(newQuestionId);
    }
  }, [mqttQuestionData]);

  // Type-safe handling of question data without sorting
  useEffect(() => {
    if (Array.isArray(questionData?.data?.hustle_questions)) {
      // Use the original order from the API without sorting
      setSelectedQuestions(questionData.data.hustle_questions);

      // Initialize questionIdToSubmit with the first question's ID if available
      if (questionData.data.hustle_questions.length > 0) {
        const firstQuestionId =
          questionData.data.hustle_questions[0]?.questions?.question_id;
        if (firstQuestionId && !questionIdToSubmit) {
          console.log(
            "Initializing questionIdToSubmit with first question ID:",
            firstQuestionId
          );
          setQuestionIdToSubmit(Number(firstQuestionId));
        }
      }
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
    console.log("handleAmountSelect called with amount:", amount);

    // Only allow selection if timer is active and not submitted yet
    if (timerActive && !isSubmitted && timeLeft > 0) {
      // Find the exact key that matches the amount
      const exactKey = Object.keys(userBidAmounts).find(
        (key) => Math.abs(parseFloat(key) - amount) < 0.01
      );

      if (exactKey) {
        console.log(
          "Found exact key:",
          exactKey,
          "with value:",
          userBidAmounts[exactKey]
        );
        setSelectedAmount(parseFloat(exactKey));
        setSelectedBidValue(userBidAmounts[exactKey]);
      } else {
        console.warn("No exact key found for amount:", amount);
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

  // Timer effect
  useEffect(() => {
    // This is the critical guard - timer should not run if not active
    if (!timerActive) {
      console.log("Timer not active, not starting countdown");
      return;
    }


    if (timeLeft <= 0) {
      console.log("Time's up! Showing next button and fetching answer");
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
      console.log("Decreasing timer by 1 second");
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => {
      console.log("Clearing timer");
      clearTimeout(timer);
    };
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

    const answerLetter = convertOptionToLetter(selectedOption);
    const formattedTimestamp = formatTimestamp(new Date());
    const formattedGameStartTime = formatTimestamp(gameStartTime as Date);
    setIsSubmitted(true);
    setShowNextButton(true); // Enable the Next button after submission

    // Find the exact string key from the backend that matches the selected amount
    const selectedAmountKey = Object.keys(userBidAmounts).find(
      (key) => Math.abs(parseFloat(key) - selectedAmount) < 0.01
    );

    // Use the exact key string from the backend (e.g., "15000.00")
    const amountToStake = selectedAmountKey || selectedAmount.toFixed(2);

    // Get the question ID to submit - prioritize MQTT data, then fall back to selected questions
    const questionId =
      mqttQuestionData?.question?.questions?.question_id ||
      selectedQuestions[currentQuestionIndex]?.questions?.question_id ||
      questionIdToSubmit;

    console.log("Submitting answer for question ID:", questionId);
    console.log("Amount to stake:", amountToStake);
    console.log("Selected option:", answerLetter);

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
          console.log(
            "Successfully submitted answer for question ID:",
            questionId
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
      (key) => Math.abs(parseFloat(key) - selectedAmount) < 0.01
    );

    // Use the exact key string from the backend (e.g., "15000.00")
    const amountToStake = selectedAmountKey || selectedAmount.toFixed(2);

    // Get the question ID to submit - prioritize MQTT data, then fall back to selected questions
    const questionId =
      mqttQuestionData?.question?.questions?.question_id ||
      selectedQuestions[currentQuestionIndex]?.questions?.question_id ||
      questionIdToSubmit;

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

  // // Add useEffect for MQTT message handling
  // useEffect(() => {
  //   if (isConnected) {
  //     const handler = (receivedMessage: any) => {
  //       console.log("Question screen received message:", receivedMessage);

  //       // Log the entire message structure for debugging
  //       console.log("Full message structure:", JSON.stringify(receivedMessage, null, 2));

  //       // Handle question reveal events
  //       if (
  //         receivedMessage?.event &&
  //         (receivedMessage.event.startsWith("game_s1_question_reveal") ||
  //          receivedMessage.event === "game_s1_question_reveal")
  //       ) {
  //         console.log("Processing question reveal event:", receivedMessage.event);

  //         // Try to find spend_breakdown in various locations
  //         let spendBreakdown = null;
  //         let questionData = null;

  //         // Check payload.data path
  //         if (receivedMessage?.payload?.data) {
  //           questionData = receivedMessage.payload.data;
  //           console.log("Found question data in payload.data");

  //           if (Array.isArray(questionData.spend_breakdown)) {
  //             spendBreakdown = questionData.spend_breakdown;
  //             console.log("Found spend_breakdown in payload.data.spend_breakdown");
  //           }
  //         }

  //         // Check payload directly
  //         if (!spendBreakdown && receivedMessage?.payload?.spend_breakdown) {
  //           spendBreakdown = receivedMessage.payload.spend_breakdown;
  //           console.log("Found spend_breakdown in payload.spend_breakdown");
  //         }

  //         // Check data directly
  //         if (!spendBreakdown && receivedMessage?.data?.spend_breakdown) {
  //           spendBreakdown = receivedMessage.data.spend_breakdown;
  //           console.log("Found spend_breakdown in data.spend_breakdown");
  //         }

  //         // Store question data if found
  //         if (questionData) {
  //           setMqttQuestionData(questionData);

  //           // Reset state for the new question
  //           setSelectedOption(null);
  //           setIsSubmitted(false);
  //           resetTimerState();

  //           // Set the current question index
  //           if (questionData.question_index) {
  //             setCurrentQuestionIndex(questionData.question_index - 1);
  //           }

  //           // Update the question ID to submit
  //           if (questionData.question?.questions?.question_id) {
  //             setQuestionIdToSubmit(questionData.question.questions.question_id);
  //           } else if (receivedMessage.payload?.question_id) {
  //             setQuestionIdToSubmit(Number(receivedMessage.payload.question_id));
  //           }
  //         }

  //         // Process spend breakdown if found
  //         if (spendBreakdown) {
  //           console.log("Processing spend_breakdown:", spendBreakdown);

  //           const currentUserId = user?.contestant_id;
  //           console.log("Current user ID:", currentUserId);

  //           // Find the current user's data in the spend_breakdown
  //           const userData = spendBreakdown.find(
  //             (contestant: any) => contestant.contestant_id === currentUserId
  //           );

  //           console.log("User data found:", userData);

  //           if (userData && userData.spend_breakdown) {
  //             console.log("Setting userBidAmounts to:", userData.spend_breakdown);

  //             // Store the user's bid amounts
  //             setUserBidAmounts(userData.spend_breakdown);

  //             // Set default selected amount to the first amount
  //             const bidKeys = Object.keys(userData.spend_breakdown);

  //             if (bidKeys.length > 0) {
  //               const firstKey = bidKeys[0];
  //               console.log("Setting selectedAmount to:", parseFloat(firstKey));
  //               setSelectedAmount(parseFloat(firstKey));
  //               setSelectedBidValue(userData.spend_breakdown[firstKey]);
  //             }
  //           } else {
  //             console.warn("No user data found in spend_breakdown for ID:", currentUserId);
  //           }
  //         } else {
  //           console.warn("No spend_breakdown found in message");
  //         }
  //       }

  //       // Handle timer start events
  //       if (
  //         receivedMessage?.event &&
  //         receivedMessage.event.startsWith("game_s1_timer_start")
  //       ) {
  //         // Start timer for current question
  //         handleStartTimer();
  //       }

  //       if (receivedMessage?.event === "game_s1_results_reveal") {
  //         // Proceed to the next stage
  //         setAllQuestionsCompleted(true);
  //       }
  //     };

  //     // Register the message handler
  //     onMessage(handler);

  //     // Clean up function to remove the handler when component unmounts
  //     return () => {
  //       onMessage(null);
  //     };
  //   }
  // }, [isConnected, onMessage, user?.contestant_id]);

  // // Debug logging for questionIdToSubmit changes
  // useEffect(() => {
  //   if (isConnected) {
  //     const handler = (receivedMessage: any) => {
  //       console.log("Question screen received message:", receivedMessage);

  //       // Handle question reveal events
  //       if (
  //         receivedMessage?.event &&
  //         (receivedMessage.event.startsWith("game_s1_question_reveal") ||
  //          receivedMessage.event === "game_s1_question_reveal")
  //       ) {
  //         console.log("Processing question reveal event:", receivedMessage.payload.data);

  //         if (receivedMessage?.payload?.data) {
  //           const questionData = receivedMessage.payload.data;

  //           // Store the question data
  //           setMqttQuestionData(questionData);

  //           // Set question-related states
  //           if (questionData.question_index) {
  //             setCurrentQuestionIndex(questionData.question_index - 1);
  //           }

  //           if (questionData.question?.questions?.question_id) {
  //             setQuestionIdToSubmit(questionData.question.questions.question_id);
  //           } else if (receivedMessage.payload?.question_id) {
  //             setQuestionIdToSubmit(Number(receivedMessage.payload.question_id));
  //           }

  //           // Reset answer-related states only
  //           setSelectedOption(null);
  //           setIsSubmitted(false);

  //           // Handle timer reset carefully
  //           resetTimerState();
  //         }
  //       }

  //       // Handle timer start events
  //       if (
  //         receivedMessage?.event &&
  //         receivedMessage.event.startsWith("game_s1_timer_start")
  //       ) {
  //         handleStartTimer();
  //       }

  //       if (receivedMessage?.event === "game_s1_results_reveal") {
  //         setAllQuestionsCompleted(true);
  //       }
  //     };

  //     onMessage(handler);
  //     return () => onMessage(null);
  //   }
  // }, [isConnected, onMessage, user?.contestant_id]);

  // // Handle bid amounts in a separate, dedicated useEffect
  // useEffect(() => {
  //   if (mqttQuestionData?.spend_breakdown && user?.contestant_id) {
  //     console.log("=== Processing bid amounts ===");
  //     console.log("spend_breakdown:", mqttQuestionData.spend_breakdown);
  //     console.log("user ID:", user.contestant_id);

  //     const userData = mqttQuestionData.spend_breakdown.find(
  //       (contestant: any) => contestant.contestant_id === user.contestant_id
  //     );

  //     console.log("Found user data:", userData);

  //     if (userData?.spend_breakdown) {
  //       console.log("Setting bid amounts:", userData.spend_breakdown);

  //       // Set bid amounts
  //       setUserBidAmounts(userData.spend_breakdown);

  //       // Set default selection
  //       const bidKeys = Object.keys(userData.spend_breakdown);
  //       if (bidKeys.length > 0) {
  //         const firstAmount = parseFloat(bidKeys[0]);
  //         const firstBidValue = userData.spend_breakdown[bidKeys[0]];

  //         console.log("Setting default selection:", { firstAmount, firstBidValue });
  //         setSelectedAmount(firstAmount);
  //         setSelectedBidValue(firstBidValue);
  //       }
  //     } else {
  //       console.warn("No user data found for contestant_id:", user.contestant_id);
  //       console.log("Available contestants:",
  //         mqttQuestionData.spend_breakdown.map((c: Contestant) => ({
  //           id: c.contestant_id,
  //           name: c.contestant_name
  //         }))
  //       );
  //     }
  //   }
  // }, [mqttQuestionData?.spend_breakdown, user?.contestant_id]);

  // Add a direct effect to initialize userBidAmounts when mqttQuestionData changes
  // useEffect(() => {
  //   if (mqttQuestionData?.spend_breakdown && user?.contestant_id) {
  //     console.log("=== Processing bid amounts from mqttQuestionData ===");
  //     console.log("spend_breakdown:", mqttQuestionData.spend_breakdown);
  //     console.log("user ID:", user.contestant_id);

  //     const userData = mqttQuestionData.spend_breakdown.find(
  //       (contestant: any) => contestant.contestant_id === user.contestant_id
  //     );

  //     console.log("Found user data:", userData);

  //     if (userData?.spend_breakdown) {
  //       console.log("Setting bid amounts directly from mqttQuestionData:", userData.spend_breakdown);

  //       // Set bid amounts
  //       setUserBidAmounts({...userData.spend_breakdown});

  //       // Set default selection
  //       const bidKeys = Object.keys(userData.spend_breakdown);
  //       if (bidKeys.length > 0) {
  //         const firstAmount = parseFloat(bidKeys[0]);
  //         const firstBidValue = userData.spend_breakdown[bidKeys[0]];

  //         console.log("Setting default selection:", { firstAmount, firstBidValue });
  //         setSelectedAmount(firstAmount);
  //         setSelectedBidValue(firstBidValue);
  //       }
  //     } else {
  //       console.warn("No user data found for contestant_id:", user.contestant_id);
  //       console.log("Available contestants:",
  //         mqttQuestionData.spend_breakdown.map((c: any) => ({
  //           id: c.contestant_id,
  //           name: c.contestant_name
  //         }))
  //       );
  //     }
  //   }
  // }, [mqttQuestionData, user?.contestant_id]);

  useEffect(() => {
    if (!isConnected) return;

    const handler = (receivedMessage: any) => {
      console.log("📥 MQTT message received:", JSON.stringify(receivedMessage, null, 2));

      const { event, payload, data } = receivedMessage;

      // ✅ Handle Question Reveal
      if (
        event?.startsWith("game_s1_question_reveal") ||
        event === "game_s1_question_reveal"
      ) {
        console.log("✅ Processing question reveal event");
        
        // Extract question data from multiple possible locations
        let questionData = payload?.data || payload || data || {};
        
        // Extract spend breakdown from multiple possible locations
        let spendBreakdown =
          questionData?.spend_breakdown ||
          payload?.spend_breakdown ||
          data?.spend_breakdown ||
          receivedMessage?.spend_breakdown ||
          null;

        console.log("📊 Question data:", JSON.stringify(questionData, null, 2));
        console.log("💰 Spend breakdown:", JSON.stringify(spendBreakdown, null, 2));

        setMqttQuestionData?.(questionData);

        // 🧠 Reset state for new question
        setSelectedOption?.(null);
        setIsSubmitted?.(false);
        if (resetTimerState && typeof resetTimerState === 'function') {
          resetTimerState();
        }

        // Set question index
        if (questionData.question_index !== undefined && questionData.question_index !== null) {
          setCurrentQuestionIndex?.(questionData.question_index - 1);
        }

        // Set question ID for submission
        if (questionData.question?.questions?.question_id) {
          setQuestionIdToSubmit?.(questionData.question.questions.question_id);
        } else if (payload?.question_id) {
          setQuestionIdToSubmit?.(Number(payload.question_id));
        } else if (questionData?.question_id) {
          setQuestionIdToSubmit?.(Number(questionData.question_id));
        }

        // ✅ Extract and store user bid info
        if (spendBreakdown && user?.contestant_id) {
          console.log("🔍 Looking for contestant_id:", user.contestant_id);
          
          // Handle both array and object formats
          let userData = null;
          
          if (Array.isArray(spendBreakdown)) {
            userData = spendBreakdown.find(
              (contestant: any) =>
                String(contestant.contestant_id) === String(user.contestant_id)
            );
          } else if (typeof spendBreakdown === 'object') {
            // If it's an object, check if it contains the user's data directly
            userData = spendBreakdown[user.contestant_id] || spendBreakdown;
          }

          console.log("🧾 User bid data found:", JSON.stringify(userData, null, 2));

          if (userData?.spend_breakdown) {
            setUserBidAmounts?.(userData.spend_breakdown);

            // Set initial bid selection
            const bidKeys = Object.keys(userData.spend_breakdown);
            if (bidKeys.length > 0) {
              const firstAmount = parseFloat(bidKeys[0]);
              const firstBidValue = userData.spend_breakdown[bidKeys[0]];
              setSelectedAmount?.(firstAmount);
              setSelectedBidValue?.(firstBidValue);
              console.log("💵 Initial bid set:", { amount: firstAmount, value: firstBidValue });
            }
          } else if (userData && typeof userData === 'object') {
            // If userData is the spend breakdown itself
            setUserBidAmounts?.(userData);
            
            const bidKeys = Object.keys(userData);
            if (bidKeys.length > 0) {
              const firstAmount = parseFloat(bidKeys[0]);
              const firstBidValue = userData[bidKeys[0]];
              setSelectedAmount?.(firstAmount);
              setSelectedBidValue?.(firstBidValue);
              console.log("💵 Initial bid set (direct):", { amount: firstAmount, value: firstBidValue });
            }
          } else {
            console.warn("⚠️ No spend_breakdown found for user:", user.contestant_id);
            console.warn("Available data:", Object.keys(spendBreakdown));
          }
        } else {
          console.warn("⚠️ Missing spend_breakdown or user contestant_id");
          console.warn("Spend breakdown exists:", !!spendBreakdown);
          console.warn("User contestant_id:", user?.contestant_id);
        }

        // Extract general bid options if available
        if (questionData?.bid_options || payload?.bid_options || data?.bid_options) {
          const bidOptions = questionData.bid_options || payload.bid_options || data.bid_options;
          console.log("🎯 Bid options available:", bidOptions);
          // Set bid options if you have a setter for it
          // setBidOptions(bidOptions);
        }
      }

      // 🕒 Handle timer start
      if (event?.startsWith("game_s1_timer_start") || event === "game_s1_timer_start") {
        console.log("⏰ Timer start event received");
        if (handleStartTimer && typeof handleStartTimer === 'function') {
          handleStartTimer();
        }
      }

      // ✅ Handle results reveal
      if (event === "game_s1_results_reveal") {
        console.log("📊 Results reveal event received");
        setAllQuestionsCompleted?.(true);
      }
    };

    onMessage(handler);
    return () => {
      onMessage(null); // cleanup
    };
  }, [isConnected, onMessage, user?.contestant_id]);
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
                              width={30}
                              height={35}
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
                              Question{" "}
                              {mqttQuestionData?.question_index ||
                                currentQuestionIndex + 1}
                            </p>
                          </div>
                          <div className="">
                            <h2 className="text-white text-xl 2xl:text-2xl text-center font-gilroyMedium font-extrabold">
                              {mqttQuestionData?.question?.questions
                                ?.question ||
                                selectedQuestions[currentQuestionIndex]
                                  ?.questions?.question}
                            </h2>
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
                                  ?.question_booster ||
                                  selectedQuestions[currentQuestionIndex]
                                    ?.questions?.question_booster}{" "}
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
                                    Number(
                                      dataBalance?.data?.balances?.find(
                                        (balance) =>
                                          balance.contestant_id ===
                                          user?.contestant_id
                                      )?.balance ||
                                        // Use wallet balance from MQTT data if available
                                        mqttQuestionData?.spend_breakdown?.find(
                                          (contestant: any) =>
                                            contestant.contestant_id ===
                                            user?.contestant_id
                                        )?.wallet_balance ||
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
                              mqttQuestionData?.question?.questions ||
                              selectedQuestions[currentQuestionIndex]
                                ?.questions ||
                              {};

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

                        {/* Amount buttons section */}
                        <div className="flex flex-col items-start gap-1 mt-7">
                          <div className="flex items-center w-full">
                            <div className="flex flex-1 items-center">
                              <div className="flex gap-2">
                                {userBidAmounts &&
                                Object.keys(userBidAmounts).length > 0 ? (
                                  Object.entries(userBidAmounts).map(
                                    ([amountKey, bidValue]) => {
                                      const amount = parseFloat(amountKey);
                                      return (
                                        <div
                                          key={amountKey}
                                          className="flex flex-col items-center"
                                        >
                                          <Button
                                            onClick={() =>
                                              handleAmountSelect(amount)
                                            }
                                            disabled={
                                              !timerActive ||
                                              isSubmitted ||
                                              timeLeft <= 0
                                            }
                                            aria-pressed={
                                              selectedAmount === amount
                                            }
                                            className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                              selectedAmount === amount
                                                ? "bg-[#04DA6A] text-black"
                                                : "bg-[#011B0D] text-[#04DA6A] border-dashed border-[0.5px] border-[#04DA6A]"
                                            } ${
                                              !timerActive ||
                                              isSubmitted ||
                                              timeLeft <= 0
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
                                  <div className="text-white text-sm">
                                    Waiting for bid options... (ID:{" "}
                                    {user?.contestant_id})
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="items-end justify-end">
                              {/* Submit button - only show if not submitted yet AND time hasn't elapsed */}
                              {!isSubmitted && (
                                <Button
                                  className="p-0 bg-transparent"
                                  onClick={handleSubmitAnswer}
                                  disabled={
                                    !timerActive ||
                                    !selectedOption ||
                                    isSubmitted ||
                                    !userBidAmounts ||
                                    Object.keys(userBidAmounts).length === 0
                                  }
                                >
                                  <GradientButton
                                    text="Submit"
                                    className={`uppercase ${!timerActive || !selectedOption || !userBidAmounts || Object.keys(userBidAmounts).length === 0 ? "opacity-50" : ""}`}
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
            <HustleSideBar
              showEmptyCard={false}
              showHustlerCard={true}
              eliminated={0}
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

export default QuestionScreen;
