import KillerIcon from "@/app/icons/KillerIcon";
import { GlowyStrokeText } from "@/components/core";
import { addCommasToNumber } from "@/utils";

type ExtraBallDetails = {
  name: "KILLER_BALL" | "CRYSTAL_BALL" | "LIBERTY_LIFE_BALL" | "EXTRA_PICK_BALL" | string;
  type: string;
  effect_action: string;
  effect_desc: string;
};

type BalanceDetails = {
  is_gain: boolean;
  previous_balance: string;
  amount_gained: number;
  amount_lost: number;
  current_balance: number;
};

type ContestantPick = {
  contestant_id: number;
  number_pick: number;
  is_match: boolean;
  is_extra_ball: boolean;
  extra_ball_details?: ExtraBallDetails;
  balance_details: BalanceDetails;
};

type MyData = {
  name: ContestantPick;
  number_revealed: (number | null)[];
};

interface prop{
    isOpen:boolean
    data:MyData
    
}
const KillerHustlePulledModal = ({isOpen,data}:prop) => {
  return (

    <>
    
    {isOpen&&  <div className="flex flex-col items-center text-center text-white space-y-4">
        {/* Icon */}
      <KillerIcon/>
  
        {/* Title */}
        <h2 className="text-5xl  font-outfit text-[#EB001B] mt-5   font-black">Killer Hustle Pulled</h2>
  
        {/* Subtitle */}
        <h3 className="text-3xl font-bold text-[#EEF2F6] font-gilroyMedium">Your winnings are now at risk.</h3>
  
        {/* Description */}
        <p className="text-lg text-white max-w-lg font-montserrat  ">
          That hits hard, your total pot just dropped by 50%. One killer can crash your whole hustle.
          Be careful!
        </p>
  
        {/* Amount Box */}
        <div className="px-6  text-[20px] font-bold text-white ">
         {/* <h2 className=" line-through"> ₦1,000,000.00</h2> */}

         <GlowyStrokeText
                               strokeWidth={2}
                               strokeColor="#04DA6A"
                               glowColor="#04DA6A"
                               glowIntensity="low"
                               textclassName="text-[2.5rem]  font-black font-gilroyMedium [@media(min-width:2000px)]:text-[5rem]"
                               fillColor="#fff"
                               lineThrough={true}
                               lineThroughColor="#04DA6A"
                             >
                               ₦{addCommasToNumber(Number(data?.name?.balance_details?.previous_balance))}
                             </GlowyStrokeText>
        <p className="  text-[3.125rem] -mt-2 font-black font-gilroyBold text-[#EB001B]">
       ₦{addCommasToNumber(Number(data?.name?.balance_details?.current_balance))}
        </p>
        </div>
  
        {/* Red Glitch Glow */}
      </div>}
    </>
  );
};

export default KillerHustlePulledModal;
