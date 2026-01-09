import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#bd93f9] disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                default: 'bg-[#bd93f9] text-black hover:bg-[#ff79c6] shadow-[0_0_15px_rgba(189,147,249,0.3)] hover:shadow-[0_0_20px_rgba(255,121,198,0.4)]',
                destructive: 'bg-[#ff5555] text-black hover:bg-[#ff5555]/90 shadow-[0_0_15px_rgba(255,85,85,0.3)]',
                outline: 'border border-[#bd93f9] bg-transparent text-[#bd93f9] hover:bg-[#bd93f9]/10',
                secondary: 'bg-[#50fa7b] text-black hover:bg-[#50fa7b]/90 shadow-[0_0_15px_rgba(80,250,123,0.3)]',
                ghost: 'text-[#f8f8f2] hover:bg-[#1a1b26] hover:text-[#bd93f9]',
                link: 'text-[#bd93f9] underline-offset-4 hover:underline',
            },
            size: {
                default: 'h-9 px-4 py-2',
                sm: 'h-8 rounded px-3 text-xs',
                lg: 'h-10 rounded px-8',
                icon: 'h-9 w-9',
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
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
