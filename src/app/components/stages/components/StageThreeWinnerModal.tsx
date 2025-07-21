// "use client";
// import { useEffect } from "react";
// import { motion } from "framer-motion";
// import Image from "next/image";
// import PassComponent from "./stage3/PassComponent";
// import Logo from "@/app/icons/Logo";
// import PassCard from "./stage3/PassCard";
// import YouWonText from "./stage3/YouWonText";


// interface prop{
//   name: string
//   balance: string;
//   imgUrl?:string
// }
// export default function StageThreeWinnerModal({name, balance,imgUrl}:prop) {
//   console.log(balance);
  
//   useEffect(() => {
//     const audio = new Audio("/sounds/success-sound.wav");
//     audio.play().catch((e) => {
//       console.warn("Audio failed to play automatically:", e);
//     });
//   }, []);

//   return (
//     <div className="fixed w-full inset-0 bg-[url('/images/stage-3-bg.svg')] bg-cover bg-no-repeat !z-[999999999] flex flex-col items-center justify-center text-white px-6">
//       {/* Top Heading */}
//       <div className="text-center mb-7">
//         <Logo width={200} height={100} />
//       </div>

//       {/* Pass Card Animation */}
//       <div className="relative h-[400px] w-full flex justify-center items-center flex-col">
        // <motion.div
        //   className="absolute -top-[3.6rem]"
        //   initial={{ y: -100, scale: 0.7 }}
        //   animate={{ y: 0, scale: 1 }}
        //   transition={{ type: "spring", stiffness: 200 }}
        // >
        //   <PassCard />
        // </motion.div>

        // <motion.div
        //   className="!z-[99999]"
        //   initial={{ y: -100, scale: 0.7 }}
        //   animate={{ y: 0, scale: 1 }}
        //   transition={{ type: "spring", stiffness: 200 }}
        // >
        //   <Image alt="image" src={imgUrl as string ?? "/"} width={250} height={250} />
        // </motion.div>

//         <motion.div
//           className="!z-[9999999999]"
        
//         >
       
//        <h2 className="font-gilroyBold uppercase text-center text-[4.25rem] font-extrabold text-[#e79b0c]">{name} <br /> You won the pass</h2>
     
//      <div className="bg-[#001B10] px-6 py-2 rounded-[1.25rem]">
//   <p className="text-[22px] font-semibold text-[#00FF84] drop-shadow-[0_0_5px_#00FF84]">
//     Earnings: <span className="font-bold">₦{balance.toLocaleString()??0}</span>
//   </p>
// </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// }

"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import PassCard from "./stage3/PassCard";
import Image from "next/image";

interface StageThreeWinnerModalProps {
  name: string;
  balance: string;
  imgUrl?: string;
}

export default function StageThreeWinnerModal({ name, balance, imgUrl }: StageThreeWinnerModalProps) {
  useEffect(() => {
    const audio = new Audio("/sounds/success-sound.wav");
    audio.play().catch((e) => {
      console.warn("Audio failed to play automatically:", e);
    });
  }, []);

  // Generate confetti elements
  const confettiColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
  const confettiElements = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    left: Math.random() * 100,
    animationDelay: Math.random() * 3,
    size: Math.random() * 10 + 5,
  }));

  return (
    <div className="fixed w-full inset-0 bg-black flex flex-col items-center justify-center text-white px-6 overflow-hidden">
      {/* Animated Confetti Background */}
      <div className="absolute inset-0 pointer-events-none">
        {confettiElements.map((confetti) => (
          <motion.div
            key={confetti.id}
            className="absolute"
            style={{
              left: `${confetti.left}%`,
              width: `${confetti.size}px`,
              height: `${confetti.size}px`,
              backgroundColor: confetti.color,
              borderRadius: Math.random() > 0.5 ? '50%' : '0%',
            }}
            initial={{ y: -20, opacity: 0, rotate: 0 }}
            animate={{
              y: window.innerHeight + 20,
              opacity: [0, 1, 1, 0],
              rotate: 360,
            }}
            transition={{
              duration: 3,
              delay: confetti.animationDelay,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Pass Badge */}


        {/* Profile Image */}
        <motion.div
          className="!z-[99999999]"
          initial={{ y: -100, scale: 0.7, rotate: -10 }}
          animate={{ y: 0, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <PassCard/>
        </motion.div>
        <motion.div
          className="relative"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          <div className="w-[11.875rem] -mt-16 h-[11.875rem] rounded-xl overflow-hidden ">
            {imgUrl ? (
              <motion.div
          className="!z-[99999]"
          initial={{ y: -100, scale: 0.7 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <Image alt="image" src={imgUrl as string ?? "/"} width={250} height={250} />
        </motion.div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </motion.div>

        {/* Winner Text */}
        <motion.div
          className="text-center -mt-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 mb-2 drop-shadow-lg">
            {name?.toUpperCase()}
          </h1>
          <h2 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 drop-shadow-lg">
            YOU WON THE PASS!
          </h2>
        </motion.div>

        {/* Earnings Display */}
        <motion.div
          className="bg-[#001B10] mt-4  px-8 py-4 rounded-2xl shadow-lg"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
        >
          <p className="text-green-300 text-xl md:text-2xl font-semibold text-center">
            Earnings: <span className="font-bold text-[#00FF84] drop-shadow-[0_0_5px_#00FF84]">₦{balance.toLocaleString()}</span>
          </p>
        </motion.div>

        {/* Celebration Particles */}
        <motion.div
          className="absolute -top-10 left-1/2 transform -translate-x-1/2"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <div className="text-6xl">🎉</div>
        </motion.div>

        <motion.div
          className="absolute -top-10 left-1/4"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          <div className="text-4xl">✨</div>
        </motion.div>

        <motion.div
          className="absolute -top-10 right-1/4"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ delay: 1.6, duration: 0.6 }}
        >
          <div className="text-4xl">🎊</div>
        </motion.div>
      </div>
    </div>
  );
}