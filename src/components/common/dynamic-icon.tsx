"use client";

// PERFORMANCE: this used to do `import { icons } from "lucide-react"`, which
// bundles the ENTIRE lucide icon map (~550 kB of JS) into every page that
// renders a DynamicIcon (home wheel, /links). Bookmark icons are emoji; the
// only lucide names ever passed in are the category icons below plus the Link
// fallback. Import them by name so the bundler tree-shakes the rest.
//
// If you add a new category icon name (see getCategoryIcon in
// bookmark-carousel.tsx), add it to this registry too - unknown names fall
// back to the Link icon, same as before.
import {
  Baby,
  Banknote,
  Building,
  Building2,
  Church,
  ExternalLink,
  FileText,
  Folder,
  GraduationCap,
  Heart,
  HeartPulse,
  Laptop,
  Link,
  MessageSquare,
  Monitor,
  Phone,
  Pill,
  Scale,
  Shield,
  ShieldCheck,
  Star,
  User,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

const ICON_REGISTRY: Record<string, LucideIcon> = {
  Baby,
  Banknote,
  Building,
  Building2,
  Church,
  ExternalLink,
  FileText,
  Folder,
  GraduationCap,
  Heart,
  HeartPulse,
  Laptop,
  Link,
  MessageSquare,
  Monitor,
  Phone,
  Pill,
  Scale,
  Shield,
  ShieldCheck,
  Star,
  User,
};

interface DynamicIconProps extends Omit<LucideProps, "ref"> {
  name: string;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const IconComponent = ICON_REGISTRY[name] ?? ICON_REGISTRY.Link;
  return <IconComponent {...props} />;
}
