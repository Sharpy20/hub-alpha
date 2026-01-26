"use client";

import { icons, LucideProps } from "lucide-react";

interface DynamicIconProps extends Omit<LucideProps, "ref"> {
  name: string;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const IconComponent = icons[name as keyof typeof icons];

  if (!IconComponent) {
    const FallbackIcon = icons.Link;
    return <FallbackIcon {...props} />;
  }

  return <IconComponent {...props} />;
}
