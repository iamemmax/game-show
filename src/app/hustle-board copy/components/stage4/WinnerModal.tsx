import KillerIcon from "@/app/icons/KillerIcon";
import WinnerBallIcon from "@/app/icons/WinnerBallIcon";
import { GlowyStrokeText } from "@/components/core";
interface prop{
    isOpen:boolean
}
const WinnerBallModal = ({isOpen}:prop) => {
  return (

    <>
    
    {isOpen&&  <div className="flex flex-col items-center text-center text-white space-y-4">
        {/* Icon */}
      <WinnerBallIcon/>
  
        {/* Title */}
        {/* <h2 className="text-5xl  font-outfit text-[#EB001B] mt-5   font-black">Killer Hustle Pulled</h2> */}
  
        {/* Subtitle */}
        <h3 className="text-3xl font-bold text-[#EEF2F6] font-gilroyMedium mt-5">The Hustle Champion - Ihotu.</h3>
  
        {/* Description */}
        <p className="text-lg text-white max-w-xl font-montserrat  ">
        You played hard, outsmarted the competition, and now you’re set for life! The grind was real, the journey was tough—but YOU made it! Welcome to financial freedom!
        </p>
  
        {/* Amount Box */}
        <div className="px-6  text-[20px] font-bold text-white ">

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

export default WinnerBallModal;
