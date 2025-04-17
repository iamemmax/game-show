import AddIcon from "@/app/icons/AddIcon";
import MinusIcon from "@/app/icons/MinusIcon";
import { Button } from "@/components/core";
import { convertNumberToNaira } from "@/utils/currency";
import { addCommasToNumber } from "@/utils/numbers";
import { useState, useEffect } from "react";

type Investor = {
  name: string;
  percentage: number;
  amount: number;
};

type MessageType = "success" | "error" | "warning" | "";

export default function RedistributeCapital(): JSX.Element {
  const initialCapital = 900000;
  const [totalCapital, setTotalCapital] = useState<number>(initialCapital);
  const [investors, setInvestors] = useState<Investor[]>([
    { name: "Caterer", percentage: 20, amount: 0 },
    { name: "Agri tech", percentage: 20, amount: 0 },
    { name: "Fashion", percentage: 20, amount: 0 },
    { name: "Fintech", percentage: 20, amount: 0 },
    { name: "Barber", percentage: 20, amount: 0 },
  ]);
  const [totalPercentage, setTotalPercentage] = useState<number>(100);
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<MessageType>("");

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

  const handleCapitalChange = (newCapital: string): void => {
    setTotalCapital(parseFloat(newCapital) || 0);
  };

  const resetPercentages = (): void => {
    const equalShare = 100 / investors.length;
    const updatedInvestors = investors.map((investor) => ({
      ...investor,
      percentage: equalShare,
    }));
    setInvestors(updatedInvestors);
    setMessage("Percentages reset to equal distribution.");
    setMessageType("success");
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

  return (
    <>
      <div className="flex mt-6 items-center gap-3 justify-center text-white">
        {investors?.map((investor, idx: number) => (
          <div className="" key={idx}>
            <div className="py-2 px-4 flex items-center justify-center flex-nowrap bg-[#1e083b] rounded-10">
              <h2 className="text-center capitalize text-base text-nowrap font-verdana font-extrabold outline-invest-text text-white ">
                {investor?.name}
              </h2>
            </div>
            <div className="border border-[#9E5CFF] rounded-10 p-[.6875rem] flex justify-center items-center mt-4 flex-col">
              <h3 className="font-extrabold text-[1.75rem] font-gilroyHeavy outline-invest-text">
                {investor?.percentage.toFixed(2)??0}%
              </h3>
              <div className="bg-[#231438] rounded-[1.25rem] px-4 py-1 flex justify-center items-center">
                <p className="text-[#E00FFF] text-sm font-medium font-gilroyMedium">
                  ₦
                  {addCommasToNumber(
                    Number(investor?.amount?.toFixed(0)) ?? "0"
                  )}
                </p>
              </div>
              <div className="flex gap-3 items-center mt-2">
                <Button
                  className="w-[3rem] h-[1.6875rem] p-0 border border-[#9E5CFF] flex justify-center items-center rounded-[7px]"
                  onClick={() => decrementPercentage(idx)}
                >
                  <div className=" h-4 mt-2 flex justify-center items-center">
                    {" "}
                    <MinusIcon />
                  </div>
                </Button>

                <Button
                  className="w-[3rem] h-[1.6875rem] p-0 border border-[#9E5CFF]  rounded-[7px]"
                  onClick={() => incrementPercentage(idx)}
                >
                  <div className=" h-4 mt-2 flex justify-center items-center">
                    {" "}
                    <AddIcon />
                  </div>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
