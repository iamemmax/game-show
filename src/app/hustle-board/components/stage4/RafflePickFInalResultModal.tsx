"use client"

import { motion } from "framer-motion"
import CrystalIcon from "@/app/icons/CrystalIcon"
import { GlowyStrokeText, Dialog } from "@/components/core"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Contestant, HustleMatch, MatchedHustle } from "@/app/admin/misc/api"
import { Ball } from "@/app/admin/misc/components/RaffleBall";
import { cn } from "@/utils/classNames"
import Image from "next/image"
import { convertNumberToNaira } from "@/utils/currency"


interface RafflePickFInalResultModalProps {
    isOpen: boolean
    data: MatchedHustle[]
    setShowModal: Dispatch<SetStateAction<MatchedHustle[] | null>>

    contestant: Contestant

}

const RafflePickFInalResultModal = ({ isOpen, data, setShowModal, contestant }: RafflePickFInalResultModalProps) => {

    const [matchCount, setMatchCount] = useState(0)
    const [currentResult, setCurrentResult] = useState<HustleMatch | null>(null)

    useEffect(() => {
        if (isOpen && data.length > 0) {
            setMatchCount(data.filter((match) => match.is_match).length)
            setCurrentResult(data[0])
        }
    }, [isOpen, data])

    if (!isOpen) return null



    // Check if this is a golden card (match count is 5)
    const isGoldenCard = matchCount === 2

    return (
        <article className={cn(
            "relative flex flex-col items-center justify-center max-w-2xl w-full px-4 rounded-2xl h-[70vh]",
            isGoldenCard 
                ? "bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 shadow-2xl shadow-yellow-500/50" 
                : "bg-[#1A0B25]"
        )}>
            {/* Golden card subtle effect */}
            {isGoldenCard && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
            )}
            
            <article className={cn(
                "relative flex flex-col items-center justify-center w-[300px] h-[400px]",
                isGoldenCard && "ring-4 ring-yellow-600/30 rounded-xl"
            )}>
                <Image
                    src={contestant.contestant_photo_url || "/images/userImage.png"}
                    alt="Raffle Ball"
                    fill
                    objectFit="cover"
                    className="rounded-xl"
                />
            </article>
            
            <h2 className={cn(
                "text-5xl font-anton",
                isGoldenCard 
                    ? "text-black" 
                    : "text-yellow-500"
            )}
              style={!isGoldenCard ? {
                    textShadow: "0 0 2px #FFD700, 0 0 12px #FFA500, 0 0 2px #FFD700"
                } : {}}
            >
                {contestant?.name || "Contestant"}'s Final Result
            </h2>
            
            <h5
                className={cn(
                    "text-8xl font-anton",
                    isGoldenCard 
                        ? "text-black" 
                        : "bg-gradient-to-b from-yellow-400 to-orange-500 bg-clip-text text-transparent"
                )}
                style={!isGoldenCard ? {
                    textShadow: "0 0 8px #FFD700, 0 0 18px #FFA500, 0 0 3px #FFD700"
                } : {}}
            >
                Matched: {matchCount}/5
            </h5>

            <p
            className={cn(
                "text-4xl mt-8 font-anton border-2 rounded-lg px-4 py-2",
                isGoldenCard 
                    ? "text-black border-black bg-yellow-200/50" 
                    : "text-white border-green-500 bg-green-950"
            )}
            >
               Final Balance:  
               {
                convertNumberToNaira(Number(contestant.actual_balance) || 0)
               }
            </p>
        </article>
    )
}

export default RafflePickFInalResultModal