import { MatchedHustlesResponse } from '@/app/admin/misc/api'
import NumberCardContainer from '@/app/shared/NumberContainer'
import React from 'react'


interface Props {
    mynumbers: number[] | undefined
    revealedNumbers: number[]
    getNumberMatchStatus: (num: number | null, allRevealed: boolean) => {
        matched: boolean;
        showRed: boolean;
    }
    matchedHustlesData: MatchedHustlesResponse | null | undefined
    

}
const RaffleRevealModalMatchSection = ({ mynumbers, revealedNumbers, getNumberMatchStatus, matchedHustlesData }: Props


) => {
    return (
        <div className="flex flex-col gap-6 mt-4">
            <div className="flex items-center justify-center flex-col">
                <h3 className="text-white text-2xl font-gilroyMedium mb-2">
                    Initial picks
                </h3>
                <div className="flex border-[2px] divide-x shadow-[0_4px_20px_#8700C7] divide-[#4B1874] rounded-[20px] py-[5.35px] px-3 border-[#CE64FF]">
                    {mynumbers?.map((num) => {
                        const { matched, showRed } = getNumberMatchStatus(
                            num,
                            revealedNumbers?.length === 5
                        );
                        return (
                            <div key={num} className="px-4">
                                <NumberCardContainer
                                    text={String(num)}
                                    textColor={
                                        matched ? "#fff" : showRed ? "#fff" : "#F2C94C"
                                    }
                                    active={matched || showRed}
                                    width={75}
                                    height={80}
                                    className="cursor-pointer transition-transform hover:scale-105"
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <div className="flex justify-center items-center flex-col">
                <h3 className="text-white text-xl font-gilroyMedium  mb-2">
                    Match Picks
                </h3>
                <div className="flex border-[2px] divide-x shadow-[0_4px_20px_#8700C7] divide-[#4B1874] rounded-[20px] py-[5.35px] px-3 border-[#CE64FF]">
                    {matchedHustlesData?.data?.map((x, idx: number) => {
                        
                        const isRevealed = x !== null;

                        const isMatched =
                            isRevealed && mynumbers?.includes(x?.number_pick);
                        return (
                            <div
                                key={idx}
                                className="px-4 flex items-center flex-col justify-center"
                            >
                                <NumberCardContainer
                                    text={isRevealed ? String(x?.number_pick) : ""}
                                    textColor="#fff"
                                    backgroundColor={
                                        isMatched
                                            ? "#04DA6A"
                                            : !isMatched
                                                ? "#EB001B"
                                                : ""
                                    }
                                    width={75}
                                    height={80}
                                    active={isMatched || !isMatched}
                                    className="cursor-pointer font-verdana transition-transform hover:scale-105"
                                // status={status}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}

export default RaffleRevealModalMatchSection