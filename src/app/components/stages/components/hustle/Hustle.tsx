import Logo from "@/app/icons/Logo";
import StartUpIcon from "@/app/icons/StartupIcon";
import Trophy from "@/app/icons/Trophy";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import Image from "next/image";
import React from "react";
import { CustomTabs, TabItem } from "./HustleTab";
import KeepCapitalTab from "./KeepCapitalTab";
import RedristibuteCapital from "./RedristibuteCapital";
import HustleStages from "./HustleStages";
import HustleSideBar from "./HustleSideBar";
import HustleBottomCard from "./HustleBottomCard";

const Hustle = () => {
  const tabs: TabItem[] = [
    {
      value: "Keep",
      label: "Keep capital overlay",
      content: <KeepCapitalTab />,
    },
    {
      value: "Redistribute",
      label: "Redistribute capital",
      content: <RedristibuteCapital />,
    },
  ];

  return (
    <div className="grid grid-cols-[1fr_5fr_1fr] h-full ">
      {/* Left Sidebar */}
      <div className="flex flex-col justify-between">
        <div className="flex justify-center items-center h-3.5 w-full mt-8">
          <Logo />
        </div>
        <div>
          <HustleStages />
        </div>
        <div className="w-full p-[1.4375rem] flex-col rounded-t-[1.75rem] flex justify-center items-center bg-[linear-gradient(to_right,_#2D0304,_#EE24B8,_#1E0227)] text-white">
          <Trophy height={50} width={50} />
          <div className="flex flex-col justify-center pt-1 items-center">
            <p className="uppercase font-bold text-xs font-verdana text-white">
              Stage 1 of 6
            </p>
            <p className="max-w-[100px] text-center mt-1 font-display font-bold text-xs text-white">
              Hustle: Fashion Designer
            </p>
          </div>
        </div>
      </div>

      {/* Center Content */}
      <div className="flex flex-col justify-between items-center min-h-full">
        {/* Top section */}
        <div className="flex flex-col w-full items-center">
          <div className="w-full h-[100px] flex items-center justify-center">
            <HeaderTitleContainer
              backgroundColor="#791192"
              color="#ed99ff"
              text="Pick-Pad"
              textGradientEnd="#8E17AA"
              textGradientStart="#8E17AA"
              borderGradientStart="#f712fc"
              borderGradientEnd="#e151fe"
              fontSize={45}
              fontFamily="Verdana"
              textStrokeColor="#a219c1"
              textStrokeWidth={4.4}
            />
          </div>

          <div className="border-[9px] border-[#d91fff] w-full py-[0.5rem] 2xl:py-[2.5rem] max-2xl:max-w-[46.5rem] rounded-[.875rem] 2xl:px-[3rem] bg-[#13051E] ">
            <div className="flex justify-center flex-col items-center">
              <div>
                <h2 className="text-[2.125rem] text-center font-extrabold outline-text text-black">
                  Stage 1: Hustle Kick-off
                </h2>
                <p className="text-sm font-normal text-[#D5B9FF]">
                  Tap each hustle card below to determine how you want to invest
                </p>
              </div>

              <div className="flex mt-2 items-center gap-[1.375rem]">
                {/* Player Info */}
                <div className="flex bg-black rounded-10 gap-4 px-[1.125rem] pr-[5rem] items-center py-2">
                  <div className="relative h-[2.8rem] w-[2.8rem] bg-[#bf7222] border-[5px] border-[#dba531] rounded-full overflow-hidden">
                    <Image
                      alt="User avatar"
                      src="/images/userImage.png"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-white font-normal text-xs font-gilroyMedium">
                      Demola
                    </p>
                    <h2 className="text-sm font-medium font-gilroyMedium text-white outline-text-white-2">
                      Player 1
                    </h2>
                  </div>
                </div>

                {/* Startup Capital */}
                <div className="flex bg-black rounded-10 gap-4 px-[1.125rem] pr-[4rem] items-center py-2">
                  <div className="relative h-[2.8rem] w-[2.8rem] flex justify-center items-center bg-[#3C127299] bg-opacity-60 rounded-full overflow-hidden">
                    <StartUpIcon />
                  </div>
                  <div>
                    <p className="text-white font-normal text-xs font-gilroyMedium">
                      Startup capital
                    </p>
                    <h2 className="text-sm font-medium font-gilroyMedium text-white outline-text-white-2">
                      ₦900,000
                    </h2>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-2 relative w-full flex justify-center items-center">
                <CustomTabs
                  tabs={tabs}
                  defaultValue="Keep"
                  tabsListClassName=""
                  tabsContentClassName="w-full px-0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Card (sticks to bottom) */}
        <div className="w-full max-w-[35rem] lg:max-w-[46.5rem] 2xl:max-w-[80rem] mt-2">
          <HustleBottomCard />
        </div>
      </div>

      {/* Right Sidebar */}
      <div>
        <HustleSideBar />
      </div>
    </div>
  );
};

export default Hustle;
