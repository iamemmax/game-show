import * as React from "react";
import { SVGProps } from "react";

interface CustomSVGProps extends SVGProps<SVGSVGElement> {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
  }
  
  const AddIcon = ({
    color = "#fff",
    borderColor = "#9E5CFF",
    borderWidth = 2,
    ...props
  }: CustomSVGProps) => (
  <svg
    width={56}
    height={56}
    viewBox="0 0 56 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g filter="url(#filter0_d_371_3013)">
      <mask
        id="path-1-outside-1_371_3013"
        maskUnits="userSpaceOnUse"
        x={20.8662}
        y={15.9688}
        width={15}
        height={15}
        fill="black"
      >
        <rect fill={color} x={20.8662} y={15.9688} width={15} height={15} />
        <path d="M26.5062 29.1127V18.0247H29.6022V29.1127H26.5062ZM22.3542 25.0327V22.1047H33.7782V25.0327H22.3542Z" />
      </mask>
      <path
        d="M26.5062 29.1127V18.0247H29.6022V29.1127H26.5062ZM22.3542 25.0327V22.1047H33.7782V25.0327H22.3542Z"
        fill={color}
      />
      <path
        d="M26.5062 29.1127H25.1062V30.5128H26.5062V29.1127ZM26.5062 18.0247V16.6247H25.1062V18.0247H26.5062ZM29.6022 18.0247H31.0022V16.6247H29.6022V18.0247ZM29.6022 29.1127V30.5128H31.0022V29.1127H29.6022ZM22.3542 25.0327H20.9542V26.4328H22.3542V25.0327ZM22.3542 22.1047V20.7048H20.9542V22.1047H22.3542ZM33.7782 22.1047H35.1782V20.7048H33.7782V22.1047ZM33.7782 25.0327V26.4328H35.1782V25.0327H33.7782ZM27.9062 29.1127V18.0247H25.1062V29.1127H27.9062ZM26.5062 19.4247H29.6022V16.6247H26.5062V19.4247ZM28.2022 18.0247V29.1127H31.0022V18.0247H28.2022ZM29.6022 27.7127H26.5062V30.5128H29.6022V27.7127ZM23.7542 25.0327V22.1047H20.9542V25.0327H23.7542ZM22.3542 23.5047H33.7782V20.7048H22.3542V23.5047ZM32.3782 22.1047V25.0327H35.1782V22.1047H32.3782ZM33.7782 23.6327H22.3542V26.4328H33.7782V23.6327Z"
        fill={borderColor}
      
        mask="url(#path-1-outside-1_371_3013)"
      />
    </g>
    <defs>
      <filter
        id="filter0_d_371_3013"
        x={0.529442}
        y={0.739153}
        width={55.0734}
        height={54.738}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy={4.53881} />
        <feGaussianBlur stdDeviation={10.2123} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.619608 0 0 0 0 0.360784 0 0 0 0 1 0 0 0 1 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_371_3013"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_371_3013"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
);
export default AddIcon;

