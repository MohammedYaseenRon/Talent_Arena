import { cn } from "@/lib/utils";

type ButtonVariant = 'orange' | 'white' | 'gray' | 'black' | 'green' | 'red';

interface GradientButtonProps {
    text: string,
    variant?: ButtonVariant,
    size?: 'sm' | 'md' | 'lg',
    className?: string,
    onClick?: () => void,
    disabled?: boolean
}

const variantStyles = {
    orange: {
        background: 'linear-gradient(to bottom, #f97316, #ea580c)',
        textColor: 'text-white',
        boxShadow: '0 2px 8px rgba(249, 115, 22, 0.4)',
    },
    white: {
        background: 'linear-gradient(to bottom, #ffffff, #f1f5f9)',
        textColor: 'text-gray-900',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    gray: {
        background: 'linear-gradient(to bottom, #e5e7eb, #d1d5db)',
        textColor: 'text-gray-800',
        boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
    },
    black: {
        background: 'linear-gradient(to bottom, rgb(31, 41, 55), rgb(17, 24, 39))',
        textColor: 'text-white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.5), 0 1.5px 0 rgba(255,255,255,0.1) inset, 0 -2px 8px rgba(0,0,0,0.8) inset',
        innerShadow: '0 0 0 2px rgba(255,255,255,0.05) inset, 0 1.5px 0 rgba(255,255,255,0.1) inset, 0 -2px 8px rgba(0,0,0,0.3) inset',
    },
    green: {
        background: 'linear-gradient(to bottom, #10b981, #059669)',
        textColor: 'text-white',
        boxShadow: '0 2px 6px rgba(16,185,129,0.4)',
    },
    red: {
        background: 'linear-gradient(to bottom, #ef4444, #dc2626)',
        textColor: 'text-white',
        boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
    },
}

const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-1.75 text-sm',
    lg: 'px-6 py-2.5 text-base'
}


export function GradientButton({
    text,
    variant = "orange",
    size = "md",
    className,
    onClick,
    disabled = false
}: GradientButtonProps) {
    const variantStyle = variantStyles[variant];
    const sizeStyle = sizeStyles[size];

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "relative inline-block rounded-full font-medium transition-all duration-200",
                "active:scale-[0.98] flex justify-center items-center",
                "hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                sizeStyle,
                className,
                variantStyle.textColor
            )}

            style={{
                background: variantStyle.background,
                boxShadow: variantStyle.boxShadow
            }}
        >
            <span className="relative z-10">{text}</span>
        </button>
    )

}