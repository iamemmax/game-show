"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/core";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import NumberCardContainer from "@/app/shared/NumberContainer";
interface prop{
  onNext: () => void
}
const Stage1 = ({onNext}:prop) => {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [autoPicked, setAutoPicked] = useState<boolean>(false);

  // Countdown Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      if (!autoPicked) {
        autoSelectRemainingNumbers();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  // Handle number click
  const handleNumberClick = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== num));
    } else if (selectedNumbers.length < 5) {
      setSelectedNumbers([...selectedNumbers, num]);
    }
  };

  const isSelected = (num: number) => selectedNumbers.includes(num);

  // Automatically select remaining numbers
  const autoSelectRemainingNumbers = () => {
    const availableNumbers = Array.from({ length: 49 }, (_, i) => i + 1).filter(
      num => !selectedNumbers.includes(num)
    );
  
    const shuffled = availableNumbers.sort(() => 0.5 - Math.random()); // Shuffle
    const numbersToAdd = shuffled.slice(0, 5 - selectedNumbers.length); // Pick random ones
  
    setSelectedNumbers(prev => [...prev, ...numbersToAdd]);
    setAutoPicked(true);
  };
  

  return (
    <div className="overflow-y-auto">
      <div className="w-full h-[100px]  flex items-center justify-center">
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

      <div className="flex justify-center  flex-col items-center max-lg:px-3">
        {/* Selection Grid */}
        <div className="border-[9px] border-[#d91fff] w-full py-[1rem]   max-xl:max-w-[65rem] 2xl:py-[3rem] max-w-[56.25rem] rounded-[.875rem] max-xl:px-[2rem] 2xl:px-[3rem] bg-[#13051E] -mt-3">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-[2.125rem]  font-extrabold outline-text text-black">
                Stage 1: Hustle Kick-off
              </h2>
            </div>
            <div>
              <h2 className="font-extrabold text-[2.75rem] text-white">{`0:${timeLeft.toString().padStart(2, "0")}`}</h2>
            </div>
          </div>

          <div className="flex flex-wrap max-md:gap-[18px] gap-[8px] 2xl:gap-[.875rem] max-xl:gap-y-5 2xl:gap-y-8  2xl:mt-8">
            {Array.from({ length: 49 }, (_, i) => i + 1).map(num => (
              <div
                key={num}
                onClick={() => handleNumberClick(num)}
                className="cursor-pointer transition-transform hover:scale-105"
              >
                <NumberCardContainer
                  text={String(num)}
                  textColor="#F2C94C"
                  secondaryGradientStartColor={isSelected(num) ? "#FF00FF" : "#7E3CE0"}
                  secondaryGradientMiddleColor={isSelected(num) ? "#FF00FF" : "#760F1B"}
                  secondaryGradientEndColor={isSelected(num) ? "#FF00FF" : "#3C1272"}
                  primaryGradientStartColor={isSelected(num) ? "#FF00FF" : "#7E3CE0"}
                  primaryGradientEndColor={isSelected(num) ? "#FF00FF" : "#3C1272"}
                  // width={62}
                  // height={45}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Selected Numbers Display */}
        <div className="flex justify-between items-center">
        <div className="flex items-center gap-[2.125rem] border-[5px] border-[#CE64FF]
        py-[1rem] 2xl:px-[2.6875rem]  max-w-[38.5rem] rounded-[.875rem] px-[2rem] bg-[#13051E] mt-2 xl:mt-7"
        >
          <div className="flex gap-x-3 items-center">
            <div className="relative h-[3rem] w-[3rem] bg-[#bf7222] border-[5px] border-[#dba531] rounded-full overflow-hidden">
              <Image
                alt="User avatar"
                src="/images/userImage.png"
                fill
                className="object-cover"
              />
            </div>
            <p className="text-base text-white outline-text-white">Demola</p>
          </div>

          <div className="flex divide-x-2 divide-[#4B1874]">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="px-2">
                <NumberCardContainer
                  text={selectedNumbers[i] ? String(selectedNumbers[i]) : ""}
                  textColor="#F2C94C"
                  width={55}
                  height={45}
                />
              </div>
            ))}
          </div>
        </div>

<Button className="bg-pink-950" onClick={()=>onNext()}>Proceed</Button>
        </div>
      </div>
    </div>
  );
};

export default Stage1;
