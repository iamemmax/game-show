import React from 'react';
import { cn } from '@/utils/classNames';

interface NumberValueCardProps {
  number: string | number;
  value: string | number;
  className?: string;
  width?: number;
  height?: number;
  primaryColor?: string;
  secondaryColor?: string;
}

export const NumberValueCard: React.FC<NumberValueCardProps> = ({
  number,
  value,
  className,
  width = 120,
  height = 120,
  primaryColor = "#7E3CE0",
  secondaryColor = "#D91FFF"
}) => {
  const uniqueId = React.useId();
  // const gradientId = `number_value_gradient_${uniqueId}`;

  return (
    <div 
      className={cn(
        'relative flex flex-col items-center justify-center rounded-lg overflow-hidden',
        className
      )}
      style={{ 
        width,
        height,
        background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
      }}
    >
      {/* Number */}
      <div className="text-4xl font-bold text-white mb-2">
        {number}
      </div>
      
      {/* Value */}
      <div className="text-sm text-white/90">
        {typeof value === 'number' ? 
          new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
          }).format(value) 
          : value
        }
      </div>
    </div>
  );
};