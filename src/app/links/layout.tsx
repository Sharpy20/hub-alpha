import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Links | wardHub",
  description: "Quick links to clinical systems, resources, and external services",
};

export default function LinksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
