import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { TasksProvider } from "./tasks-provider";
import { WardSettingsProvider } from "./ward-settings-provider";
import { VerificationProvider } from "./verification-provider";
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/components/ui";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Inpatient Hub - Ward Resources & Referrals",
  description: "NHS ward management tool for quick access to resources, referrals, and guides",
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
      <body className={`${sourceSans.variable} font-sans antialiased`}>
        <Providers>
          <TasksProvider>
            <WardSettingsProvider>
              <VerificationProvider>
                <ErrorBoundary>{children}</ErrorBoundary>
              </VerificationProvider>
            </WardSettingsProvider>
          </TasksProvider>
        </Providers>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
