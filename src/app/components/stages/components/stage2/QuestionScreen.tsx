import Logo from "@/app/icons/Logo";
import Trophy from "@/app/icons/Trophy";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import HustleStages from "../hustle/HustleStages";
import HustleSideBar from "../hustle/HustleSideBar";
import NumberCardContainer from "@/app/shared/NumberContainer";
// import { questionArray } from "../mocks/sampleQuestion";
import { cn } from "@/utils/classNames";
import CheckIcon from "@/app/icons/CheckIcon";
import ErrorIcon from "@/app/icons/ErrorIcon";
import { tokenStorage } from "@/utils/auth";
import { Button } from "@/components/core";
import GradientButton from "@/app/shared/GradientButton";
import Image from "next/image";
import { useGetAllHustleQuestions } from "../../api/stage1/getHustleQuestion";
import { contestantImages, revealResults } from "../mocks/contestantImages";
import { addCommasToNumber } from "@/utils";
import FastestFingerResult from "../hustle/FastestFingerResult";

// Add new interface for attempted options
interface AttemptedOption {
  option: string;
}

// Add type for option keys
type OptionKey = "option_a" | "option_b" | "option_c" | "option_d";

const QuestionScreen = () => {
  // Get user from storage
  const user = tokenStorage.getUser();

  const {data: questionData} = useGetAllHustleQuestions(user?.game_episode as number);
  // const questionArray = questionData?.data?.hustle_questions || [];
  
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<OptionKey | null>(null);
  const [attemptedOptions, setAttemptedOptions] = useState<AttemptedOption[]>([]);
  const [selectedPercentage, setSelectedPercentage] = useState(10); // Start at 10%
  const [selectedAmount, setSelectedAmount] = useState(10000); // 10% of max
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const maxAmount = 100000; // Maximum amount for the range
  const rangeRef = useRef<HTMLInputElement>(null);
  const [rangeAdjusted, setRangeAdjusted] = useState(false); // Track if range has been adjusted

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
  

  // Function to handle range change
  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPercentage = parseInt(e.target.value);
    setSelectedPercentage(newPercentage);
    
    // Calculate the amount based on percentage
    const newAmount = (maxAmount * newPercentage) / 100;
    setSelectedAmount(newAmount);
    
    // Mark that the range has been adjusted
    setRangeAdjusted(true);
    
    console.log("Range adjusted in handler:", true);
    console.log(`Selected: ${newPercentage}% = ₦${newAmount.toLocaleString()}`);
  };

  // Effect to update the range progress
  useEffect(() => {
    if (rangeRef.current) {
      const min = parseInt(rangeRef.current.min);
      const max = parseInt(rangeRef.current.max);
      const progress = ((selectedPercentage - min) / (max - min)) * 100;
      rangeRef.current.style.setProperty('--range-progress', `${progress}%`);
    }
  }, [selectedPercentage]);

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      setShowNextButton(true);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  // Handle option selection - now just selects without checking correctness
  const handleOptionSelect = (option: OptionKey) => {
    // Only allow selection if not submitted yet
    if (!isSubmitted) {
      setSelectedOption(option);
    }
  };

  // Handle submit answer
  const handleSubmitAnswer = () => {
    if (!selectedOption) return;

    const currentQuestion =  selectedQuestions[currentQuestionIndex];

    // Mark as submitted
    setIsSubmitted(true);

    // Add to attempted options
    setAttemptedOptions([
      ...attemptedOptions,
      {
        option: selectedOption,
      },
    ]);

    // Here you would send the data to your API
    const submissionData = {
      contestant_id: user?.contestant_id,
      question_id: currentQuestion?.question?.question_id,
      answer: selectedOption,
      amount_stake: selectedAmount,
      pecentage_stake: selectedPercentage,
      timestamp: new Date().toISOString(), // Add timestamp
    };

    console.log("Submitting answer:", submissionData);

  
  };

  // Handle next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < selectedQuestions?.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
      setTimeLeft(20); // Reset timer for next question
      setShowNextButton(false);
    }
  };

  // Function to check if a question has been attempted
  const isQuestionAttempted = (idx: number) => {
    return idx < currentQuestionIndex;
  };


  return (
    <div className="grid grid-cols-[1.2fr_5fr_1fr] h-full ">
      {/* Left Sidebar */}
      <div className="flex flex-col justify-between">
        <div className="flex justify-center items-center h-3.5 w-full mt-8">
          <Logo />
        </div>
        <div>
          <HustleStages />
        </div>
        <div className="w-full p-[1.4375rem] flex-col rounded-t-[1.75rem] flex justify-center items-center bg-[linear-gradient(to_right,_#2D0304,_#EE24B8,_#1E0227)] text-white">
          <Trophy height={50} width={50} />
          <div className="flex flex-col justify-center pt-1 items-center">
            <p className="uppercase font-bold text-xs font-verdana text-white">
              Stage 2 of 6
            </p>
            <p className="max-w-[100px] text-center mt-1 font-display font-bold text-xs text-white">
              Hustle: Fashion Designer
            </p>
          </div>
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
                    Stage 2: Prove your hustle
                  </h2>
                  <p className="text-sm font-normal text-[#D5B9FF]">
                    Select minimum of 2 number to determine the trivia questions
                    for this round
                  </p>
                </div>

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
              </div>

              <div className="grid mt-5 gap-2 grid-cols-[1fr_3fr_1fr]">
                <div className="flex  flex-col">
                  {selectedQuestions?.map((contestant, idx: number) => (
                    <div className="flex gap-2 items-center" key={idx}>
                      <div className="">
                        <NumberCardContainer
                          text={contestant?.hustle_reveal?.hustle_number}
                          textColor={
                            currentQuestionIndex === idx
                              ? "#FFFFFF"
                              : isQuestionAttempted(idx)
                                ? "#fff"
                                : "#F2C94C"
                          }
                          backgroundColor={
                            currentQuestionIndex === idx
                              ? "#04DA6A"
                              : isQuestionAttempted(idx)
                                ? "#FEC124"
                                : "black"
                          }
                          width={30}
                          height={35}
                          active={
                            currentQuestionIndex === idx ||
                            isQuestionAttempted(idx)
                          }
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-2">
                          <div className="h-[1.2rem] w-[1.2rem] relative">
                            <Image
                              alt="User avatar"
                              src={contestantImages[idx] || "/images/userImage.png"}
                              fill
                              className="object-cover rounded-full"
                            />
                          </div>
                          <p className="text-white text-xs font-bold font-gilroyBold" style={{WebkitTextStroke:"1.3px #7E3CE0"}}>
                            {contestant?.contestant?.contestant_name?.split(' ')[0]}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="relative">
                  <div className="border-[.3125rem] relative border-[#D71BFA] flex-col flex gap-4  px-[2.12rem] items-center justify-start py-[1rem] rounded-[1.5rem] bg-[#000000]">
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
                      <h2 className="text-white text-2xl text-center font-gilroyMedium font-extrabold">
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
                              disabled={isSubmitted}
                              className={cn(
                                "bg-[#000000] border-2 border-[#D71BFA] rounded-[.75rem]  font-bold  text-xl font-gilroyBold px-4 py-[.5625rem] text-white text-left",
                                selectedOption === option &&
                                  "bg-[#FCCE19] border-none text-[#745300]",
                                isSubmitted && "opacity-70"
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

                      {/* Range slider, Submit and Next buttons */}
                      <div className="flex items-center gap-3 justify-between mt-7">
                        <div className="flex justify-between items-center max-w-[250px] bg-[#011B0D] px-2 py-1 rounded-[40px]">
                          <input
                            ref={rangeRef}
                            type="range"
                            min="10"
                            max="100"
                            step="10"
                            value={selectedPercentage}
                            onChange={handleRangeChange}
                            className="custom-range w-full"
                            disabled={isSubmitted || timeLeft <= 0}
                          />
                          <div className="flex flex-col items-end ml-3">
                            <p className=" text-xxs font-gilroyMedium text-[#04DA6A]" style={{ textShadow: "0px 1px 2px rgba(0, 0, 0, 0.8)" }}>
                              ₦{selectedAmount.toLocaleString()}
                            </p>
                           
                          </div>
                        </div>
                        <div className="">
                        <p 
                              className="text-white text-[1.75rem] font-gilroyBold font-bold" 
                              style={{ 
                                textShadow: "0px 0px 10px rgba(4, 218, 106, 0.5)",
                                WebkitTextStroke: "1.4px #04DA6A"
                              }}
                            >
                              {selectedPercentage}%
                            </p>
                        </div>

                        {/* Submit button - only show if not submitted yet AND time hasn't elapsed */}
                        {!isSubmitted && timeLeft > 0 && (
                          <Button
                            className="p-0 bg-transparent"
                            onClick={handleSubmitAnswer}
                            disabled={!selectedOption || !rangeAdjusted}
                          >
                            <GradientButton
                              text="Submit"
                              className={`uppercase ${(!selectedOption || !rangeAdjusted) ? 'opacity-50' : ''}`}
                              width={130}
                            />
                          </Button>
                        )}

                        {/* Next button - only show after time elapses */}
                        {showNextButton && (
                          <Button
                            className="p-0 bg-transparent"
                            onClick={handleNextQuestion}
                            disabled={
                              currentQuestionIndex ===
                              selectedQuestions.length - 1
                            }
                          >
                            <GradientButton
                              text="Next"
                              className="uppercase"
                              width={130}
                            />
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-white mt-4">Loading questions...</p>
                  )}
                </div>
                <div className="">
                  <FastestFingerResult resultArray={revealResults} timeElapsed={timeLeft <= 0 || showNextButton}/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div>
        <HustleSideBar />
      </div>
    </div>
  );
};

export default QuestionScreen;
