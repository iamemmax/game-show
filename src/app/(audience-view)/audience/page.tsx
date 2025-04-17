import HustleCard from '@/app/shared/HustleCard'
import { PATTERN_PURPLE_BLACK, PATTERN_PURPLE_GREY, PATTERN_PURPLE_WHITE,PATTERN_ORANGE_BLACK } from '@/app/shared/HustleCard.PatternTypes'
import React from 'react'

const page = () => {
    return (
        <div>

            {/* <HustleCard
                title='Hairdressing'
                number={"25"}
                amount={"$250"}
                pattern="PATTERN_PURPLE_BLACK"

            />
            <HustleCard
                title='Hairdressing'
                number={"25"}
                amount={"$6000"}
                pattern="PATTERN_PURPLE_WHITE"

            /> */}
            
            <HustleCard
                id="gaming-card"
                title="Gaming"
                number={"25"}
                amount={"$250"}
                pattern={PATTERN_PURPLE_WHITE}
            />
            <HustleCard
                id="furniture-card"
                title="Furniture"
                number={"25"}
                amount={"$450"}
                pattern={PATTERN_PURPLE_GREY}
            />
            <HustleCard
                id="welder-card"
                title="Welder"
                number={"25"}
                amount={"$750"}
                pattern={PATTERN_ORANGE_BLACK}
            />
        </div>
    )
}

export default page