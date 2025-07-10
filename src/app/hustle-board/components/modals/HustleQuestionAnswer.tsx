import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import CheckIcon from '@/app/icons/CheckIcon'
import HustleBoardModal from './HustleBoardModal';
import HustleRevealResult from './HustleRevealResult';


interface BidData {
  contestant_id: number;
  contestant_name: string;
  answer: string;
  amount_staked: number;
}

type OptionProps = {
  label: string;
  optionKey: string;
  isCorrect?: boolean;
  index: number;
 
};

const QuizOption: React.FC<OptionProps> = ({ label, optionKey, isCorrect = false, index }) => {
  const [showCorrectAnimation, setShowCorrectAnimation] = useState(false);

  useEffect(() => {
    if (isCorrect) {
      // Delay the animation based on index for staggered effect
      const timer = setTimeout(() => {
        setShowCorrectAnimation(true);
      }, index * 200 + 800); // Start after 800ms, then stagger by 200ms each

      return () => clearTimeout(timer);
    }
  }, [isCorrect, index]);

  return (
    <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ 
    opacity: 1, 
    y: 0,
    // Add these animations only for correct options
    ...(isCorrect && {
      scale: [1, 1.05, 1],
      boxShadow: [
        '0 0 0px rgba(4, 218, 106, 0)',
        '0 0 20px rgba(4, 218, 106, 0.6)',
        '0 0 10px rgba(4, 218, 106, 0.3)'
      ]
    })
  }}
  transition={{ 
    duration: 0.5, 
    delay: index * 0.1,
    // Add specific transition for correct option effects
    ...(isCorrect && {
      scale: { duration: 0.8, times: [0, 0.6, 1] },
      boxShadow: { duration: 1.2, times: [0, 0.5, 1] }
    })
  }}
  className={`w-full rounded-xl px-6 py-3 font-bold text-2xl flex items-center justify-between transition-all duration-500 relative overflow-hidden ${
    isCorrect 
      ? 'bg-[#04DA6A]/20 border-2 border-[#04DA6A] text-white' 
      : 'border border-[#7E3CE0] text-white'
  }`}
>
      {/* Lightning/Glow Effect for Correct Answer */}
      {isCorrect && showCorrectAnimation && (
        <>
          {/* Animated glow background */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0, 0.8, 0.4],
              scale: [0.8, 1.2, 1],
            }}
            transition={{ 
              duration: 1.2,
              times: [0, 0.5, 1],
              repeat: 2,
              ease: "easeOut"
            }}
            className="absolute inset-0 bg-gradient-to-r from-[#04DA6A]/30 via-[#04DA6A]/50 to-[#04DA6A]/30 rounded-xl"
          />
          
          {/* Lightning flash effect */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ 
              opacity: [0, 1, 0],
              x: [-100, 100],
            }}
            transition={{ 
              duration: 0.6,
              delay: 0.3,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
          />

          {/* Sparkle particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0, rotate: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                rotate: [0, 180, 360],
                x: [0, Math.random() * 40 - 20],
                y: [0, Math.random() * 40 - 20],
              }}
              transition={{ 
                duration: 1.5,
                delay: 0.5 + i * 0.1,
                ease: "easeOut"
              }}
              className="absolute w-2 h-3 bg-[#04DA6A] rounded-full"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                boxShadow: '0 0 8px #04DA6A',
              }}
            />
          ))}
        </>
      )}

      <div className="flex items-center relative z-10">
        <motion.span 
          className="mr-3"
          animate={isCorrect && showCorrectAnimation ? {
            textShadow: [
              '0 0 0px #04DA6A',
              '0 0 10px #04DA6A',
              '0 0 5px #04DA6A'
            ]
          } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {optionKey}
        </motion.span>
        <motion.span
        className='text-2xl'
          animate={isCorrect && showCorrectAnimation ? {
            textShadow: [
              '0 0 0px #04DA6A',
              '0 0 10px #04DA6A', 
              '0 0 5px #04DA6A'
            ]
          } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {label}
        </motion.span>
      </div>
      
      {/* Correct Answer Icon with animation */}
      {isCorrect && (
        <motion.div
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={showCorrectAnimation ? { 
            opacity: 1, 
            scale: [0, 1.3, 1], 
            rotate: [180, 0] 
          } : { opacity: 0, scale: 0 }}
          transition={{ 
            duration: 0.6, 
            delay: 0.8,
            type: "spring",
            stiffness: 200,
            damping: 10
          }}
          className="bg-[#04DA6A] rounded-full p-1 relative z-10"
          style={{
            boxShadow: showCorrectAnimation ? '0 0 15px #04DA6A' : 'none'
          }}
        >
          <CheckIcon size={16} />
        </motion.div>
      )}
    </motion.div>
  );
};





interface Datum {
  contestant_id: number;
  answered_in: number;
  is_correct: boolean;
  is_winner: boolean;
  answer: string;
  wallet_balance: number;
  book_balance: number;
  startup_balance: number;
  stage_balance: number;
  contestant_name: string;
  contestant_attr: string;
  profit_loss: Profitloss;
}

interface Profitloss {
  contestant_id: number;
  bid_amount: number;
  amount_gained: number;
  amount_lost: number;
}


interface prop {
  booster?: string;
  showBooster?: boolean;
  showBid?:boolean
  questionIndex: number;
  currentQuestionOptions?: {
    option_a?: string;
    option_b?: string;
    option_c?: string;
    option_d?: string;
  };
  correctAnswer?: string;
  question?: string;
    currentQuestionAnswerData: BidData[]
    currentQuestion:any
  mqttAnswerData: Datum[];
}

const HustleQuestionAnswerModal = ({
  booster,
  showBooster = false,
  questionIndex,
  currentQuestionOptions,
  correctAnswer,
  question,
  currentQuestionAnswerData,
  currentQuestion,
  mqttAnswerData,
  showBid=true
}: prop) => {
  
  // Helper function to convert option key to letter
  const getOptionLetter = (optionKey: string): string => {
    const optionMap: Record<string, string> = {
      'option_a': 'A',
      'option_b': 'B',
      'option_c': 'C',
      'option_d': 'D'
    };
    return optionMap[optionKey] || '';
  };

  // Helper function to check if option is correct
  const isCorrectOption = (optionKey: string): boolean => {
    return getOptionLetter(optionKey) === correctAnswer;
  };

  // Render options dynamically
  const renderOptions = () => {
    if (!currentQuestionOptions) {
      // Fallback to static options if no data provided
      return (
        <>
          <QuizOption optionKey="A." label="Onitsha market" index={0}  />
          <QuizOption optionKey="B." label="Eko market" index={1} />
          <QuizOption optionKey="C." label="Centre market" index={2} />
          <QuizOption optionKey="D." label="Kumasi market" index={3} />
        </>
      );
    }

    return Object.entries(currentQuestionOptions)
      .filter(([_, optionText]) => optionText) // Filter out empty options
      .map(([optionKey, optionText], index) => {
        const optionLetter = getOptionLetter(optionKey);
        const isCorrect = isCorrectOption(optionKey);
        
        return (
          <QuizOption
            key={optionKey}
            optionKey={`${optionLetter}.`}
            label={optionText || ''}
            isCorrect={isCorrect}
            index={index}
          />
        );
      });
  };

  return (
    <div className="fixed inset-0 z-50  flex items-center w-[103.25rem] justify-center bg-black/80">
      <div className="px-8">

      <div className="bg-[#15052B] grid grid-cols-[1fr_1.5fr]  items-start gap-[2.1875rem] rounded-[30px] text-white w-full border border-[#7E3CE0] p-[1.875rem]">
        
        <div className="">
          <div className="bg-[#29104A] flex items-center justify-center rounded-10 px-[22px] py-2">
            <p className="text-[#9E5CFF] text-[1.625rem] font-sans font-semibold">
              Question {questionIndex}
            </p>
          </div>

          <div className="bg-[#000] border-[.125rem] border-[#7E3CE0] mt-3 rounded-[20px] px-4 py-10 flex justify-center items-center flex-col">
            <p className="text-white text-center text-2xl font-gilroyBold font-semibold">
              {question || "What is the Biggest market in West Africa?"}
            </p>

            {showBooster && (
              <div className="bg-[#011B0D] mt-5 rounded-[12px] py-2 px-8">
                <p
                  className="text-base text-white font-extrabold text-center"
                  style={{
                    WebkitTextStroke: "1px #04DA6A",
                    textShadow: "0px 2px 4px rgba(4, 218, 106, 0.5)",
                  }}
                >
                  {booster}
                  <span
                    className="text-base pl-1 font-outfit font-normal text-[#04DA6A]"
                    style={{
                      WebkitTextStroke: "0px",
                      textShadow: "none",
                    }}
                  >
                    Booster
                  </span>
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4 mt-3">
            {renderOptions()}
          </div>
        </div>
        
       <div className="relative min-h-[62rem] w-full">
  <div className="absolute inset-0 transition-opacity duration-300">
    {!mqttAnswerData ? (
      <HustleBoardModal
        currentQuestion={currentQuestion}
        currentQuestionAnswerData={currentQuestionAnswerData}
        showBid={showBid}
      />
    ) : (
      <HustleRevealResult
        mqttAnswerData={mqttAnswerData}
        currentQuestion={currentQuestion}
        showBid={showBid}
      />
    )}
  </div>
</div>

      </div>
      </div>
    </div>
  )
}

export default HustleQuestionAnswerModal