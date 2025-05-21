import { cn } from '@/utils/classNames';

interface FormErrorProps {
  errorMessage?: string;
  className?: string;
}

export function FormError({ errorMessage, className }: FormErrorProps) {
  return (
    <p
      className={cn(
        'mt-1.5 rounded-md bg-red-100 px-4 py-0.5 text-[8px] text-red-600 animate-in fade-in-40',
        className
      )}
    >
      {errorMessage || 'This is required'}
    </p>
  );
}
