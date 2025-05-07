import StagesCard from '@/app/shared/StagesCard'
import FastestFingerResultBoard from '@/app/shared/UserBadge'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { contestantImages } from '../../components/mocks/contestantImages'
import { answerOptionProp, answerQuestionProp } from '../../api/stage1/question/getQuestionAnswer'
import moment from 'moment';
import { Button } from '@/components/core'
import GradientButton from '@/app/shared/GradientButton'

interface FastestFingerResultProps {
  timeElapsed?: boolean;
  correctOption?: string;
  resultArray: answerQuestionProp | null | undefined;
  onStartTimer?: () => void; // Add callback prop for starting timer
}

const FastestFingerResult = ({ 
  timeElapsed = false, 
  resultArray,
  onStartTimer 
}: FastestFingerResultProps) => {
  const [visibleResults, setVisibleResults] = useState<number[]>([]);
  const [timerStarted, setTimerStarted] = useState(false);

  // Handle starting the timer
  const handleStartTimer = () => {
    if (onStartTimer) {
      onStartTimer();
      setTimerStarted(true);
    }
  };

  useEffect(() => {
    if (timeElapsed) {
      // Reset visible results when time elapses
      setVisibleResults([]);
      
      // Show results one by one with a delay
      resultArray?.data.forEach((_, index) => {
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

  // Function to calculate answer time for each contestant
  function calculateAnswerTime(result: any) {
    if (!result || !result.question_start_time || !result.timestamp) {
      return "0.00";
    }
    
    const start = moment(result.question_start_time);
    const answer = moment(result.timestamp);
    
    // Calculate difference in seconds with 2 decimal precision
    const timeTaken = moment.duration(answer.diff(start)).asSeconds();
    return timeTaken.toFixed(2);
  }

  return (
    <div>
      {timeElapsed ? (
        // Show results when time has elapsed
        <div className="flex-1 flex h-full 2xl:gap-4 gap-2 flex-col justify-center items-center">
          <AnimatePresence>
            {resultArray?.data?.map((result, index) => {
              const isCorrect = result?.is_correct;
              const answerTime = calculateAnswerTime(result);
              
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
                  <FastestFingerResultBoard 
                    username={result.contestant?.contestant_name}
                    amount={answerTime}
                    avatarUrl={contestantImages[index]}
                    isOnline={true}
                    borderColor="#FFC125"
                    correctAnswerColor={isCorrect ? "#04DA6A" : "#EB001B"}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        // Show placeholder cards and start timer button when time hasn't elapsed
        <div className="flex-1 flex h-full 2xl:gap-4 gap-2 flex-col justify-center items-center">
          {/* Add Start Timer button at the top */}
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
