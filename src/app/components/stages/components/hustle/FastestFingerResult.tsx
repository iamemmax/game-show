import StagesCard from '@/app/shared/StagesCard'
import UserBadge from '@/app/shared/UserBadge'
import React, { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { contestantImages } from '../../components/mocks/contestantImages'
import { answerOptionProp } from '../../api/stage1/question/getQuestionAnswer'
import { answerQuestion2Prop } from '../../api/stage2/getQuestion2Answer'
import { tokenStorage } from '@/utils/auth'

// Create a unified type for contestant answers
interface ContestantAnswer {
  contestant: {
    contestant_attr: string;
    contestant_name: string;
    contestant_id: number;
  };
  answer_supplied: string;
  is_correct: boolean;
  timestamp: string;
}

interface FastestFingerResultProps {
  timeElapsed?: boolean;
  correctOption?: string;
  resultArray?: answerOptionProp | answerQuestion2Prop | null | undefined;
  length?: number;
}

const FastestFingerResult = ({ 
  timeElapsed = false, 
  resultArray,
  length=6
}: FastestFingerResultProps) => {
  const [visibleResults, setVisibleResults] = useState<number[]>([]);
  // Get current user once and store it
  const currentUser = useMemo(() => tokenStorage.getUser(), []);

  // Helper function to extract contestant answers from either data format
  const getContestantAnswers = useMemo(() => {
    if (!resultArray || !resultArray.data) return [];
    
    // Handle Stage 1 format (data is an object with contestant_answers array)
    if (!Array.isArray(resultArray.data) && resultArray.data.contestant_answers) {
      return resultArray.data.contestant_answers;
    }
    
    // Handle Stage 2 format (data is an array of objects with contestant_answers array)
    if (Array.isArray(resultArray.data) && resultArray.data.length > 0 && resultArray.data[0].contestant_answers) {
      return resultArray.data[0].contestant_answers;
    }
    
    return [];
  }, [resultArray]);

  // Helper function to get question data
  const questionData = useMemo(() => {
    if (!resultArray || !resultArray.data) return null;
    
    // Handle Stage 1 format
    if (!Array.isArray(resultArray.data) && resultArray.data.question) {
      return resultArray.data.question;
    }
    
    // Handle Stage 2 format
    if (Array.isArray(resultArray.data) && resultArray.data.length > 0 && resultArray.data[0].question) {
      return resultArray.data[0].question;
    }
    
    return null;
  }, [resultArray]);

  // Calculate first correct index once
  const firstCorrectIndex = useMemo(() => 
    getContestantAnswers.findIndex(item => item.is_correct), 
    [getContestantAnswers]
  );

  useEffect(() => {
    if (!timeElapsed || getContestantAnswers.length === 0) return;
    
    // Reset visible results when time elapses
    setVisibleResults([]);
    
    // Create a copy of the data for sorting
    const sortedResults = [...getContestantAnswers].sort((a, b) => {
      // Calculate time differences - assuming timestamp is available
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      
      // First prioritize correct answers
      if (a.is_correct && !b.is_correct) return -1;
      if (!a.is_correct && b.is_correct) return 1;
      
      // If both are correct or both are incorrect, sort by time
      return timeA - timeB;
    });
    
    // Clear any existing timeouts to prevent memory leaks
    const timeouts: NodeJS.Timeout[] = [];
    
    // Show results one by one with a delay
    sortedResults.forEach((_, index) => {
      const timeout = setTimeout(() => {
        setVisibleResults(prev => [...prev, index]);
      }, 500 * (index + 1)); // 500ms delay between each result
      
      timeouts.push(timeout);
    });
    
    // Cleanup function to clear all timeouts
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [timeElapsed, getContestantAnswers]);

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3
      }
    }
  };

  function calculateTimeDifference(startTime: string, endTime: string): string {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const diff = end - start;
    const seconds = Math.floor((diff % 60000) / 1000);
    return `0.${seconds.toString().padStart(2, '0')}`;
  }

  return (
    <div className="h-full flex flex-col">
      {timeElapsed && getContestantAnswers.length > 0 ? (
        // Show results when time has elapsed
        <div className="flex-1 flex h-full 2xl:gap-4 gap-2 flex-col justify-center items-center overflow-y-auto max-h-[600px]">
          <AnimatePresence>
            {getContestantAnswers.map((result, index) => {
              const isCorrect = result?.is_correct;
              
              // Calculate answer time - assuming question has start_time
              const answerTime = calculateTimeDifference(
                questionData?.question_start_time || result.timestamp, 
                result.timestamp
              );
              
              // Only the first correct answer should be active
              const isFirstCorrect = isCorrect && index === firstCorrectIndex;
              
              // Check if this result belongs to the current user
              const isCurrentUser = currentUser && 
                result.contestant?.contestant_id === currentUser.contestant_id;
              
              // Only render if this result should be visible
              if (!visibleResults.includes(index)) {
                return null;
              }
              
              // Define special styling for current user
              const currentUserStyles = isCurrentUser ? {
                borderColor: "#00FFFF", // Cyan border for current user
                backgroundGradient: {
                  middleColor: "#004B4B", // Darker cyan for middle
                  endColor: "#00BFBF", // Medium cyan for end
                  startColor: "#00FFFF", // Bright cyan for start
                  direction: "vertical" as "vertical"
                },
                textGradient: {
                  startColor: "#FFFFFF",
                  endColor: "#00FFFF", // Cyan text gradient
                  direction: "horizontal" as "horizontal"
                },
                className: ""
              } : {
                borderColor: "#FFC125",
                backgroundGradient: {
                  middleColor: "#997416",
                  endColor: "#FEC124",
                  startColor: "#FFC125",
                  direction: "vertical" as "vertical"
                },
                textGradient: {
                  startColor: "#FFFFFF",
                  endColor: "#FFC125",
                  direction: "horizontal" as "horizontal"
                },
                className: ""
              };
              
              return (
                <motion.div 
                  key={index}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className={`w-full ${isCurrentUser ? 'z-10' : ''}`}
                >
                  <div className={`relative ${isCurrentUser ? 'transform scale-110' : ''}`}>
                    {/* Add glowing border effect for current user */}
                    {isCurrentUser && (
                      <div className="absolute inset-0 rounded-full blur-sm" 
                           style={{ 
                             background: 'linear-gradient(to right, #00FFFF, #00BFBF, #00FFFF)',
                             transform: 'scale(1.05)',
                             opacity: 0.7,
                             zIndex: -1
                           }} 
                      />
                    )}
                    
                    <UserBadge 
                      username={result.contestant?.contestant_name}
                      amount={answerTime}
                      avatarUrl={contestantImages[index % contestantImages.length]}
                      isOnline={true}
                      isActive={!!(isFirstCorrect || isCurrentUser)}
                      borderColor={currentUserStyles.borderColor}
                      backgroundGradient={currentUserStyles.backgroundGradient}
                      textGradient={currentUserStyles.textGradient}
                      color="#FFFFFF"
                      correctAnswerColor={isCorrect ? "#04DA6A" : "#EB001B"}
                      usernameClassName={`mt-[6px] text-white text-xs ${isCurrentUser ? 'font-bold' : ''}`}
                      dotPosition={{y:36}}
                      width={130}
                      className={currentUserStyles.className}
                    />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        // Show placeholder cards
        <div className="flex-1 flex h-full 2xl:gap-4 gap-2 flex-col justify-center items-center">
          {Array.from({length}).map((_, index) => (
            <StagesCard 
              key={index}
              title=""
              subTitle=""
              borderColor="#FFC125" 
              iconText="" 
              showIcon={false} 
              width={130}
              className="2xl:w-[260px]"
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default FastestFingerResult
