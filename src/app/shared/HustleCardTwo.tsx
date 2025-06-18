import * as React from "react";
import { cn } from "@/utils/classNames";
import { GlowyStrokeText } from "@/components/core";

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
  patternWidth?: number;
  patternHeight?: number;
  titleContainer?: React.ReactNode;
};

const HustleCardTwo = ({
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
  patternWidth = 300,
  patternHeight = 169,
  titleContainer,
  ...props
}: HustleCardPatternProps) => {
  const patternId = `pattern-${id}`;

  return (
    <article
      className={cn(
        "relative group flex flex-col rounded-2xl w-full h-full overflow-hidden",
        className
      )}
    >
      {/* Background Image - using CSS background for better aspect ratio handling */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${pattern})` }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all duration-300 z-10"></div>

      {/* Content layer (above pattern and overlay) */}
      <div className="absolute inset-0 flex w-full flex-col justify-between z-20 p-3">
        {/* Title at top */}
        <div
          className={cn(
            "text-3xl text-white w-full font-bold  flex justify-center items-center text-center  line-clamp-2",
            titleContainer
          )}
        >
          {/* <h2  className="w-full font-bold font-gilroyHeavy "  style={{ WebkitTextStroke: "1.2px black" }}>{title}</h2> */}

          <GlowyStrokeText
            strokeWidth={3}
            strokeColor="#000"
            glowColor="#13051E"
            glowIntensity="none"
            textclassName={cn(
              `text-[1.8rem]  font-extrabold font-gilroyHeavy [@media(min-width:2000px)]:text-[3rem]`,
              titleClassName
            )}
            fillColor="#fff"
          >
            {title}
          </GlowyStrokeText>
        </div>

        {/* Number and Amount centered */}
        <div className="flex flex-col items-center justify-center flex-1 -mt-2">
          {/* <h5
                        style={{ WebkitTextStroke: "4px black" }}
                        className={cn(numberSize, "text-white font-bold font-gilroyHeavy text-center leading-none", numberClassName)}
                    >
                        {number}
                    </h5> */}

          <GlowyStrokeText
            strokeWidth={4}
            strokeColor="#000"
            glowColor="#13051E"
            glowIntensity="low"
            textclassName={cn(
              "text-[1rem] font-extrabold font-verdana [@media(min-width:2000px)]:text-[3rem] [@media(min-width:2100px)]:text-[15rem]",
              numberClassName
            )}
            fillColor="#fff"
            //   className={cn}
          >
            {number}
          </GlowyStrokeText>

          <GlowyStrokeText
            strokeWidth={4}
            strokeColor="#000"
            glowColor="#13051E"
            glowIntensity="low"
            textclassName={cn(
              "text-[1rem] font-extrabold font-gilroyHeavy [@media(min-width:2000px)]:text-[3rem] [@media(min-width:2100px)]:text-[15rem]",
              amountClassName
            )}
            fillColor="#fff"
            //   className={cn}
          >
            {amount}
          </GlowyStrokeText>
        </div>

        {/* Empty space at bottom for balance */}
        <div className="h-4"></div>
      </div>
    </article>
  );
};

export default HustleCardTwo;
