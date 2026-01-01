import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
	"inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors",
	{
		variants: {
			variant: {
				default: "bg-wave-high/10 text-wave-high border border-wave-high/30",
				secondary: "bg-wave-low/10 text-wave-low border border-wave-low/30",
				pulse: "bg-pulse/10 text-pulse border border-pulse/30",
				life: "bg-life/10 text-life border border-life/30",
				outline: "border border-white/20 text-muted",
				glass: "glass text-light",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
	return (
		<div className={cn(badgeVariants({ variant }), className)} {...props} />
	);
}

export { Badge, badgeVariants };
