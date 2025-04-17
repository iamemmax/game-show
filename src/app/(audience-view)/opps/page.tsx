import HustleCard from '@/app/shared/HustleCard'
import { PATTERN_PURPLE_BLACK, PATTERN_PURPLE_GREY, PATTERN_PURPLE_WHITE } from '@/app/shared/HustleCard.PatternTypes'
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
            
            {/* <HustleCard
                title='Hairdressing'
                number={"25"}
                amount={"$250"}
                pattern={PATTERN_PURPLE_GREY}

            /> */}
            {/* <HustleCard
                title='Hairdressing'
                number={"25"}
                amount={"$250"}
                pattern={PATTERN_PURPLE_GREY}

            /> */}
            <HustleCard
                title='Hairdressing'
                number={"25"}
                amount={"$250"}
                pattern={PATTERN_PURPLE_BLACK}

            />
        </div>
    )
}

export default page