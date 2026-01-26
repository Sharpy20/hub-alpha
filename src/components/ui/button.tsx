"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-nhs-blue text-white hover:bg-nhs-dark-blue focus-visible:ring-nhs-blue",
      secondary:
        "bg-nhs-pale-grey text-nhs-black hover:bg-nhs-mid-grey/30 focus-visible:ring-nhs-mid-grey",
      outline:
        "border-2 border-nhs-blue text-nhs-blue hover:bg-nhs-blue hover:text-white focus-visible:ring-nhs-blue",
      ghost:
        "text-nhs-blue hover:bg-nhs-pale-grey focus-visible:ring-nhs-blue",
      danger:
        "bg-nhs-red text-white hover:bg-red-700 focus-visible:ring-nhs-red",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
