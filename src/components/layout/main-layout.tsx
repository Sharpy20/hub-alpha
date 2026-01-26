"use client";

import { ReactNode, useEffect, useState } from "react";
import { Header } from "./Header";
import { Footer } from "./footer";
import { GdprModal } from "@/components/auth/gdpr-modal";
import { BackToTop } from "@/components/ui";
import { useApp } from "@/app/providers";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { gdprAccepted, setGdprAccepted } = useApp();
  const [showGdpr, setShowGdpr] = useState(false);

  useEffect(() => {
    // Show GDPR modal if not accepted (after a brief delay for hydration)
    const timer = setTimeout(() => {
      if (!gdprAccepted) {
        setShowGdpr(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [gdprAccepted]);

  const handleGdprAccept = () => {
    setGdprAccepted(true);
    setShowGdpr(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-nhs-pale-grey/30">
      <Header />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
      <Footer />
      <GdprModal isOpen={showGdpr} onAccept={handleGdprAccept} />
      <BackToTop />
    </div>
  );
}
