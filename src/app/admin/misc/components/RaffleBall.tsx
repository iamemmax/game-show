"use client"
import { cn } from "@/utils/classNames"
import type { SVGProps } from "react"

interface BallProps extends SVGProps<SVGSVGElement> {
  number?: number
  variant?: "regular" | "matched" | "mismatched" | "selected"
  size?: "sm" | "md" | "lg"
  onClick?: () => void
  textClassName?: string
}

export function Ball({
  number,
  variant = "regular",
  size = "md",
  onClick,
  className,
  textClassName,
  ...props
}: BallProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  }

  const baseClasses = cn("cursor-pointer transition-transform hover:scale-105", sizeClasses[size], className)

  const extraTextClass = cn(
    "font-semibold font-montserrat",
    size == "sm" ? "text-base" : size == "md" ? "text-lg" : "text-lg",
  )

  return (
    <div className="relative cursor-pointer" onClick={onClick}>
      {variant === "matched" ? (
        <>
          <svg viewBox="0 0 38 39" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClasses} {...props}>
            <g filter="url(#filter0_ii_2298_752)">
              <circle cx={18} cy={18.9854} r={18} fill="url(#paint0_linear_2298_752)" />
              <path
                d="M28.3105 9.1123L29.9717 8.19636L31.8486 10.3593L31.3061 12.4242L28.3105 9.1123Z"
                fill="white"
                fillOpacity={0.5}
              />
            </g>
            <defs>
              <filter
                id="filter0_ii_2298_752"
                x={-25}
                y={-24.0146}
                width={77}
                height={77}
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity={0} result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dx={12} dy={12} />
                <feGaussianBlur stdDeviation={6} />
                <feComposite in2="hardAlpha" operator="arithmetic" k2={-1} k3={1} />
                <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.12 0" />
                <feBlend mode="normal" in2="shape" result="effect1_innerShadow_2298_752" />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dx={-25} dy={-25} />
                <feGaussianBlur stdDeviation={25} />
                <feComposite in2="hardAlpha" operator="arithmetic" k2={-1} k3={1} />
                <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.12 0" />
                <feBlend mode="normal" in2="effect1_innerShadow_2298_752" result="effect2_innerShadow_2298_752" />
              </filter>
              <linearGradient
                id="paint0_linear_2298_752"
                x1={20}
                y1={3.58535}
                x2={11}
                y2={47.1854}
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#04DA6A" />
                <stop offset={1} stopColor="#035D2E" />
              </linearGradient>
            </defs>
          </svg>
          {number && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn("text-white font-montserrat font-semibold ", textClassName, extraTextClass)}>
                {number}
              </span>
            </div>
          )}
        </>
      ) : variant === "mismatched" ? (
        <>
          <svg viewBox="0 0 38 39" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClasses} {...props}>
            <g filter="url(#filter0_ii_2298_771)">
              <circle cx={18} cy={18} r={18} fill="url(#paint0_linear_2298_771)" />
              <path
                d="M28.3105 8.12695L29.9717 7.21101L31.8486 9.37397L31.3061 11.4388L28.3105 8.12695Z"
                fill="white"
                fillOpacity={0.5}
              />
            </g>
            <defs>
              <filter
                id="filter0_ii_2298_771"
                x={-25}
                y={-25}
                width={77}
                height={77}
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity={0} result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dx={12} dy={12} />
                <feGaussianBlur stdDeviation={6} />
                <feComposite in2="hardAlpha" operator="arithmetic" k2={-1} k3={1} />
                <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.12 0" />
                <feBlend mode="normal" in2="shape" result="effect1_innerShadow_2298_771" />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dx={-25} dy={-25} />
                <feGaussianBlur stdDeviation={25} />
                <feComposite in2="hardAlpha" operator="arithmetic" k2={-1} k3={1} />
                <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.12 0" />
                <feBlend mode="normal" in2="effect1_innerShadow_2298_771" result="effect2_innerShadow_2298_771" />
              </filter>
              <linearGradient
                id="paint0_linear_2298_771"
                x1={20}
                y1={2.6}
                x2={11}
                y2={46.2}
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#FF001D" />
                <stop offset={1} stopColor="#3E0014" />
              </linearGradient>
            </defs>
          </svg>
          {number && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn("text-white", textClassName, extraTextClass)}>{number}</span>
            </div>
          )}
        </>
      ) : variant === "selected" ? (
        <>
          <svg viewBox="0 0 38 39" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClasses} {...props}>
            <g filter="url(#filter0_ii_2260_2030)">
              <circle cx={18} cy={18.9854} r={18} fill="url(#paint0_linear_2260_2045)" />
              <path
                d="M28.3105 9.1123L29.9717 8.19636L31.8486 10.3593L31.3061 12.4242L28.3105 9.1123Z"
                fill="white"
                fillOpacity={0.5}
              />
            </g>
            <defs>
              <filter
                id="filter0_ii_2260_2045"
                x={-25}
                y={-24.0146}
                width={77}
                height={77}
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity={0} result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dx={12} dy={12} />
                <feGaussianBlur stdDeviation={6} />
                <feComposite in2="hardAlpha" operator="arithmetic" k2={-1} k3={1} />
                <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.12 0" />
                <feBlend mode="normal" in2="shape" result="effect1_innerShadow_2260_2045" />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dx={-25} dy={-25} />
                <feGaussianBlur stdDeviation={25} />
                <feComposite in2="hardAlpha" operator="arithmetic" k2={-1} k3={1} />
                <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.12 0" />
                <feBlend mode="normal" in2="effect1_innerShadow_2260_2045" result="effect2_innerShadow_2260_2045" />
              </filter>
              <linearGradient
                id="paint0_linear_2260_2045"
                x1={20}
                y1={3.58535}
                x2={11}
                y2={47.1854}
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#000" />
                <stop offset={1} stopColor="#63108A" />
              </linearGradient>
            </defs>
          </svg>
          {number && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn("text-white", textClassName, extraTextClass)}>{number}</span>
            </div>
          )}
        </>
      ) : (
        <>
          <svg viewBox="0 0 38 39" fill="none" xmlns="http://www.w3.org/2000/svg" className={baseClasses} {...props}>
            <g filter="url(#filter0_ii_2260_2030)">
              <circle cx={18} cy={18} r={18} fill="url(#paint0_linear_2260_2030)" />
              <path
                d="M28.3105 9.1123L29.9717 8.19636L31.8486 10.3593L31.3061 12.4242L28.3105 9.1123Z"
                fill="white"
                fillOpacity={0.5}
              />
            </g>
            <defs>
              <filter
                id="filter0_ii_2260_2030"
                x={-25}
                y={-24.0146}
                width={77}
                height={77}
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity={0} result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dx={12} dy={12} />
                <feGaussianBlur stdDeviation={6} />
                <feComposite in2="hardAlpha" operator="arithmetic" k2={-1} k3={1} />
                <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.12 0" />
                <feBlend mode="normal" in2="shape" result="effect1_innerShadow_2260_2030" />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dx={-25} dy={-25} />
                <feGaussianBlur stdDeviation={25} />
                <feComposite in2="hardAlpha" operator="arithmetic" k2={-1} k3={1} />
                <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.12 0" />
                <feBlend mode="normal" in2="effect1_innerShadow_2260_2030" result="effect2_innerShadow_2030" />
              </filter>
              <linearGradient
                id="paint0_linear_2260_2030"
                x1={20}
                y1={3.58535}
                x2={11}
                y2={47.1854}
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#D91FFF" />
                <stop offset={1} stopColor="#63108A" />
              </linearGradient>
            </defs>
          </svg>
          {number && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn("text-white", textClassName, extraTextClass)}>{number}</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
