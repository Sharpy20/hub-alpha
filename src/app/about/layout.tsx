import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About wardHub",
  description:
    "What wardHub is, where your data goes, and how the content gets checked",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
