"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { Button, ErrorModal } from "@/components/core";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import NumberCardContainer from "@/app/shared/NumberContainer";
import { motion } from "framer-motion";
import { tokenStorage } from "@/utils/auth";
import { useStageOnePickNumber } from "./api/stage1/stageOnePickNumber";
import { useDebounce, useErrorModalState } from "@/hooks";
import { formatAxiosErrorMessage } from "@/utils";
import { AxiosError } from "axios";
import { useGetAllHustleNumbers } from "./api/stage1/getAllHustlePicks";
// import HustleBottomCard from "./components/hustle/HustleBottomCard";
import HustleSideBar from "./components/hustle/HustleSideBar";
import Logo from "@/app/icons/Logo";
import HustleStages from "./components/hustle/HustleStages";
import { ContestantDetails } from "@/types/types";
import { useMQTT } from "@/hooks/useMqttService";
// import debounce from "lodash/debounce";

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
  const { isConnected, sendMessage, onMessage, userId } = useMQTT();
  
  // Explicitly type the state with number[]
  const [selectedNumbers, setSelectedNumbers] = useState<Array<number>>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [autoPicked, setAutoPicked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data, refetch } = useGetAllHustleNumbers(user?.game_episode as number);
  const debouncedRefetchRef = useRef(
    useDebounce(() => {
      refetch();
    }, 300) // 300ms debounce time
  );

  // State to track current user's picks and other contestants' picks separately
  const [myPicks, setMyPicks] = useState<number[]>([]);
  const [otherContestantsPicks, setOtherContestantsPicks] = useState<number[]>([]);

  // Add state to track recently updated numbers for visual feedback
  const [recentlyUpdated, setRecentlyUpdated] = useState<number[]>([]);

  // Function to send picked numbers to backend
  const sendPickedNumbers = async (num: number) => {
    if (!user?.contestant_id) return;
    
    // CRITICAL: Validate that number is not already picked by others
    if (otherContestantsPicks.includes(num) && !myPicks.includes(num)) {
      console.error("Cannot pick number that is already picked by another contestant:", num);
      openErrorModalWithMessage("This number has already been selected by another contestant");
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
          event: "select_number/pick",
          payload: {
            game_episode: user?.game_episode,
            contestant_id: user?.contestant_id,
            picks: num,
            timestamp: new Date().toISOString()
          }
        };
        
        // Send the message
        await sendMessage(JSON.stringify(payload), "select_number/pick");
      }
    } catch (error) {
      console.error("Failed to publish message to MQTT:", error);
      // Revert optimistic update on error
      refetch();
    } finally {
      setIsLoading(false);
    }
  };

  // Setup MQTT message handling for initial load
  useEffect(() => {
    if (isConnected) {
      // Set up message handler
      const handler = (receivedMessage: any) => {
        console.log("Received message:", receivedMessage);
        
        // Check if message is related to our game picks
        if (receivedMessage?.contestant_id && (receivedMessage?.picks || receivedMessage?.pick)) {
          // If this is for our user ID, update the selected numbers
          if (receivedMessage.contestant_id === user?.contestant_id) {
            if (receivedMessage.picks) {
              setSelectedNumbers(receivedMessage.picks);
            } else if (receivedMessage.pick && receivedMessage.action) {
              // Handle individual pick actions
              if (receivedMessage.action === 'add') {
                setSelectedNumbers(prev => [...prev, receivedMessage.pick]);
              } else if (receivedMessage.action === 'remove') {
                setSelectedNumbers(prev => prev.filter(n => n !== receivedMessage.pick));
              }
            }
          }
          
          // Always refetch to get updated data from all contestants
          refetch();
        }
      };
      
      // Pass the handler function to onMessage
      onMessage(handler);
      
      return () => {
        // Clean up the message handler when the component unmounts
        // Pass null directly without wrapping it in an object
        onMessage(null);
      };
    }
  }, [isConnected, onMessage, user?.contestant_id, refetch]);

  // Load user's previously picked numbers on mount
  useEffect(() => {
    if (user?.contestant_id && data?.data) {
      const userPicks = data.data.find(
        (contestant) => contestant.contestant_id === user.contestant_id
      );
      
      if (userPicks && userPicks.picks && userPicks.picks.length > 0) {
        console.log("Found user's previous picks:", userPicks.picks);
        setSelectedNumbers(userPicks.picks);
        setMyPicks(userPicks.picks);
        setAutoPicked(true);
      }
    }
  }, [user?.contestant_id, data?.data]);

  // Process data to separate my picks from others' picks
  useEffect(() => {
    if (data?.data && Array.isArray(data.data) && user?.contestant_id) {
      console.log("Processing contestant data:", data.data);
      
      // Find my picks in the data
      const myPicksFromData = data.data.find(
        contestant => contestant.contestant_id === user.contestant_id
      )?.picks || [];
      
      // Find all other contestants' picks
      const otherPicks = data.data
        .filter(contestant => contestant.contestant_id !== user.contestant_id)
        .flatMap(contestant => contestant.picks || [])
        .filter((value, index, self) => self.indexOf(value) === index); // Get unique values
      
      console.log("My picks from data:", myPicksFromData);
      console.log("Other contestants' picks:", otherPicks);
      
      // Update state
      setMyPicks(myPicksFromData);
      setOtherContestantsPicks(otherPicks);
      
      // Also update selectedNumbers to match myPicks for UI consistency
      if (JSON.stringify(myPicksFromData) !== JSON.stringify(selectedNumbers)) {
        setSelectedNumbers(myPicksFromData);
      }
    }
  }, [data?.data, user?.contestant_id]);

  // Check if a number is disabled (picked by others)
  const isNumberDisabled = (num: number): boolean => {
    // If time has elapsed, all numbers are disabled except already selected ones
    if (timeLeft <= 0) {
      return !myPicks.includes(num);
    }
    
    // If already selected 5 numbers, disable all except the selected ones
    if (myPicks.length >= 5 && !myPicks.includes(num)) {
      return true;
    }
    
    // Check if number is picked by other contestants
    return otherContestantsPicks.includes(num);
  };

  // Countdown Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setTimeLeft(0); // Ensure timer stops at 0
      
      // Send time elapsed event via MQTT
      if (isConnected && user?.contestant_id) {
        const timeElapsedPayload = {
          contestant_id: user.contestant_id,
          picks: selectedNumbers,
          timestamp: new Date().toISOString()
        };
        
        sendMessage(JSON.stringify(timeElapsedPayload), "time_elapsed").catch((error) => {
          console.error("Failed to publish time elapsed event to MQTT:", error);
        });
      }
      
      // Auto-select remaining numbers if needed
      if (!autoPicked && selectedNumbers.length < 5) {
        autoSelectRemainingNumbers();
      } else if (selectedNumbers.length === 5) {
        // If all 5 numbers are already selected, send completion event
        if (isConnected && user?.contestant_id) {
          const completionPayload = {
            contestant_id: user.contestant_id,
            picks: selectedNumbers,
            timestamp: new Date().toISOString()
          };
          
          sendMessage(JSON.stringify(completionPayload), "picks_completed").catch((error) => {
            console.error("Failed to publish completion event to MQTT:", error);
          });
        }
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1)); // Prevent negative values
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, autoPicked, selectedNumbers.length, isConnected, user?.contestant_id, sendMessage]);

  // Check if a number is selected by the current user
  const isSelected = (num: number): boolean => {
    return myPicks.includes(num);
  };

  // Improved handleNumberClick with stricter validation
  const handleNumberClick = async (num: number): Promise<void> => {
      // CRITICAL: Check if number is picked by other contestants - STRICT CHECK
    if (otherContestantsPicks.includes(num) && !myPicks.includes(num)) {
  
      openErrorModalWithMessage("This number has already been selected by another contestant");
      return;
    }
    
    // Allow clicking own selections even if time elapsed
    if (timeLeft <= 0 && !myPicks.includes(num)) {
      console.log("Click ignored: Time elapsed and number not selected");
      return;
    }
    
    // Don't allow selecting more than 5 numbers
    if (!myPicks.includes(num) && myPicks.length >= 5) {
      openErrorModalWithMessage("You can only select 5 numbers");
      return;
    }

    console.log("Click allowed, proceeding with selection");
    
    try {
      // Send to backend immediately
      await sendPickedNumbers(num);
      
      // If this selection completes the 5 picks, send completion event
      if (!myPicks.includes(num) && myPicks.length === 4 && isConnected && user?.contestant_id) {
        // Wait a bit for the pick to be processed
        setTimeout(() => {
          const completionPayload = {
            contestant_id: user.contestant_id,
            picks: [...myPicks, num],
            timestamp: new Date().toISOString()
          };
          
          sendMessage(JSON.stringify(completionPayload), "picks_completed").catch((error) => {
            console.error("Failed to publish completion event to MQTT:", error);
          });
        }, 500);
      }
    } catch (error) {
      console.error("Error updating picks:", error);
      const errorMessage = formatAxiosErrorMessage(error as AxiosError);
      openErrorModalWithMessage(String(errorMessage));
    }
  };

  // Enhanced MQTT message handling with immediate UI updates
  useEffect(() => {
    if (isConnected) {
      // Set up message handler for real-time updates
      const handleMessage = (receivedMessage:any) => {
        console.log("Received MQTT message:", receivedMessage);
        
        // Check if message is related to game picks
        if (receivedMessage?.contestant_id && (receivedMessage?.pick !== undefined || receivedMessage?.picks)) {
          const isMyMessage = receivedMessage.contestant_id === user?.contestant_id;
          
          // Handle pick actions immediately
          if (receivedMessage.pick !== undefined && receivedMessage.action) {
            const pickedNumber = receivedMessage.pick;
            
            if (isMyMessage) {
              // Update my picks
              if (receivedMessage.action === 'add') {
                console.log("Adding number to my picks from MQTT:", pickedNumber);
                setMyPicks(prev => [...prev.filter(n => n !== pickedNumber), pickedNumber]);
                setSelectedNumbers(prev => [...prev.filter(n => n !== pickedNumber), pickedNumber]);
              } else if (receivedMessage.action === 'remove') {
                console.log("Removing number from my picks from MQTT:", pickedNumber);
                setMyPicks(prev => prev.filter(n => n !== pickedNumber));
                setSelectedNumbers(prev => prev.filter(n => n !== pickedNumber));
              }
            } else {
              // Update other contestants' picks immediately
              if (receivedMessage.action === 'add') {
                console.log("Other contestant picked number:", pickedNumber);
                setOtherContestantsPicks(prev => [...prev.filter(n => n !== pickedNumber), pickedNumber]);
                
                // Add visual feedback for recently updated numbers
                setRecentlyUpdated(prev => [...prev, pickedNumber]);
                
                // Remove from recently updated after animation
                setTimeout(() => {
                  setRecentlyUpdated(prev => prev.filter(n => n !== pickedNumber));
                }, 1000);
              } else if (receivedMessage.action === 'remove') {
                console.log("Other contestant unpicked number:", pickedNumber);
                setOtherContestantsPicks(prev => prev.filter(n => n !== pickedNumber));
              }
            }
          }
          
          // Handle full picks array updates
          if (receivedMessage.picks && Array.isArray(receivedMessage.picks)) {
            if (isMyMessage) {
              console.log("Updating my picks from MQTT:", receivedMessage.picks);
              setMyPicks(receivedMessage.picks);
              setSelectedNumbers(receivedMessage.picks);
            }
          }
          
          // Always refetch to ensure data consistency
          debouncedRefetchRef.current();
        }
      };
      
      onMessage(handleMessage);
      
      return () => {
        onMessage(null);
      };
    }
  }, [isConnected, onMessage, user?.contestant_id]);

  // Automatically select remaining numbers
  const autoSelectRemainingNumbers = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Get all available numbers (not picked by others and not already picked by me)
      const availableNumbers: Array<number> = Array.from(
        { length: 49 },
        (_, i) => i + 1
      ).filter(
        (num: number) =>
          !myPicks.includes(num) && !otherContestantsPicks.includes(num)
      );

      const shuffled: Array<number> = availableNumbers.sort(
        () => 0.5 - Math.random()
      );
      const numbersToAdd: Array<number> = shuffled.slice(
        0,
        5 - myPicks.length
      );
      const newSelectedNumbers: Array<number> = [
        ...myPicks,
        ...numbersToAdd,
      ];

      // Optimistic update
      setMyPicks(newSelectedNumbers);
      setSelectedNumbers(newSelectedNumbers);
      setAutoPicked(true);
      
      // Send each auto-selected number to the backend and publish to MQTT
      for (const num of numbersToAdd) {
        await sendPickedNumbers(num);
        // Small delay to avoid overwhelming the system
        await new Promise(r => setTimeout(r, 100));
      }
      
      // Trigger a single refetch after all operations
      refetch();
      
      // Publish auto-pick completion event
      if (user?.contestant_id && isConnected) {
        const autoPickPayload = {
          contestant_id: user.contestant_id,
          auto_picked: true,
          picks: newSelectedNumbers,
          timestamp: new Date().toISOString()
        };
        
        sendMessage(JSON.stringify(autoPickPayload), "picks_completed").catch((error) => {
          console.error("Failed to publish auto-pick message to MQTT:", error);
        });
      }
    } catch (error) {
      console.error("Error auto-selecting numbers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a synchronization function to ensure data consistency
  const synchronizeData = useCallback(async () => {
    if (!user?.game_episode || !isConnected) return;
    
    try {
      console.log("Synchronizing data...");
      
      // Request a full data refresh
      const result = await refetch();
      
      if (result.data?.data) {
        console.log("Sync successful, processing data:", result.data.data);
        
        // Process the data to update local state
        const myPicksFromData = result.data.data.find(
          contestant => contestant.contestant_id === user.contestant_id
        )?.picks || [];
        
        const otherPicks = result.data.data
          .filter(contestant => contestant.contestant_id !== user.contestant_id)
          .flatMap(contestant => contestant.picks || [])
          .filter((value, index, self) => self.indexOf(value) === index);
        
        // Update state with the latest data
        setMyPicks(myPicksFromData);
        setSelectedNumbers(myPicksFromData);
        setOtherContestantsPicks(otherPicks);
        
        console.log("Sync complete. My picks:", myPicksFromData);
        console.log("Other contestants' picks:", otherPicks);
        
        // Publish current state to MQTT to ensure all clients are in sync
        if (user?.contestant_id) {
          const syncPayload = {
            contestant_id: user.contestant_id,
            picks: myPicksFromData,
            timestamp: new Date().toISOString(),
            sync: true
          };
          
          sendMessage(JSON.stringify(syncPayload), "sync_state").catch((error) => {
            console.error("Failed to publish sync state to MQTT:", error);
          });
        }
      }
    } catch (error) {
      console.error("Error synchronizing data:", error);
    }
  }, [user?.game_episode, user?.contestant_id, isConnected, refetch, sendMessage]);

  // Trigger synchronization on component mount and when connection status changes
  useEffect(() => {
    if (isConnected) {
      synchronizeData();
      
      // Set up periodic synchronization
      const syncInterval = setInterval(() => {
        synchronizeData();
      }, 5000); // Sync every 5 seconds
      
      return () => clearInterval(syncInterval);
    }
  }, [isConnected, synchronizeData]);

  // Add a connection status indicator
  const ConnectionStatus = () => (
    <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
      <span className="text-xs text-white">{isConnected ? 'Connected' : 'Disconnecting...'}</span>
    </div>
  );

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
          <div className=""></div>
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
            <div className="w-full py-[1rem] max-xl:max-w-[65rem] 2xl:py-[3rem] max-w-[56.25rem] rounded-[.875rem] px-[2rem] 2xl:px-[3rem] bg-[#13051E] -mt-3 relative overflow-hidden">
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
                    <h2 className="text-[2.125rem] font-extrabold outline-text text-black">
                      Stage 1: Hustle Kick-off {user?.contestant_id && `(${user.contestant_id})`}
                    </h2>
                  </div>
                  <div>
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
                  </div>
                </div>

                <div className="flex flex-wrap max-md:gap-[18px] gap-[14px] 2xl:gap-[.875rem] max-xl:gap-y-5 2xl:gap-y-8 2xl:mt-8">
                  {Array.from({ length: 49 }, (_, i) => i + 1).map((num) => {
                    const isMyPick = myPicks.includes(num);
                    const isOthersPick = otherContestantsPicks.includes(num);
                    const isDisabled = isNumberDisabled(num);
                    
                    return (
                      <div
                        key={num}
                        onClick={() => {
                          if (!isDisabled || isMyPick) {
                            handleNumberClick(num);
                          } else {
                            console.log(`Click blocked on number ${num}: ${isOthersPick ? "Picked by another contestant" : "Other restriction"}`);
                            if (isOthersPick) {
                              openErrorModalWithMessage("This number has already been selected by another contestant");
                            }
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
                        } ${recentlyUpdated.includes(num) ? "animate-pulse" : ""}`}
                      >
                        {isOthersPick && (
                          <div className="absolute inset-0 z-10 bg-red-500 opacity-20 rounded-full pointer-events-none"></div>
                        )}
                        <NumberCardContainer
                          text={String(num)}
                          textColor={isMyPick ? "#fff" : "#F2C94C"}
                          className={`max-xl:w-[54px] max-xl:h-[54px] ${recentlyUpdated.includes(num) ? "ring-2 ring-red-500" : ""}`}
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

              <Button
                className="bg-pink-950"
                onClick={onNext}
                disabled={isLoading || selectedNumbers.length !== 5}
              >
                Proceed
              </Button>
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
