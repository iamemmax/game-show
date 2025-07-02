"use client";
import React, { useState, useEffect, useCallback } from "react";
import {  GlowyStrokeText } from "@/components/core";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import NumberCardContainer from "@/app/shared/NumberContainer";
import { motion } from "framer-motion";
import { tokenStorage } from "@/utils/auth";
// import { useErrorModalState } from "@/hooks";
import Logo from "@/app/icons/Logo";
import { ContestantDetails } from "@/types/types";
import { useMQTT } from "@/hooks/useMqttService";
import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy";
import HustleStages from "@/app/components/stages/components/hustle/HustleStages";
import HustleSideBar from "@/app/components/stages/components/hustle/HustleSideBar";
// import { useEliminationCheck } from "@/hooks/useEliminationCheck";
import { useGetAllHustleNumbers } from "@/app/components/stages/api/stage1/getAllHustlePicks";
import { useParams } from "next/navigation";

interface Response {
  contestant_id: number;
  picks: number[];
}

interface Props {
  onNext: () => void;
}

// Define an extended type for the user that includes game_episode
interface ExtendedContestantDetails extends ContestantDetails {
  game_episode?: number;
}

const HustleBoardNumberPicks = ({ onNext }: Props) => {
  // Type the user properly
  const user = tokenStorage.getUser() as ExtendedContestantDetails | null;


  // Use the elimination check hook

  // Use the MQTT context
  const { isConnected, onMessage } = useMQTT();
  const params = useParams()

  // Fetch all hustle picks
  const { data: hustlePicksData } = useGetAllHustleNumbers(
     Number(params?.episodeId)
  );

  // Explicitly type the state with number[]
  const [timeLeft, setTimeLeft] = useState(30);

  // State to track current user's picks and other contestants' picks separately
  const [otherContestantsPicks, setOtherContestantsPicks] = useState<number[]>([]);

  // Add state to track recently updated numbers for visual feedback
  const [recentlyUpdated, setRecentlyUpdated] = useState<number[]>([]);

  // Add state to track if timer has started
  const [timerStarted, setTimerStarted] = useState(false);

  // Add state to track picks by contestant ID
  const [picksByContestant, setPicksByContestant] = useState<Record<number, number[]>>({});

  // Define contestant colors (for 6 contestants)
  const contestantColors: Record<number | 'default', string> = {
    1: "#FEC124", // Yellow/Gold
    2: "#FF5733", // Orange/Red
    3: "#33FF57", // Green
    4: "#3357FF", // Blue
    5: "#FF33F5", // Pink/Magenta
    6: "#33FFF5", // Cyan
    default: "#666666" // Gray (default)
  };

  // Function to handle all hustle picks received from API or socket
  const handleAllHustlePicks = useCallback(
    (receivedMessage: any) => {
      // Handle API response format (like the sample you provided)
      if (receivedMessage?.status === "success" && Array.isArray(receivedMessage.data)) {

        // Extract all picks from contestants
        const allPicks: number[] = [];
        const newPicksByContestant: Record<number, number[]> = {};

        receivedMessage.data.forEach((contestant: Response) => {
          // Store all contestants' picks
          if (Array.isArray(contestant.picks)) {
            allPicks.push(...contestant.picks);
            // Store picks by contestant ID
            newPicksByContestant[contestant.contestant_id] = contestant.picks;
          }
        });

        // Remove duplicates from all picks
        const uniquePicks = [...new Set(allPicks)];

        // Update state
        setOtherContestantsPicks(uniquePicks);
        setPicksByContestant(newPicksByContestant);

        return true; // Indicate that we handled this event
      }

      // Handle MQTT event format
      if (
        receivedMessage?.event === "receive_hustle_picks" &&
        receivedMessage?.payload &&
        Array.isArray(receivedMessage.payload)
      ) {

        // Extract all picks from contestants
        const allPicks: number[] = [];
        const newPicksByContestant: Record<number, number[]> = {};

        receivedMessage.payload.forEach((contestant: Response) => {
          // Store all contestants' picks
          if (Array.isArray(contestant.picks)) {
            allPicks.push(...contestant.picks);
            // Store picks by contestant ID
            newPicksByContestant[contestant.contestant_id] = contestant.picks;
          }
        });

        // Remove duplicates from all picks
        const uniquePicks = [...new Set(allPicks)];

        // Update state
        setOtherContestantsPicks(uniquePicks);
        setPicksByContestant(newPicksByContestant);

        return true; // Indicate that we handled this event
      }

      return false; // Indicate that we did not handle this event
    },
    []
  );

  
  // Initialize data from API when component loads
  useEffect(() => {
    if (hustlePicksData) {
      handleAllHustlePicks(hustlePicksData);
    }
  }, [hustlePicksData, handleAllHustlePicks]);

  // Set up MQTT message handler
  useEffect(() => {
    if (isConnected) {
      const handler = (receivedMessage: any) => {

        // Handle proceed to next stage event
        if (
          receivedMessage?.event === "proceed_to_next_stage" ||
          receivedMessage?.event === "stage_complete"
        ) {
          onNext();
        }

        // Handle game_s1_init event to start timer
        if (receivedMessage?.event === "game_s1_init") {
          setTimerStarted(true);
          
          // Calculate elapsed time since start_time if provided
          if (receivedMessage?.payload?.start_time) {
            const startTime = new Date(receivedMessage.payload.start_time);
            const currentTime = new Date();
            const elapsedSeconds = Math.floor(
              (currentTime.getTime() - startTime.getTime()) / 1000
            );
            
            // Calculate remaining time (60 seconds total - elapsed time)
            const remainingTime = Math.max(0, 30 - elapsedSeconds);
            setTimeLeft(remainingTime);
          } else {
            // Default to 60 seconds if no start_time provided
            setTimeLeft(36);
          }
        }

        // Handle timer start event
        if (receivedMessage?.event === "start_hustle_timer") {
          setTimerStarted(true);
          
          // Set the time from the message or default to 60 seconds
          if (receivedMessage?.payload?.time) {
            setTimeLeft(receivedMessage.payload.time);
          }
        }

        // Handle timer update event
        if (receivedMessage?.event === "hustle_timer_update") {
          if (receivedMessage?.payload?.time_left !== undefined) {
            setTimeLeft(receivedMessage.payload.time_left);
          }
        }

        // Handle timer end event
        if (receivedMessage?.event === "game_s1_hustle_pick_time_elapse") {
          console.log("Timer ended:", receivedMessage);
          setTimeLeft(0);
        }

        // Try to handle as all_hustle_pick event
        if (handleAllHustlePicks(receivedMessage)) {
          return; // Event was handled, skip the rest
        }

        // Handle individual pick events
        if (
          receivedMessage?.event === "pick_hustle_number" &&
          receivedMessage?.payload
        ) {
          const { contestant_id, pick } = receivedMessage.payload;

          // Update picks by contestant
          setPicksByContestant(prev => ({
            ...prev,
            [contestant_id]: [...(prev[contestant_id] || []), pick]
          }));
          
          // Update other contestants' picks for display
          setOtherContestantsPicks(prev => [...new Set([...prev, pick])]);
          
          // Add visual feedback for recently updated numbers
          setRecentlyUpdated(prev => [...prev, pick]);

          // Remove from recently updated after animation
          setTimeout(() => {
            setRecentlyUpdated(prev => prev.filter(n => n !== pick));
          }, 1000);
        }
        if (receivedMessage?.event === "game_s1_hustle_reveal") {
                  // Proceed to the next stage
                  onNext();
                }
      };

      // Pass the handler function to onMessage
      onMessage(handler);

      return () => {
        // Clean up the message handler when the component unmounts
        onMessage(null);
      };
    }
  }, [isConnected, onMessage, handleAllHustlePicks, onNext]);

  // Add a connection status indicator
  const ConnectionStatus = () => (
    <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
      <div
        className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
      ></div>
    </div>
  );

  // Add a timer effect to count down
  useEffect(() => {
    // Only run the timer if it has started and there's time left
    if (timerStarted && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft((prevTime) => Math.max(0, prevTime - 1));
      }, 1000);
      
      // Clean up the timer when component unmounts or timer stops
      return () => clearTimeout(timer);
    }
  }, [timerStarted, timeLeft]);



  // Function to get the color for a number based on which contestant picked it
  const getNumberColor = (num: number): string => {
    // Check which contestant picked this number
    for (const [contestantId, picks] of Object.entries(picksByContestant)) {
      if (picks.includes(num)) {
        // Map the contestant ID to a color index (1-6)
        // We use modulo to ensure it's always in range 1-6
        const colorIndex = (Number(contestantId) % 6) + 1;
        return contestantColors[colorIndex];
      }
    }
    
    // Default color for unpicked numbers
    return "black";
  };

  return (
    <>
      {/* Elimination Modal */}
      {/* <EliminationModal 
        open={showEliminationModal} 
        onOpenChange={setShowEliminationModal} 
      /> */}
      
      <div className="grid grid-cols-[1fr_5fr_1fr] gap-3 h-full select-none">
        {/* Left Sidebar */}
        <div className="flex flex-col items-center justify-between [@media(min-width:2000px)]:py-[3rem]">
          <div className="flex justify-center items-center h-3.5 w-full mt-8">
            <Logo  className="[@media(min-width:2000px)]:w-[12rem]  [@media(min-width:2000px)]:h-[12rem] "/>
          </div>
          <div>
            <HustleStages />
          </div>
          <div className="pb-4 ">
            <Salary4LifeTrophy className="max-xl:h-[13.25rem]" />
          </div>
        </div>

        <div className="overflow-y-auto">
          <div className="w-full h-[100px] flex items-center justify-center">
            <HeaderTitleContainer
              backgroundColor="#791192"
              color="#ed99ff"
              text="Hustle board"
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

          <div className="flex justify-center flex-col items-center max-lg:px-3">
            {/* Selection Grid */}
            <div className="w-full py-[1.5rem]  2xl:py-[3rem] border  rounded-[.875rem] px-[2rem] 2xl:px-[3rem] bg-[#13051E] -mt-3 relative overflow-hidden">
              {/* Connection Status Indicator */}
              <ConnectionStatus />

              {/* Animated border */}
              <div className="absolute inset-0">
                <motion.div
                  className="w-[200%] h-[200%] absolute -left-1/2 -top-1/2"
                  style={{
                    background: `conic-gradient(from 0deg at 50% 50%,
                      transparent 0deg,
                      #d91fff 10deg,
                      #d91fff 60deg,
                      #00ffff 90deg,
                      #00ffff 140deg,
                      transparent 180deg,
                      transparent 360deg
                    )`,
                  }}
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 3,
                    ease: "linear",
                    repeat: Infinity,
                  }}
                />
              </div>

              {/* Content container */}
              <div className="absolute inset-[8px] bg-[#13051E] rounded-[.675rem]" />
              <div className="relative">
                <div className="flex justify-between items-center">
                  <div>
                    <GlowyStrokeText
                      strokeWidth={2}
                      strokeColor="#D91FFF"
                      glowColor="#13051E"
                      glowIntensity="low"
                      textclassName="text-[2.125rem] font-extrabold font-gilroyHeavy [@media(min-width:2000px)]:text-[5rem]"
                      fillColor="#000"
                    >
                      Stage 1 : Hustle Kick-off
                    </GlowyStrokeText>
                  </div>
                  <div>
                    {
                      timerStarted && (
                        <div className="flex items-center justify-center bg-gradient-to-r from-amber-500 to-yellow-500 border-[2px] border-[#C76000] rounded-xl px-3 py-1.5 ">
                          <span
                            className="text-[20px] font-extrabold font-verdana text-white"
                            style={{
                              WebkitTextStroke: "1.5px #C76000",
                              textShadow: "0px 1px 2px rgba(199, 96, 0, 0.5)",
                            }}
                          >
                            {`0:${Math.max(0, timeLeft).toString().padStart(2, "0")}`}
                          </span>
                        </div>
                      )
                    }
                  </div>
                </div>

                <div className="flex flex-wrap max-md:gap-[18px] gap-[14px] 2xl:gap-[1.875rem] max-xl:gap-y-5 2xl:gap-y-8 2xl:mt-8">
                  {Array.from({ length: 49 }, (_, i) => i + 1).map((num) => {
                    const isPicked = otherContestantsPicks.includes(num);
                    const isRecentlyUpdated = recentlyUpdated.includes(num);
                    const numberColor = getNumberColor(num);

                    return (
                      <div
                        key={num}
                        className={`relative cursor-default select-none ${
                          isRecentlyUpdated ? "animate-pulse" : ""
                        }`}
                      >
                        <NumberCardContainer
                          text={String(num)}
                          textColor={isPicked ? "#fff" : "#F2C94C"}
                          className={`${isRecentlyUpdated ? "ring-2 ring-red-500" : ""} [@media(min-width:2000px)]:w-[9rem] select-none [@media(min-width:2000px)]:h-[9.3rem]`}
                          primaryGradientEndColor={isPicked ? "#FF00FF" : "#3C1272"}
                          width={95}
                          height={90}
                          backgroundColor={numberColor}
                          active={isPicked}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

        
        </div>

        {/* Right Sidebar */}
        <div>
          <HustleSideBar
            showJackpot={false}
            showHustlerCard={true}
            showEmptyCard={false}
            showHustleCardAmt={false}
          />
        </div>
      </div>
    </>
  );
};

export default HustleBoardNumberPicks;
