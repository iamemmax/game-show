import BarIcon from "@/app/icons/BarIcon";
import SettingsIcon from "@/app/icons/SettingIcon";
import ContestantCard from "@/app/shared/ContestantCard";
import IconBoard from "@/app/shared/IconBoard";
import JackpotContainer from "@/app/shared/JackpotContainer";
import { Button } from "@/components/core";
import React from "react";

const HustleSideBar = () => {
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

      <div className="flex-1 flex px-3 h-full flex-col justify-center items-center">
        <ContestantCard
          title="Hustler 1"
          subtitle="Active"
          isActive={true}
          imageUrl={`/images/userImage5.png`}
          backgroundColor="transparent" // Use "gradient" to enable gradient background
          borderColor="transparent"
        />
        <ContestantCard
          title="Hustler 2"
          subtitle="Active"
          isActive={true}
          imageUrl="/images/userImage.png"
          backgroundColor="gradient" // Use "gradient" to enable gradient background
          gradientColors={{
            startColor: "#FFB804",
            startOpacity: 0.8,
            midColor: "#FEC124",
            endColor: "#E5AA18",
          }}
          borderColor="transparent"
        />
        <ContestantCard
          title="Hustler 3"
          subtitle="Active"
          isActive={true}
          imageUrl={`${process.env.NEXT_PUBLIC_BASE_URL || ""}/images/userImage3.png`}
          borderColor="transparent"
          backgroundColor="transparent"
          borderWidth={0.5}
        />
        <ContestantCard
          title="Hustler 4"
          subtitle="Active"
          isActive={true}
          imageUrl={`${process.env.NEXT_PUBLIC_BASE_URL || ""}/images/userImage4.png`}
          backgroundColor="transparent"
          borderColor="transparent"
        />
        <ContestantCard
          title="Hustler 5"
          subtitle="Active"
          isActive={true}
          imageUrl={`${process.env.NEXT_PUBLIC_BASE_URL || ""}/images/userImage5.png`}
          backgroundColor="transparent"
          borderColor="transparent"
        />
        <ContestantCard
          title="Hustler 6"
          subtitle="Active"
          isActive={true}
          imageUrl={`${process.env.NEXT_PUBLIC_BASE_URL || ""}/images/userImage2.png`}
          backgroundColor="transparent"
          borderColor="transparent"
        />
      </div>
      <div className="">
        <JackpotContainer text="₦100m"/>
      </div>
    </div>
  );
};

export default HustleSideBar;
