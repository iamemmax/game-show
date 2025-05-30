import StagesCard from '@/app/shared/StagesCard'
import UserBadge from '@/app/shared/UserBadge'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { contestantImages } from '../mocks/contestantImages'
import { useMQTT } from '@/hooks/useMqttService'

// Create a unified type for contestant answers
interface ContestantAnswer {
  contestant: {
    contestant_attr?: string;
    contestant_name: string;
    contestant_id: number;
  };
  answer_supplied: string;
  is_correct: boolean;
  timestamp: string;
  amount_staked?: number;
}

interface FastestFingerResultProps {
  resultArray?: any;
  timeElapsed?: boolean;
  mqttAnswerData?: any;
  currentQuestionId?: string | null;
}

const FastestFingerResult = ({ 
  resultArray, 
  timeElapsed, 
  mqttAnswerData,
  currentQuestionId 
}: FastestFingerResultProps) => {
  const [sortedAnswers, setSortedAnswers] = useState<ContestantAnswer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [questionData, setQuestionData] = useState<any>(null);
  const { isConnected, onMessage } = useMQTT();

  // Reset state when question changes
  useEffect(() => {
    if (currentQuestionId) {
      setSortedAnswers([]);
      setShowResults(false);
      setQuestionData(null);
    }
  }, [currentQuestionId]);

  // Handle MQTT events for question answers
  useEffect(() => {
    if (!isConnected) return;

    const handler = (receivedMessage: any) => {
      try {
        // Handle question answer event
        if (receivedMessage?.event === "game_s1_question_answer") {
          console.log("📊 FastestFingerResult received answer event:", receivedMessage);
          
          const payload = receivedMessage.payload || {};
          const questionId = payload.question_id;
          
          // Only process if this is for the current question
          if (!currentQuestionId || questionId === currentQuestionId) {
            const answersData = payload.answers_data?.data;
            
            if (answersData?.contestant_answers) {
              // Save question data for calculating time differences
              if (answersData.question) {
                setQuestionData(answersData.question);
              }
              
              // Process and sort the answers
              const answers = answersData.contestant_answers;
              const sorted = [...answers].sort((a, b) => {
                // First sort by correctness (correct answers first)
                if (a.is_correct && !b.is_correct) return -1;
                if (!a.is_correct && b.is_correct) return 1;
                
                // Then sort by timestamp for correct answers (fastest first)
                if (a.is_correct && b.is_correct) {
                  return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
                }
                
                // For incorrect answers, also sort by timestamp
                return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
              });
              
              setSortedAnswers(sorted);
              setShowResults(true);
            }
          }
        }
      } catch (error) {
        console.error("❌ Error processing MQTT message in FastestFingerResult:", error);
      }
    };

    onMessage(handler);

    return () => {
      console.log("Cleaning up MQTT message handler in FastestFingerResult");
      onMessage(null);
    };
  }, [isConnected, onMessage, currentQuestionId]);

  // Process mqttAnswerData when it changes
  useEffect(() => {
    if (mqttAnswerData?.contestant_answers) {
      // Save question data for calculating time differences
      if (mqttAnswerData.question) {
        setQuestionData(mqttAnswerData.question);
      }
      
      // Process and sort the answers
      const answers = mqttAnswerData.contestant_answers;
      const sorted = [...answers].sort((a, b) => {
        // First sort by correctness (correct answers first)
        if (a.is_correct && !b.is_correct) return -1;
        if (!a.is_correct && b.is_correct) return 1;
        
        // Then sort by timestamp for correct answers (fastest first)
        if (a.is_correct && b.is_correct) {
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        }
        
        // For incorrect answers, also sort by timestamp
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });
      
      setSortedAnswers(sorted);
      setShowResults(true);
    }
  }, [mqttAnswerData]);

  // Process resultArray when it changes or when timeElapsed becomes true
  useEffect(() => {
    if (resultArray?.data?.contestant_answers && (timeElapsed || showResults)) {
      // Save question data for calculating time differences
      if (resultArray.data.question) {
        setQuestionData(resultArray.data.question);
      }
      
      const answers = resultArray.data.contestant_answers;
      const sorted = [...answers].sort((a, b) => {
        // First sort by correctness (correct answers first)
        if (a.is_correct && !b.is_correct) return -1;
        if (!a.is_correct && b.is_correct) return 1;
        
        // Then sort by timestamp for correct answers (fastest first)
        if (a.is_correct && b.is_correct) {
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        }
        
        // For incorrect answers, also sort by timestamp
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });
      
      setSortedAnswers(sorted);
      setShowResults(true);
    }
  }, [resultArray, timeElapsed, showResults]);

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
    try {
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();
      const diff = end - start;
      const seconds = Math.floor((diff % 60000) / 1000);
      const milliseconds = Math.floor((diff % 1000) / 10);
      return `${seconds}.${milliseconds.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error("Error calculating time difference:", error);
      return "0.00";
    }
  }

  // Determine which results to show (limit to top 5 for example)
  const visibleResults = Array.from({ length: Math.min(sortedAnswers.length, 5) }, (_, i) => i);

  return (
    <div className="h-full flex items-center flex-col">
      {(timeElapsed || showResults) && sortedAnswers.length > 0 ? (
        // Show results when time has elapsed or results are available
        <div className="flex-1 flex h-full 2xl:gap-4 gap-2 flex-col justify-center items-center overflow-y-auto max-h-[600px]">
          <AnimatePresence>
            {visibleResults.map((index) => {
              const result = sortedAnswers[index];
              const isCorrect = result?.is_correct;
              
              // Calculate answer time - assuming question has start_time
              const answerTime = calculateTimeDifference(
                questionData?.question_start_time || new Date().toISOString(), 
                result.timestamp
              );
              
              // Find the index of the first correct answer in the sorted data
              const firstCorrectIndex = sortedAnswers.findIndex(item => item.is_correct);
              
              // Only the first correct answer should be active
              const isFirstCorrect = isCorrect && index === firstCorrectIndex;
              
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
                    username={result.contestant?.contestant_name || `Player ${index + 1}`}
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
          {Array.from({length: 5}).map((_, index) => (
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
  );
};

export default FastestFingerResult
