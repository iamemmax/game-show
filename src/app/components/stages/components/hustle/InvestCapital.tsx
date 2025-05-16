import React, { useState, useEffect } from "react";
import GradientButton from "@/app/shared/GradientButton";
import HustleCard from "@/app/shared/HustleCard";
import {
  PATTERN_ORANGE_BLACK,
  PATTERN_PURPLE_GREY,
  PATTERN_PURPLE_WHITE,
  PATTERN_GREEN_BLACK,
  PATTERN_PURPLE_BLACK,
} from "@/app/shared/HustleCard.PatternTypes";
import { Button } from "@/components/core";
import { Reveal } from "../../api/stage1/getHustleReveal";
import { convertKebabAndSnakeToTitleCase } from "@/utils/strings";
// import { convertNumberToNaira } from "@/utils/currency";
import { addCommasToNumber } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Prop{
  setShowQuestionScreen: React.Dispatch<React.SetStateAction<boolean>>
  hustleReveal: Reveal[] | undefined
}
const InvestCapital = ({hustleReveal}:Prop) => {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  
  useEffect(() => {
    // Show cards one by one with a delay
    if (hustleReveal && hustleReveal.length > 0) {
      hustleReveal.forEach((_, index) => {
        setTimeout(() => {
          setVisibleCards(prev => [...prev, index]);
        }, 500 * (index + 1)); // 500ms delay between each card
      });
    }
  }, [hustleReveal]);

  const hustlePattern = [
    { pattern: PATTERN_PURPLE_WHITE },
    { pattern: PATTERN_PURPLE_GREY },
    { pattern: PATTERN_PURPLE_BLACK },
    { pattern: PATTERN_ORANGE_BLACK },
    { pattern: PATTERN_GREEN_BLACK }
  ];
  
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.8 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };
  
  return (
    <div className="w-full">
      <div className="grid grid-cols-5 items-center gap-3 px-2 text-white">
        <AnimatePresence>
          {hustleReveal?.map((card, idx: number) => (
            visibleCards.includes(idx) && (
              <motion.div 
                className="" 
                key={card.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <HustleCard
                  id={card?.id.toString()}
                  title={convertKebabAndSnakeToTitleCase(card?.hustle_name)}
                  number={card.hustle_number}
                  amount={`₦${addCommasToNumber(Number(card?.hustle_amount?.toFixed(0)?.toLocaleString()))}`}
                  pattern={hustlePattern[idx]?.pattern}
                  amountClassName="text-[1.5rem] 2xl:text-[1.8rem]"
                  numberClassName="text-[2.5rem] text-white"
                  className="text-xs border-[1px] py-0"
                  titleClassName="text-xs font-extrabold"
                />
                
                <motion.div 
                  className="flex justify-center items-center mt-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className={`text-xs text-center font-gilroyMedium ${
                    card?.hustle_state === "DUD" 
                      ? "bg-[#2D0408] text-[#EB001B]" 
                      : "bg-[#011B0D] text-[#04DA6A]"
                  } px-3 py-[7px] rounded-10 text-white`}>
                    {convertKebabAndSnakeToTitleCase(card.hustle_state)}
                  </p>
                </motion.div>
              </motion.div>
            )
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InvestCapital;

