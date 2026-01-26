import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Tasks | Inpatient Hub",
  description: "Personal task board for tracking your assigned tasks",
};

export default function MyTasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
