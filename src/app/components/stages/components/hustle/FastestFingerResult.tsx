import StagesCard from '@/app/shared/StagesCard'
import UserBadge from '@/app/shared/UserBadge'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { contestantImages } from '../mocks/contestantImages'
import { useMQTT } from '@/hooks/useMqttService'

// Create a unified type for contestant answers
interface ContestantAnswer {
  status: string;
  message: string;
  data: Datum[];
}

interface Datum {
  contestant_id: number;
  answered_in: number;
  is_correct: boolean;
  is_winner: boolean;
  wallet_balance: number;
  book_balance: number;
  stage_balance: number;
  contestant_name: null;
  contestant_attr: string;
}

interface FastestFingerResultProps {
  resultArray?: any;
  timeElapsed?: boolean;
  mqttAnswerData?: any;
  currentQuestionId?: string | null;
}
const FastestFingerResult = ({ 

  currentQuestionId 
}: FastestFingerResultProps) => {
  const [showResults, setShowResults] = useState(false);
  const [questionData, setQuestionData] = useState<Datum[] | null>(null); // <-- Re-enable this state
  const { isConnected, onMessage } = useMQTT();

  useEffect(() => {
    if (currentQuestionId) {
      setShowResults(false);
      setQuestionData(null);
    }
  }, [currentQuestionId]);

  useEffect(() => {
    if (!isConnected) return;

    const handler = (receivedMessage: any) => {
      try {
        if (receivedMessage?.event === "game_s1_question_answer") {
          
          const payload = receivedMessage.payload || {};
          const questionId = payload.question_id;

          if (!currentQuestionId || questionId === currentQuestionId) {
            const answersData = payload.answers_data?.data;

            if (answersData?.contestant_answers) {
              setQuestionData(answersData.contestant_answers); // <-- Save all results
              setShowResults(true);
            }
          }
        }else if(receivedMessage?.event === "game_s2_question_answer"){ 
  
          const payload = receivedMessage.payload || {};
          const questionId = payload.question_id;

          if (!currentQuestionId || questionId === currentQuestionId) {
            const answersData = payload.answers_data?.data;

            if (answersData?.contestant_answers) {
              setQuestionData(answersData.contestant_answers); // <-- Save all results
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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  return (
    <div className="h-full flex items-center flex-col">
      {showResults && questionData ? (
        <div className="flex-1 flex h-full 2xl:gap-4 gap-2 flex-col justify-center items-center overflow-y-auto max-h-[600px]">
          <AnimatePresence>
            {questionData.map((result, index) => {
              const username = result.contestant_name || result.contestant_attr || `Player ${index + 1}`;
              const answerTime = result.answered_in.toFixed(2) + 's';
              const isCorrect = result.is_correct;
              const isFirstCorrect = result.is_winner;

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
                    username={username}
                    amount={answerTime}
                    avatarUrl={contestantImages[index % contestantImages.length]}
                    isOnline={true}
                    isActive={isFirstCorrect}
                    borderColor="#FFC125"
                    backgroundGradient={{
                      middleColor: "#997416",
                      endColor: "#FEC124",
                      startColor: "#FFC125",
                      direction: "vertical",
                    }}
                    textGradient={{
                      startColor: "#FFFFFF",
                      endColor: "#FFC125",
                      direction: "horizontal",
                    }}
                    color="#FFFFFF"
                    correctAnswerColor={isCorrect ? "#04DA6A" : "#EB001B"}
                    usernameClassName="mt-[6px] text-white text-xs"
                    dotPosition={{ y: 36 }}
                    width={130}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex-1 flex h-full 2xl:gap-4 gap-2 flex-col justify-center items-center">
          {Array.from({ length: 5 }).map((_, index) => (
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
