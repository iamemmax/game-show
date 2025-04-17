import * as React from "react";
import HustleCardPattern from "./HustleCard.Pattern";
import { cn } from "@/utils/classNames";


type HustleCardPatternProps = {
    className?: string;
    title?: string;
    number?: string | number;
    amount?: string | number;
    pattern: string;
    svgProps?: React.SVGProps<SVGSVGElement>;
    id?: string; // Added unique ID prop
}

const HustleCard = ({
    title = "Card",
    number = "00",
    amount = "00.00",
    className,
    pattern,
    svgProps,
    id = `hustlecard-${Math.random().toString(36).substring(2, 9)}`, // Generate a unique ID if not provided
    ...props
}: HustleCardPatternProps) => {
    const patternId = `pattern-${id}`;
    const imageId = `image-${id}`;
    
    return (
        <article className={cn("flex flex-col border-[3px] border-[#7E3CE0] rounded-3xl max-w-[250px] aspect-video", className)}>
            <header
                className="text-3xl text-white font-bold p-2 text-center"
            >
                {title}
            </header>
            <div className="mt-auto relative">
                <div className="absolute top-0 size-full left-0 right-0 bottom-0 flex flex-col items-center justify-center">
                    <h5
                        style={{ WebkitTextStroke: "7px black" }}
                        className="text-8xl text-white font-black"
                    >
                        {number}
                    </h5>
                    <p
                        className="text-4xl text-white font-black"
                        style={{ WebkitTextStroke: "2px black" }}
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
                    <rect width={121} height={77} rx={7.3522} fill={`url(#${patternId})`} />
                    <defs>
                        <pattern
                            id={patternId}
                            patternContentUnits="objectBoundingBox"
                            width={1}
                            height={1}
                        >
                            <use
                                xlinkHref={`#${imageId}`}
                                transform="matrix(0.00162338 0 0 0.00255102 0 -0.563776)"
                            />
                        </pattern>
                        <image
                            id={imageId}
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
};

export default HustleCard;