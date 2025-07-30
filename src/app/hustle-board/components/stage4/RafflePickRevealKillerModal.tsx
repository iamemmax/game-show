"use client";

import { motion } from "framer-motion";
import KillerIcon from "@/app/icons/KillerIcon";
import { GlowyStrokeText, Dialog } from "@/components/core";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { HustleMatch } from "@/app/admin/misc/api";
import { Ball } from "@/app/admin/misc/components/RaffleBall";
import { cn } from "@/utils/classNames";
import NumberFlow from "@number-flow/react";

interface KillerModalProps {
  isOpen: boolean;
  data: {
    hustle_match: HustleMatch;
    number_revealed: number[];
  };
  setShowModal: Dispatch<SetStateAction<boolean>>;
}

const KillerHustlePulledModal = ({
  isOpen,
  data,
  setShowModal,
}: KillerModalProps) => {
  const [showGlitch, setShowGlitch] = useState(false);

  const [amountToDisplay, setAmountToDisplay] = useState(
    data.hustle_match.balance_details?.previous_balance
  );
  const [isAnimatingAmount, setIsAnimatingAmount] = useState(false);
  useEffect(() => {
    setIsAnimatingAmount(true);
    setAmountToDisplay(data.hustle_match.balance_details?.current_balance);
    setTimeout(() => {
      setIsAnimatingAmount(false);
    }, 1000);
  }, []);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setShowModal}>
      <motion.div
        initial={{ scale: 0, opacity: 0, rotate: -50 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0, opacity: 0, rotate: 50 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-gradient-to-br from-red-900/90 to-black/90 backdrop-blur-lg rounded-2xl p-8 border-2 border-red-500/50 shadow-2xl max-w-2xl"
      >
        <div className="flex flex-col items-center text-center text-white space-y-6">
          <Ball
            number={data.hustle_match.number_pick}
            variant={"mismatched"}
            size="md"
            className={cn("transition-all duration-300 w-32 h-32")}
            textClassName="!font-bold !text-4xl text-white"
          />
          <motion.h2
            className={`text-8xl font-anton text-[#EB001B] mt-5 font-black ${
              showGlitch ? "animate-pulse" : ""
            }`}
            animate={
              showGlitch
                ? {
                    textShadow: [
                      "0 0 5px #EB001B",
                      "0 0 8px #EB001B",
                      "0 0 7px #EB001B",
                    ],
                  }
                : {}
            }
          >
            Crusher Ball!(-
            {data.hustle_match.extra_ball_details?.effect_action == "MINUS_100K"
              ? "-100k"
              : data.hustle_match.extra_ball_details?.effect_action == "MINUS_50K"
              ? "-50k"
              : "-20k"}
            )
          </motion.h2>

          {/* Description */}
          <p className="text-lg text-white max-w-xl font-montserrat leading-relaxed">
            {data.hustle_match.extra_ball_effect_desc ||
              "The hustle turned deadly!. Sometimes the risk doesn't pay off."}
          </p>

          <motion.div className="px-8 py-4 bg-red-900/50 rounded-lg border border-red-500/30">
            <GlowyStrokeText
              strokeWidth={3}
              strokeColor={isAnimatingAmount ? "#EB001B" : "#de7272ff"}
              glowColor={isAnimatingAmount ? "#EB001B" : "#de7272ff"}
              glowIntensity="medium"
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

export default KillerHustlePulledModal;
