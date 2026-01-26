"use client";

import { MainLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Home, Bookmark, FileText, BookOpen, Search, ArrowLeft } from "lucide-react";

const QUICK_LINKS = [
  {
    icon: Home,
    label: "Home",
    description: "Return to the main page",
    href: "/",
  },
  {
    icon: Bookmark,
    label: "Bookmarks",
    description: "Quick links and resources",
    href: "/bookmarks",
  },
  {
    icon: FileText,
    label: "Referrals",
    description: "Step-by-step referral guides",
    href: "/referrals",
  },
  {
    icon: BookOpen,
    label: "How-To Guides",
    description: "Clinical procedures and SOPs",
    href: "/how-to",
  },
];

export default function NotFoundPage() {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        {/* 404 Display */}
        <div className="mb-6">
          <span className="text-8xl md:text-9xl font-bold bg-gradient-to-br from-nhs-blue via-nhs-bright-blue to-nhs-light-blue bg-clip-text text-transparent">
            404
          </span>
        </div>

        {/* Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-nhs-pale-grey rounded-full flex items-center justify-center mx-auto">
            <Search className="w-10 h-10 text-nhs-mid-grey" />
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl md:text-3xl font-bold text-nhs-black mb-3">
          Page not found
        </h1>
        <p className="text-nhs-dark-grey text-lg max-w-md mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Try checking the URL or use the links below to find what you need.
        </p>

        {/* Go Back Home Button */}
        <Link href="/" className="mb-10">
          <Button size="lg" className="gap-2">
            <ArrowLeft className="w-5 h-5" />
            Go back home
          </Button>
        </Link>

        {/* Quick Links Section */}
        <div className="w-full max-w-2xl">
          <h2 className="text-lg font-semibold text-nhs-dark-grey mb-4">
            Or try one of these pages:
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {QUICK_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href} className="block">
                  <Card hover className="h-full">
                    <CardContent className="flex items-center gap-4 py-4">
                      <div className="w-12 h-12 bg-nhs-pale-grey rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-nhs-blue" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-nhs-black">
                          {link.label}
                        </h3>
                        <p className="text-sm text-nhs-dark-grey">
                          {link.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Search Suggestion */}
        <p className="mt-8 text-sm text-nhs-mid-grey">
          If you believe this page should exist, please contact your ward administrator.
        </p>
      </div>
    </MainLayout>
  );
}
