import React from 'react';

const Stage3Reward = () => {
  return (
    <div className="flex gap-8  items-center justify-center">
      {/* Dud Card */}
      <div className="relative">
        <div className="w-80 h-32 bg-black border-2 border-cyan-400 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
          {/* Dud Badge */}
          <div className="absolute top-2 bg-red-900 border border-red-600 px-4 py-1 rounded-full">
            <span className="text-red-300 font-bold text-xs uppercase tracking-wide">Dud</span>
          </div>
          
          {/* Main Text with Strong Neon Effect */}
         {/* Main Text with Strong Neon Effect */}
          <div className="text-center mt-2">
            <h2 className="text-white text-2xl outline-text-white font-bold tracking-wide uppercase" 
               >
              Health Insurance
            </h2>
          </div>
        </div>
      </div>

      {/* Pass Card */}
      <div className="relative">
        <div className="w-80 h-32 bg-black border-2 border-cyan-400 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
          {/* Pass Badge */}
          <div className="absolute top-2 bg-green-800 border border-green-600 px-4 py-1 rounded-full">
            <span className="text-green-300 font-bold text-xs uppercase tracking-wide">Pass</span>
          </div>
          
          {/* Main Text with Strong Neon Effect */}
          <div className="text-center mt-2">
            <h2 className="text-white outline-text-white text-3xl font-bold tracking-wide" 
               style={{
                                WebkitTextStroke: "2px #035D2E",
                                textShadow: "0px 1px 2px rgba(3, 93, 46, 0.5)"
                              }}
               >
              ₦500,000
            </h2>
          </div>
        </div>
        
      
      </div>
    </div>
  );
};

export default Stage3Reward;