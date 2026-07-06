"use client";

import { MainLayout } from "@/components/layout";
import { Card, CardContent, CardHeader } from "@/components/ui";
import {
  Info,
  Database,
  BadgeCheck,
  Clock,
  Wrench,
  MessageSquare,
  ShieldAlert,
  Unplug,
} from "lucide-react";
import Link from "next/link";
import { useV2Href } from "@/lib/hooks/useV2";
// PERFORMANCE: import the catalog module directly (not the ui barrel) - it is
// the lightest file that knows every guide id. See the note in components/ui/index.ts.
import { ALL_GUIDES } from "@/lib/data/guides/catalog";
import { guideApproval, type ApprovalStatus } from "@/lib/data/approval-status";
import { version as appVersion } from "../../../package.json";

// Live counts, computed from the same data the guides index uses. Guides with
// no explicit entry in GUIDE_APPROVAL fall back to amber (awaiting review),
// exactly as guideApproval() resolves them for the badge on each tile.
const COUNTS = ALL_GUIDES.reduce(
  (acc, g) => {
    acc[guideApproval(g.id)] += 1;
    return acc;
  },
  { green: 0, amber: 0, red: 0 } as Record<ApprovalStatus, number>
);
const TOTAL_GUIDES = ALL_GUIDES.length;

export default function AboutPage() {
  const link = useV2Href();

  return (
    <MainLayout>
      <div className="about-page max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-nhs-black">About wardHub</h1>
          <p className="text-nhs-dark-grey mt-1">
            What this is, where your data goes, and how the content gets checked
          </p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-nhs-black flex items-center gap-2">
              <Info className="w-6 h-6 text-nhs-blue" />
              What wardHub is
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-nhs-dark-grey">
              One place for the ward&apos;s guides, referrals, links, training
              quiz and team diary. Instead of hunting through the intranet or
              asking whoever happens to be on shift, staff open wardHub and the
              process is laid out step by step.
            </p>
            <p className="text-nhs-dark-grey">
              It was built by a Ward NIC at Derbyshire Healthcare NHS Foundation
              Trust as a personal development project. It is not yet a
              trust-approved system - treat it as a demo, and check the source
              document before acting on anything clinical.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-nhs-black flex items-center gap-2">
              <Database className="w-6 h-6 text-nhs-green" />
              Where your data lives
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-nhs-dark-grey">
              Everything you type stays in this browser, in localStorage on
              this device. Nothing is sent to any server: there are no
              accounts, no tracking, no analytics and no cookies. Even the
              fonts are self-hosted, so a page view makes no request to any
              third party. The site&apos;s security policy (CSP) restricts
              connections to the site itself, which means &quot;no data
              leaves&quot; is technically enforced by the browser, not just a
              promise.
            </p>
            <ul className="list-disc list-inside space-y-2 text-nhs-dark-grey">
              <li>
                Logging out clears anything patient-related (the referral chase
                log and care review tracker)
              </li>
              <li>
                The GDPR page has a clear-my-data button that wipes everything
                in one click
              </li>
              <li>
                All patient and staff names in the demo are fictional - no real
                patient data anywhere
              </li>
            </ul>
            <p className="text-sm text-nhs-mid-grey">
              The full detail, including what each localStorage key holds, is
              on the{" "}
              <Link
                href={link("/gdpr")}
                className="text-nhs-blue hover:text-nhs-dark-blue font-medium"
              >
                GDPR &amp; Privacy page
              </Link>
              .
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-nhs-blue">
          <CardHeader>
            <h2 className="text-xl font-bold text-nhs-black flex items-center gap-2">
              <BadgeCheck className="w-6 h-6 text-nhs-blue" />
              How content is checked
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-nhs-dark-grey">
              Every guide and link carries a traffic-light status badge. Green
              means checked and approved. Amber means built but awaiting
              review. Red means still in development - treat it as a draft.
              Guides that haven&apos;t been explicitly reviewed default to
              amber, because &quot;awaiting review&quot; is the honest baseline.
            </p>
            <p className="text-nhs-dark-grey">
              Here is where the {TOTAL_GUIDES} guides stand right now. These
              numbers come straight from the live approval data, not from a
              hand-written claim:
            </p>
            <div className="grid grid-cols-3 gap-3" role="list" aria-label="Guide approval counts">
              <div
                role="listitem"
                className="rounded-lg border-2 border-emerald-300 bg-emerald-50 p-4 text-center"
              >
                <BadgeCheck className="w-6 h-6 text-emerald-700 mx-auto" aria-hidden="true" />
                <p className="text-3xl font-bold text-emerald-700 mt-1">
                  {COUNTS.green}
                </p>
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 mt-1">
                  Passed
                </p>
              </div>
              <div
                role="listitem"
                className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4 text-center"
              >
                <Clock className="w-6 h-6 text-amber-700 mx-auto" aria-hidden="true" />
                <p className="text-3xl font-bold text-amber-700 mt-1">
                  {COUNTS.amber}
                </p>
                <p className="text-xs font-bold uppercase tracking-wide text-amber-700 mt-1">
                  Awaiting review
                </p>
              </div>
              <div
                role="listitem"
                className="rounded-lg border-2 border-rose-300 bg-rose-50 p-4 text-center"
              >
                <Wrench className="w-6 h-6 text-rose-700 mx-auto" aria-hidden="true" />
                <p className="text-3xl font-bold text-rose-700 mt-1">
                  {COUNTS.red}
                </p>
                <p className="text-xs font-bold uppercase tracking-wide text-rose-700 mt-1">
                  In development
                </p>
              </div>
            </div>
            <p className="text-sm text-nhs-mid-grey">
              Most guides are amber on purpose. Green is reserved for formal
              sign-off, and nothing gets waved through to make the numbers look
              better.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-nhs-black flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-nhs-purple" />
              Report a problem
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-nhs-dark-grey">
              Spotted something wrong, out of date or missing? Use the{" "}
              <Link
                href={link("/feedback")}
                className="text-nhs-blue hover:text-nhs-dark-blue font-medium"
              >
                feedback page
              </Link>{" "}
              - it takes a minute and every report gets read. Every guide also
              has a quick thumbs up or down at the bottom, so a &quot;this
              didn&apos;t help&quot; takes one tap.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-nhs-black flex items-center gap-2">
              <Unplug className="w-6 h-6 text-nhs-orange" />
              What this demo is not
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-2 text-nhs-dark-grey">
              <li>
                <strong>Not connected to SystmOne</strong> or any other
                clinical system - nothing here reads or writes clinical records
              </li>
              <li>
                <strong>Not for real patient data</strong> - it is a demo with
                fictional patients and staff
              </li>
              <li>
                <strong>Not a replacement for trust policy</strong> - guides
                summarise and link to the source document on FOCUS so you can
                always check the original
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-nhs-mid-grey space-y-1 pt-2">
          <p className="flex items-center justify-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
            wardHub v{appVersion} - alpha demo, not for clinical use
          </p>
          <p>Page last reviewed: 5 July 2026</p>
        </div>
      </div>
    </MainLayout>
  );
}
