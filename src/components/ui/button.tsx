import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const buttonVariants = cva("inline-flex items-center justify-center rounded-xl text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:pointer-events-none disabled:opacity-50", {
  variants: { variant: { default: "bg-sky-500 text-white hover:bg-sky-400", secondary: "border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700", ghost: "text-slate-400 hover:bg-slate-800 hover:text-slate-100", destructive: "bg-rose-500 text-white hover:bg-rose-400" }, size: { default: "h-10 px-4", sm: "h-9 px-3 text-xs", icon: "h-10 w-10" } },
  defaultVariants: { variant: "default", size: "default" },
});
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean }
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />;
});
Button.displayName = "Button";
export { buttonVariants };
