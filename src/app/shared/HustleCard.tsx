import * as React from "react";
import HustleCardPattern from "./HustleCard.Pattern";
import { cn } from "@/utils/classNames";


type HustleCardPatternProps = {
    className?: string
    title?: string
    number?: string | number
    amount?: string | number
    pattern: string
    svgProps?: React.SVGProps<SVGSVGElement>
}



const HustleCard = ({
    title = "Card",
    number = "00",
    amount = "00.00",
    className,
    pattern,
    svgProps,
    ...props
}: HustleCardPatternProps) => (
    <article className={cn("flex flex-col border-[3px] border-[#7E3CE0] rounded-3xl max-w-[250px] aspect-video", className)}>
        <header
            className="text-3xl text-white font-bold p-2 text-center "
        >
            {title}
        </header>
        <div className="mt-auto relative">

            <div className="absolute top-0 size-full left-0 right-0 bottom-0 flex flex-col items-center justify-center">
                <h5
                    style={{ WebkitTextStroke: "7px black !important;" }}
                    className="text-8xl text-white font-black "
                >
                    {number}
                </h5>
                <p
                    className="text-4xl text-white font-black "
                    style={{ WebkitTextStroke: "2px black !important;" }}
                >
                    {amount}
                </p>
            </div>

            <svg
                viewBox="0 0 121 77"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                {...svgProps}
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
        </div>
    </article>
);
export default HustleCard;
