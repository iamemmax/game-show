import BarIcon from "@/app/icons/BarIcon";
import SettingsIcon from "@/app/icons/SettingIcon";
import ContestantCard from "@/app/shared/ContestantCard";
import IconBoard from "@/app/shared/IconBoard";
import JackpotContainer from "@/app/shared/JackpotContainer";
import StagesCard from "@/app/shared/StagesCard";
import UserBadge from "@/app/shared/UserBadge";
import { Button, GlowyStrokeText } from "@/components/core";
import React from "react";
import { contestantImages } from "../mocks/contestantImages";
import { useGetWalletBalance } from "../../api/stage1/getbalance";
import { tokenStorage } from "@/utils/auth";
import { addCommasToNumber } from "@/utils";
import Image from "next/image";
interface prop {
  showJackpot?: boolean;
  showEmptyCard?: boolean;
  showHustlerCard?: boolean;
}
const HustleSideBar = ({
  showJackpot = true,
  showEmptyCard = false,
  showHustlerCard = false,
}: prop) => {
  const user = tokenStorage.getUser();
  const { data: dataBalance, isLoading } = useGetWalletBalance(
    user?.game_episode as number
  );
  return (
    <div className="flex justify-between h-full items-center flex-col">
      {/* <div className="py-4 flex justify-center items-center">
        <div className="flex gap-2 items-center">
         <Button className="p-0 bg-transparent">
         <IconBoard icon={<BarIcon />} />
         </Button>
         <Button className="p-0 bg-transparent">
          <IconBoard icon={<SettingsIcon />} />
          </Button>
        </div>
      </div> */}

      <div className="relative flex flex-col  justify-center items-center">
        {/* <div className="w-[136.73px] bg-[#ae77ff] p-[5px] h-[84.66px] rounded-[12.79px] ">
<div className="w-full h-full flex justify-center items-center rounded-[12.79px] bg-gradient-to-b from-[#d531f8] to-[#9a5eb2]">
  <div className="w-[36px] h-[36px] absolute -top-4  rounded-full overflow-hidden ">
    <Image
      src="/images/userImage.png"
      alt="User Image"
      width={38}
      height={36}
      className="object-cover"
    />
    <div className=" z-[999999] bg-green-500 mt-8 w-2 h-2 rounded-full"/>
  </div>
  <div className="flex flex-col justify-center gap-0 mt-3 items-center">
    <GlowyStrokeText strokeWidth={2} strokeColor="#a132b7" glowColor="#ce45eb" glowIntensity="low"  textclassName="text-[19.18px] font-extrabold font-gilroyHeavy text-white"
    fillColor="#fff"
    >
      N250,000
    </GlowyStrokeText>
    <GlowyStrokeText strokeWidth={2} strokeColor="#a132b7" glowColor="#ce45eb" glowIntensity="low"  textclassName="text-[19.18px] font-extrabold font-gilroyHeavy text-white -mt-2"
    fillColor="#fff"
    >
    Ihotu
    </GlowyStrokeText>
  </div>
</div>
  </div> */}
      </div>

      {showHustlerCard && (
        <>
          {isLoading ? (
            <div className="flex-1 flex px-3 h-full flex-col justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
            </div>
          ) : (
            <div className="flex-1 flex px-3 gap-5 h-full flex-col justify-center items-center">
              {// <UserBadge
              //   username={`₦${addCommasToNumber(Number(bal?.balance?.toFixed(0)))}`}
              //   amount={bal?.contestant_name?.split(' ')[0]}
              //   avatarUrl={contestantImages[idx]}
              //   isOnline={true}
              //   isActive={user?.contestant_id === bal?.contestant_id?true:false}
              //   borderColor={user?.contestant_id === bal?.contestant_id?"#D71BFA":"#FFC125"}
              //   borderWidth={user?.contestant_id === bal?.contestant_id?1:0.4}
              //   backgroundGradient={{
              //     middleColor: "#D71BFA",
              //     endColor: "#D71BFA",
              //     startColor: "#D71BFA",
              //     direction: "vertical"
              //   }}
              //   textGradient={{
              //     startColor: "#FFFFFF",
              //     endColor: "#FFC125",
              //     direction: "horizontal"
              //   }}
              //   correctAnswerColor={"#04DA6A"}
              //   usernameClassName={"text-[14px] mt-[4px] text-white"}
              //   amountClassName={"text-[12px] text-white/80 mt-[4px]"}
              //   dotPosition={{y:37,x:25}}
              //   key={idx}
              // />
              dataBalance?.data?.balances?.map((bal, idx: number) => (
                <div
                  className="w-[136.73px] bg-[#ae77ff] p-[5px] h-[70.66px] rounded-[12.79px] relative "
                  key={idx}
                >
                  <div className="w-full h-full flex justify-center items-center rounded-[12.79px] bg-gradient-to-b from-[#d531f8] to-[#9a5eb2]">
                   
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
                    <div className="z-[999999] bg-green-500  -mt-2 absolute w-2.5 h-2.5 rounded-full" 
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
                          {`₦${addCommasToNumber(Number(bal?.balance?.toFixed(0)))}`}
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
                          {bal?.contestant_name?.split(" ")[0]} 
                          
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
        {showJackpot && <JackpotContainer size={120} text="₦100m" />}
      </div>
    </div>
  );
};

export default HustleSideBar;
