import CrystalIcon from "@/app/icons/CrystalIcon";
import KillerIcon from "@/app/icons/KillerIcon";
import { GlowyStrokeText } from "@/components/core";
interface prop{
    isOpen:boolean
}
const CrystalModal = ({isOpen}:prop) => {
  return (

    <>
    
    {isOpen&&  <div className="flex flex-col items-center text-center text-white space-y-4">
        {/* Icon */}
      <CrystalIcon/>
  
        {/* Title */}
        <h2 className="text-5xl  font-outfit text-[#04DA6A] mt-5   font-black">Crystal Hustle Found</h2>
  
        {/* Subtitle */}
  
        {/* Description */}
        <p className="text-lg text-white max-w-xl font-montserrat  ">
         You just earned a ₦3,000,000 bonus on top of your winnings! Sometimes the hustle brings unexpected gold. Well played!
        </p>
  
        {/* Amount Box */}
        <div className="px-6  text-[20px] font-bold text-white ">
         {/* <h2 className=" line-through"> ₦1,000,000.00</h2> */}

         <GlowyStrokeText
                               strokeWidth={2}
                               strokeColor="#04DA6A"
                               glowColor="#04DA6A"
                               glowIntensity="medium"
                               textclassName="text-[2.9rem]  font-black  font-gilroyHeavy [@media(min-width:2000px)]:text-[5rem]"
                               fillColor="#fff"
                               lineThroughColor="#04DA6A"
                             >
                               ₦3,500,000
                             </GlowyStrokeText>
       
        </div>
  
        {/* Red Glitch Glow */}
      </div>}
    </>
  );
};

export default CrystalModal;

