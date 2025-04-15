import { Button } from "@/components/core";
import { useState, useEffect } from "react";

type Investor = {
  name: string;
  percentage: number;
  amount: number;
};

type MessageType = "success" | "error" | "warning" | "";

export default function RedistributeCapital(): JSX.Element {
  const initialCapital = 120000;
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

  const handlePercentageChange = (index: number, newPercentage: string): void => {
    const updatedInvestors = [...investors];
    const parsedValue = parseFloat(newPercentage) || 0;
    updatedInvestors[index].percentage = parsedValue;

    let newTotal = updatedInvestors.reduce((sum, inv) => sum + inv.percentage, 0);

    if (newTotal > 100) {
      const excess = newTotal - 100;
      const otherInvestors = updatedInvestors.filter((_, i) => i !== index);
      const otherTotal = otherInvestors.reduce((sum, inv) => sum + inv.percentage, 0);

      if (otherTotal > 0) {
        updatedInvestors.forEach((inv, i) => {
          if (i !== index) {
            const proportion = inv.percentage / otherTotal;
            inv.percentage = Math.max(0, inv.percentage - excess * proportion);
            inv.percentage = Math.round(inv.percentage * 100) / 100;
          }
        });

        setMessage("Total exceeded 100%. Other percentages were adjusted automatically.");
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
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <>
     {/* <div className="p-4 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
    //   <h1 className="text-2xl font-bold mb-4 text-blue-700">Capital Distribution Calculator</h1>

    //   <div className="mb-6">
    //     <label className="block font-medium mb-1">Total Capital:</label>
    //     <input
    //       type="number"
    //       value={totalCapital}
    //       onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCapitalChange(e.target.value)}
    //       className="w-full p-2 border rounded"
    //     />
    //   </div>

    //   <div className="mb-4">
    //     <div className="flex justify-between items-center mb-2">
    //       <h2 className="text-xl font-semibold">Investors</h2>
    //       <button
    //         onClick={resetPercentages}
    //         className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
    //       >
    //         Reset to Equal
    //       </button>
    //     </div>

    //     <div className="overflow-x-auto">
    //       <table className="w-full border-collapse">
    //         <thead className="bg-gray-100">
    //           <tr>
    //             <th className="p-2 text-left">Name</th>
    //             <th className="p-2 text-left">Percentage (%)</th>
    //             <th className="p-2 text-left">Amount</th>
    //           </tr>
    //         </thead>
    //         <tbody>
    //           {investors.map((investor, index) => (
    //             <tr key={index} className="border-b">
    //               <td className="p-2">
    //                 <input
    //                   type="text"
    //                   value={investor.name}
    //                   onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
    //                     handleNameChange(index, e.target.value)
    //                   }
    //                   className="w-full p-1 border rounded"
    //                 />
    //               </td>
    //               <td className="p-2">
    //                 <input
    //                   type="number"
    //                   min="0"
    //                   max="100"
    //                   value={investor.percentage}
    //                   onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
    //                     handlePercentageChange(index, e.target.value)
    //                   }
    //                   className="w-full p-1 border rounded"
    //                 />
    //               </td>
    //               <td className="p-2 font-medium">{formatCurrency(investor.amount)}</td>
    //             </tr>
    //           ))}
    //         </tbody>
    //         <tfoot className="bg-gray-50">
    //           <tr>
    //             <td className="p-2 font-bold">Total</td>
    //             <td
    //               className={`p-2 font-bold ${
    //                 Math.abs(totalPercentage - 100) > 0.01 ? "text-red-600" : "text-green-600"
    //               }`}
    //             >
    //               {totalPercentage.toFixed(2)}%
    //             </td>
    //             <td className="p-2 font-bold">{formatCurrency(totalCapital)}</td>
    //           </tr>
    //         </tfoot>
    //       </table>
      </div> */}
   <div className="flex mt-6 items-center gap-3 justify-center text-white">
        {
            investors?.map((investor,idx:number)=>(
                <div className="" key={idx}>
<div className="py-2 px-4 flex items-center justify-center flex-nowrap bg-[#1e083b] rounded-10">
    <h2 className="text-center capitalize text-base text-nowrap font-verdana font-extrabold outline-invest-text text-white ">{investor?.name}</h2>
</div>
<div className="border border-[#9E5CFF] rounded-10 p-[.6875rem] flex justify-center items-center mt-4 flex-col">
    <h3 className="font-extrabold text-[1.75rem] font-gilroyHeavy outline-invest-text">{investor?.percentage}%</h3>
    <div className="bg-[#231438] rounded-[1.25rem] px-4 py-1 flex justify-center items-center">
    <p className="text-[#E00FFF] text-sm font-medium font-gilroyMedium">₦{investor?.amount}</p>
    </div>
    <div className="flex">
        <Button className="p-0">-</Button>
        <Button className="p-0">+</Button>
    </div>
</div>
                </div>
            ))
        }
    </div>
   
    </>
  );
}
