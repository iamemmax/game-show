import * as React from "react";
import { SVGProps } from "react";


interface CustomSVGProps extends SVGProps<SVGSVGElement> {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
  }
  
  const MinusIcon = ({
    color = "#fff",
    borderColor = "#9E5CFF",
    borderWidth = 2,
    ...props
  }: CustomSVGProps) => (
  <svg
    width={53}
    height={49}
    viewBox="0 0 53 49"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g filter="url(#filter0_d_371_3010)">
      <mask
        id="path-1-outside-1_371_3010"
        maskUnits="userSpaceOnUse"
        x={20.8394}
        y={16.2422}
        width={12}
        height={7}
        fill="black"
      >
        <rect fill={color} x={20.8394} y={16.2422} width={12} height={7} />
        <path d="M22.3994 21.6722V17.9222H30.8894V21.6722H22.3994Z" />
      </mask>
      <path
        d="M22.3994 21.6722V17.9222H30.8894V21.6722H22.3994Z"
        fill={color}
      />
      <path
        d="M22.3994 21.6722H20.9994V23.0722H22.3994V21.6722ZM22.3994 17.9222V16.5222H20.9994V17.9222H22.3994ZM30.8894 17.9222H32.2894V16.5222H30.8894V17.9222ZM30.8894 21.6722V23.0722H32.2894V21.6722H30.8894ZM23.7994 21.6722V17.9222H20.9994V21.6722H23.7994ZM22.3994 19.3222H30.8894V16.5222H22.3994V19.3222ZM29.4894 17.9222V21.6722H32.2894V17.9222H29.4894ZM30.8894 20.2722H22.3994V23.0722H30.8894V20.2722Z"
        fill={borderColor}
        mask="url(#path-1-outside-1_371_3010)"
      />
    </g>
    <defs>
      <filter
        id="filter0_d_371_3010"
        x={0.574852}
        y={0.635638}
        width={52.1394}
        height={47.4001}
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
          result="effect1_dropShadow_371_3010"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_371_3010"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
);
export default MinusIcon;
