import StagesCard from '@/app/shared/StagesCard'
import FastestFingerResultBoard from '@/app/shared/UserBadge'
import React from 'react'
import { motion } from 'framer-motion'
import { contestantImages } from '../../components/mocks/contestantImages'

interface FastestFingerResultProps {
  timeElapsed?: boolean;
  correctOption?: string;
   resultArray: {
    contestant_id: number;
    contestant_name: string;
    answer: string;
    selected_option: string;
    timestamp: string;
}[]
}

const FastestFingerResult = ({ timeElapsed = false ,resultArray}: FastestFingerResultProps) => {
  // Function to format timestamp to decimal seconds (e.g., 0.15, 1.23)
  const formatTime = (timestamp: string): string => {
    // For mock data, generate random times between 0.10 and 2.99
    const randomSeconds = (Math.random() * 2.89 + 0.10).toFixed(2);
    return randomSeconds;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div>
      {timeElapsed ? (
        // Show results when time has elapsed
        <motion.div 
          className="flex-1 flex h-full 2xl:gap-4 gap-2 flex-col justify-center items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {resultArray.map((result, index) => {
            const isCorrect = result.selected_option === result?.answer;
            
            return (
              <motion.div key={index} variants={itemVariants}>
                <FastestFingerResultBoard 
                  username={result.contestant_name}
                  amount={formatTime(result?.timestamp)}
                  avatarUrl={contestantImages[index]}
                  isOnline={true}
                  borderColor="#FFC125"
                  correctAnswerColor={isCorrect ? "#04DA6A" : "#EB001B"}
                />
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        // Show placeholder cards when time hasn't elapsed
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
