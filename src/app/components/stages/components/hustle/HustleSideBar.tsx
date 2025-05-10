import BarIcon from "@/app/icons/BarIcon";
import SettingsIcon from "@/app/icons/SettingIcon";
import ContestantCard from "@/app/shared/ContestantCard";
import IconBoard from "@/app/shared/IconBoard";
import JackpotContainer from "@/app/shared/JackpotContainer";
import StagesCard from "@/app/shared/StagesCard";
import UserBadge from "@/app/shared/UserBadge";
import { Button } from "@/components/core";
import React from "react";
import { contestantImages } from "../mocks/contestantImages";
import { useGetWalletBalance } from "../../api/stage1/getbalance";
import { tokenStorage } from "@/utils/auth";
import { addCommasToNumber } from "@/utils";
interface prop{
  showJackpot?:boolean;
  showEmptyCard?:boolean;
  showHustlerCard?:boolean;
}
const HustleSideBar = ({showJackpot=true, showEmptyCard=false, showHustlerCard=false}:prop) => {
  const user = tokenStorage.getUser();
  const {data:dataBalance, isLoading}=useGetWalletBalance(user?.game_episode as number)
  return (
    <div className="flex justify-between h-full items-center flex-col">
      <div className="py-4 flex justify-center items-center">
        <div className="flex gap-2 items-center">
         <Button className="p-0 bg-transparent">
         <IconBoard icon={<BarIcon />} />
         </Button>
         <Button className="p-0 bg-transparent">
          <IconBoard icon={<SettingsIcon />} />
          </Button>
        </div>
      </div>
      
 {showHustlerCard&& <>
 {
  isLoading?<div className="flex-1 flex px-3 h-full flex-col justify-center items-center">
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
</div>:   <div className="flex-1 flex px-3 gap-3 h-full flex-col justify-center items-center">
  {
    dataBalance?.data?.balances?.map((bal,idx:number)=>(
      <UserBadge 
        username={`₦${addCommasToNumber(Number(bal?.balance?.toFixed(0)))}`}
        amount={bal?.contestant_name?.split(' ')[0]}
        avatarUrl={contestantImages[idx]}
        isOnline={true}
        isActive={user?.contestant_id === bal?.contestant_id?true:false}
        borderColor={user?.contestant_id === bal?.contestant_id?"#D71BFA":"#FFC125"}
        borderWidth={user?.contestant_id === bal?.contestant_id?1:0.4}
        backgroundGradient={{
          middleColor: "#D71BFA",
          endColor: "#D71BFA",
          startColor: "#D71BFA",
          direction: "vertical"
        }}
        textGradient={{
          startColor: "#FFFFFF",
          endColor: "#FFC125",
          direction: "horizontal"
        }}
        correctAnswerColor={"#04DA6A"}
        usernameClassName={"text-[14px] mt-[4px] text-white"}
        amountClassName={"text-[12px] text-white/80 mt-[4px]"}
        dotPosition={{y:37,x:25}}
        key={idx}
      />
    ))
  }
        </div>

 }
 </>
  
      }

      {
          showEmptyCard&& <div className="flex-1 flex px-3 h-full 2xl:gap-4  flex-col justify-center items-center">
       {Array.from({length:6}).map((_,index)=>(
         <StagesCard 
         key={index}
         title=""
          subTitle=""
        borderColor="#FFC125" iconText="" showIcon={false} 
        width={130}
        className="2xl:w-[260px]"
        />
       ))}
        </div>
      }
    <div className="min-h-[100px]">
    {showJackpot&&  
        <JackpotContainer text="₦100m"/>
      }
      </div>
    </div>
  );
};

export default HustleSideBar;
