import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ward Diary | wardHub",
  description: "Ward task management and scheduling",
};

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
