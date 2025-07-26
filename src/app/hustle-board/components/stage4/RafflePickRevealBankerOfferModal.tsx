"use client"

import { motion } from "framer-motion"
import KillerIcon from "@/app/icons/KillerIcon"
import { Dialog } from "@/components/core"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { cn } from "@/utils/classNames"
import NumberFlow from "@number-flow/react"

interface KillerModalProps {
    isOpen: boolean
    offerAmount: number
    setShowModal: Dispatch<SetStateAction<boolean>>
}

const RafflePickRevealBankerOfferModal = ({ isOpen, offerAmount, setShowModal }: KillerModalProps) => {
    const [animatedAmount, setAnimatedAmount] = useState(0)
    const [showGlitch, setShowGlitch] = useState(false)

    useEffect(() => {
        if (isOpen) {
            // // Animate the loss amount
            // const targetAmount = offerAmount
            // if (typeof targetAmount !== "number" || isNaN(targetAmount)) return
            // let current = 0
            // const increment = targetAmount / 50
            // const timer = setInterval(() => {
            //     current += increment
            //     if (current >= targetAmount) {
            //         setAnimatedAmount(targetAmount)
            //         clearInterval(timer)
            //         // Trigger glitch effect
            //         setShowGlitch(true)
            //         setTimeout(() => setShowGlitch(false), 500)
            //     } else {
            //         setAnimatedAmount(Math.floor(current))
            //     }
            // }, 30)

            // return () => clearInterval(timer)

            setAnimatedAmount(offerAmount)
        }
    }, [isOpen, offerAmount])

    if (!isOpen) return null

    return (

        <Dialog open={isOpen} onOpenChange={setShowModal}>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm font-montserrat">
                <article
                    className={cn(
                        "relative flex flex-col items-center justify-center max-w-2xl w-full px-4 rounded-2xl h-[70vh]",
                    )}
                >
                   
                    <p className="text-black px-16 py-5 bg-white text-4xl text-center font-black">
                        OFFER :
                    </p>

                    <NumberFlow
                        value={animatedAmount}
                        format={{ style: 'currency', currency: 'NGN', }}
                        className="text-9xl font-anton text-green-500"

                    />

                </article>
            </div>
        </Dialog>
    )
}

export default RafflePickRevealBankerOfferModal
