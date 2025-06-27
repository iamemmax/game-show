import StagesCard from '@/app/shared/StagesCard'
import UserBadge from '@/app/shared/UserBadge'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { contestantImages } from '../mocks/contestantImages'
import { useMQTT } from '@/hooks/useMqttService'
import { usePathname } from 'next/navigation'

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
  contestant_name: string | null;
  contestant_attr: string;
}

interface FastestFingerResultProps {
  resultArray?: Datum[] | null;
  timeElapsed?: boolean;
  mqttAnswerData?: Datum[] | null;
  currentQuestionId?: string | null;
}
const FastestFingerResult = ({ 
  resultArray,
  timeElapsed,
 
}: FastestFingerResultProps) => {


  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  const pathname = usePathname();
  const isBoardRoute = pathname?.includes('/hustle-board/');

  return (
    <div className="h-full !z-[999999999999] flex items-center flex-col">
     
      
      {/* Show results when time has elapsed or results are available */}
      {(timeElapsed) && resultArray&&resultArray?.length > 0 ? (
        <div className="flex-1 flex h-full 2xl:gap-4 gap-2 flex-col justify-center items-center overflow-y-auto max-h-[600px]">
          <AnimatePresence>
            {resultArray?.map((result, index) => {
              
              // Display the answered_in time exactly as it comes from the backend
              const answerTime = result.answered_in;
              
         
              const contestantName = result.contestant_name || `Player ${index + 1}`;
              
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
                    username={contestantName}
                    amount={`${String(answerTime?.toFixed(2))}` }
                    avatarUrl={contestantImages[index % contestantImages.length]} // Use modulo to avoid index errors
                    isOnline={true}
                    isActive={result.is_winner&& result?.is_correct} // Only active if it's the first correct answer
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
                    correctAnswerColor={result.is_correct ? "#04DA6A" : "#EB001B"}
                    usernameClassName='mt-[6px] text-white text-xs'
                    dotPosition={{y:36}}
                  width={isBoardRoute?230:130}
                  height={isBoardRoute?80:53}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        // Show placeholder cards
        <div className="flex-1 flex h-full 2xl:gap-4 gap-2 flex-col justify-start items-start">
          {Array.from({length: 6}).map((_, index) => (
            <StagesCard 
              key={index}
              title=""
              subTitle=""
              borderColor="#FFC125" 
              iconText="" 
              showIcon={false} 
              width={isBoardRoute?230:130}
                  height={isBoardRoute?80:53}
              className="2xl:w-[260px]"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FastestFingerResult