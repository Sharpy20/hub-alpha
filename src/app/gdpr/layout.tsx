import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GDPR & Privacy | wardHub",
  description: "Information about data protection and privacy in wardHub",
};

export default function GdprLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
