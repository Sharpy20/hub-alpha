import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Patients | Inpatient Hub",
  description: "Patient list and management for ward staff",
};

export default function PatientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
