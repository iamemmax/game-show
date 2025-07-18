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
import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy";
import { useMQTT } from "@/hooks/useMqttService";
// import { Dialog } from "@/components/ui/dialog";
import { useParams, useRouter } from "next/navigation";
import HustleSideBar from "@/app/components/stages/components/hustle/HustleSideBar";
import HustleStages from "@/app/components/stages/components/hustle/HustleStages";
import { contestantImages } from "@/app/components/stages/components/mocks/contestantImages";
import GetHustleBoardReadyScreen from "./GettHustleBoardReadyScreen";
import { useGetAllHustleQuestions } from "@/app/components/stages/api/stage1/question/getHustleQuestion";
// import { useGetQuestionAnswer } from "@/app/components/stages/api/stage1/question/getQuestionAnswer";
import FastestFingerResult from "@/app/components/stages/components/hustle/FastestFingerResult";
import HustleBoardStageTallyPage from "./HustleBoardStageTally";
import HustleQuestionAnswerModal from "./modals/HustleQuestionAnswer";
import AnimatedText from "@/app/shared/AnimatedText";
import { ContestantSpend } from "@/app/components/type";
import { AnimatedAmount } from "@/app/shared/AnimatedAmount";

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

interface Prop {
  onNext: () => void;
}

// import typewriterSfx from "@/sounds/typewriter.mp3"; // Replace with your sound file

const Stage1QuestionScreen = ({ onNext }: Prop) => {
  const { isConnected, addMessageListener, removeMessageListener } = useMQTT();
  const params = useParams();

  // Get user from storage
  const user = tokenStorage.getUser();

  // Always call hooks at the top level, even if the result is conditionally used
  const { data: questionData, isLoading } = useGetAllHustleQuestions(
    Number(params?.episodeId)
  );

  // State declarations at the top level
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [selectedOption, setSelectedOption] = useState<OptionKey | null>(null);
  const [showBidPrompt, setShowBidPrompt] = useState(false);

  // const [selectedAmount, setSelectedAmount] = useState(10000); // Default selected amount
  const [isSubmitted, setIsSubmitted] = useState(false);
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
  const [previousWinnings, setPreviousWinnings] = useState<
    Record<string, number>
  >({});

  const [showResultModal, setShowResultModal] = useState(false);
  const [currentQuestionAnswerData, setCurrentQuestionAnswerData] = useState<
    any | null
  >(null);
  const [contestantBids, setContestantBids] = useState<{
    [contestantId: string]: {
      contestant_id: string;
      contestant_name: string;
      bid_amount: number;
      timestamp: string;
      question_id?: string;
      remaining_capital?: number;
      bid_percentage?: string;
    };
  }>({});

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

  const [mqttResultData, setMqttResultData] = useState<any>(null);
  // const [showEliminationModal, setShowEliminationModal] = useState(false);

  // Add new state variables for user-specific bid amounts
  // const [userBidAmounts, setUserBidAmounts] = useState<{
  //   [key: string]: number;
  // }>({});

  // Add refs for timer management
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentQuestionIdRef = useRef<string | null>(null);

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
            // setShouldFetchAnswer(true);
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


// sound
const playBidSelectedSound = () => {
  try {
    const audio = new Audio("/sounds/select-bid.mp3");
    audio.volume = 0.7; // Adjust volume as needed
    audio.play().catch(console.error);
  } catch (error) {
    console.error("Error playing bid selected sound:", error);
  }
};

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
    if (!isConnected) return;

    const handleMQTTMessage = (receivedMessage: any) => {

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
         setShowBidPrompt(true);
        // setResultMessageSent(false);
        setMqttAnswerData(null);
        setShowResultModal(false);
        setCurrentQuestionAnswerData(null);
        // FIXED: Clear contestant bids completely for new question
        setContestantBids({});
        setContestantOption({});

        // 3. Set current index and question ID
        // setCurrentQuestionIndex(questionData.question_index || 1);
        const questionId =
          questionData?.question?.question?.question_id ||
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
            // setUserBidAmounts(userData.spend_breakdown);

            const bidKeys = Object.keys(userData.spend_breakdown);
            if (bidKeys.length > 0) {
              const firstAmount = parseFloat(bidKeys[0]);
              // setSelectedAmount(firstAmount);
            }
          } 
        }
      }

    
if (receivedMessage?.event === "contestant_bid_selected") {
  const payload = receivedMessage.payload || {};
  const {
    contestant_id,
    contestant_name,
    bid_amount,
    timestamp,
    question_id,
    remaining_capital,
    bid_percentage,
  } = payload;

  if (contestant_id && contestant_name && bid_amount !== undefined) {
    // Only update bids for the current question
    if (question_id === currentQuestionId) {
      // Play sound effect for bid selection
      playBidSelectedSound();
      
      setContestantBids((prevBids) => {
        const updatedBids = {
          ...prevBids,
          [contestant_id]: {
            contestant_id,
            contestant_name,
            bid_amount,
            timestamp,
            question_id,
            remaining_capital,
            bid_percentage,
          },
        };

        return updatedBids;
      });
         setShowBidPrompt(false);
    }
  }
}

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
      
      setContestantOption((prevOpt) => {
        const updatedBids = {
          ...prevOpt,
          [contestant_id]: {
            contestant_id,
            contestant_name,
            selected_option,
            is_selected,
            timestamp,
            question_id,
          },
        };

        return updatedBids;
      });
    }
  }
}


      if (receivedMessage?.event === "clear_all_bids") {
        setContestantOption({});
      }
      if (receivedMessage?.event === "clear_all_options") {
        setContestantOption({});
      }

      if (receivedMessage?.event === "game_s1_question_bids_reveal") {
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

      // ... rest of your message handlers remain the same
      if (receivedMessage?.event === "game_s1_question_answer") {
        const payload = receivedMessage.payload || {};
        // console.log(payload);

        const questionId = payload?.data?.question?.question_id;

        if (
          questionId?.toString() === currentQuestionIdRef?.current?.toString()
        ) {
          const answersData = payload?.data?.answers;

          setMqttAnswerData(answersData);
          setMqttResultData(answersData);

          if (payload?.question?.correct_option) {
            setCorrectAnswer(payload?.data?.question?.correct_option);
            setIsSubmitted(true);
            setTimerActive(false);
          }
        }
      }

      if (receivedMessage.event === "game_s1_timer_start") {
        handleStartTimer();
      }

      if (receivedMessage.event === "game_s1_results_reveal") {
        console.log("📊 Results reveal event received");
        setAllQuestionsCompleted(true);
      }
    };
 if (isConnected) {
      addMessageListener(handleMQTTMessage);
    }

    return () => {
      removeMessageListener(handleMQTTMessage);
    };


  }, [isConnected, addMessageListener, removeMessageListener, user?.contestant_id, currentQuestionId]);

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



  // FIXED: Add this function to reset the timer state for the next question
  const resetTimerState = () => {
    setTimerActive(false);
    setTimeLeft(10);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  // Function to check if a question has been attempted
  const isQuestionAttempted = (idx: number) => {
    return mqttQuestionData?.question?.hustle_reveal?.hustle_number > idx;
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
    setIsSubmitted(false); // Ensure we can make selections
  };

  const [fontSize, setFontSize] = useState("text-4xl 2xl:text-5xl");
  const textRef = useRef(null);
  const getFontSizeClass = (textLength: number) => {
    if (textLength <= 35) {
      return "text-3  xl 2xl:text-[3.75rem]"; // Very short: Big and bold
    } else if (textLength <= 70) {
      return "text-2xl 2xl:text-[3.4375rem]"; // Medium: Still large
    } else if (textLength <= 100) {
      return "text-2xl 2xl:text-[2.125rem]"; // Longer, fit within 2 lines
    } else {
      return "text-xl 2xl:text-[3rem]"; // Fallback: Smaller but readable
    }
  };

  useEffect(() => {
    const questionText =
      mqttQuestionData?.question || "Waiting for question...";
    const newFontSize = getFontSizeClass(questionText.length);
    setFontSize(newFontSize);
  }, [mqttQuestionData?.question]);

  // FIXED: Now all conditional returns come AFTER all hooks have been called
  if (showPrepPage) {
    return <GetHustleBoardReadyScreen />;
  }

  if (allQuestionsCompleted) {
    return (
      <HustleBoardStageTallyPage
        eliminationCount={0}
        removeCount={0}
        activeState={1}
        onNext={() => onNext}
      />
    );
  }
  const handleAmountStart = (id: string) => {
    console.log("Animation started for contestant:", id);
  };

  const handleAmountComplete = (id: string) => {
    console.log("Animation completed for contestant:", id);
  };
  return (
    <>
      <div className="grid grid-cols-[1fr_5fr_1fr] h-full  ">
        {/* Left Sidebar */}
        <div className="flex flex-col justify-between">
          <div className="flex justify-center items-center h-3.5 w-full mt-8">
            <Logo />
          </div>
          <div>
            <HustleStages />
          </div>
          <div className="pb-4 ">
            <Salary4LifeTrophy className="max-xl:h-[13.25rem] " />
          </div>
        </div>

        <div className="flex flex-col justify-between items-center min-h-full">
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
              <div className="absolute inset-[8px] bg-[#13051E] rounded-[.675rem]" />
              <div className="relative">
                <div className="flex justify-between w-full items-start">
                  <div className="text-left  w-full">
                    <h2
                      className="text-[3.75rem] font-lucky text-left font-extrabold  text-black"
                      style={{ WebkitTextStroke: "1.5px #d91fff" }}
                    >
                      Stage 1: Hustle kick off
                    </h2>
                  </div>

               {timerActive&&  <div className="flex items-center justify-center bg-gradient-to-r from-amber-500 to-yellow-500 border-[2px] border-[#C76000] rounded-xl px-3 py-1.5 shadow-md">
        <span
          className={`${
            "text-[40px]"
          } font-extrabold font-lucky text-white whitespace-nowrap`}
          style={{
            WebkitTextStroke: "1.5px #C76000",
            textShadow: "0px 1px 2px rgba(199, 96, 0, 0.5)",
          }}
        >
          
            {`0:${Math.max(0, timeLeft).toString().padStart(2, "0")}`}
        </span>
      </div>}

               {  showBidPrompt&&  <div className="flex items-center justify-center bg-gradient-to-r from-amber-500 to-yellow-500 border-[2px] border-[#C76000] rounded-xl px-3 py-1.5 shadow-md">
        <span
          className={`${
            "text-[40px]"
          } font-extrabold font-lucky text-white whitespace-nowrap`}
          style={{
            WebkitTextStroke: "1.5px #C76000",
            textShadow: "0px 1px 2px rgba(199, 96, 0, 0.5)",
          }}
        >
          
           Lock in Hustle
        </span>
      </div>}
            
                </div>

                <div className="grid mt-8 gap-6 items-start grid-cols-[1fr_2.5fr_1fr]">
                 

                    <div className="flex w-full  gap-4 mt-1">
  {/* Left Column: First 3 contestants */}
<div className="flex flex-col gap-4 w-full">
  {mqttQuestionData?.spend_breakdown?.slice(0, 3).map((spend: ContestantSpend) => {
    const selectedBid = contestantBids?.[spend.contestant_id];
    const selectedOption = contestantOption?.[spend.contestant_id];

    console.log(selectedBid);
    

    const matchingKey = selectedBid
      ? Object.keys(spend.spend_breakdown).find(
          (key) =>
            Math.ceil(Number(key) / 100) * 100 ===
            Math.ceil(Number(selectedBid.bid_amount) / 100) * 100
        )
      : null;

    const potentialWinning = matchingKey
      ? Math.ceil(Number(spend.spend_breakdown[matchingKey]) / 100) * 100
      : 0;

    const previousValue = previousWinnings[spend.contestant_id] || 0;

    // Determine if answer option is selected
    const isAnswerOptionSelected = !!selectedOption;
    
    // Determine if bid is selected but option is not
    const isBidSelectedButOptionNot = !!selectedBid && !selectedOption;

    return (
      <div
        key={spend.contestant_id}
        className={`text-left py-4 px-3  w-full rounded-10 transition-all duration-300 ${
          isAnswerOptionSelected 
            ? "bg-[#011B0D]" // Green background when answer option is selected
            : "bg-[#0F002E]" // Purple background default
        }`}
      >
        <div className="text-white text-base font-gilroyBold font-bold mb-1">
          {spend.contestant_name?.split(" ")[0]}
        </div>

        <div className="grid grid-cols-2 w-full justify-center gap-2">
          {Object.entries(spend.spend_breakdown).map(([amount, value], index) => {
            const parsedAmount = Math.ceil(Number(amount) / 100) * 100;
            const normalizedBidAmount = selectedBid
              ? Math.ceil(Number(selectedBid.bid_amount) / 100) * 100
              : null;

            const isBidSelected = parsedAmount === normalizedBidAmount;

            return (
              <div
                key={`${spend.contestant_id}-${index}`}
                className={`rounded-lg px-3 py-2 text-2xl font-gilroyHeavy transition-all ${
                  isBidSelected
                    ? isAnswerOptionSelected
                      ? "bg-[#00FF47] font-semibold text-black" // Green when both bid and option selected
                      : "bg-[#fff] font-semibold text-black" // White when only bid selected
                    : isAnswerOptionSelected
                      ? "bg-[#004D1A] text-white" // Darker green for unselected bids when option is selected
                      : "bg-[#26005F] text-[#E86FFF]" // Default purple for unselected bids
                }`}
              >
                ₦{parsedAmount.toLocaleString()}
              </div>
            );
          })}
        </div>

        {selectedBid && potentialWinning > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 flex items-center gap-2"
          >
            <div
              className={`text-lg font-gilroyMedium transition-all ${
                isAnswerOptionSelected 
                  ? "text-[#00FF47]" // Green text when answer option is selected
                  : isBidSelectedButOptionNot
                    ? "text-[#FFB800]" // Yellow/orange text when bid selected but option not
                    : "text-white opacity-50" // Default white with opacity
              }`}
            >
              {isAnswerOptionSelected ? "Winning:" : isBidSelectedButOptionNot && "Winning:"}
            </div>
            <div className={`text-lg font-gilroyHeavy font-bold transition-all ${
              isAnswerOptionSelected 
                ? "text-[#00FF47]" // Green amount when answer option is selected
                : isBidSelectedButOptionNot
                  ? "text-[#FFB800]" // Yellow/orange amount when bid selected but option not
                  : "text-[#fff]" // Default white
            }`}>
              <AnimatedAmount
                from={previousValue}
                to={potentialWinning}
                onStart={() => handleAmountStart(String(spend.contestant_id))}
                onComplete={() => handleAmountComplete(String(spend.contestant_id))}
              />
            </div>
          </motion.div>
        )}
      </div>
    );
  })}
</div>

                  </div>
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full ">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        {/* Animated container */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.6 }}
                          className="border-[.3125rem] relative border-[#D71BFA] flex-col flex gap-4 px-[2.12rem] items-center justify-start py-[3rem] rounded-[1.5rem] bg-[#000000]"
                        >
                          <div className="flex gap-x-4 items-center">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                          >
                            <p className="bg-[#011B0D] rounded-10 px-6 py-2 text-2xl text-[#04DA6A] font-outfit">
                              Question{" "}
                              {mqttQuestionData?.question_index || "..."}
                            </p>
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                          >
                            <p className="bg-[#011B0D] rounded-10 px-6 py-2 text-2xl text-[#04DA6A] font-outfit">
                            Owner: {mqttQuestionData?.question?.contestant?.contestant_name?.split((" ")[0])}
                            </p>
                          </motion.div>

                          </div>

                          <motion.div
                          className="py-8"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            ref={textRef}
                          >
                            {mqttQuestionData?.question?.question?.question ? (
                              <>
                                <AnimatedText
                                  text={
                                    mqttQuestionData.question.question.question 

                                  }
                                  // fontSize={fontSize}
                                />
                              </>
                            ) : (
                              <h2 className="text-white text-xl 2xl:text-2xl text-center font-gilroyMedium font-extrabold">
                                Waiting for question from host...
                              </h2>
                            )}
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6 }}
                            className="flex justify-center  absolute  -bottom-9 items-center w-full gap-4"
                          >
                            <div className="bg-[#011B0D] rounded-[12px] py-3 px-8 max-xl:max-w-[170px]">
                              <p
                                className="text-4xl text-white font-extrabold text-center"
                                style={{
                                  WebkitTextStroke: "2px #04DA6A",
                                  textShadow:
                                    "0px 2px 4px rgba(4, 218, 106, 0.5)",
                                }}
                              >
                                {mqttQuestionData?.question?.question
                                  ?.question_booster || "..."}{" "}
                                <span
                                  className="text-4xl font-outfit font-normal text-[#04DA6A]"
                                  style={{
                                    WebkitTextStroke: "0px",
                                    textShadow: "none",
                                  }}
                                >
                                  Booster
                                </span>
                              </p>
                            </div>
                          </motion.div>
                        </motion.div>

                        {/* Animated answer buttons */}
                        <motion.div
                          className="grid grid-cols-2 gap-[.625rem] mt-[3.625rem]"
                          initial="hidden"
                          animate="visible"
                          variants={{
                            hidden: {},
                            visible: {
                              transition: {
                                staggerChildren: 0.12,
                              },
                            },
                          }}
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
                            );
                            const currentQuestions =
                              mqttQuestionData?.question?.question || {};
                            const isCorrect = isCorrectOption(option);
                            const isSelected = selectedOption === option;
                            const showResult = isSubmitted && correctAnswer;

                            return (
                              <motion.button
                                key={option}
                                disabled={true}
                                variants={{
                                  hidden: { opacity: 0, y: 20 },
                                  visible: { opacity: 1, y: 0 },
                                }}
                                className={cn(
                                  "bg-[#000000] border-2 border-[#D71BFA] cursor-none rounded-[.75rem] font-bold text-2xl font-gilroyBold px-4 py-[1.5625rem] text-white text-left relative",
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
                                    !mqttQuestionData?.question?.question) &&
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
                                {isCorrect && showResult && (
                                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                    <div className="bg-[#04DA6A] rounded-full p-1">
                                      <CheckIcon size={16} />
                                    </div>
                                  </div>
                                )}
                                {isSelected && !isCorrect && showResult && (
                                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                    <div className="bg-[#FF3B30] rounded-full p-1">
                                      <ErrorIcon />
                                    </div>
                                  </div>
                                )}
                              </motion.button>
                            );
                          })}
                        </motion.div>
                      </div>
                    </>
                  )}

              

 {/* Right Column: Last 3 contestants */}
 <div className="flex flex-col gap-4 w-full">
  {mqttQuestionData?.spend_breakdown?.slice(3).map((spend: ContestantSpend) => {
    const selectedBid = contestantBids?.[spend.contestant_id];
    const selectedOption = contestantOption?.[spend.contestant_id];

    const matchingKey = selectedBid
      ? Object.keys(spend.spend_breakdown).find(
          (key) =>
            Math.ceil(Number(key) / 100) * 100 ===
            Math.ceil(Number(selectedBid.bid_amount) / 100) * 100
        )
      : null;

    const potentialWinning = matchingKey
      ? Math.ceil(Number(spend.spend_breakdown[matchingKey]) / 100) * 100
      : 0;

    const previousValue = previousWinnings[spend.contestant_id] || 0;

    // Determine if answer option is selected
    const isAnswerOptionSelected = !!selectedOption;
    
    // Determine if bid is selected but option is not
    const isBidSelectedButOptionNot = !!selectedBid && !selectedOption;

    return (
      <div
        key={spend.contestant_id}
        className={`text-left py-4 px-3  w-full rounded-10 transition-all duration-300 ${
          isAnswerOptionSelected 
            ? "bg-[#011B0D]" // Green background when answer option is selected
            : "bg-[#0F002E]" // Purple background default
        }`}
      >
        <div className="text-white text-base font-gilroyBold font-bold mb-1">
          {spend.contestant_name?.split(" ")[0]}
        </div>

        <div className="grid grid-cols-2 w-full justify-center gap-2">
          {Object.entries(spend.spend_breakdown).map(([amount, value], index) => {
            const parsedAmount = Math.ceil(Number(amount) / 100) * 100;
            const normalizedBidAmount = selectedBid
              ? Math.ceil(Number(selectedBid.bid_amount) / 100) * 100
              : null;

            const isBidSelected = parsedAmount === normalizedBidAmount;

            return (
              <div
                key={`${spend.contestant_id}-${index}`}
                className={`rounded-lg px-3 py-2 text-2xl font-gilroyHeavy transition-all ${
                  isBidSelected
                    ? isAnswerOptionSelected
                      ? "bg-[#00FF47] font-semibold text-black" // Green when both bid and option selected
                      : "bg-[#fff] font-semibold text-black" // White when only bid selected
                    : isAnswerOptionSelected
                      ? "bg-[#004D1A] text-white" // Darker green for unselected bids when option is selected
                      : "bg-[#26005F] text-[#E86FFF]" // Default purple for unselected bids
                }`}
              >
                ₦{parsedAmount.toLocaleString()}
              </div>
            );
          })}
        </div>

        {selectedBid && potentialWinning > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 flex items-center gap-2"
          >
            <div
              className={`text-lg font-gilroyMedium transition-all ${
                isAnswerOptionSelected 
                  ? "text-[#00FF47]" // Green text when answer option is selected
                  : isBidSelectedButOptionNot
                    ? "text-[#FFB800]" // Yellow/orange text when bid selected but option not
                    : "text-white opacity-50" // Default white with opacity
              }`}
            >
              {isAnswerOptionSelected ? "Winning:" : isBidSelectedButOptionNot && "Winning:"}
            </div>
            <div className={`text-lg font-gilroyHeavy font-bold transition-all ${
              isAnswerOptionSelected 
                ? "text-[#00FF47]" // Green amount when answer option is selected
                : isBidSelectedButOptionNot
                  ? "text-[#FFB800]" // Yellow/orange amount when bid selected but option not
                  : "text-[#fff]" // Default white
            }`}>
              <AnimatedAmount
                from={previousValue}
                to={potentialWinning}
                onStart={() => handleAmountStart(String(spend.contestant_id))}
                onComplete={() => handleAmountComplete(String(spend.contestant_id))}
              />
            </div>
          </motion.div>
        )}
      </div>
    );
  })}
</div>
                {showResultModal && (
                  <HustleQuestionAnswerModal
                    booster={
                      mqttQuestionData?.question?.question?.question_booster
                    }
                    showBooster={true}
                    currentQuestionOptions={{
                      option_a: mqttQuestionData?.question?.question?.option_a,
                      option_b: mqttQuestionData?.question?.question?.option_b,
                      option_c: mqttQuestionData?.question?.question?.option_c,
                      option_d: mqttQuestionData?.question?.question?.option_d,
                    }}
                    questionIndex={mqttQuestionData?.question_index}
                    correctAnswer={
                      mqttQuestionData?.question?.question?.correct_option
                    }
                    question={mqttQuestionData?.question?.question?.question}
                    currentQuestionAnswerData={currentQuestionAnswerData}
                    currentQuestion={mqttQuestionData}
                    mqttAnswerData={mqttAnswerData}
                  />
                )}

             
              </div>

<div className="">
              <div className="flex items-center gap-x-12 mt-8">
 {questionData?.map((contestant, idx: number) => (
                      <div className="flex flex-col gap-2 items-center" key={idx}>
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
                            width={60}
                            height={60}
                            active={
                              mqttQuestionData?.question?.hustle_reveal
                                ?.hustle_number > contestant?.hustle_number
                            }
                            iconPosition={{ y: 33 }}
                            iconSize={30}
                            className="select-none"
                          />
                        </div>
                        {/* <GlowyStrokeText
                              strokeWidth={2}
                              strokeColor="#7E3CE0"
                              glowColor="#13051e"
                              textclassName="text-base  text-white font-extrabold font-gilroyBold text-center font-extrabold font-gilroyHeavy"
                              fillColor="#fff"
                              glowIntensity={"none"}
                            >
                              2x
                            </GlowyStrokeText> */}
                      </div>
                    ))}
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
            mqttAnswerData={mqttResultData}
          />
        </div>
      </div>
    </>
  );
};

export default Stage1QuestionScreen;
