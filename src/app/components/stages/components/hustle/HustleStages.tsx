import StagesCard from "@/app/shared/StagesCard";
import React from "react";
interface prop {
  activeStage?: number;
}
const HustleStages = ({ activeStage = 1 }: prop) => {
  return (
    <div>
      <div className="  flex flex-col items-center justify-center gap-4 p-4">
        <StagesCard
          borderColor={
            activeStage === 1 ? "#5d400b" : "#FFC125"
          }
          iconText="1"
          title="Stage1"
          subTitle="Choose Hustle"
          backgroundFill={activeStage === 1 ? "#5d400b" : "#FFC125"}
          isActive={activeStage === 1 ? true : false}
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
          isActive={activeStage === 2 ? true : false}
          borderColor={activeStage === 2 ? "#5d400b" : "#FFC125"}
          iconText="2"
          backgroundFill={activeStage === 2 ? "#5d400b" : "#FFC125"}
        />

        <StagesCard
          title="Stage 3"
          subTitle="Pick a Number"
          isActive={activeStage === 3 ? true : false}
          borderColor={activeStage === 3 ? "#5d400b" : "#FFC125"}
          iconText="3"
          backgroundFill={activeStage === 3 ? "#5d400b" : "#FFC125"}
        />

        <StagesCard
          title="Stage 4"
          subTitle="Buyout or Draw"
          borderColor={activeStage === 4 ? "#5d400b" : "#FFC125"}
          iconText="5"
          finalStage={true}
          isActive={activeStage === 4 ? true : false}
          backgroundFill={activeStage === 4 ? "#5d400b" : "#FFC125"}
        />
      </div>
    </div>
  );
};

export default HustleStages;
