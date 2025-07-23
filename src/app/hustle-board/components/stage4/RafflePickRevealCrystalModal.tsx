"use client"

import { motion } from "framer-motion"
import CrystalIcon from "@/app/icons/CrystalIcon"
import { GlowyStrokeText,Dialog } from "@/components/core"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { HustleMatch } from "@/app/admin/misc/api"

interface CrystalModalProps {
  isOpen: boolean
  data: {
    hustle_match: HustleMatch
    number_revealed: number[]
  }
    setShowModal: Dispatch<SetStateAction<boolean>>
  
}

const CrystalModal = ({ isOpen, data ,setShowModal}: CrystalModalProps) => {
  const [animatedAmount, setAnimatedAmount] = useState(0)
  const [showSparkle, setShowSparkle] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Animate the gain amount
      const targetAmount = data.hustle_match.balance_details?.amount_gained
      if (typeof targetAmount !== "number" || isNaN(targetAmount)) return
      let current = 0
      const increment = targetAmount / 60
      const timer = setInterval(() => {
        current += increment
        if (current >= targetAmount) {
          setAnimatedAmount(targetAmount)
          clearInterval(timer)
          // Trigger sparkle effect
          setShowSparkle(true)
          setTimeout(() => setShowSparkle(false), 1000)
        } else {
          setAnimatedAmount(Math.floor(current))
        }
      }, 25)

      return () => clearInterval(timer)
    }
  }, [isOpen, data.hustle_match.balance_details?.amount_gained])

  if (!isOpen) return null

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
        {/* Icon with glow animation */}
        <motion.div animate={showSparkle ? { scale: [1, 1.2, 1], rotate: [0, 360] } : {}} transition={{ duration: 1 }}>
          <CrystalIcon />
        </motion.div>

        {/* Title with shimmer effect */}
        <motion.h2
          className="text-5xl font-outfit text-[#04DA6A] mt-5 font-black"
          animate={
            showSparkle
              ? {
                textShadow: ["0 0 10px #04DA6A", "0 0 30px #04DA6A", "0 0 10px #04DA6A"],
              }
              : {}
          }
        >
          Crystal Hustle Found!
        </motion.h2>

        {/* Ball Number */}
        <div className="text-2xl font-bold text-white/80">Ball #{data.hustle_match.number_pick}</div>

        {/* Description */}
        <p className="text-lg text-white max-w-xl font-montserrat leading-relaxed">
          {data.hustle_match.extra_ball_details?.effect_desc ||
            `You just earned a ₦${data.hustle_match.balance_details?.amount_gained.toLocaleString()} bonus on top of your winnings! Sometimes the hustle brings unexpected gold. Well played!`}
        </p>

        {/* Animated Amount Gain */}
        <motion.div
          className="px-8 py-4 bg-cyan-900/50 rounded-lg border border-cyan-400/30"
          animate={showSparkle ? { scale: [1, 1.15, 1] } : {}}
        >
          <GlowyStrokeText
            strokeWidth={3}
            strokeColor="#04DA6A"
            glowColor="#04DA6A"
            glowIntensity="high"
            textclassName="text-[3.5rem] font-black font-gilroyHeavy"
            fillColor="#fff"
          >
            +₦{animatedAmount?.toLocaleString()}
          </GlowyStrokeText>
        </motion.div>

        {/* Balance Update */}
        <div className="space-y-2">
          <div className="text-sm text-white/60">
            Previous Balance: ₦{data.hustle_match.balance_details?.previous_balance.toLocaleString()}
          </div>
          <div className="text-lg font-bold text-cyan-300">
            New Balance: ₦{data.hustle_match.balance_details?.current_balance.toLocaleString()}
          </div>
        </div>

        {/* Effect Type */}
        {data.hustle_match.extra_ball_details?.type && (
          <div className="text-sm text-cyan-300 bg-cyan-900/30 px-4 py-2 rounded-full">
            {data.hustle_match.extra_ball_details.type.replace(/_/g, " ")}
          </div>
        )}
      </div>
    </motion.div>
      
     </Dialog>
  )
}

export default CrystalModal
