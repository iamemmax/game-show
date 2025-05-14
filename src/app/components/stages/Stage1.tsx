"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { Button, ErrorModal, GlowyStrokeText } from "@/components/core";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import NumberCardContainer from "@/app/shared/NumberContainer";
import { motion } from "framer-motion";
import { tokenStorage } from "@/utils/auth";
import { useErrorModalState } from "@/hooks";
import { formatAxiosErrorMessage } from "@/utils";
import { AxiosError } from "axios";
import HustleSideBar from "./components/hustle/HustleSideBar";
import Logo from "@/app/icons/Logo";
import HustleStages from "./components/hustle/HustleStages";
import { ContestantDetails } from "@/types/types";
import { useMQTT } from "@/hooks/useMqttService";
import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy";

interface RootObject {
  event: string;
  response: Response[];
}

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

const Stage1 = ({ onNext }: Props) => {
  // Type the user properly
  const user = tokenStorage.getUser() as ExtendedContestantDetails | null;
  const {
    isErrorModalOpen,
    setErrorModalState,
    openErrorModalWithMessage,
    errorModalMessage,
  } = useErrorModalState();

  // Use the MQTT context
  const { isConnected, sendMessage, onMessage } = useMQTT();
  
  // Explicitly type the state with number[]
  const [selectedNumbers, setSelectedNumbers] = useState<Array<number>>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isLoading, setIsLoading] = useState(false);

  // State to track current user's picks and other contestants' picks separately
  const [myPicks, setMyPicks] = useState<number[]>([]);
  const [otherContestantsPicks, setOtherContestantsPicks] = useState<number[]>([]);

  // Add state to track recently updated numbers for visual feedback
  const [recentlyUpdated, setRecentlyUpdated] = useState<number[]>([]);

  // Add state to track if timer has started
  const [timerStarted, setTimerStarted] = useState(false);

 

  // Function to handle all hustle picks received from socket
  const handleAllHustlePicks = useCallback((receivedMessage: any) => {
    if (receivedMessage?.event === "receive_hustle_picks" && 
        receivedMessage?.payload && 
        Array.isArray(receivedMessage.payload)) {
      
      console.log("Received receive_hustle_picks data:", receivedMessage);
      
      // Extract all picks from other contestants
      const allOtherPicks: number[] = [];
      let myCurrentPicks: number[] = [];
      
      receivedMessage.payload.forEach((contestant: Response) => {
        if (contestant.contestant_id === user?.contestant_id) {
          // These are my picks
          myCurrentPicks = contestant.picks || [];
        } else {
          // These are other contestants' picks
          if (Array.isArray(contestant.picks)) {
            allOtherPicks.push(...contestant.picks);
          }
        }
      });
      
      // Remove duplicates from other contestants' picks
      const uniqueOtherPicks = [...new Set(allOtherPicks)];
      
      console.log("My picks from receive_hustle_picks:", myCurrentPicks);
      console.log("Other contestants' picks from receive_hustle_picks:", uniqueOtherPicks);
      
      // Update state
      setMyPicks(myCurrentPicks);
      setSelectedNumbers(myCurrentPicks);
      setOtherContestantsPicks(uniqueOtherPicks);
      
      return true; // Indicate that we handled this event
    }
    
    return false; // Indicate that we did not handle this event
  }, [user?.contestant_id]);

  // Function to send picked numbers to backend
  const sendPickedNumbers = async (num: number) => {
    if (!user?.contestant_id) return;
    
    // CRITICAL: Validate that number is not already picked by others
    if (otherContestantsPicks.includes(num) && !myPicks.includes(num)) {
      return;
    }
    
    // Set loading state
    setIsLoading(true);
    
    try {
      if (isConnected) {
        const action = myPicks.includes(num) ? 'remove' : 'add';
        
        // Apply optimistic update immediately
        if (action === 'add') {
          setMyPicks(prev => [...prev.filter(n => n !== num), num]);
          setSelectedNumbers(prev => [...prev.filter(n => n !== num), num]);
        } else {
          setMyPicks(prev => prev.filter(n => n !== num));
          setSelectedNumbers(prev => prev.filter(n => n !== num));
        }
        
        // Simplified payload structure as requested
        const payload = {
          event: "pick_hustle_number",
          payload: {
            game_episode: user?.game_episode,
            contestant_id: user?.contestant_id,
            pick: num,
            action: action,
          }
        };
        
        // Send the message
        await sendMessage(payload, "pick_hustle_number");
      }
    } catch (error) {
      console.error("Failed to publish message to MQTT:", error);
      // Revert optimistic update on error
      // requestAllHustlePicks(); // Request fresh data on error
    } finally {
      setIsLoading(false);
    }
  };
  

  // Consolidate all MQTT message handling into a single useEffect
  useEffect(() => {
    if (isConnected) {
      // Set up message handler
      const handler = (receivedMessage: any) => {
        
        // Handle start timer event
        if (receivedMessage?.event === "game_s1_init") {
          setTimerStarted(true);
          // Calculate elapsed time since start_time
          const startTime = new Date(receivedMessage?.payload?.start_time);
          const currentTime = new Date();
          const elapsedSeconds = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
          
          // Calculate remaining time (60 seconds total - elapsed time)
          const remainingTime = Math.max(0, 60 - elapsedSeconds);
          console.log("Elapsed seconds:", elapsedSeconds, "Remaining time:", remainingTime);
          
          setTimeLeft(remainingTime);
          
          // Start the countdown timer
          const timerInterval = setInterval(() => {
            setTimeLeft(prevTime => {
              const newTime = prevTime - 1;
              if (newTime <= 0) {
                clearInterval(timerInterval);
                return 0;
              }
              return newTime;
            });
          }, 1000);
          
          // Clean up interval on component unmount
          return () => clearInterval(timerInterval);
          // Start the timer if not already started
        }
        
        // Handle proceed to next stage event
        if (receivedMessage?.event === "proceed_to_next_stage" || 
            receivedMessage?.event === "stage_complete") {
          
          console.log("Received proceed to next stage event:", receivedMessage);
          
          // Set state to proceed to next stage
          // setShouldProceedToNext(true);
        }
        
        // Try to handle as all_hustle_pick event
        if (handleAllHustlePicks(receivedMessage)) {
          return; // Event was handled, skip the rest
        }
        
        // Handle individual pick events
        if (receivedMessage?.contestant_id && receivedMessage?.picks !== undefined) {
          const isMyMessage = receivedMessage.contestant_id === user?.contestant_id;
          
          // If it's a single number
          if (typeof receivedMessage.picks === 'number') {
            const pickedNumber = receivedMessage.picks;
            const action = receivedMessage.action || 'add'; // Default to add if not specified
            
            if (isMyMessage) {
              // Update my picks
              if (action === 'add') {
                setMyPicks(prev => [...prev.filter(n => n !== pickedNumber), pickedNumber]);
                setSelectedNumbers(prev => [...prev.filter(n => n !== pickedNumber), pickedNumber]);
              } else if (action === 'remove') {
                console.log("Removing number from my picks from MQTT:", pickedNumber);
                setMyPicks(prev => prev.filter(n => n !== pickedNumber));
                setSelectedNumbers(prev => prev.filter(n => n !== pickedNumber));
              }
            } else {
              // Update other contestants' picks immediately
              if (action === 'add') {
                console.log("Other contestant picked number:", pickedNumber);
                setOtherContestantsPicks(prev => [...prev.filter(n => n !== pickedNumber), pickedNumber]);
                
                // Add visual feedback for recently updated numbers
                setRecentlyUpdated(prev => [...prev, pickedNumber]);
                
                // Remove from recently updated after animation
                setTimeout(() => {
                  setRecentlyUpdated(prev => prev.filter(n => n !== pickedNumber));
                }, 1000);
              } else if (action === 'remove') {
                console.log("Other contestant unpicked number:", pickedNumber);
                setOtherContestantsPicks(prev => prev.filter(n => n !== pickedNumber));
              }
            }
          }
          
          // If it's an array of numbers
          if (Array.isArray(receivedMessage.picks)) {
            if (isMyMessage) {
              console.log("Updating my picks from MQTT:", receivedMessage.picks);
              setMyPicks(receivedMessage.picks);
              setSelectedNumbers(receivedMessage.picks);
            } else {
              // For other contestants, we need to update the otherContestantsPicks
              // This is more complex as we need to remove their old picks and add new ones
              // For simplicity, we'll request a full refresh of all picks
            }
          }
        }



        if ( receivedMessage?.event === "game_s1_hustle_reveal") {
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
  }, [isConnected, onMessage, user?.contestant_id, handleAllHustlePicks])

  // Add a connection status indicator
  const ConnectionStatus = () => (
    <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
    </div>
  );

  // Add this function before the return statement in your Stage1 component
  const isNumberDisabled = (num: number): boolean => {
    // A number is disabled if:
    // 1. Timer hasn't started - this should be the first check
    // 2. It's picked by other contestants (and not by me)
    // 3. I already have 5 picks and this isn't one of them
    // 4. Timer has ended
    
    // First check - if timer hasn't started, disable all numbers
    if (!timerStarted) return true;
    
    const isOthersPick = otherContestantsPicks.includes(num) && !myPicks.includes(num);
    const maxPicksReached = myPicks.length >= 5 && !myPicks.includes(num);
    const timerEnded = timeLeft <= 0 && !myPicks.includes(num);
    
    return isOthersPick || maxPicksReached || timerEnded;
  };

  // Function to handle number click
  const handleNumberClick = (num: number) => {
    // Don't allow clicks if loading
    if (isLoading) return;
    
    // Don't allow clicks if timer hasn't started
    if (!timerStarted) return;
    
    // Don't allow clicks if time has elapsed
    if (timeLeft <= 0 && !myPicks.includes(num)) return;
    
    // Don't allow clicks on numbers picked by others
    if (otherContestantsPicks.includes(num) && !myPicks.includes(num)) return;
    
    // Don't allow more than 5 picks
    if (myPicks.length >= 5 && !myPicks.includes(num)) return;
    
    // Send the pick to the backend
    sendPickedNumbers(num);
  };

  return (
    <>
      <div className="grid grid-cols-[1fr_5fr_1fr] gap-3 h-full ">
        {/* Left Sidebar */}
        <div className="flex flex-col justify-between">
          <div className="flex justify-center items-center h-3.5 w-full mt-8">
            <Logo />
          </div>
          <div>
            <HustleStages />
          </div>
          <div className="pb-4 ">
            <Salary4LifeTrophy className="max-xl:h-[13.25rem]"/>
          </div>
        </div>
    
        <div className="overflow-y-auto">
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

          <div className="flex justify-center flex-col items-center max-lg:px-3">
            {/* Selection Grid */}
            <div className="w-full py-[1.5rem] max-xl:max-w-[65rem] 2xl:py-[3rem] max-w-[56.25rem] rounded-[.875rem] px-[2rem] 2xl:px-[3rem] bg-[#13051E] -mt-3 relative overflow-hidden">
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
                    {/* <h2 className="text-[2.125rem] font-extrabold outline-text text-black">
                      Stage 1: Hustle Kick-off 
                    </h2> */}


                      <GlowyStrokeText
                                              strokeWidth={1.5}
                                              strokeColor="#D91FFF"
                                              glowColor="transparent"
                                              glowIntensity="none"
                                              textclassName="text-[2.125rem] font-extrabold font-gilroyHeavy text-white"
                                              fillColor="#000"
                                            >
                                                Stage 1 : Hustle Kick-off
                                            </GlowyStrokeText>
                  </div>
                  <div>
                    {timerStarted && (
                      <div className="flex items-center justify-center bg-gradient-to-r from-amber-500 to-yellow-500 border-[2px] border-[#C76000] rounded-xl px-3 py-1.5 shadow-md">
                        <span 
                          className="text-[20px] font-extrabold font-verdana text-white"
                          style={{ 
                            WebkitTextStroke: "1.5px #C76000",
                            textShadow: "0px 1px 2px rgba(199, 96, 0, 0.5)"
                          }}
                        >
                          {`0:${Math.max(0, timeLeft).toString().padStart(2, "0")}`}
                        </span>
                      </div>
                    ) 
                    // : (
                    //   <Button
                    //     className="p-0 bg-transparent"
                    //     onClick={handleStartTimer}
                    //   >
                    //     <div className="flex items-center justify-center bg-gradient-to-r from-green-500 to-green-600 border-[2px] border-[#035D2E] rounded-xl px-3 py-2 shadow-md">
                    //       <span 
                    //         className="text-[16px] font-extrabold font-verdana text-white"
                    //         style={{ 
                    //           WebkitTextStroke: "1px #035D2E",
                    //           textShadow: "0px 1px 2px rgba(3, 93, 46, 0.5)"
                    //         }}
                    //       >
                    //         Start Timer
                    //       </span>
                    //     </div>
                    //   </Button>
                    // )
                    
                    }
                  </div>
                </div>

                <div className="flex flex-wrap max-md:gap-[18px] gap-[14px] 2xl:gap-[.875rem] max-xl:gap-y-5 2xl:gap-y-8 2xl:mt-8">
                  {Array.from({ length: 49 }, (_, i) => i + 1).map((num) => {
                    const isMyPick = myPicks.includes(num);
                    const isOthersPick = otherContestantsPicks.includes(num);
                    const isDisabled = isNumberDisabled(num);
                    const isRecentlyUpdated = recentlyUpdated.includes(num);
                    
                    return (
                      <div
                        key={num}
                        onClick={() => {
                          if (!isDisabled || isMyPick) {
                            handleNumberClick(num);
                          } 
                        }}
                        className={`relative cursor-pointer transition-transform ${
                          isLoading
                            ? "cursor-wait"
                            : isMyPick
                              ? "hover:scale-105" // My picks - can be clicked to deselect
                              : isDisabled
                                ? "opacity-50 cursor-not-allowed" // Disabled numbers
                                : "hover:scale-105" // Available numbers
                        } ${isRecentlyUpdated ? "animate-pulse" : ""}`}
                      >
                        <NumberCardContainer
                          text={String(num)}
                          textColor={isMyPick ? "#fff" : "#F2C94C"}
                          className={`max-xl:w-[58px] max-xl:h-[58px] ${isRecentlyUpdated ? "ring-2 ring-red-500" : ""}`}
                          primaryGradientEndColor={
                            isMyPick ? "#FF00FF" : "#3C1272"
                          }
                          backgroundColor={
                            isMyPick
                              ? "#FEC124" // My picks
                              : isOthersPick
                                ? "#666" // Other contestants' picks
                                : "black" // Available numbers
                          }
                          active={isMyPick}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            {/* Selected Numbers Display */}
            <div className="flex justify-between items-center mt-4">
              <div
                className="flex items-center gap-[2.125rem] border-[5px] border-[#CE64FF]
                py-[1rem] 2xl:px-[2.6875rem] max-w-[38.5rem] rounded-[.875rem] px-[2rem] bg-[#13051E] mt-2 xl:mt-7"
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
                  <p className="text-base text-white outline-text-white">
                    {user?.name?.split(" ")[0] || ""}
                  </p>
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

              {/* Loading indicator */}
              {isLoading && (
                <div className="fixed top-0 right-0 m-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                </div>
              )}

              {/* <Button
                className="bg-pink-950"
                onClick={onNext}
                disabled={isLoading || selectedNumbers.length !== 5}
              >
                Proceed
              </Button> */}
            </div>
          </div>

          <ErrorModal
            isErrorModalOpen={isErrorModalOpen}
            setErrorModalState={() => {
              setErrorModalState(false);
            }}
            subheading={
              errorModalMessage || "Please check your inputs and try again."
            }
          />
        </div>
           
        {/* Right Sidebar */}
        <div>
          <HustleSideBar showJackpot={false} showHustlerCard={false} showEmptyCard={true}/>
        </div>
      </div>
    </>
  );
};

export default Stage1;
