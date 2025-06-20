import KillerIcon from "@/app/icons/KillerIcon";
import { GlowyStrokeText } from "@/components/core";
interface prop{
    isOpen:boolean
}
const KillerHustlePulledModal = ({isOpen}:prop) => {
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
                               ₦1,000,000.00
                             </GlowyStrokeText>
        <p className="  text-[3.125rem] -mt-2 font-black font-gilroyBold text-[#EB001B]">
        ₦500,000.00
        </p>
        </div>
  
        {/* Red Glitch Glow */}
      </div>}
    </>
  );
};

export default KillerHustlePulledModal;
