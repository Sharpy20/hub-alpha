"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout";
import { useApp } from "@/app/providers";
import Link from "next/link";
import { FileText, ArrowRight, Pencil, Shield, Bookmark, Sparkles } from "lucide-react";
import { bookmarks } from "@/lib/data/bookmarks";
import { useV2Href, useIsV2 } from "@/lib/hooks/useV2";

// v1 (limited build) has no backend to store who has editor rights, so the
// request is a mailto to the project owner. v2 will replace this with a real
// approval flow.
const EDITOR_MAILTO =
  "mailto:michael.sharpe4@nhs.net" +
  "?subject=" +
  encodeURIComponent("wardHub - editor rights request") +
  "&body=" +
  encodeURIComponent(
    "I'd like editor rights on wardHub.\n\nName:\nRole:\nWard:\nWhich guides or areas you'd like to edit:\n",
  );

// Dynamic counts from data
const WORKFLOW_COUNT = 12; // Defined inline in referrals/[id] page
const GUIDE_COUNT = 13;    // Defined inline in how-to/[id] page
const BOOKMARK_COUNT = bookmarks.length;

export default function AdminPage() {
  const { user, setUser } = useApp();
  const link = useV2Href();
  const isV2 = useIsV2();
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

        {/* Request Creator Privileges - shown for users without content admin access
            (kept visible after a demo grant so the explanatory message shows). */}
        {(!isContentAdmin || showCreatorRequest) && (
          <div className="bg-white rounded-xl border-2 border-amber-200 p-6 max-w-lg mx-auto">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">Want to create content?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Contributor privileges let you create and edit workflows, guides, and links. This is a separate privilege that can be added to any role.
                </p>
                {isV2 ? (
                  <a
                    href={EDITOR_MAILTO}
                    className="block w-full text-center py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:shadow-lg transition-all no-underline"
                  >
                    Request editor rights
                  </a>
                ) : showCreatorRequest ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <p className="text-sm text-emerald-800 font-medium mb-1">Editor rights granted (demo)</p>
                    <p className="text-xs text-emerald-700">
                      You can now create and edit content - try the Editor cards below. In the live version this
                      request would go to a Ward Admin or Senior Admin for approval (plus Creator Training) before
                      rights are granted; here in the demo it&apos;s granted instantly so you can explore.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => { if (user) setUser({ ...user, isContributor: true }); setShowCreatorRequest(true); }}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                  >
                    Request editor rights
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content Admin cards */}
        {isContentAdmin && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Bookmarks card */}
          <Link href={link("/admin/links")} className="block no-underline">
            <div className="bg-white rounded-xl border-2 border-gray-100 p-6 hover:border-amber-300 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center">
                  <Bookmark className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                    Links
                  </h2>
                  <p className="text-gray-500">{BOOKMARK_COUNT} links</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                Edit links and descriptions.{user.role === "senior_admin" ? " Manage categories." : ""}
              </p>
              <div className="flex items-center gap-2 text-amber-600 font-semibold group-hover:gap-3 transition-all text-sm">
                Manage
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Guides card (merged referral guides + how-to guides) */}
          <Link href={link("/admin/workflows")} className="block no-underline">
            <div className="bg-white rounded-xl border-2 border-gray-100 p-6 hover:border-rose-300 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-rose-700 rounded-xl flex items-center justify-center">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-rose-600 transition-colors">
                    Guides
                  </h2>
                  <p className="text-gray-500">{WORKFLOW_COUNT} referral + {GUIDE_COUNT} how-to guides</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                Edit referral workflows, how-to guides, steps, forms, and case note templates.
              </p>
              <div className="flex items-center gap-2 text-rose-600 font-semibold group-hover:gap-3 transition-all text-sm">
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
