import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default:
    "bg-white text-slate-950 hover:bg-white/90 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_16px_50px_rgba(255,255,255,0.12)]",
  secondary: "bg-white/10 text-white hover:bg-white/15 border border-white/10",
  outline: "border border-white/15 bg-transparent text-white hover:bg-white/5",
  ghost: "bg-transparent text-white hover:bg-white/5"
};

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  default: "h-11 px-5 text-sm",
  sm: "h-9 px-4 text-sm",
  lg: "h-12 px-6 text-sm"
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "default", size = "default", type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});
