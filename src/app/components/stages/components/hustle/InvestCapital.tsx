import React from "react";
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
import { convertNumberToNaira } from "@/utils/currency";
import { addCommasToNumber } from "@/utils";

interface Prop{
  setShowQuestionScreen: React.Dispatch<React.SetStateAction<boolean>>
  hustleReveal: Reveal[] | undefined
}
const InvestCapital = ({setShowQuestionScreen,hustleReveal}:Prop) => {
  const hustlePattern =[
    {
   
      pattern: PATTERN_PURPLE_WHITE,
     
    },
    {
     
      pattern: PATTERN_PURPLE_GREY,
       
    },
    {
    
      pattern: PATTERN_PURPLE_BLACK,
   
    },
    {
    
      pattern: PATTERN_ORANGE_BLACK,
      
    },
    {
      
      pattern: PATTERN_GREEN_BLACK,
    
    }
  ]
  
  return (
    <div className="w-full">
    <div className="grid grid-cols-5 items-center gap-3 px-2 text-white">
      {hustleReveal?.map((card,idx:number) => (
        <div className="" key={card.id}>
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
       
          <div className="flex justify-center items-center mt-3"><p className={`text-xs  text-center font-gilroyMedium ${card?.hustle_state==="DUD"?"bg-[#2D0408] text-[#EB001B]":"bg-[#011B0D] text-[#04DA6A]"} px-3  py-[7px] rounded-10 text-white `}>{convertKebabAndSnakeToTitleCase(card.hustle_state)}</p></div>
    
        </div>
      ))}
    </div>

    <div className="mt-2 flex w-full justify-center py-2 items-center">
      {/* <Button className="p-0 bg-transparent" onClick={()=>setShowQuestionScreen(true)}>
        <GradientButton text="invest" className="uppercase" height={35}/>
      </Button> */}
    </div>
    </div>
  );
};

export default InvestCapital;

