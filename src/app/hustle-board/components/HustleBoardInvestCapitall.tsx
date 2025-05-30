import React from "react";
import HustleCard from "@/app/shared/HustleCard";
import {
  PATTERN_ORANGE_BLACK,
  PATTERN_PURPLE_GREY,
  PATTERN_PURPLE_WHITE,
  PATTERN_GREEN_BLACK,
  PATTERN_PURPLE_BLACK,
} from "@/app/shared/HustleCard.PatternTypes";
import { convertKebabAndSnakeToTitleCase } from "@/utils/strings";
import { addCommasToNumber } from "@/utils";
import { hustleRevealProps } from "@/app/components/stages/api/stage1/getHustleReveal";
import Image from "next/image";
import { contestantImages } from "@/app/components/stages/components/mocks/contestantImages";
import HustleCardTwo from "@/app/shared/HustleCardTwo";
import { motion } from "framer-motion";
interface Prop {
  setShowQuestionScreen?: React.Dispatch<React.SetStateAction<boolean>>;
  hustleReveal: hustleRevealProps | null | undefined;
}

const HustleBoardInvestCapitall = ({ hustleReveal }: Prop) => {
  const hustlePattern = [
    // { pattern: PATTERN_PURPLE_WHITE },
    { pattern: PATTERN_PURPLE_GREY },
    { pattern: PATTERN_PURPLE_WHITE },
    { pattern: PATTERN_PURPLE_BLACK },
    { pattern: PATTERN_ORANGE_BLACK },
    { pattern: PATTERN_GREEN_BLACK },
  ];

  if (!hustleReveal?.data || hustleReveal.data.length === 0) {
    return <div>No hustle data available</div>;
  }

  return (
    <div className="flex flex-col gap-2 w-full max-w-[1400px] mx-auto px-4">
      {hustleReveal.data.map((contestant, idx) => (
    <div key={contestant.contestant_id} className="grid grid-cols-[1fr_5fr] items-start gap-3">
  {/* Contestant Card - Purple card style */}
  <div className="aspect-video bg-[#1C0240] border border-[#7E3CE0] rounded-lg py-3 px-4 flex-shrink-0 flex flex-col justify-between relative overflow-hidden">
    {/* Background pattern/texture - optional */}
    <div className="absolute inset-0 bg-black/10 rounded-lg"></div>
    
    {/* Content */}
    <div className="relative z-10 flex flex-col h-full justify-between">
      {/* Top section with image */}
      <div className="flex justify-start">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
          <Image
            alt=""
            src={contestantImages[idx] || "/images/userImage.png"}
            width={40}
            height={40}
            className="rounded-full w-full h-full object-cover"
          />
        </div>
      </div>
      
      {/* Bottom section with text */}
      <div className="flex flex-col items-start">
        <p className="text-white text-sm font-medium leading-tight mb-1">
          {contestant.contestant_details?.name}
        </p>
        <p className="text-white text-lg font-bold leading-tight">
          ₦{addCommasToNumber(
            contestant.reveals
              .filter((card) => card.hustle_state !== "DUD")
              .reduce((sum, card) => sum + card.hustle_amount, 0)
          )}
        </p>
      </div>
    </div>
  </div>

  {/* Hustle Cards - Existing code */}
  <div className="grid grid-cols-5 gap-4 flex-grow [@media(min-width:2000px)]:gap-[4rem]">
    {contestant.reveals?.map((card, cardIdx) => (
      <div key={card.id} className="aspect-video relative">
        <HustleCardTwo
          id={card.id.toString()}
          title={convertKebabAndSnakeToTitleCase(
            card.hustle_name?.split(" ")[0]
          )}
          number={card.hustle_number}
          amount={`₦${addCommasToNumber(Number(card.hustle_amount.toFixed(0)))}`}
          pattern={hustlePattern[cardIdx % hustlePattern.length].pattern}
          titleContainer="w-full flex justify-center items-center absolute left-0 truncate top-0 font-bold text-white leading-tight line-clamp-2"
          titleClassName="text-[1.3rem] truncate"
          numberClassName="text-[2.5rem] mt-[15px]"
          amountClassName="text-[1.3rem] font-bold -mt-2"
          className="h-full w-full"
        />

        <motion.div 
          className="flex justify-center items-center mt-2"
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
      </div>
    ))}
  </div>
</div>
      ))}
    </div>
  );
};

export default HustleBoardInvestCapitall;
