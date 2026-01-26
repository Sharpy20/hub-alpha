import { HTMLAttributes, forwardRef } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info" | "focus";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = "", variant = "default", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

    const variants = {
      default: "bg-nhs-pale-grey text-nhs-dark-grey",
      success: "bg-green-100 text-nhs-green",
      warning: "bg-yellow-100 text-yellow-800",
      error: "bg-red-100 text-nhs-red",
      info: "bg-blue-100 text-nhs-blue",
      focus: "bg-nhs-yellow text-nhs-black",
    };

    return (
      <span
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
