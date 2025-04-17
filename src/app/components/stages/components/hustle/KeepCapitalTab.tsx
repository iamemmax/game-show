import HustleCard from "@/app/shared/HustleCard";
import {
  PATTERN_ORANGE_BLACK,
  PATTERN_PURPLE_GREY,
  PATTERN_PURPLE_WHITE,
  PATTERN_GREEN_BLACK,
  PATTERN_PURPLE_BLACK,
} from "@/app/shared/HustleCard.PatternTypes";
import React from "react";

const KeepCapitalTab = () => {
  return (
    <div className="grid grid-cols-5  items-center gap-3 px-2  text-white ">
      <HustleCard
        id="Caterer"
        title="Caterer"
        number={"4"}
        amount={"₦180,000"}
       amountClassName="text-[1.25rem] 2xl:text-[2rem]"
        numberClassName="text-[2.5rem] text-white"
        className=" text-xs border-[1px]  py-0"
        titleClassName="text-base font-extrabold"
        pattern={PATTERN_PURPLE_WHITE}
      />
      <HustleCard
        id="Fashion"
        title="Fashion"
        number={"15"}
        amount={"₦180,000"}
        pattern={PATTERN_PURPLE_GREY}
       amountClassName="text-[1.25rem] 2xl:text-[2rem]"
         numberClassName="text-[2.5rem] text-white"
        className=" text-xs border-[1px]  py-0"
        titleClassName="text-base font-extrabold"
      />
      <HustleCard
       id="Agritech"
       title="Agri tech"
       number={"13"}
       amount={"₦180,000"}
       pattern={PATTERN_PURPLE_BLACK}
       amountClassName="text-[1.25rem] 2xl:text-[2rem]"
         numberClassName="text-[2.5rem] text-white"
        className=" text-xs border-[1px]  py-0"
        titleClassName="text-base font-extrabold"
      />
     
      <HustleCard
        id="Fintech"
        title="Fintech"
        number={"15"}
        amount={"₦180,000"}
        pattern={PATTERN_ORANGE_BLACK}
       amountClassName="text-[1.25rem] 2xl:text-[2rem]"
         numberClassName="text-[2.5rem] text-white"
        className=" text-xs border-[1px]  py-0"
        titleClassName="text-base font-extrabold"
      />
      <HustleCard
        id="Barber"
        title="Barber"
        number={"25"}
        amount={"₦180,000"}
        pattern={PATTERN_GREEN_BLACK}
       amountClassName="text-[1.25rem] 2xl:text-[2rem]"
         numberClassName="text-[2.5rem] text-white"
        className=" text-xs border-[1px] py-0"
        titleClassName="text-base font-extrabold"
      />
    </div>
  );
};

export default KeepCapitalTab;
