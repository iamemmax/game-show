"use client"

import { motion } from "framer-motion"
import KillerIcon from "@/app/icons/KillerIcon"
import { GlowyStrokeText ,Dialog} from "@/components/core"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { HustleMatch } from "@/app/admin/misc/api"

interface KillerModalProps {
  isOpen: boolean
  data: {
    hustle_match: HustleMatch
    number_revealed: number[]
  }
  setShowModal: Dispatch<SetStateAction<boolean>>
}

const KillerHustlePulledModal = ({ isOpen, data,setShowModal }: KillerModalProps) => {
  const [animatedAmount, setAnimatedAmount] = useState(0)
  const [showGlitch, setShowGlitch] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Animate the loss amount
      const targetAmount = data.hustle_match.balance_details?.amount_lost
      if (typeof targetAmount !== "number" || isNaN(targetAmount)) return
      let current = 0
      const increment = targetAmount / 50
      const timer = setInterval(() => {
        current += increment
        if (current >= targetAmount) {
          setAnimatedAmount(targetAmount)
          clearInterval(timer)
          // Trigger glitch effect
          setShowGlitch(true)
          setTimeout(() => setShowGlitch(false), 500)
        } else {
          setAnimatedAmount(Math.floor(current))
        }
      }, 30)

      return () => clearInterval(timer)
    }
  }, [isOpen, data.hustle_match.balance_details?.amount_lost])

  if (!isOpen) return null

  return (

      <Dialog open={isOpen} onOpenChange={setShowModal}>

    <motion.div
      initial={{ scale: 0, opacity: 0, rotate: -180 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      exit={{ scale: 0, opacity: 0, rotate: 180 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="bg-gradient-to-br from-red-900/90 to-black/90 backdrop-blur-lg rounded-2xl p-8 border-2 border-red-500/50 shadow-2xl max-w-2xl"
    >
      <div className="flex flex-col items-center text-center text-white space-y-6">
        {/* Icon with shake animation */}
        <motion.div animate={showGlitch ? { x: [-5, 5, -5, 5, 0] } : {}} transition={{ duration: 0.5 }}>
          <KillerIcon />
        </motion.div>

        {/* Title with glitch effect */}
        <motion.h2
          className={`text-5xl font-outfit text-[#EB001B] mt-5 font-black ${showGlitch ? "animate-pulse" : ""}`}
          animate={showGlitch ? { textShadow: ["0 0 10px #EB001B", "0 0 20px #EB001B", "0 0 10px #EB001B"] } : {}}
        >
          Killer Hustle Pulled!
        </motion.h2>

        {/* Ball Number */}
        <div className="text-2xl font-bold text-white/80">Ball #{data.hustle_match.number_pick}</div>

        {/* Description */}
        <p className="text-lg text-white max-w-xl font-montserrat leading-relaxed">
          {data.hustle_match.extra_ball_details?.effect_desc ||
            "The hustle turned deadly! You've hit a killer ball that reduces your balance. Sometimes the risk doesn't pay off."}
        </p>

        {/* Animated Amount Loss */}
        <motion.div
          className="px-8 py-4 bg-red-900/50 rounded-lg border border-red-500/30"
          animate={showGlitch ? { scale: [1, 1.1, 1] } : {}}
        >
          <GlowyStrokeText
            strokeWidth={3}
            strokeColor="#EB001B"
            glowColor="#EB001B"
            glowIntensity="high"
            textclassName="text-[3.5rem] font-black font-gilroyHeavy"
            fillColor="#fff"
          >
            -₦{animatedAmount.toLocaleString()}
          </GlowyStrokeText>
        </motion.div>

        {/* Balance Update */}
        <div className="space-y-2">
          <div className="text-sm text-white/60">
            Previous Balance: ₦{data.hustle_match.balance_details?.previous_balance.toLocaleString()}
          </div>
          <div className="text-lg font-bold text-white">
            New Balance: ₦{data.hustle_match.balance_details?.current_balance.toLocaleString()}
          </div>
        </div>

        {/* Effect Type */}
        {data.hustle_match.extra_ball_details?.type && (
          <div className="text-sm text-red-300 bg-red-900/30 px-4 py-2 rounded-full">
            {data.hustle_match.extra_ball_details.type.replace(/_/g, " ")}
          </div>
        )}
      </div>
    </motion.div>
      </Dialog>
  )
}

export default KillerHustlePulledModal
