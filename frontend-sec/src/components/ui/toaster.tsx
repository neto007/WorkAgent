import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            theme="dark"
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast:
                        'group toast group-[.toaster]:bg-[#0b0b11] group-[.toaster]:text-[#f8f8f2] group-[.toaster]:border-[#1a1b26] group-[.toaster]:shadow-lg',
                    description: 'group-[.toast]:text-[#6272a4]',
                    actionButton:
                        'group-[.toast]:bg-[#bd93f9] group-[.toast]:text-black',
                    cancelButton:
                        'group-[.toast]:bg-[#1a1b26] group-[.toast]:text-[#6272a4]',
                },
            }}
            {...props}
        />
    );
};

export { Toaster };
