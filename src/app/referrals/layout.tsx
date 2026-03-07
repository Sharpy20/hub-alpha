import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Referral Hub | wardHub",
  description: "Step-by-step workflows for common referrals",
};

export default function ReferralsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
