import { winninData } from '@/app/components/stages/api/stage3/fetchWInningAmt';
import { SmallSpinner } from '@/icons/core';
import { addCommasToNumber } from '@/utils';
import React from 'react';
interface prop{
  data:winninData | undefined
  isLoadingAmt: boolean
}
const Stage3Reward = ({data,isLoadingAmt}:prop) => {
  return (
    <div className="flex gap-8 flex-col   items-center justify-center">
      {/* Dud Card */}
      <div className="relative ">
        <div className="  p-4  bg-black  gap-5 rounded-lg flex  flex-col items-center justify-center relative overflow-hidden">
          {/* Dud Badge */}
          <div className=" bg-red-900 border border-red-600 px-4 py-1 rounded-full">
            <span className="text-red-300 font-bold text-2xl uppercase tracking-wide">Dud</span>
          </div>
          
          {/* Main Text with Strong Neon Effect */}
         {/* Main Text with Strong Neon Effect */}
          <div className="text-center mt-2">
            <h2 className="text-white text-2xl outline-text-white font-bold tracking-wide uppercase" 
               >
              Liberty Life
            </h2>
          </div>
        </div>
      </div>

      {/* Pass Card */}
      <div className="relative">
        <div className=" bg-black p-4  flex gap-x-5  items-center justify-center flex-col relative overflow-hidden">
          {/* Pass Badge */}
          <div className=" bg-green-800 border border-green-600 px-4 py-1 rounded-full">
            <span className="text-green-300 font-bold text-2xl uppercase tracking-wide">Pass</span>
          </div>
          
          {/* Main Text with Strong Neon Effect */}
          <div className="text-center mt-2">
           {isLoadingAmt?<SmallSpinner/>: <h2 className="text-white outline-text-white text-3xl font-bold tracking-wide" 
               style={{
                                WebkitTextStroke: "2px #035D2E",
                                textShadow: "0px 1px 2px rgba(3, 93, 46, 0.5)"
                              }}
               >
              ₦{addCommasToNumber(data?.data?.amount)}
            </h2>}
          </div>
        </div>
        
      
      </div>
    </div>
  );
};

export default Stage3Reward;