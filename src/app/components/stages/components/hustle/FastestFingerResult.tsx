import StagesCard from '@/app/shared/StagesCard'
import UserBadge from '@/app/shared/UserBadge'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { contestantImages } from '../../components/mocks/contestantImages'
import { answerQuestionProp } from '../../api/stage1/question/getQuestionAnswer'

interface FastestFingerResultProps {
  timeElapsed?: boolean;
  correctOption?: string;
  resultArray: answerQuestionProp | null | undefined;
}

const FastestFingerResult = ({ 
  timeElapsed = false, 
  resultArray
}: FastestFingerResultProps) => {
  const [visibleResults, setVisibleResults] = useState<number[]>([]);

  useEffect(() => {
    if (timeElapsed && resultArray?.data) {
      // Reset visible results when time elapses
      setVisibleResults([]);
      
      // Create a copy of the data for sorting
      const sortedResults = [...resultArray.data].sort((a, b) => {
        // Calculate time differences
        const timeA = new Date(a.timestamp).getTime() - new Date(a.question_start_time).getTime();
        const timeB = new Date(b.timestamp).getTime() - new Date(b.question_start_time).getTime();
        
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

  function calculateTimeDifference(startTime: number, endTime: number): string {
    const diff = endTime - startTime;
    const seconds = Math.floor((diff % 60000) / 1000);
    return `0.${seconds.toString().padStart(0)}`;
  }

  return (
    <div className="h-full flex flex-col">
      {timeElapsed ? (
        // Show results when time has elapsed
        <div className="flex-1 flex h-full 2xl:gap-4 gap-2 flex-col justify-center items-center overflow-y-auto max-h-[300px]">
          <AnimatePresence>
            {resultArray?.data?.map((result, index) => {
              const isCorrect = result?.is_correct;
              const answerTime = calculateTimeDifference(
                new Date(result.question_start_time).getTime(), 
                new Date(result.timestamp).getTime()
              );
              
              // Find the index of the first correct answer in the sorted data
              const firstCorrectIndex = resultArray.data.findIndex(item => item.is_correct);
              
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
          {Array.from({length:6}).map((_, index) => (
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
