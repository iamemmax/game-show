import HustleCard from '@/app/shared/HustleCard'
import { PATTERN_GREEN_BLACK, PATTERN_ORANGE_BLACK, PATTERN_PURPLE_BLACK, PATTERN_PURPLE_GREY, PATTERN_PURPLE_WHITE } from '@/app/shared/HustleCard.PatternTypes'
import React from 'react'

const page = () => {
    return (
        <div>

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