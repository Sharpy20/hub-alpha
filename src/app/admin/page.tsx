"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout";
import { useApp } from "@/app/providers";
import Link from "next/link";
import { FileText, BookOpen, ArrowRight, Pencil, Shield, Bookmark, Settings, Sparkles, AlertTriangle } from "lucide-react";
import { bookmarks } from "@/lib/data/bookmarks";

// Dynamic counts from data
const WORKFLOW_COUNT = 12; // Defined inline in referrals/[id] page
const GUIDE_COUNT = 13;    // Defined inline in how-to/[id] page
const BOOKMARK_COUNT = bookmarks.length;

export default function AdminPage() {
  const { user } = useApp();
  const [showCreatorRequest, setShowCreatorRequest] = useState(false);

  if (!user) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Please Log In</h1>
          <p className="text-gray-500">You need to be logged in to access admin features.</p>
        </div>
      </MainLayout>
    );
  }

  const isContentAdmin = user.isContributor || user.role === "manager" || user.role === "senior_admin";
  const isWardAdmin = user.role === "ward_admin" || user.role === "manager" || user.role === "senior_admin";

  const roleLabels: Record<string, string> = {
    staff: "Staff",
    lead: "Lead",
    manager: "Manager",
    ward_admin: "Ward Admin",
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
                {user.isContributor && " + Contributor"}
              </p>
            </div>
          </div>
        </div>

        {/* Request Creator Privileges - shown for users without content admin access */}
        {!isContentAdmin && (
          <div className="bg-white rounded-xl border-2 border-amber-200 p-6 max-w-lg mx-auto">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">Want to create content?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Contributor privileges let you create and edit workflows, guides, and bookmarks. This is a separate privilege that can be added to any role.
                </p>
                {showCreatorRequest ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-sm text-amber-800 font-medium mb-1">Request submitted</p>
                    <p className="text-xs text-amber-700">
                      Needs approval from a Ward Admin or Manager, plus completion of Creator Training.
                      Your request has been noted - please speak to your Ward Admin or Manager.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCreatorRequest(true)}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                  >
                    Request Creator Privileges
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Ward Admin cards */}
        {isWardAdmin && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Ward Settings card */}
            <Link href="/admin/ward-settings" className="block no-underline">
              <div className="bg-white rounded-xl border-2 border-gray-100 p-6 hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Settings className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      Ward Settings
                    </h2>
                    <p className="text-gray-500">Configure your ward</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 text-sm">
                  Patient entry fields, task categories, shifts, discharge checklist, and more.
                </p>
                <div className="flex items-center gap-2 text-indigo-600 font-semibold group-hover:gap-3 transition-all text-sm">
                  Configure
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Content Admin cards */}
        {isContentAdmin && (
        <div className="grid md:grid-cols-3 gap-6">
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
                  <p className="text-gray-500">{WORKFLOW_COUNT} referrals</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                Edit referral workflows, steps, forms, and case note templates.
              </p>
              <div className="flex items-center gap-2 text-rose-600 font-semibold group-hover:gap-3 transition-all text-sm">
                Manage
                <ArrowRight className="w-4 h-4" />
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
              <p className="text-gray-600 mb-4 text-sm">
                Edit how-to guides, add content, steps, and helpful tips.
              </p>
              <div className="flex items-center gap-2 text-emerald-600 font-semibold group-hover:gap-3 transition-all text-sm">
                Manage
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Bookmarks card */}
          <Link href="/admin/bookmarks" className="block no-underline">
            <div className="bg-white rounded-xl border-2 border-gray-100 p-6 hover:border-amber-300 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center">
                  <Bookmark className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                    Bookmarks
                  </h2>
                  <p className="text-gray-500">{BOOKMARK_COUNT} bookmarks</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                Edit bookmarks, links, and descriptions.{user.role === "senior_admin" ? " Manage categories." : ""}
              </p>
              <div className="flex items-center gap-2 text-amber-600 font-semibold group-hover:gap-3 transition-all text-sm">
                Manage
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>
        )}

        {/* Info box */}
        {(isContentAdmin || isWardAdmin) && (
        <div className="bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-800 mb-2">About Content Editing</h3>
          <p className="text-gray-600 mb-3">
            As a {roleLabels[user.role] || user.role}{user.isContributor ? " with Contributor privileges" : ""}, you can edit workflows and guides. Changes are saved to local storage in this demo version.
          </p>
          {user.role === "senior_admin" && (
            <p className="text-gray-600">
              <strong>Senior Admin:</strong> You can also delete content and manage other contributors.
            </p>
          )}
        </div>
        )}
      </div>
    </MainLayout>
  );
}
