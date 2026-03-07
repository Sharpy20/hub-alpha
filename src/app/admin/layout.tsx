import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | wardHub",
  description: "Content management and administration",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
