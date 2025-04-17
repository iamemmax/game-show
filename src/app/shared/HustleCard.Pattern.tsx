import * as React from "react";
import { SVGProps } from "react";
import { PATTERN_GREEN_BLACK, PATTERN_ORANGE_BLACK, PATTERN_PURPLE_BLACK, PATTERN_PURPLE_GREY, PATTERN_PURPLE_WHITE } from "./HustleCard.PatternTypes";


type HustleCardPatternProps = {
    width?: number,
    height?: number,
    pattern?: string
    // pattern: "PATTERN_PURPLE_WHITE" | "PATTERN_PURPLE_BLACK" | "PATTERN_PURPLE_GREY" | "PATTERN_ORANGE_BLACK" | "PATTERN_GREEN_BLACK"
}



const HustleCardPattern = ({ pattern, ...props }: SVGProps<SVGSVGElement> & HustleCardPatternProps) => {
    
    // const memoizedPattern = React.useMemo(() => {
    //     switch (pattern) {
    //         case "PATTERN_PURPLE_WHITE":
    //             return PATTERN_PURPLE_WHITE;
    //         case "PATTERN_PURPLE_BLACK":
    //             return PATTERN_PURPLE_BLACK;
    //         case "PATTERN_PURPLE_GREY":
    //             return PATTERN_PURPLE_GREY;
    //         case "PATTERN_ORANGE_BLACK":
    //             return PATTERN_ORANGE_BLACK;
    //         case "PATTERN_GREEN_BLACK":
    //             return PATTERN_GREEN_BLACK;
    //         default:
    //             return PATTERN_PURPLE_WHITE;
    //     }
    // }, [pattern]);

    // const getPattern = React.useCallback(() => memoizedPattern, [memoizedPattern]);
  
    return (
        <svg
            viewBox="0 0 121 77"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            {...props}
        >
            <rect width={121} height={77} rx={7.3522} fill="url(#pattern0_402_1074)" />
            <defs>
                <pattern
                    id="pattern0_402_1074"
                    patternContentUnits="objectBoundingBox"
                    width={1}
                    height={1}
                >
                    <use
                        xlinkHref="#image0_402_1074"
                        transform="matrix(0.00162338 0 0 0.00255102 0 -0.563776)"
                    />
                </pattern>
                <image
                    id="image0_402_1074"
                    width={616}
                    height={834}
                    preserveAspectRatio="none"
                    xlinkHref={pattern}
                />
            </defs>
        </svg>
    )
};
export default HustleCardPattern;
