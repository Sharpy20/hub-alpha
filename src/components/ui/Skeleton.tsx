import { HTMLAttributes, forwardRef } from "react";

/**
 * Base Skeleton component with pulse animation
 * Use for custom skeleton shapes by passing width/height via className
 */
interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional: make the skeleton rounded */
  rounded?: boolean;
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className = "", rounded = false, ...props }, ref) => {
    const baseStyles = "animate-pulse bg-nhs-pale-grey";
    const roundedStyles = rounded ? "rounded-full" : "rounded";

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${roundedStyles} ${className}`}
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

/**
 * SkeletonCard - Card-shaped loading placeholder
 * Mimics the Card component structure with header and content areas
 */
interface SkeletonCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Show header section */
  showHeader?: boolean;
  /** Number of content lines to show */
  lines?: number;
  /** Show a footer section */
  showFooter?: boolean;
}

const SkeletonCard = forwardRef<HTMLDivElement, SkeletonCardProps>(
  (
    { className = "", showHeader = true, lines = 3, showFooter = false, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`bg-white rounded-xl border border-nhs-pale-grey shadow-sm overflow-hidden ${className}`}
        {...props}
      >
        {showHeader && (
          <div className="px-6 py-4 border-b border-nhs-pale-grey">
            <Skeleton className="h-6 w-1/3" />
          </div>
        )}
        <div className="px-6 py-4 space-y-3">
          {Array.from({ length: lines }).map((_, index) => (
            <Skeleton
              key={index}
              className={`h-4 ${
                index === lines - 1 ? "w-2/3" : "w-full"
              }`}
            />
          ))}
        </div>
        {showFooter && (
          <div className="px-6 py-4 border-t border-nhs-pale-grey bg-nhs-pale-grey/30">
            <Skeleton className="h-8 w-24" />
          </div>
        )}
      </div>
    );
  }
);

SkeletonCard.displayName = "SkeletonCard";

/**
 * SkeletonText - Text line loading placeholder
 * Use for inline text loading states
 */
interface SkeletonTextProps extends HTMLAttributes<HTMLDivElement> {
  /** Number of lines to display */
  lines?: number;
  /** Last line width (percentage or Tailwind width class) */
  lastLineWidth?: string;
}

const SkeletonText = forwardRef<HTMLDivElement, SkeletonTextProps>(
  ({ className = "", lines = 1, lastLineWidth = "w-3/4", ...props }, ref) => {
    if (lines === 1) {
      return (
        <Skeleton
          ref={ref}
          className={`h-4 ${lastLineWidth} ${className}`}
          {...props}
        />
      );
    }

    return (
      <div ref={ref} className={`space-y-2 ${className}`} {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            className={`h-4 ${
              index === lines - 1 ? lastLineWidth : "w-full"
            }`}
          />
        ))}
      </div>
    );
  }
);

SkeletonText.displayName = "SkeletonText";

/**
 * SkeletonButton - Button-shaped loading placeholder
 * Matches the Button component sizing
 */
interface SkeletonButtonProps extends HTMLAttributes<HTMLDivElement> {
  /** Button size variant */
  size?: "sm" | "md" | "lg";
}

const SkeletonButton = forwardRef<HTMLDivElement, SkeletonButtonProps>(
  ({ className = "", size = "md", ...props }, ref) => {
    const sizeStyles = {
      sm: "h-8 w-20",
      md: "h-10 w-24",
      lg: "h-12 w-32",
    };

    return (
      <Skeleton
        ref={ref}
        className={`${sizeStyles[size]} rounded-lg ${className}`}
        {...props}
      />
    );
  }
);

SkeletonButton.displayName = "SkeletonButton";

export { Skeleton, SkeletonCard, SkeletonText, SkeletonButton };
