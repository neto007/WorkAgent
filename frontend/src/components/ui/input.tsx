import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full rounded-md border border-[#1a1b26] bg-[#050101] px-3 py-2 text-sm text-[#f8f8f2] placeholder:text-[#6272a4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bd93f9]/20 focus-visible:border-[#bd93f9] disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = 'Input';

export { Input };
