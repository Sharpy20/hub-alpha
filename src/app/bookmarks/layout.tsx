import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bookmarks | wardHub",
  description: "Quick links to clinical systems, resources, and external services",
};

export default function BookmarksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
