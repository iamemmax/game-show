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
number:number
};

type MessageType = "success" | "error" | "warning" | "";

export default function RedistributeCapital(): JSX.Element {
  const initialCapital = 900000;
  const [totalCapital, setTotalCapital] = useState<number>(initialCapital);
  const [investors, setInvestors] = useState<Investor[]>([
    { name: "Caterer", percentage: 20, amount: 0,number:22 },
    { name: "Agri tech", percentage: 20, amount: 0,number:30 },
    { name: "Fashion", percentage: 20, amount: 0 ,number:17},
    { name: "Fintech", percentage: 20, amount: 0,number:54 },
    { name: "Barber", percentage: 20, amount: 0 ,number:10},
  ]);
  const [totalPercentage, setTotalPercentage] = useState<number>(100);
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<MessageType>("");
  

  // Add new state for tracking view mode
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [showDetailedView, setShowDetailedView] = useState<boolean>(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);

  const handleCardClick = (idx: number) => {
    if (selectedCards.includes(idx)) {
      // If card is already selected, remove it
      setSelectedCards(selectedCards.filter(cardIdx => cardIdx !== idx));
    } else {
      // Add new card to selected cards
      setSelectedCards([...selectedCards, idx]);
    }
  };

  const handleBackToCards = () => {
    setShowDetailedView(false);
    setSelectedCardIndex(null);
  };

  useEffect(() => {
    calculateAmounts();
  }, [investors, totalCapital]);

  const calculateAmounts = (): void => {
    let total = 0;
    const updatedInvestors = investors.map((investor) => {
      const amount = (investor.percentage / 100) * totalCapital;
      total += investor.percentage;
      return { ...investor, amount };
    });

    setInvestors(updatedInvestors);
    setTotalPercentage(total);

    if (Math.abs(total - 100) > 0.01) {
      setMessage("Percentages must sum to 100%");
      setMessageType("error");
    } else {
      setMessage("Total is exactly 100%");
      setMessageType("success");
    }
  };

  const handleNameChange = (index: number, newName: string): void => {
    const updatedInvestors = [...investors];
    updatedInvestors[index].name = newName;
    setInvestors(updatedInvestors);
  };

  const handlePercentageChange = (
    index: number,
    newPercentage: string
  ): void => {
    const updatedInvestors = [...investors];
    const parsedValue = parseFloat(newPercentage) || 0;
    updatedInvestors[index].percentage = parsedValue;

    let newTotal = updatedInvestors.reduce(
      (sum, inv) => sum + inv.percentage,
      0
    );

    if (newTotal > 100) {
      const excess = newTotal - 100;
      const otherInvestors = updatedInvestors.filter((_, i) => i !== index);
      const otherTotal = otherInvestors.reduce(
        (sum, inv) => sum + inv.percentage,
        0
      );

      if (otherTotal > 0) {
        updatedInvestors.forEach((inv, i) => {
          if (i !== index) {
            const proportion = inv.percentage / otherTotal;
            inv.percentage = Math.max(0, inv.percentage - excess * proportion);
            inv.percentage = Math.round(inv.percentage * 100) / 100;
          }
        });

        setMessage(
          "Total exceeded 100%. Other percentages were adjusted automatically."
        );
        setMessageType("warning");
      } else {
        updatedInvestors[index].percentage = 100;
        setMessage("Maximum percentage is 100%. Value has been capped.");
        setMessageType("warning");
      }
    }

    setInvestors(updatedInvestors);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const incrementPercentage = (index: number): void => {
    const updatedInvestors = [...investors];
    updatedInvestors[index].percentage += 1;
    if (updatedInvestors[index].percentage > 100) {
      updatedInvestors[index].percentage = 100;
    }
    handlePercentageChange(
      index,
      updatedInvestors[index].percentage.toString()
    );
  };

  const decrementPercentage = (index: number): void => {
    const updatedInvestors = [...investors];
    updatedInvestors[index].percentage -= 1;
    if (updatedInvestors[index].percentage < 0) {
      updatedInvestors[index].percentage = 0;
    }
    handlePercentageChange(
      index,
      updatedInvestors[index].percentage.toString()
    );
  };
const patterTypes =  [PATTERN_GREEN_BLACK, PATTERN_ORANGE_BLACK, PATTERN_PURPLE_BLACK, PATTERN_PURPLE_GREY, PATTERN_PURPLE_WHITE]
  return (
    <>
     <div className="grid grid-cols-5 gap-3 px-2  text-white ">
      {investors.map((investor, idx) => (
        <div 
          key={investor.name} 
          onClick={() => handleCardClick(idx)} 
          className="cursor-pointer"
        >
          {selectedCards.includes(idx) ? (
            // Show percentage container for selected card
            <div className="border border-[#9E5CFF] rounded-10 p-[.6875rem] flex justify-center items-center flex-col">
              <h2 className="text-center capitalize text-sm text-nowrap font-verdana font-extrabold text-white" style={{ WebkitTextStroke: "1.5px #000" }}>
                {investor.name}
              </h2>
              <h3 className="font-extrabold text-[1.2rem] font-gilroyHeavy outline-invest-text" style={{ WebkitTextStroke: "1.2px #E00FFF" }}>
                {investor.percentage.toFixed(2)}%
              </h3>
              <div className="bg-[#231438] rounded-[1.25rem] px-4 py-[3px] flex justify-center items-center">
                <p className="text-[#E00FFF] text-xs font-medium font-gilroyMedium mt-1">
                  ₦{addCommasToNumber(Number(investor.amount.toFixed(0)))}
                </p>
              </div>
              <div className="flex gap-3 items-center mt-[5px]">
                <Button
                  className="w-[3rem] h-[1.6rem] p-0 border border-[#9E5CFF]  flex justify-center items-center rounded-[7px]"
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
            className="text-sm border-[1px] rounded-10  py-0"
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
   <div className=" mt-2 flex w-full justify-center items-center">
  <Button className="p-0 bg-transparent"> <GradientButton text="invest" className="uppercase" height={35}/></Button>
   </div>
    </>
  );
}
