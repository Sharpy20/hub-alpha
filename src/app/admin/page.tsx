"use client";

import { MainLayout } from "@/components/layout";
import { useApp } from "@/app/providers";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { FileText, BookOpen, ArrowRight, Pencil, Shield } from "lucide-react";

// Count data (would come from data in real app)
const WORKFLOW_COUNT = 12;
const GUIDE_COUNT = 13;

export default function AdminPage() {
  const { user } = useApp();
  const router = useRouter();

  // Redirect if not contributor or senior_admin
  useEffect(() => {
    if (user && user.role !== "contributor" && user.role !== "senior_admin") {
      router.push("/");
    }
  }, [user, router]);

  if (!user || (user.role !== "contributor" && user.role !== "senior_admin")) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500">
            You need Creator Admin or Senior Admin permissions to access this page.
          </p>
        </div>
      </MainLayout>
    );
  }

  const roleLabels: Record<string, string> = {
    contributor: "Creator Admin",
    senior_admin: "Senior Admin",
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Pencil className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Creator Admin Dashboard</h1>
              <p className="text-white/80 mt-1">
                Logged in as {user.name} ({roleLabels[user.role] || user.role})
              </p>
            </div>
          </div>
        </div>

        {/* Admin cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Workflows card */}
          <Link href="/admin/workflows" className="block no-underline">
            <div className="bg-white rounded-xl border-2 border-gray-100 p-6 hover:border-rose-300 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-rose-700 rounded-xl flex items-center justify-center">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-rose-600 transition-colors">
                    Workflows
                  </h2>
                  <p className="text-gray-500">{WORKFLOW_COUNT} referral workflows</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Edit and manage referral workflows. Add new steps, update forms, and customize case note templates.
              </p>
              <div className="flex items-center gap-2 text-rose-600 font-semibold group-hover:gap-3 transition-all">
                Manage Workflows
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </Link>

          {/* Guides card */}
          <Link href="/admin/guides" className="block no-underline">
            <div className="bg-white rounded-xl border-2 border-gray-100 p-6 hover:border-emerald-300 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                    Guides
                  </h2>
                  <p className="text-gray-500">{GUIDE_COUNT} how-to guides</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Edit and manage how-to guides. Add new content, update steps, and include helpful tips.
              </p>
              <div className="flex items-center gap-2 text-emerald-600 font-semibold group-hover:gap-3 transition-all">
                Manage Guides
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </Link>
        </div>

        {/* Info box */}
        <div className="bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-800 mb-2">About Content Editing</h3>
          <p className="text-gray-600 mb-3">
            As a {roleLabels[user.role] || user.role}, you can edit workflows and guides. Changes are saved to local storage in this demo version.
          </p>
          {user.role === "senior_admin" && (
            <p className="text-gray-600">
              <strong>Senior Admin:</strong> You can also delete content and manage other contributors.
            </p>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
