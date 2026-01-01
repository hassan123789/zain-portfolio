import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wave-high focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				default:
					"bg-wave-high text-void hover:bg-wave-high/90 shadow-lg shadow-wave-high/20",
				secondary:
					"bg-wave-low text-light hover:bg-wave-low/90 shadow-lg shadow-wave-low/20",
				ghost: "hover:bg-white/5 hover:text-light",
				outline:
					"border border-white/10 bg-transparent hover:bg-white/5 hover:border-wave-high/50",
				glass: "glass hover:border-wave-high/50",
				pulse:
					"bg-pulse text-light hover:bg-pulse/90 shadow-lg shadow-pulse/20",
				life: "bg-life text-void hover:bg-life/90 shadow-lg shadow-life/20",
			},
			size: {
				default: "h-10 px-6 py-2",
				sm: "h-9 px-4 text-xs",
				lg: "h-12 px-8 text-base",
				xl: "h-14 px-10 text-lg",
				icon: "h-10 w-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, ...props }, ref) => {
		return (
			<button
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			/>
		);
	},
);
Button.displayName = "Button";

export { Button, buttonVariants };
