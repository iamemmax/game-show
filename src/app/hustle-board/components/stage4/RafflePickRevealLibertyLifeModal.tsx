"use client"

import { motion } from "framer-motion"
import { GlowyStrokeText,Dialog } from "@/components/core"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { HustleMatch } from "@/app/admin/misc/api"

interface LibertyLifeModalProps {
    isOpen: boolean
    data: {
        hustle_match: HustleMatch
        number_revealed: number[]
    };
        setShowModal: Dispatch<SetStateAction<boolean>>
    
}

const LibertyLifeModal = ({ isOpen, data,setShowModal }: LibertyLifeModalProps) => {
    const [showPulse, setShowPulse] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                setShowPulse(true)
                setTimeout(() => setShowPulse(false), 2000)
            }, 500)
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
          <Dialog open={isOpen} onOpenChange={setShowModal}>

        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-gradient-to-br from-blue-900/95 to-indigo-900/95 backdrop-blur-lg rounded-2xl p-8 border-2 border-blue-400/50 shadow-2xl max-w-2xl mx-auto relative"
        >
            <div className="flex flex-col items-center text-center text-white space-y-6">
                {/* Health Icon */}
                <motion.div
                    className="text-8xl"
                    animate={showPulse ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 1, repeat: 2 }}
                >
                    🏥
                </motion.div>

                {/* Title */}
                <motion.h2
                    className="text-5xl font-outfit text-[#4A90E2] mt-5 font-black"
                    animate={
                        showPulse
                            ? {
                                textShadow: ["0 0 10px #4A90E2", "0 0 25px #4A90E2", "0 0 10px #4A90E2"],
                            }
                            : {}
                    }
                >
                    Liberty Life Ball!
                </motion.h2>

                {/* Ball Number */}
                <div className="text-2xl font-bold text-white/80">Ball #{data.hustle_match.number_pick}</div>

                {/* Description */}
                <p className="text-lg text-white max-w-xl font-montserrat leading-relaxed">
                    {data.hustle_match.extra_ball_details?.effect_desc ||
                        "Congratulations! You've won a Liberty Life Ivy Health Insurance Plan. Your health and future are now secured!"}
                </p>

                {/* Prize Display */}
                <motion.div
                    className="px-8 py-6 bg-blue-900/50 rounded-lg border border-blue-400/30"
                    animate={showPulse ? { scale: [1, 1.1, 1] } : {}}
                >
                    <GlowyStrokeText
                        strokeWidth={2}
                        strokeColor="#4A90E2"
                        glowColor="#4A90E2"
                        glowIntensity="medium"
                        textclassName="text-[2.5rem] font-black font-gilroyHeavy"
                        fillColor="#fff"
                    >
                        Health Insurance Plan
                    </GlowyStrokeText>
                    <div className="text-blue-300 text-lg mt-2">Liberty Life Ivy Plan</div>
                </motion.div>

                {/* Balance (unchanged) */}
                <div className="text-lg font-bold text-white">
                    Balance Unchanged: ₦{data.hustle_match.balance_details?.current_balance.toLocaleString()}
                </div>

                {/* Effect Type */}
                {data.hustle_match.extra_ball_details?.type && (
                    <div className="text-sm text-blue-300 bg-blue-900/30 px-4 py-2 rounded-full">
                        {data.hustle_match.extra_ball_details.type.replace(/_/g, " ")}
                    </div>
                )}

                {/* Additional Benefits */}
                <div className="bg-blue-900/30 rounded-lg p-4 text-sm text-blue-200">
                    <div className="font-semibold mb-2">Plan Benefits:</div>
                    <ul className="text-left space-y-1">
                        <li>• Comprehensive health coverage</li>
                        <li>• Emergency medical services</li>
                        <li>• Preventive care included</li>
                        <li>• Family coverage options</li>
                    </ul>
                </div>
            </div>
        </motion.div>
          </Dialog>
    )
}

export default LibertyLifeModal
