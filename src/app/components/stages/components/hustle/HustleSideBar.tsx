import JackpotContainer from "@/app/shared/JackpotContainer";
import StagesCard from "@/app/shared/StagesCard";
// import UserBadge from "@/app/shared/UserBadge";
import { GlowyStrokeText } from "@/components/core";
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
  // mqttAnswerBalanceData?: any;
}

const HustleSideBar = ({
  showJackpot = true,
  showEmptyCard = false,
  showHustlerCard = false,
  showHustleCardAmt = true,
  mqttAnswerData,
  // mqttAnswerBalanceData
}: prop) => {
  const user = tokenStorage.getUser();
  const params = useParams();

  const { data: allContestsant, isLoading } = useGetGameContestants(
    !params?.episodeId
      ? (user?.game_episode as number)
      : Number(params?.episodeId)
  );

  const myContestant = allContestsant?.data?.find(
    (contestant) => contestant.id === user?.contestant_id
  );

  // Only use allContestsant when mqttAnswerData is empty array, undefined, or null
  const dataToRender =
    !mqttAnswerData || mqttAnswerData.length === 0
      ? allContestsant?.data || []
      : mqttAnswerData;

  return (
    <div className="flex justify-between !z-[999999999999] h-full items-center flex-col">
      <div className="relative flex flex-col justify-center items-center"></div>

      {showHustlerCard && (
  <>
    {isLoading ? (
      <div className="flex-1 flex px-3 h-full flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
      </div>
    ) : (
      <div className={`flex-1 flex px-3 gap-6 h-full flex-col justify-center items-center`}>
        {dataToRender?.map((contestant: any, idx: number) => {
          const isBoardRoute = typeof params?.episodeId !== "undefined";

          let contestantInfo = contestant;
          if (mqttAnswerData && mqttAnswerData.length > 0) {
            contestantInfo =
              allContestsant?.data?.find(
                (c: any) => c.id === contestant.contestant_id
              ) || contestant;
          }

          const isMyContestant =
            contestantInfo.id === myContestant?.id ||
            contestant.contestant_id === myContestant?.id;

          const baseCardBg = isBoardRoute
            ? "bg-[#ae77ff]"
            : isMyContestant
              ? "bg-[#FFC125]"
              : "bg-[#ae77ff]";

          const baseGradient = isBoardRoute
            ? "from-[#d531f8] to-[#9a5eb2]"
            : isMyContestant
              ? "from-amber-500 to-yellow-500"
              : "from-[#d531f8] to-[#9a5eb2]";

          return (
            <div
              key={idx}
              className={`${isBoardRoute ? "w-[12rem] h-[7rem] mt-3" : "w-[8.5456rem] h-[70.66px]"} ${baseCardBg} p-[5px] rounded-[12.79px] relative ${
                contestantInfo?.is_eliminated ? "opacity-50 hidden" : ""
              }`}
            >
              <div
                className={`w-full h-full flex justify-center items-center rounded-[12.79px] bg-gradient-to-b ${baseGradient}`}
              >
                {/* Avatar */}
                <div
                  className={`absolute ${isBoardRoute?"-top-6":"-top-3"}  rounded-full overflow-hidden ${
                    isBoardRoute ? "h-[4rem] w-[4rem]" : "h-[1.875rem] w-[1.875rem]"
                  }`}
                >
                  <Image
                    src={contestantImages[idx] ?? ""}
                    alt="User Image"
                    width={isBoardRoute ? 64 : 30}
                    height={isBoardRoute ? 64 : 30}
                    className="object-cover w-full h-full"
                  />
                </div>

                {/* Green Dot */}
                <div
                  className="z-[999999] bg-green-500 -mt-2 absolute w-2.5 h-2.5 rounded-full"
                  style={{ top:isBoardRoute?"35px": "15px", right: isBoardRoute?"60px" :"52px" }}
                />

                {/* Balance & Name */}
                <div className={`relative w-full ${isBoardRoute?"mt-4":""}`}>
                  <div className="flex flex-col justify-center gap-0 mt-3 items-center w-full">
                    {showHustleCardAmt && (
                      <GlowyStrokeText
                        strokeWidth={2}
                        strokeColor="#a132b7"
                        glowColor="#ce45eb"
                        glowIntensity="low"
                        textclassName={`${
                          isBoardRoute
                            ? "text-[1.3rem]"
                            : "text-[19.18px]"
                        } font-extrabold font-gilroyHeavy text-white`}
                        fillColor="#fff"
                      >
                        {allContestsant?.game?.stage !== "STAGE_ONE"
                          ? `₦${addCommasToNumber(
                              Number(contestant?.actual_balance) || 0
                            )}`
                          : `₦${addCommasToNumber(
                              Number(contestant?.stage_balance)
                            )}`}
                      </GlowyStrokeText>
                    )}
                    <GlowyStrokeText
                      truncate
                      strokeWidth={2}
                      strokeColor="#a132b7"
                      glowColor="#ce45eb"
                      glowIntensity="low"
                      textclassName={`${
                        isBoardRoute
                          ? "text-[1.2rem]"
                          : "text-[19.18px]"
                      } font-extrabold font-gilroyHeavy text-white -mt-1   max-w-[110px] truncate`}
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
