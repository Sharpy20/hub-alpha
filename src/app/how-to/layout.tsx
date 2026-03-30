import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How-To Guides | wardHub",
  description: "Step-by-step guides for clinical procedures, assessments, and team tasks",
};

export default function HowToLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
