import StagesCard from '@/app/shared/StagesCard'
import FastestFingerResultBoard from '@/app/shared/UserBadge'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { contestantImages } from '../../components/mocks/contestantImages'
import { answerOptionProp, answerQuestionProp } from '../../api/stage1/question/getQuestionAnswer'
import UserBadge from '@/app/shared/UserBadge'
// import moment from 'moment';
// import { Button } from '@/components/core'
// import GradientButton from '@/app/shared/GradientButton'

interface FastestFingerResultProps {
  timeElapsed?: boolean;
  correctOption?: string;
  resultArray: answerQuestionProp | null | undefined;
  // Remove onStartTimer prop
}

const FastestFingerResult = ({ 
  timeElapsed = false, 
  resultArray
}: FastestFingerResultProps) => {
  const [visibleResults, setVisibleResults] = useState<number[]>([]);
  // Remove timerStarted state
  // Remove handleStartTimer function

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
      
      // Replace the original data with sorted data for rendering
      const sortedResultArray = {
        ...resultArray,
        data: sortedResults
      };
      
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

//   function formatTime(time: number): string {
//     const date = new Date(time);
//     return date.toLocaleTimeString('en-US', {
//         hour12: false,
//         hour: '2-digit',
//         minute: '2-digit',
//         second: '2-digit',
//         // fractionalSecondDigits: 0
//     });
// }

function calculateTimeDifference(startTime: number, endTime: number): string {
    const diff = endTime - startTime;
    const seconds = Math.floor((diff % 60000) / 1000);

    return `0.${seconds.toString().padStart(0)}`;
}
  return (
    <div>
      {timeElapsed ? (
        // Show results when time has elapsed
        <div className="flex-1 flex h-full 2xl:gap-4 gap-2 flex-col justify-center items-center">
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
                    usernameClassName=' mt-[6px] text-white text-xs'
                    dotPosition={{y:36}}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        // Show placeholder cards WITHOUT any start timer button
        <div className="flex-1 flex h-full 2xl:gap-4 gap-2 flex-col justify-center items-center">
          {/* REMOVE THIS ENTIRE BLOCK if it exists:
          {!timerStarted && (
            <Button 
              className="p-0 bg-transparent mb-4"
              onClick={handleStartTimer}
            >
              <GradientButton
                text="Start Timer"
                className="uppercase"
                width={150}
                startColor="#8EFE9B"
                endColor="#03984A"
                baseColor="#035D2E"
              />
            </Button>
          )}
          */}
          
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
