import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | wardHub",
  description: "Login to access the wardHub demo",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
