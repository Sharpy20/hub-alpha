import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How-To Guides | Inpatient Hub",
  description: "Step-by-step guides for clinical procedures, assessments, and ward tasks",
};

export default function HowToLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
