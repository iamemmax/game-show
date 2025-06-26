import { cva, VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/utils/classNames';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-center text-xs font-medium ring-offset-white transition duration-300 hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 active:scale-90 disabled:pointer-events-none disabled:scale-100 disabled:opacity-40 disabled:hover:cursor-not-allowed',
  {
    variants: {
      variant: {
        default: 'bg-main text-white',
        light: 'bg-main-light text-main',
        white: 'bg-white text-main',
        red: 'bg-red-800 text-red-100',
        outlined: 'border border-main bg-transparent text-main',
        unstyled: '',
      },
      size: {
        default: 'px-6 py-2',
        icon: "size-5",
        lg: 'rounded-lg px-6 py-3',
        fullWidth: 'block w-full py-2',
        unstyled: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
