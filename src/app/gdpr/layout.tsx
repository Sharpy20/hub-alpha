import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GDPR & Privacy | Inpatient Hub",
  description: "Information about data protection and privacy in Inpatient Hub",
};

export default function GdprLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
