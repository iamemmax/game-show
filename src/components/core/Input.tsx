import * as React from 'react';
import { cn } from '@/utils/classNames';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  removeSpaces?: boolean; // Add prop to control space removal
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, removeSpaces = false, onChange, ...props }, ref) => {
    // Custom onChange handler to remove spaces if needed
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (removeSpaces) {
        // Remove all spaces from the input value
        const noSpacesValue = e.target.value.replace(/\s+/g, '');
        
        // Create a new synthetic event with the modified value
        const newEvent = {
          ...e,
          target: {
            ...e.target,
            value: noSpacesValue
          }
        } as React.ChangeEvent<HTMLInputElement>;
        
        // Set the input's value directly to avoid cursor jumping
        e.target.value = noSpacesValue;
        
        // Call the original onChange with our modified event
        onChange?.(newEvent);
      } else {
        // Call the original onChange handler
        onChange?.(e);
      }
    };

    return (
      <input
        className={cn(
          'flex h-9 w-full rounded-lg bg-[#462B58] px-5 py-2 text-xs transition duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-white/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        type={type}
        onChange={handleChange}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
