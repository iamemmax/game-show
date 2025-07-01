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
import { useGetGameContestants } from "@/app/admin/misc/api";
import { useParams } from "next/navigation";
interface Prop {
  // setShowQuestionScreen?: React.Dispatch<React.SetStateAction<boolean>>;
  //  onNext: () => void
  hustleReveal: hustleRevealProps | null | undefined;
}

const HustleBoardInvestCapitall = ({ hustleReveal }: Prop) => {
    const params = useParams();
  const hustlePattern = [
    // { pattern: PATTERN_PURPLE_WHITE },
    { pattern: PATTERN_PURPLE_GREY },
    { pattern: PATTERN_PURPLE_WHITE },
    { pattern: PATTERN_PURPLE_BLACK },
    { pattern: PATTERN_ORANGE_BLACK },
    { pattern: PATTERN_GREEN_BLACK },
  ];
    const { data: allContestsant } = useGetGameContestants(
     Number(params?.episodeId)
    );
  

   const getContestantInfo = (id: number) => {
    const allconstestant = allContestsant?.data?.find(
      (contestant) => contestant.id === id
    );

    return allconstestant;
  };

  if (!hustleReveal?.data || hustleReveal.data.length === 0) {
    return <div className="text-white text-base">No hustle data available</div>;
  }

  return (
    <div className="flex flex-col gap-2 w-full mx-auto px-4">
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
        <p className="text-white text-2xl font-bold leading-tight">
          ₦{addCommasToNumber(
            Number(getContestantInfo(contestant?.contestant_id)?.actual_balance)
           )}
        </p>
      </div>
    </div>
  </div>

  {/* Hustle Cards - Existing code */}
  <div className="grid grid-cols-5 relative gap-4 flex-grow ">
    {contestant.reveals?.map((card, cardIdx) => (
      <div key={card.id} className="  mb-2 relative">
        <HustleCardTwo
          id={card.id.toString()}
          title={convertKebabAndSnakeToTitleCase(
            card.hustle_name?.split(" ")[0]
          )}
          number={card.hustle_number}
          amount={`₦${addCommasToNumber(Number(card.hustle_amount.toFixed(0)))}`}
          pattern={hustlePattern[cardIdx % hustlePattern.length].pattern}
          titleContainer="w-full flex justify-center items-center absolute left-0 truncate top-[5px] font-bold text-white leading-tight line-clamp-2"
          titleClassName="text-[1.5rem] truncate"
          numberClassName="text-[3rem] top-5 "
          amountClassName="2xl:text-[1.2rem] top-2 text-[1.4rem] 3xl:text-[1.8rem] font-bold "
          className=" w-full min-h-[8rem] "
        />

        {/* <motion.div 
          className="flex justify-center items-center mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className={`text-xs text-center font-gilroyMedium ${
            card?.hustle_state === "DUD" 
              ? "bg-[#2D0408] text-[#EB001B]" 
              : "bg-[#011B0D] text-[#04DA6A]"
          } px-3 py-2 rounded-10 text-white`}>
            {convertKebabAndSnakeToTitleCase(card.hustle_state)}
          </p>
        </motion.div> */}
      </div>
    ))}
  </div>
</div>
      ))}
    </div>
  );
};

export default HustleBoardInvestCapitall;
