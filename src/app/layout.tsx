import type { Metadata } from "next";
import { Source_Sans_3, Lora } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { TasksProvider } from "./tasks-provider";
import { WardSettingsProvider } from "./ward-settings-provider";
import { VerificationProvider } from "./verification-provider";
import { TourProvider } from "./tour-provider";
import { TourModal } from "@/components/tour/TourModal";
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/components/ui";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

// Lora for patient-facing MH guides. Self-hosted via next/font (downloaded at build,
// served from our domain) so no visitor data reaches Google - keep it that way.
const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
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
      <body className={`${sourceSans.variable} ${lora.variable} font-sans antialiased`}>
        <Providers>
          <TasksProvider>
            <WardSettingsProvider>
                <VerificationProvider>
                  <TourProvider>
                    <ErrorBoundary>{children}</ErrorBoundary>
                    <TourModal />
                  </TourProvider>
                </VerificationProvider>
            </WardSettingsProvider>
          </TasksProvider>
        </Providers>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
