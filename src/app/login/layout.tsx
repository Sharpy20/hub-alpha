import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Inpatient Hub",
  description: "Login to access the Inpatient Hub demo",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
