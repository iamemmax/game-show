  import Logo from "@/app/icons/Logo";
  import Trophy from "@/app/icons/Trophy";
  import HeaderTitleContainer from "@/app/shared/HeaderContainer";
  import Image from "next/image";
  import React, { useEffect, useState } from "react";
  import { motion } from "framer-motion";
  import HustleStages from "../hustle/HustleStages";
  import HustleSideBar from "../hustle/HustleSideBar";
  import NumberCardContainer from "@/app/shared/NumberContainer";
  import PrizeCard from "@/app/shared/PrizeCard";
  import { questionArray } from "../mocks/sampleQuestion";
  import { cn } from "@/utils/classNames";
import CheckIcon from "@/app/icons/CheckIcon";
import ErrorIcon from "@/app/icons/ErrorIcon";

  // Types
  interface Contestant {
    name: string;
    number_pick: number;
    img: string;
  }

  interface Question {
    no: number;
    question: string;
    options: {
      A: string;
      B: string;
      C: string;
      D: string;
    };
    answer: string;
  }

  interface ContestantStatus {
    name: string;
    number_pick: number;
    img: string;
    status: 'correct' | 'wrong' | 'missed' | null;
    hasAttempted: boolean;
    isOriginalOwner?: boolean;  // Track if this contestant is the original owner
    answeredForNumber?: number; // Track which number they answered for
    missedByOwner?: boolean;
    originalOwnerStatus?: {     // Track original owner's information
      name: string;
      status: 'missed';
      number_pick: number;
    };
    questionAnsweredBy?: {      // Track who answered the question
      name: string;
      status: 'correct';
    };
  }

  // Add new interface for attempted options
  interface AttemptedOption {
    option: string;
    status: 'correct' | 'wrong';
  }

  const QuestionScreen = () => {
    const [timeLeft, setTimeLeft] = useState<number>(20);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnsStatus, setSelectedAnsStatus] = useState<'correct' | 'wrong' | null>(null);
    const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    // Add new state for tracking contestants
    const [contestants, setContestants] = useState<ContestantStatus[]>([]);
    const [currentContestantIndex, setCurrentContestantIndex] = useState<number>(0);
    // Add new state for tracking attempted options
    const [attemptedOptions, setAttemptedOptions] = useState<AttemptedOption[]>([]);

    // Initialize contestants array with status
    const initialContestants: ContestantStatus[] = [
      {
        name: "Demola",
        number_pick: 2,
        img: "/images/userImage3.png",
        status: null,
        hasAttempted: false
      },
      {
        name: "Idris",
        number_pick: 7,
        img: "/images/userImage2.png",
        status: null,
        hasAttempted: false
      },
      {
        name: "Demola",
        number_pick: 9,
        img: "/images/userImage3.png",
        status: null,
        hasAttempted: false
      },
      {
        name: "Edmund",
        number_pick: 10,
        img: "/images/userImage4.png",
        status: null,
        hasAttempted: false
      },
      {
        name: "Ola",
        number_pick: 13,
        img: "/images/userImage.png",
        status: null,
        hasAttempted: false
      },
      {
        name: "Idris",
        number_pick: 16,
        img: "/images/userImage3.png",
        status: null,
        hasAttempted: false
      },
      {
        name: "Edmund",
        number_pick: 18,
        img: "/images/userImage4.png",
        status: null,
        hasAttempted: false
      },

      {
        name: "Ola",
        number_pick: 20,
        img: "/images/userImage.png",
        status: null,
        hasAttempted: false
      },
    ];

    useEffect(() => {
      setContestants(initialContestants);
    }, []);

    // Add useEffect to initialize questions
    useEffect(() => {
      // Get matched questions based on contestants' number picks
      const matchedQuestions = getMatchedQuestions(questionArray, initialContestants);
      setSelectedQuestions(matchedQuestions);
      // console.log('Matched Questions:', matchedQuestions);
    }, []); // Run once on mount

    // Function to match question numbers with number_pick
    const getMatchedQuestions = (
      questions: Question[],
      picks: ContestantStatus[]
    ): Question[] => {
      const pickedNumbers = picks.map((p) => p.number_pick);
      return questions.filter((q) => pickedNumbers.includes(q.no));
    };

    // console.log(contestants);

    const handleAnswerQst = (option: string, question: Question) => {
      if (selectedAnsStatus) return;
      setSelectedOption(option);

      // Add this attempt to attempted options
      const isCorrect = question.answer === option;
      setAttemptedOptions(prev => [...prev, {
        option,
        status: isCorrect ? 'correct' : 'wrong'
      }]);

      const currentContestant = contestants[currentContestantIndex];
      
      // Find the original owner of the current question number
      const originalOwnerIndex = contestants.findIndex(
        (c) => c.number_pick === question.no
      );

      if (isCorrect) {
        if (currentContestant.number_pick === question.no) {
          // Answering own question correctly
          setContestants(prev => {
            const updated = [...prev];
            updated[originalOwnerIndex] = {
              ...updated[originalOwnerIndex],
              status: 'correct' as const,
              hasAttempted: true,
              isOriginalOwner: true,
              questionAnsweredBy: {
                name: currentContestant.name,
                status: 'correct'
              }
            };
            return updated;
          });
        } else {
          // Someone else answered correctly
          if (originalOwnerIndex !== -1) {
            setContestants(prev => {
              const updated = [...prev];
              updated[originalOwnerIndex] = {
                ...updated[originalOwnerIndex],
                status: 'missed' as const,
                missedByOwner: true,
                hasAttempted: true,
                originalOwnerStatus: {
                  name: updated[originalOwnerIndex].name,
                  status: 'missed',
                  number_pick: question.no
                },
                questionAnsweredBy: {
                  name: currentContestant.name,
                  status: 'correct'
                }
              };
              return updated;
            });
          }
        }

        setSelectedAnsStatus('correct');
      } else {
        setSelectedAnsStatus('wrong');
        
        if (currentContestantIndex === 0) {
          const nextContestantIndex = currentContestantIndex + 1;
          if (nextContestantIndex < contestants.length) {
            setTimeout(() => {
              setCurrentContestantIndex(nextContestantIndex);
              setTimeLeft(15);
              setSelectedAnsStatus(null);
            }, 1500);
          } else {
            markQuestionAsMissed();
          }
        } else {
          markQuestionAsMissed();
        }
      }
    };
    
    
    

    // Helper function to find next available contestant
    const findNextAvailableContestant = (contestantList: ContestantStatus[]): number => {
      const nextIndex = contestantList.findIndex((contestant, index) => 
        index > currentContestantIndex && !contestant.hasAttempted
      );
      
      // Only return the immediate next contestant
      return nextIndex;
    };

    // Simplified markQuestionAsMissed
    const markQuestionAsMissed = () => {
      const currentQuestion = selectedQuestions[currentQuestionIndex];
      const originalOwnerIndex = contestants.findIndex(
        c => c.number_pick === currentQuestion.no
      );

      if (originalOwnerIndex !== -1) {
        setContestants(prev => {
          const updated = [...prev];
          updated[originalOwnerIndex] = {
            ...updated[originalOwnerIndex],
            status: 'missed' as const,
            hasAttempted: true,
            missedByOwner: true,
            originalOwnerStatus: {
              name: updated[originalOwnerIndex].name,
              status: 'missed',
              number_pick: currentQuestion.no
            }
          };
          return updated;
        });
      }
    };

    // Modified handleNextQuestion to reset attempted options
    const handleNextQuestion = () => {
      if (currentQuestionIndex < selectedQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnsStatus(null);
        setSelectedOption(null);
        setTimeLeft(30);
        setAttemptedOptions([]); 
        // Move to next contestant when moving to next question
        setCurrentContestantIndex(prev => (prev + 1) % initialContestants.length);
      }
    };

    // Modified timer effect
    useEffect(() => {
      if (timeLeft === 0) {
        const currentContestant = contestants[currentContestantIndex];
        if (!currentContestant.hasAttempted) {
          const updatedContestants = [...contestants];
          updatedContestants[currentContestantIndex] = {
            ...currentContestant,
            status: 'wrong',
            hasAttempted: true
          };
          setContestants(updatedContestants);
          
          const nextContestantIndex = findNextAvailableContestant(updatedContestants);
          if (nextContestantIndex !== -1) {
            setCurrentContestantIndex(nextContestantIndex);
            setTimeLeft(15);
          } else {
            markQuestionAsMissed();
          }
        }
        return;
      }

      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }, [timeLeft]);

    // Modified to mark original owners
    useEffect(() => {
      const questionsWithOwners = initialContestants.map(contestant => ({
        ...contestant,
        isOriginalOwner: true,
        status: null,
        hasAttempted: false
      }));
      setContestants(questionsWithOwners);
    }, []);

  

    
    useEffect(() => {
      const updatedContestants = contestants.filter(c => c.status !== null);
      console.log(updatedContestants, "Contestants with status updated");
    }, [contestants]);  // Logs only when 'contestants' change
    
    return (
      <div className="grid grid-cols-[1fr_5fr_1fr] h-full ">
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
        <div className="flex  flex-col justify-between items-center min-h-full">
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
                    <h2 className="text-[2.125rem] font-extrabold outline-text text-black">
                      Stage 2: Prove your hustle
                    </h2>
                    <p className="text-sm font-normal text-[#D5B9FF]">
                      Current Player: {contestants[currentContestantIndex]?.name}
                    </p>
                  </div>
                  <div>
                    <h2 className="font-extrabold text-[2.75rem] text-white">
                      {`0:${timeLeft.toString().padStart(2, "0")}`}
                    </h2>
                  </div>
                </div>

                <div className="grid mt-5 grid-cols-[1.2fr_3fr_1fr]">
                  <div className="flex gap-3 flex-col">
                    {contestants?.map((contestant, idx: number) => (
                      <div className="flex gap-2 items-center" key={idx}>
                        <div className="">
                          <NumberCardContainer
                            text={String(contestant?.number_pick)}
                            textColor="#F2C94C"
                            width={35}
                            height={35}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative h-[1.6875rem] w-[1.6875rem]">
                            <Image
                              alt=""
                              src={contestant?.img}
                              fill
                              className="object-cover rounded-full"
                            />
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                            <p className="text-white text-xs font-gilroyMedium">
                              {contestant?.name}
                            </p>
                            {
                            <>
                             { (!contestant?.missedByOwner && contestant?.hasAttempted && contestant?.status === 'correct')  && <CheckIcon/>}
                           {  (contestant?.hasAttempted &&contestant?.missedByOwner && contestant?.originalOwnerStatus?.status  === 'missed')  && <ErrorIcon/>}
                              </>
                            }

                            </div>
                            {
                              (contestant?.hasAttempted&&contestant?.originalOwnerStatus?.status !=="missed" && !contestant?.isOriginalOwner)&& (
                                <div className="flex items-center gap-2">
                                <p className="text-white text-xs font-gilroyMedium">
                               {contestant?.questionAnsweredBy?.name}
                                </p>
                                {
                                  contestant?.hasAttempted&&contestant?.questionAnsweredBy?.status==="correct"?<CheckIcon/>:<ErrorIcon/>
                                }
                                </div>
                              )
                            }
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="relative">
                    <div className="border-[.3125rem] relative border-[#D71BFA] flex justify-center px-[2.125rem] items-center py-[3rem] rounded-[1.5rem] bg-[#000000]">
                      <h2 className="text-white text-xl text-center font-gilroyHeavy font-extrabold">
                        {selectedQuestions[currentQuestionIndex]?.question}
                      </h2>
                      <div className="absolute -bottom-8 ">
                        <PrizeCard
                          title="Win amount"
                          amount="₦500,000"
                          width={250}
                          height={60}
                          backgroundColor="#C76000"
                          gradientColors={{
                            start: "#FFD700",
                            end: "#FFA500",
                          }}
                          titleStyle={{
                            fontSize: 16,
                            fontFamily: "gilroyHeavy",
                            fontWeight: "bold",
                            fill: "#1E1E1E",
                            // strokeWidth: 1,
                            yPosition: 30, // Changed from 35 to 25
                          }}
                          amountStyle={{
                            fontSize: 28,
                            fontFamily: "gilroyHeavy",
                            fontWeight: "700",
                            fill: "#FFFFFF",
                            strokeWidth: 2,
                            strokeColor: "#C76000",
                            yPosition: 68, // Changed from 70 to 80
                          }}
                          className="transform transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
                          titleClassName="text-[#1E1E1E]"
                          amountClassName=""
                        />
                      </div>
                    </div>

                    {selectedQuestions.length > 0 ? (
                      <>
                        <div className="grid grid-cols-2 gap-4 mt-10">
                          {Object.entries(selectedQuestions[currentQuestionIndex].options).map(
                            ([key, value], index) => {
                              const attempt = attemptedOptions.find(a => a.option === key);
                              return (
                                <div
                                  key={index}
                                  className={cn(
                                    `flex gap-2 items-center mt-2 rounded-10 border py-[.9375rem] px-[1.25rem] cursor-pointer transition-all duration-300`,
                                    attempt?.status === 'correct'
                                      ? 'bg-gradient-to-r from-[#03984A] to-[#8EFE9B] border-green-500'
                                      : attempt?.status === 'wrong'
                                      ? 'bg-gradient-to-r from-[#760F1B] to-[#EB001B] border-red-500'
                                      : 'border-[#D91FFF] hover:bg-[#D91FFF]/10'
                                  )}
                                  onClick={() => handleAnswerQst(key, selectedQuestions[currentQuestionIndex])}
                                >
                                  <div className="relative h-[1.6875rem] items-center gap-3 flex">
                                    <p className="text-white text-sm text-opacity-55 font-bold font-gilroyMedium">
                                      {key}.
                                    </p>
                                    <p className="text-white text-sm text-nowrap font-gilroyMedium font-bold">
                                      {value}
                                    </p>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                        
                        {/* Next Question Button */}
                        <div className="flex justify-center mt-8">
                          <button
                            onClick={handleNextQuestion}
                            disabled={!selectedAnsStatus || currentQuestionIndex === selectedQuestions.length - 1}
                            className={cn(
                              "px-8 py-3 rounded-lg font-gilroyHeavy text-white transition-all duration-300",
                              selectedAnsStatus && currentQuestionIndex < selectedQuestions.length - 1
                                ? "bg-[#D71BFA] hover:bg-[#b818d3] cursor-pointer"
                                : "bg-gray-600 cursor-not-allowed opacity-50"
                            )}
                          >
                            Next Question
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className="text-white mt-4">Loading questions...</p>
                    )}
                  </div>
                  <div className="">3</div>
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
