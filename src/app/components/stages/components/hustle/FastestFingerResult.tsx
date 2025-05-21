import StagesCard from '@/app/shared/StagesCard'
import UserBadge from '@/app/shared/UserBadge'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { contestantImages } from '../../components/mocks/contestantImages'
import { answerOptionProp } from '../../api/stage1/question/getQuestionAnswer'
import { answerQuestion2Prop } from '../../api/stage2/getQuestion2Answer'

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

  // Helper function to extract contestant answers from either data format
  const getContestantAnswers = (): ContestantAnswer[] => {
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
  };

  // Helper function to get question data
  const getQuestionData = () => {
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
  };

  useEffect(() => {
    const contestantAnswers = getContestantAnswers();
    
    if (timeElapsed && contestantAnswers.length > 0) {
      // Reset visible results when time elapses
      setVisibleResults([]);
      
      // Create a copy of the data for sorting
      const sortedResults = [...contestantAnswers].sort((a, b) => {
        // Calculate time differences - assuming timestamp is available
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        
        // First prioritize correct answers
        if (a.is_correct && !b.is_correct) return -1;
        if (!a.is_correct && b.is_correct) return 1;
        
        // If both are correct or both are incorrect, sort by time
        return timeA - timeB;
      });
      
      // Show results one by one with a delay
      sortedResults.forEach((_, index) => {
        setTimeout(() => {
          setVisibleResults(prev => [...prev, index]);
        }, 500 * (index + 1)); // 500ms delay between each result
      });
    }
  }, [timeElapsed, resultArray]);

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

  const contestantAnswers = getContestantAnswers();
  const questionData = getQuestionData();

  return (
    <div className="h-full flex flex-col">
      {timeElapsed && contestantAnswers.length > 0 ? (
        // Show results when time has elapsed
        <div className="flex-1 flex h-full 2xl:gap-4 gap-2 flex-col justify-center items-center overflow-y-auto max-h-[300px]">
          <AnimatePresence>
            {contestantAnswers.map((result, index) => {
              const isCorrect = result?.is_correct;
              
              // Calculate answer time - assuming question has start_time
              const answerTime = calculateTimeDifference(
                questionData?.question_start_time || result.timestamp, 
                result.timestamp
              );
              
              // Find the index of the first correct answer in the sorted data
              const firstCorrectIndex = contestantAnswers.findIndex(item => item.is_correct);
              
              // Only the first correct answer should be active
              const isFirstCorrect = isCorrect && index === firstCorrectIndex;
              
              // Only render if this result should be visible
              if (!visibleResults.includes(index)) {
                return null;
              }
              
              return (
                <motion.div 
                  key={index}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full"
                >
                  <UserBadge 
                    username={result.contestant?.contestant_name}
                    amount={answerTime}
                    avatarUrl={contestantImages[index % contestantImages.length]} // Use modulo to avoid index errors
                    isOnline={true}
                    isActive={isFirstCorrect} // Only active if it's the first correct answer
                    borderColor="#FFC125"
                    backgroundGradient={{
                      middleColor: "#997416",
                      endColor: "#FEC124",
                      startColor: "#FFC125",
                      direction: "vertical"
                    }}
                    textGradient={{
                      startColor: "#FFFFFF",
                      endColor: "#FFC125",
                      direction: "horizontal"
                    }}
                    color="#FFFFFF"
                    correctAnswerColor={isCorrect ? "#04DA6A" : "#EB001B"}
                    usernameClassName='mt-[6px] text-white text-xs'
                    dotPosition={{y:36}}
                    width={130}
                  />
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
