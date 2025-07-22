import StagesCard from "@/app/shared/StagesCard";
import { useParams } from "next/navigation";
import React from "react";
interface prop {
  activeStage?: number;
  
}
const HustleStages = ({ activeStage = 1 }: prop) => {
  const params = useParams();
     const isBoardRoute = typeof params?.episodeId !== "undefined";

  return (
    <div>
      <div className="  flex flex-col items-center justify-center gap-4 p-4">
        <StagesCard
          borderColor={
            activeStage === 1 ? "#5d400b" : "#FFC125"
          }
          iconText="1"
          title="Stage1"
          subTitle="Hustle kick off"
          backgroundFill={activeStage === 1 ? "#5d400b" : "#FFC125"}
          isActive={activeStage === 1 ? true : false}
          className={isBoardRoute ? "w-[15rem] h-[7rem]" : "w-[10rem] h-[5rem]"}
          // className="[@media(min-width:2000px)]:w-[15rem]  [@media(min-width:2000px)]:h-[7rem]"
         
        />
        <StagesCard
          title="Stage 2"
          subTitle="Prove your hustle"
          isActive={activeStage === 2 ? true : false}
          borderColor={activeStage === 2 ? "#5d400b" : "#FFC125"}
          iconText="2"
          backgroundFill={activeStage === 2 ? "#5d400b" : "#FFC125"}
           className={isBoardRoute ? "w-[15rem] h-[7rem]" : "w-[10rem] h-[5rem]"}
          //  className="[@media(min-width:2000px)]:w-[25rem]  [@media(min-width:2000px)]:h-[7rem]"
        />

        <StagesCard
          title="Stage 3"
          subTitle="DUd & Pass"
          isActive={activeStage === 3 ? true : false}
          borderColor={activeStage === 3 ? "#5d400b" : "#FFC125"}
          iconText="3"
          backgroundFill={activeStage === 3 ? "#5d400b" : "#FFC125"}
           className={isBoardRoute ? "w-[15rem] h-[7rem]" : "w-[10rem] h-[5rem]"}
          //  className="[@media(min-width:2000px)]:w-[15rem]  [@media(min-width:2000px)]:h-[7rem]"
        />

        <StagesCard
          title="Stage 4"
          subTitle="Buyout or Draw"
          borderColor={activeStage === 4 ? "#5d400b" : "#FFC125"}
          iconText="5"
          finalStage={true}
          isActive={activeStage === 4 ? true : false}
          backgroundFill={activeStage === 4 ? "#5d400b" : "#FFC125"}
           className={isBoardRoute ? "w-[15rem] h-[7rem]" : "w-[10rem] h-[5rem]"}
          //  className="[@media(min-width:2000px)]:w-[15rem]  [@media(min-width:2000px)]:h-[7rem]"
        />
      </div>
    </div>
  );
};

export default HustleStages;
