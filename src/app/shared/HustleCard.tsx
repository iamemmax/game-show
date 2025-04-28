import * as React from "react";
import { cn } from "@/utils/classNames";

type HustleCardPatternProps = {
    className?: string;
    titleClassName?: string;
    numberClassName?: string;
    amountClassName?: string;
    title?: string;
    number?: string | number;
    amount?: string | number;
    pattern: string;
    numberSize?: string;
    amountSize?: string;
    svgProps?: React.SVGProps<SVGSVGElement>;
    id?: string;
}

const HustleCard = ({
    title = "Card",
    number = "00",
    amount = "00.00",
    className,
    titleClassName,
    numberClassName,
    amountClassName,
    pattern,
    amountSize = "text-4xl",
    numberSize = "text-8xl",
    svgProps,
    id = `hustlecard-${Math.random().toString(36).substring(2, 9)}`,
    ...props
}: HustleCardPatternProps) => {
    const patternId = `pattern-${id}`;
    const imageId = `image-${id}`;
    
    return (
        <article className={cn("relative group flex flex-col border-[3px] border-[#7E3CE0] rounded-2xl max-w-[250px] 2xl:max-w-[18.75rem] aspect-video", className)}>
            <header
                className={cn("text-3xl text-white font-bold p-2 text-center font-verdana", titleClassName)}
                style={{ WebkitTextStroke: "1.2px black" }}
            >
                {title}
            </header>
            <div className="mt-auto relative">
                {/* Content layer (above pattern) */}
                <div className="absolute max-2xl:top-2 size-full left-0 right-0 bottom-0 flex flex-col items-center justify-center z-20">
                    <h5
                        style={{ WebkitTextStroke: "3px black" }}
                        className={cn(numberSize, "text-white font-bold font-gilroyHeavy", numberClassName)}
                    >
                        {number}
                    </h5>
                    <p
                        className={cn(amountSize, "text-white mt-4 2xl:mt-7 font-bold font-gilroyHeavy", amountClassName)}
                        style={{ WebkitTextStroke: "1.7px black" }}
                    >
                        {amount}
                    </p>
                </div>
                
                {/* Pattern with overlay */}
                <div className="relative">
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all duration-300 rounded-[7.3522px] z-10"></div>
                    
                    {/* Pattern SVG */}
                    <svg
                        viewBox="0 0 121 77"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlnsXlink="http://www.w3.org/1999/xlink"
                        {...svgProps}
                    >
                        <rect width={121} height={77} rx={7.3522}  fill={`url(#${patternId})`} />
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
            </div>
        </article>
    );
};

export default HustleCard;
