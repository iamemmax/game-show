import StagesCard from "@/app/shared/StagesCard";
import React from "react";

const HustleStages = () => {
  return (
    <div>
      <div className="  flex flex-col items-center justify-center gap-2 p-4">
        <StagesCard
          borderColor="#5d400b"
          iconText="1"
          title="Stage1"
          subTitle="Choose Hustle"
          backgroundFill="#5d400b"
          isActive={true}
        //   customDefs={
        //     <defs>
        //       <linearGradient id="bgGradient" x1="0" y1="0" x2="1" y2="1">
        //         <stop offset="80%" stopColor="#5d400b" />
        //         <stop offset="20%" stopColor="#FFC125" />
        //       </linearGradient>
        //     </defs>
        //   }
        />
        <StagesCard 
         title="Stage 2"
          subTitle="Grind & Grow"
        borderColor="#FFC125" iconText="2" />

        <StagesCard 
         title="Stage 3"
          subTitle="Pick a Number"

        borderColor="#FFC125" iconText="3" />
        <StagesCard 
         title="Stage 4"
          subTitle="Wildcards"
        borderColor="#FFC125" iconText="4" />
        <StagesCard 
         title="Stage 5"
          subTitle="Pick and Flip"
        borderColor="#FFC125" iconText="5" />
        <StagesCard 
         title="Stage 6"
          subTitle="Buyout or Draw"
        borderColor="#FFC125" iconText="5"
        finalStage={true}
        
         />

    
      </div>
    </div>
  );
};

export default HustleStages;
