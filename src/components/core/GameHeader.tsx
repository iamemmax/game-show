import { cn } from "@/utils/classNames";
import React from "react";
import { GlowyStrokeText } from "./GlowyText";

interface GameHeaderProps {
    text: string;
    className?: string;
    padding?: string;
}

export function GameHeader({
    className,
    text,
    padding = "px-6 py-4",
}: GameHeaderProps) {

    return (
        <div className={cn("relative", className)}>
            <svg
                width={448}
                height={73}
                viewBox="0 0 448 73"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            // {...props}
            >
                <path
                    d="M20.7646 3H427.676C439.466 3.00012 447.617 14.6813 443.698 25.6826L443.503 26.2061L430.563 59.2061C428.01 65.717 421.73 70 414.736 70H33.0225C26.1388 69.9999 19.959 65.8522 17.3301 59.5371L17.0869 58.9199L4.82812 25.9199C0.702817 14.8143 8.91756 3 20.7646 3Z"
                    fill="#13051E"
                    stroke="url(#paint0_linear_406_2025)"
                    strokeWidth={6}
                />
                <defs>
                    <linearGradient
                        id="paint0_linear_406_2025"
                        x1={0.104577}
                        y1={73}
                        x2={357.333}
                        y2={-1.8402}
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop stopColor="#FE04FD" />
                        <stop offset={1} stopColor="#E97EFF" />
                    </linearGradient>
                </defs>
            </svg>


            <div className={cn("absolute z-10 inset-0 flex items-center justify-center", padding)}>
                <GlowyStrokeText
                    // glowColor="#f542f5"
                    // strokeColor="#f542f5"
                    className="text-center"
                    glowIntensity="high"
                    strokeWidth={5}
                >
                    {text}
                </GlowyStrokeText>
            </div>
        </div>
    );
}


