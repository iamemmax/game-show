import AddIcon from "@/app/icons/AddIcon";
import MinusIcon from "@/app/icons/MinusIcon";
import GradientButton from "@/app/shared/GradientButton";
import HustleCard from "@/app/shared/HustleCard";
import { PATTERN_GREEN_BLACK, PATTERN_ORANGE_BLACK, PATTERN_PURPLE_BLACK, PATTERN_PURPLE_GREY, PATTERN_PURPLE_WHITE } from "@/app/shared/HustleCard.PatternTypes";
import { Button } from "@/components/core";
import { convertNumberToNaira } from "@/utils/currency";
import { addCommasToNumber } from "@/utils/numbers";
import { useState, useEffect } from "react";

type Investor = {
  name: string;
  percentage: number;
  amount: number;
  initialAmount: number;
  number: number;
};

type MessageType = "success" | "error" | "warning" | "";
interface Prop {
  setShowInvestResult: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function RedistributeCapital({ setShowInvestResult }: Prop): JSX.Element {
  const [investors, setInvestors] = useState<Investor[]>([
    { name: "Caterer", percentage: 100, amount: 200000, initialAmount: 200000, number: 22 },
    { name: "Agri tech", percentage: 100, amount: 15000, initialAmount: 15000, number: 30 },
    { name: "Fashion", percentage: 100, amount: 200000, initialAmount: 200000, number: 17 },
    { name: "Fintech", percentage: 100, amount: 150000, initialAmount: 150000, number: 54 },
    { name: "Barber", percentage: 100, amount: 200000, initialAmount: 200000, number: 10 },
  ]);
  const [totalPercentage, setTotalPercentage] = useState<number>(100);
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<MessageType>("");
  
  // Add new state for tracking view mode
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  
  const handleCardClick = (idx: number) => {
    if (selectedCards.includes(idx)) {
      // If card is already selected, remove it
      setSelectedCards(selectedCards.filter(cardIdx => cardIdx !== idx));
    } else {
      // Add new card to selected cards
      setSelectedCards([...selectedCards, idx]);
    }
  };

  const calculateAmounts = (): void => {
    // For the purpose of showing total percentages
    let totalPercent = investors.reduce((sum, inv) => sum + inv.percentage, 0);
    setTotalPercentage(totalPercent / investors.length); // Average percentage
  };

  useEffect(() => {
    calculateAmounts();
  }, [investors]);

  const incrementPercentage = (index: number): void => {
    const updatedInvestors = [...investors];
    const currentInvestor = updatedInvestors[index];
    
    // Already at maximum (100%)
    if (currentInvestor.percentage >= 100) {
      setMessage(`${currentInvestor.name} already at maximum allocation (100%)`);
      setMessageType("warning");
      return;
    }
    
    // Step is 10%
    const step = 10;
    const newPercentage = Math.min(currentInvestor.percentage + step, 100);
    
    // Calculate new amount based on percentage of initial amount
    const newAmount = (newPercentage / 100) * currentInvestor.initialAmount;
    
    // Update investor
    currentInvestor.percentage = newPercentage;
    currentInvestor.amount = newAmount;
    
    setInvestors(updatedInvestors);
    setMessage(`Increased ${currentInvestor.name} to ${newPercentage}% of allocation`);
    setMessageType("success");
  };
  
  const decrementPercentage = (index: number): void => {
    const updatedInvestors = [...investors];
    const currentInvestor = updatedInvestors[index];
    
    // Minimum percentage (10%)
    const minPercentage = 10;
    
    // Already at minimum
    if (currentInvestor.percentage <= minPercentage) {
      setMessage(`${currentInvestor.name} already at minimum allocation (${minPercentage}%)`);
      setMessageType("warning");
      return;
    }
    
    // Step is 10%
    const step = 10;
    const newPercentage = Math.max(currentInvestor.percentage - step, minPercentage);
    
    // Calculate new amount based on percentage of initial amount
    const newAmount = (newPercentage / 100) * currentInvestor.initialAmount;
    
    // Update investor
    currentInvestor.percentage = newPercentage;
    currentInvestor.amount = newAmount;
    
    setInvestors(updatedInvestors);
    setMessage(`Decreased ${currentInvestor.name} to ${newPercentage}% of allocation`);
    setMessageType("success");
  };

  const patterTypes = [PATTERN_GREEN_BLACK, PATTERN_ORANGE_BLACK, PATTERN_PURPLE_BLACK, PATTERN_PURPLE_GREY, PATTERN_PURPLE_WHITE];
  
  return (
    <>
     <div className="grid grid-cols-5 gap-3 px-2 text-white">
      {investors.map((investor, idx) => (
        <div 
          key={investor.name} 
          onClick={() => handleCardClick(idx)} 
          className="cursor-pointer"
        >
          {selectedCards.includes(idx) ? (
            // Show percentage container for selected card
            <div className="border border-[#9E5CFF] rounded-10 p-[.6875rem] py-2 flex justify-center items-center flex-col">
              <h2 className="text-center capitalize text-sm text-nowrap font-verdana font-extrabold text-white" style={{ WebkitTextStroke: "1.5px #000" }}>
                {investor.name}
              </h2>
              <h3 className="font-extrabold text-[1.2rem] font-gilroyHeavy outline-invest-text" style={{ WebkitTextStroke: "1.2px #E00FFF" }}>
                {investor.percentage}%
              </h3>
              <div className="bg-[#231438] rounded-[1.25rem] px-4 py-[3px] flex justify-center items-center">
                <p className="text-[#E00FFF] text-xs font-medium font-gilroyMedium mt-1">
                  ₦{addCommasToNumber(Number(investor.amount.toFixed(0)))}
                </p>
              </div>
              <div className="flex gap-3 items-center mt-[5px]">
                <Button
                  className="w-[3rem] h-[1.6rem] p-0 border border-[#9E5CFF] flex justify-center items-center rounded-[7px]"
                  onClick={(e) => {
                    e.stopPropagation();
                    decrementPercentage(idx);
                  }}
                >
                  <div className="h-2 mt-2 flex justify-center items-center">
                    <MinusIcon />
                  </div>
                </Button>
                <Button
                  className="w-[3rem] h-[1.6rem] p-0 border border-[#9E5CFF] rounded-[7px]"
                  onClick={(e) => {
                    e.stopPropagation();
                    incrementPercentage(idx);
                  }}
                >
                  <div className="h-2 mt-2 flex justify-center items-center">
                    <AddIcon />
                  </div>
                </Button>
              </div>
            </div>
          ) : (
            // Show original card if not selected
            <HustleCard
              id={investor?.name?.replace(/\s+/g, "")}
              className="text-sm border-[1px] rounded-10 py-0"
              title={investor?.name}
              number={investor?.number}
              amount={`₦${addCommasToNumber(Number(investor.amount.toFixed(0)))}`}
              amountClassName="text-[1.25rem] 2xl:text-[2rem]"
              numberClassName="text-[2.5rem] text-white"
              titleClassName="text-sm font-extrabold"
              pattern={patterTypes[idx]}
            />
          )}
        </div>
      ))}
    </div>
    <div className="mt-2 py-3 flex w-full justify-center items-center">
      <Button className="p-0 bg-transparent" onClick={() => setShowInvestResult(true)}>
        <GradientButton text="invest" className="uppercase" height={35} />
      </Button>
    </div>
    </>
  );
}