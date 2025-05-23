import BarIcon from "@/app/icons/BarIcon";
import SettingsIcon from "@/app/icons/SettingIcon";
import ContestantCard from "@/app/shared/ContestantCard";
import IconBoard from "@/app/shared/IconBoard";
import JackpotContainer from "@/app/shared/JackpotContainer";
import StagesCard from "@/app/shared/StagesCard";
import UserBadge from "@/app/shared/UserBadge";
import { Button, GlowyStrokeText } from "@/components/core";
import React, { useEffect, useState } from "react";
import { contestantImages } from "../mocks/contestantImages";
import { useGetWalletBalance } from "../../api/stage1/getbalance";
import { tokenStorage } from "@/utils/auth";
import { addCommasToNumber } from "@/utils";
import { processEliminatedContestants } from "@/utils/contestants";
import Image from "next/image";
import { useGetGameContestants } from "@/app/admin/misc/api";
interface prop {
  showJackpot?: boolean;
  showEmptyCard?: boolean;
  showHustlerCard?: boolean;
  eliminated?: number;
  removeCount?: number;
}
const   HustleSideBar = ({
  showJackpot = true,
  showEmptyCard = false,
  showHustlerCard = false,
  eliminated = 0,
  removeCount = 0,
}: prop) => {
  const user = tokenStorage.getUser();
  const { data: dataBalance, isLoading } = useGetWalletBalance(
    user?.game_episode as number
  );
  const [processedBalances, setProcessedBalances] = useState<any[]>([]);
  const myBalance = dataBalance?.data?.balances?.find(
    (contestant) => contestant.contestant_id === user?.contestant_id
  );
    const {data:allContestsant} =useGetGameContestants(user?.game_episode as number);
    
    const myContestant = allContestsant?.data?.find(
      (contestant) => contestant.id === user?.contestant_id
    );

  // Process balances to mark or remove lowest contestants
  // useEffect(() => {
  //   if (dataBalance?.data?.balances) {
  //     // First, sort balances by amount (descending)
  //     const sortedBalances = [...dataBalance.data.balances].sort(
  //       (a, b) => parseFloat(String(b.book_balance)) - parseFloat(String(a.book_balance))
  //     );
      
  //     // If removeCount is specified, remove the lowest contestants
  //     let filteredBalances = sortedBalances;
  //     if (removeCount > 0) {
  //       filteredBalances = sortedBalances.slice(
  //         0, 
  //         Math.max(0, sortedBalances.length - removeCount)
  //       );
  //     }
      
  //     // If eliminated is specified, remove those contestants too
  //     if (eliminated > 0) {
  //       filteredBalances = filteredBalances.slice(
  //         0,
  //         Math.max(0, filteredBalances.length - eliminated)
  //       );
  //     }
      
  //     setProcessedBalances(filteredBalances);
      
  //     console.log(`Processed balances (removed ${removeCount + eliminated}):`, 
  //       filteredBalances.length);
  //   } else {
  //     setProcessedBalances([]);
  //   }
  // }, [dataBalance, eliminated, removeCount]);

  return (
    <div className="flex justify-between h-full items-center flex-col">
  

      <div className="relative flex flex-col  justify-center items-center">
      
      </div>

      {showHustlerCard && (
        <>
          {isLoading ? (
            <div className="flex-1 flex px-3 h-full flex-col justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
            </div>
          ) : (
            <div className="flex-1 flex px-3 gap-5 h-full flex-col justify-center items-center">
              {allContestsant?.data?.map((bal, idx: number) => (
                <div
                  className={`w-[136.73px] ${myContestant?.id === bal.id ? " bg-[#FFC125]" : "bg-[#ae77ff]"}  p-[5px] h-[70.66px] rounded-[12.79px] relative ${bal?.is_eliminated 
                    ? "opacity-50"  : ""  }`}
                  key={idx}
                >
                  <div className={`w-full h-full flex justify-center items-center rounded-[12.79px] 
                   bg-gradient-to-b  ${myContestant?.id === bal.id ? "from-amber-500 to-yellow-500 " : "from-[#d531f8] to-[#9a5eb2]"}`}>
                    <div className="w-[30px] h-[30px] absolute -top-3 rounded-full overflow-hidden">
                      <Image
                        src={contestantImages[idx] ?? ""}
                        alt="User Image"
                        width={30}
                        height={30}
                        className="object-cover"
                      />
                    </div>
                    {/* Place the dot outside the image container but position it relative to it */}
                    <div className="z-[999999] bg-green-500 -mt-2 absolute w-2.5 h-2.5 rounded-full" 
                         style={{ top: "15px", right: "52px" }} />
                    <div className="relative w-full">
                      <div className="flex flex-col justify-center gap-0 mt-3 items-center w-full">
                        <GlowyStrokeText
                          strokeWidth={2}
                          strokeColor="#a132b7"
                          glowColor="#ce45eb"
                          glowIntensity="low"
                          textclassName="text-[19.18px] font-extrabold font-gilroyHeavy text-white"
                          fillColor="#fff"
                        >
                  {`₦${addCommasToNumber(Number(bal?.book_balance))}`
}


                          
                        </GlowyStrokeText>
                        <GlowyStrokeText
                          truncate
                          strokeWidth={2}
                          strokeColor="#a132b7"
                          glowColor="#ce45eb"
                          glowIntensity="low"
                          textclassName="text-[19.18px] font-extrabold font-gilroyHeavy text-white -mt-2 max-w-[110px] truncate"
                          fillColor="#fff"
                        >
                          {bal?.name?.split(" ")[0]}
                        </GlowyStrokeText>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showEmptyCard && (
        <div className="flex-1 flex px-3 h-full 2xl:gap-4  flex-col justify-center items-center">
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
        {showJackpot && <JackpotContainer size={80}  text="₦100m" />}
      </div>
    </div>
  );
};

export default HustleSideBar;
