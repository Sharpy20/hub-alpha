import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { TasksProvider } from "./tasks-provider";
import { WardSettingsProvider } from "./ward-settings-provider";
import { VerificationProvider } from "./verification-provider";
import { ReferralLogProvider } from "./referral-log-provider";
import { TourProvider } from "./tour-provider";
import { TourModal } from "@/components/tour/TourModal";
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/components/ui";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "wardHub - Ward Resources, Guides & Diary",
  description: "wardHub - NHS ward management tool for quick access to resources, referrals, and guides",
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Lora font for patient-facing MH guides */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body className={`${sourceSans.variable} font-sans antialiased`}>
        <Providers>
          <TasksProvider>
            <WardSettingsProvider>
              <ReferralLogProvider>
                <VerificationProvider>
                  <TourProvider>
                    <ErrorBoundary>{children}</ErrorBoundary>
                    <TourModal />
                  </TourProvider>
                </VerificationProvider>
              </ReferralLogProvider>
            </WardSettingsProvider>
          </TasksProvider>
        </Providers>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
