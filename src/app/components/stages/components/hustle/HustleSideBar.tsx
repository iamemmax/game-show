
import JackpotContainer from "@/app/shared/JackpotContainer";
import StagesCard from "@/app/shared/StagesCard";
// import UserBadge from "@/app/shared/UserBadge";
import {  GlowyStrokeText } from "@/components/core";
import React from "react";
import { contestantImages } from "../mocks/contestantImages";
// import { useGetWalletBalance } from "../../api/stage1/getbalance";
import { tokenStorage } from "@/utils/auth";
import { addCommasToNumber } from "@/utils";
// import { processEliminatedContestants } from "@/utils/contestants";
import Image from "next/image";
import { useGetGameContestants } from "@/app/admin/misc/api";
import { useParams } from "next/navigation";

interface prop {
  showJackpot?: boolean;
  showEmptyCard?: boolean;
  showHustlerCard?: boolean;
  eliminated?: number;
  removeCount?: number;
  showHustleCardAmt?: boolean;
  mqttAnswerData?: any;
}

const HustleSideBar = ({
  showJackpot = true,
  showEmptyCard = false,
  showHustlerCard = false,
  showHustleCardAmt = true,
  mqttAnswerData
}: prop) => {
  const user = tokenStorage.getUser();
  const params = useParams();

  const { data: allContestsant, isLoading } = useGetGameContestants(
    !params?.episodeId ? user?.game_episode as number : Number(params?.episodeId)
  );

  const myContestant = allContestsant?.data?.find(
    (contestant) => contestant.id === user?.contestant_id
  );

  // Only use allContestsant when mqttAnswerData is empty array, undefined, or null
  const dataToRender = !mqttAnswerData || mqttAnswerData.length === 0 
    ? allContestsant?.data || []
    : mqttAnswerData;

  return (
    <div className="flex justify-between h-full items-center flex-col">
      <div className="relative flex flex-col justify-center items-center">
      </div>

      {showHustlerCard && (
        <>
          {isLoading ? (
            <div className="flex-1 flex px-3 h-full flex-col justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
            </div>
          ) : (
            <div className="flex-1 flex px-3 gap-5 h-full flex-col justify-center items-center [@media(min-width:2000px)]:gap-10">
              {dataToRender.map((contestant: any, idx: number) => {
                // For mqttAnswerData (when it has data), find the corresponding contestant info
                let contestantInfo = contestant;
                if (mqttAnswerData && mqttAnswerData.length > 0) {
                  // Find the contestant details from allContestsant based on contestant_id
                  contestantInfo = allContestsant?.data?.find(
                    (c: any) => c.id === contestant.contestant_id
                  ) || contestant;
                }

                const isMyContestant = contestantInfo.id === myContestant?.id || 
                  contestant.contestant_id === myContestant?.id;

                return (
                  <div
                    className={`w-[8.5456rem] ${
                      isMyContestant ? "bg-[#FFC125]" : "bg-[#ae77ff]"
                    } p-[5px] h-[70.66px] rounded-[12.79px] [@media(min-width:2000px)]:w-[12rem] [@media(min-width:2000px)]:h-[7rem] relative ${
                      contestantInfo?.is_eliminated ? "opacity-50 hidden" : ""
                    }`}
                    key={idx}
                  >
                    <div
                      className={`w-full h-full flex justify-center items-center rounded-[12.79px] bg-gradient-to-b ${
                        isMyContestant
                          ? "from-amber-500 to-yellow-500"
                          : "from-[#d531f8] to-[#9a5eb2]"
                      }`}
                    >
                      <div className="w-[1.875rem] h-[1.875rem] [@media(min-width:2000px)]:w-[4rem] [@media(min-width:2000px)]:h-[4rem] absolute -top-3 [@media(min-width:2000px)]:-top-[1.5rem] rounded-full overflow-hidden">
                        <Image
                          src={contestantImages[idx] ?? ""}
                          alt="User Image"
                          width={30}
                          height={30}
                          className="object-cover [@media(min-width:2000px)]:w-[4rem] [@media(min-width:2000px)]:h-[4rem]"
                        />
                      </div>
                      {/* Place the dot outside the image container but position it relative to it */}
                      <div
                        className="z-[999999] bg-green-500 -mt-2 absolute w-2.5 h-2.5 rounded-full [@media(min-width:2000px)]:mt-[0.2rem]"
                        style={{ top: "15px", right: "52px" }}
                      />
                      <div className="relative w-full">
                        <div className="flex flex-col justify-center gap-0 mt-3 items-center w-full">
                          {showHustleCardAmt && (
                            <GlowyStrokeText
                              strokeWidth={2}
                              strokeColor="#a132b7"
                              glowColor="#ce45eb"
                              glowIntensity="low"
                              textclassName="text-[19.18px] font-extrabold font-gilroyHeavy text-white"
                              fillColor="#fff"
                            >
                              {`₦${addCommasToNumber(
                                Number(contestant?.stage_balance) || 
                                Number(contestantInfo?.actual_balance) || 
                                0
                              )}`}
                            </GlowyStrokeText>
                          )}
                          <GlowyStrokeText
                            truncate
                            strokeWidth={2}
                            strokeColor="#a132b7"
                            glowColor="#ce45eb"
                            glowIntensity="low"
                            textclassName="text-[19.18px] font-extrabold font-gilroyHeavy text-white -mt-2 max-w-[110px] truncate [@media(min-width:2000px)]:text-[1.2rem]"
                            fillColor="#fff"
                          >
                            {contestantInfo?.name?.split(" ")[0]}
                          </GlowyStrokeText>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {showEmptyCard && (
        <div className="flex-1 flex px-3 h-full 2xl:gap-4 flex-col justify-center items-center">
          {Array.from({ length: 6 }).map((_, index) => (
            <StagesCard
              key={index}
              title=""
              subTitle=""
              borderColor="#FFC125"
              iconText=""
              showIcon={false}
              width={130}
              className="2xl:w-[260px]"
            />
          ))}
        </div>
      )}
      <div className="min-h-[100px]">
        {showJackpot && <JackpotContainer size={80} text="₦100m" />}
      </div>
    </div>
  );
};

export default HustleSideBar;