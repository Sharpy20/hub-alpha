import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  // diary-muted / text-foreground keep the trail readable in dark mode,
  // where the page background flips dark but grey utilities do not.
  return (
    <nav aria-label="Breadcrumb" className="diary-muted flex items-center gap-1.5 text-sm mb-4 overflow-x-auto">
      <Link href="/" aria-label="Home" className="diary-muted flex items-center gap-1 hover:text-gray-700 transition-colors flex-shrink-0">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1.5 flex-shrink-0">
          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          {item.href ? (
            <Link href={item.href} className="diary-muted hover:text-gray-700 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium truncate max-w-[200px]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
