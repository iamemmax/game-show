"use client";

import { motion } from "framer-motion";
import CrystalIcon from "@/app/icons/CrystalIcon";
import { GlowyStrokeText, Dialog } from "@/components/core";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { HustleMatch } from "@/app/admin/misc/api";
import { Ball } from "@/app/admin/misc/components/RaffleBall";
import { cn } from "@/utils/classNames";
import NumberFlow from "@number-flow/react";

interface CrystalModalProps {
  isOpen: boolean;
  data: {
    hustle_match: HustleMatch;
    number_revealed: number[];
  };
  setShowModal: Dispatch<SetStateAction<boolean>>;
}

const CrystalModal = ({ isOpen, data, setShowModal }: CrystalModalProps) => {
  const [showSparkle, setShowSparkle] = useState(false);

  const [amountToDisplay, setAmountToDisplay] = useState(
    data.hustle_match.balance_details?.previous_balance
  );
  const [isAnimatingAmount, setIsAnimatingAmount] = useState(false);
  useEffect(() => {
    setIsAnimatingAmount(true);
    setTimeout(() => {
      setAmountToDisplay(data.hustle_match.balance_details?.current_balance);
      setIsAnimatingAmount(false);
    }, 1000);
  }, []);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setShowModal}>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-gradient-to-br from-cyan-900/95 to-blue-900/95 backdrop-blur-lg rounded-2xl p-8 border-2 border-cyan-400/50 shadow-2xl max-w-2xl mx-auto relative overflow-hidden"
      >
        {/* Sparkle particles */}
        {showSparkle && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-cyan-400 rounded-full"
                initial={{
                  x: Math.random() * 400,
                  y: Math.random() * 400,
                  scale: 0,
                }}
                animate={{
                  scale: [0, 1, 0],
                  rotate: 360,
                  x: Math.random() * 400,
                  y: Math.random() * 400,
                }}
                transition={{ duration: 1, delay: Math.random() * 0.5 }}
              />
            ))}
          </div>
        )}

        <div className="flex flex-col items-center text-center text-white space-y-6 relative z-10">
          <Ball
            number={data.hustle_match.number_pick}
            variant={"matched"}
            size="md"
            className={cn("transition-all duration-300 w-32 h-32")}
            textClassName="!font-bold !text-4xl text-black"
          />
          <motion.h2
            className="text-8xl font-anton text-[#04DA6A] mt-5 font-black"
            animate={
              showSparkle
                ? {
                    textShadow: [
                      "0 0 5px #04DA6A",
                      "0 0 10px #04DA6A",
                      "0 0 5px #04DA6A",
                    ],
                  }
                : {}
            }
          >
            Bonus Ball!(
            {data.hustle_match.extra_ball_details?.effect_action == "PLUS_100K"
              ? "+100k"
              : data.hustle_match.extra_ball_details?.effect_action == "PLUS_50K"
              ? "+50k"
              : "20k"}
            )
          </motion.h2>

          {/* Description */}
          <p className="text-lg text-white max-w-xl font-montserrat leading-relaxed">
            {data.hustle_match.extra_ball_effect_desc ||
              `You just earned a ₦${data.hustle_match.balance_details?.amount_gained.toLocaleString()} bonus on top of your winnings! Sometimes the hustle brings unexpected gold. Well played!`}
          </p>
          <motion.div className="px-8 py-4 bg-cyan-900/50 rounded-lg border border-cyan-400/30">
            <GlowyStrokeText
              strokeWidth={3}
              strokeColor={isAnimatingAmount ? "#04DA6A" : "#3ddd8aff"}
              glowColor={isAnimatingAmount ? "#04DA6A" : "#76d5a4ff"}
              glowIntensity="high"
              textclassName="text-[3.25rem] font-black font-gilroyHeavy"
              fillColor="#fff"
            >
              <NumberFlow
                value={amountToDisplay ?? 0}
                prefix="₦"
                transformTiming={{ duration: 1200, easing: "linear" }}
              />
            </GlowyStrokeText>
          </motion.div>
        </div>
      </motion.div>
    </Dialog>
  );
};

export default CrystalModal;
