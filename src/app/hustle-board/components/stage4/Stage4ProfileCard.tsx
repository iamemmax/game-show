import { ContestantsResponse } from "@/app/admin/misc/api";
import { contestantImages } from "@/app/components/stages/components/mocks/contestantImages";
import { GlowyStrokeText } from "@/components/core";
import { addCommasToNumber } from "@/utils";
import NumberFlow from "@number-flow/react";
import React, { useEffect, useMemo, useRef, useState } from "react";
interface prop {
  contestantsData: ContestantsResponse | null | undefined;
}
const Stage4ProfileCard = ({ contestantsData }: prop) => {
  const lastContestantId = useMemo(() => {
    const data = contestantsData?.data?.find(
      (contestant) => contestant?.is_eliminated !== true
    );
    return data;
  }, [contestantsData]);

  const useAnimatedBalance = (targetValue: number, duration: number = 1000) => {
    const [displayValue, setDisplayValue] = useState(targetValue);
    const prevValueRef = useRef(targetValue);
    const animationRef = useRef<number>();
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
      // Initialize audio
      if (typeof window !== "undefined" && !audioRef.current) {
        audioRef.current = new Audio("/sounds/cash-counting.wav");
        audioRef.current.volume = 0.3;
        audioRef.current.loop = true;
      }
    }, []);

    useEffect(() => {
      const prevValue = prevValueRef.current;
      const difference = targetValue - prevValue;

      if (difference === 0) return;

      // Start playing sound
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
      }

      let startTime: number;
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = prevValue + difference * easeOutQuart;

        setDisplayValue(Math.round(currentValue));

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // Animation complete
          prevValueRef.current = targetValue;

          // Stop sound
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
        }
      };

      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      };
    }, [targetValue, duration]);

    return displayValue;
  };

  return (
    <div className="mt-3 flex items-center justify-center">
      <div className="flex flex-col sm:flex-row gap-5">
        {/* Demola Card */}
        <div className="bg-black rounded-3xl py-[1.0625rem] px-[2.125rem]  w-80 flex items-center gap-4 shadow-2xl hover:scale-105 transition-transform duration-300">
          <div className="relative">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-red-500">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                <img
                  src={
                    lastContestantId?.contestant_photo_url ??
                    "/images/userImage.png"
                  }
                  alt="Demola"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-white text-2xl font-semibold font-medium">
              {lastContestantId?.name}
            </h3>

            {/* <GlowyStrokeText
              strokeWidth={2}
              strokeColor="#D91FFF"
              glowColor="#13051E"
              glowIntensity="low"
              textclassName="text-[1.125rem] font-normal font-gilroyBold"
              fillColor="#fff"
            >
              {" "}
              Finalist
            </GlowyStrokeText> */}
          </div>
        </div>

        {/* Earnings Card */}
        <div className="bg-black rounded-3xl py-[1.0625rem] px-[2.125rem]  flex items-center gap-4 shadow-2xl hover:scale-105 transition-transform duration-300">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 6.14966H6C3.79 6.14966 2 7.93966 2 10.1497V6.53961C2 4.49961 3.65 2.84961 5.69 2.84961H11.31C13.35 2.84961 15 4.10966 15 6.14966Z"
                  fill="white"
                />
                <path
                  opacity="0.4"
                  d="M17.48 12.2004C16.98 12.6904 16.74 13.4304 16.94 14.1804C17.19 15.1104 18.11 15.7004 19.07 15.7004H20V17.1504C20 19.3604 18.21 21.1504 16 21.1504H6C3.79 21.1504 2 19.3604 2 17.1504V10.1504C2 7.94039 3.79 6.15039 6 6.15039H16C18.2 6.15039 20 7.95039 20 10.1504V11.6003H18.92C18.36 11.6003 17.85 11.8204 17.48 12.2004Z"
                  fill="white"
                />
                <path
                  d="M22.0002 12.6196V14.6796C22.0002 15.2396 21.5402 15.6996 20.9702 15.6996H19.0402C17.9602 15.6996 16.9702 14.9097 16.8802 13.8297C16.8202 13.1997 17.0602 12.6096 17.4802 12.1996C17.8502 11.8196 18.3602 11.5996 18.9202 11.5996H20.9702C21.5402 11.5996 22.0002 12.0596 22.0002 12.6196Z"
                  fill="white"
                />
                <path
                  d="M13 11.9004H7C6.59 11.9004 6.25 11.5604 6.25 11.1504C6.25 10.7404 6.59 10.4004 7 10.4004H13C13.41 10.4004 13.75 10.7404 13.75 11.1504C13.75 11.5604 13.41 11.9004 13 11.9004Z"
                  fill="white"
                />
              </svg>
            </div>
          </div>

          <div className="flex-1">
            {/* <h3 className="text-white text-lg font-gilroyMedium">Earnings</h3> */}
            <GlowyStrokeText
              strokeWidth={2}
              strokeColor="#D91FFF"
              glowColor="#13051E"
              glowIntensity="low"
              textclassName="text-[1.8rem] font-normal font-montserrat font-semibold"
              fillColor="#fff"
            >
              <NumberFlow
                value={Number(lastContestantId?.actual_balance ?? 0)}
                prefix="₦"
              />
            </GlowyStrokeText>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stage4ProfileCard;
