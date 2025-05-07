import { useState } from 'react';

export const ProgressBar = ({
  progress = 28, // Default progress percentage (0-100)
  trackColor = '#003300', // Dark green background
  progressColor = '#00CC00', // Bright green progress
  width = '100%',
  height = 40,
  text = '₦2,000',
  showText = true,
  borderRadius = 10,
  textColor = 'white',
  textSize = 14,
  textWeight = 'bold',
  animated = false
}) => {
  const [hover, setHover] = useState(false);
  
  // Ensure progress is between 0-100
  const boundedProgress = Math.min(100, Math.max(0, progress));
  
  // Calculate progress position (for the circle indicator)
  const progressPosition = boundedProgress;
  
  return (
    <div className="relative w-full" style={{ width, height }} 
         onMouseEnter={() => setHover(true)}
         onMouseLeave={() => setHover(false)}>
      <svg 
        viewBox="0 0 300 20" 
        className="w-full h-full"
        style={{ 
          filter: hover && animated ? 'drop-shadow(0 0 3px rgba(0, 204, 0, 0.5))' : 'none',
          transition: 'filter 0.3s ease'
        }}
      >
        {/* Background track */}
        <rect 
          x="0" 
          y="5" 
          width="300" 
          height="10" 
          rx={borderRadius / 2} 
          ry={borderRadius / 2} 
          fill={trackColor} 
        />
        
        {/* Progress fill */}
        <rect 
          x="0" 
          y="5" 
          width={progressPosition * 3} 
          height="10" 
          rx={borderRadius / 2} 
          ry={borderRadius / 2} 
          fill={progressColor} 
        />
        
        {/* Progress indicator circle */}
        <circle 
          cx={progressPosition * 3} 
          cy="10" 
          r="9" 
          fill={progressColor} 
          stroke={trackColor} 
          strokeWidth="1" 
          style={{ 
            filter: hover && animated ? 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.7))' : 'none',
            transition: 'all 0.3s ease'
          }}
        />
        
        {/* Text display */}
        {showText && (
          <text 
            x="245" 
            y="14" 
            fontFamily="Arial, sans-serif" 
            fontSize={textSize} 
            fontWeight={textWeight} 
            fill={textColor}
          >
            {text}
          </text>
        )}
      </svg>
    </div>
  );
};

// Usage example

  
