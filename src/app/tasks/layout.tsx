import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Diary | wardHub",
  description: "Team task management and scheduling",
};

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
