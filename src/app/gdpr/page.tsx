"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, Button } from "@/components/ui";
import { Shield, Lock, FileText, Mail, Database, Trash2, Check, ShieldAlert, Film } from "lucide-react";
import Link from "next/link";
import { useV2Href } from "@/lib/hooks/useV2";

// Text alternative for the explainer video (WCAG 2.1 1.2.1). The film is silent
// and entirely text-on-screen, so this is a straight transcript of the cards in
// order, not a description of narration. Chapter times match the rail shown on
// the right of the frame. If the video is re-rendered, re-check this.
const VIDEO_TRANSCRIPT: { time: string; title: string; lines: string[] }[] = [
  {
    time: "0:00",
    title: "Chapter 1 - the problem",
    lines: [
      "Labels drift across the screen: Intranet. Email chains. Policy PDFs. Sticky notes. A filing cabinet. Shared drive. The person who just left. That one folder.",
      "“A ward runs on knowledge.”",
      "“But it is scattered - and new starters are left to hunt for it.”",
      "“It should be in one place, and always current.”",
    ],
  },
  {
    time: "0:15",
    title: "Chapter 2 - this is wardHub",
    lines: [
      "Title card: “This is wardHub. A framework for turning knowledge into action. wardHub.live”",
      "The idea - “Built to be built on”. Three cards: Any ward. Any clinic. Any team that runs on procedures. Caption: “wardHub is a framework teams build on - not a finished, fixed app. The same platform fits any team that works to set procedures.”",
      "How it works - “Feed it your SOPs”. An SOP document converts into an interactive guide, “Rapid tranquillisation”, whose four steps tick off one by one: Check the criteria. Complete the form. Monitor and record. Where to send it. Caption: “Feed in a policy or SOP. Your procedures become interactive digital guides.”",
      "Real content, today - “Not a mock-up”. Three live guides: MHA detention papers (Pick the pathway, Check each form, Scrutiny checklist); Safeguarding referral (Confirm the concern, Complete the form, Where to send it); Leave and discharge (Plan the leave, Safety checks, Update the record). Caption: “This demo is populated with real SOPs from Derbyshire Healthcare NHS Foundation Trust.”",
      "In practice - “Two ways to use them”. On its own: the Section 17 leave guide. In the team diary: a day list reading Depot clinic - bay 2, Section 17 leave review (with a Guide badge), Fridge temperature check - the two linked by a line marked “linked to the task”. Caption: “Open a guide on its own when you need it. Or reach it from a task in a simple team diary.”",
      "“Let's take a look. wardHub.live”",
    ],
  },
  {
    time: "1:22",
    title: "Chapter 3 - where the data goes",
    lines: [
      "01 - The build: “AI builds the scaffold”. An AI (labelled “AI, e.g. Claude - builds the structure”) draws three empty shelves. Two badges appear: “No patient data · No trust documents” and “Replaceable by any tool”. Caption: “The AI builds an empty structure - the shelves and the frame. It never sees patient data or trust documents.”",
      "02 - The Trust fills it: “Inside the Trust boundary”. Within a box marked “Trust M365 boundary”, three sources - Policy Library, SOPs, Partner forms - feed Copilot agents, which “read policy, draft a guide”. A guide card, “Emotion Regulation referral”, turns from “In development” (red) to “Signed off” (green) and is stamped “Approved for the ward”. Caption: “Copilot agents draft a guide from Trust policy, SOPs and partner forms. A person edits it and signs it off. Red to green.”",
      "03 - The boundary holds: “The data stays inside”. Inside a box marked “Trust boundary”, “Entered on the ward - tasks, notes, sign-off” flows into the “Trust datastore - Supabase (demo) · Trust infra (live)”, which copies out to SystmOne, “the record”. A red line from “Any AI outside the boundary” is blocked at the wall. Caption: “Everything entered stays inside the Trust boundary. It copies out to SystmOne. Nothing flows back to any AI.”",
      "Closing card: “wardHub. AI builds the shelves. The Trust writes the books, checks them, and keeps them.” Footer badge: “Illustration of the full build. Not running today.”",
    ],
  },
  {
    time: "2:52",
    title: "Chapter 4 - the ask",
    lines: [
      "“Back a two-ward pilot. My ward, plus one where the team doesn't know me - for honest feedback.”",
      "Low-effort start - keep building on today's scaffold.",
      "NHS login, with the data on Trust infrastructure.",
      "Every guide authored and signed off by named Trust approvers.",
      "“It needs a senior sponsor to carry it forward.”",
    ],
  },
  {
    time: "3:10",
    title: "Chapter IG - the whole thing on one board",
    lines: [
      "A single diagram headed “Inside the Trust”.",
      "Outside the box: External build tools - marked “never reaches the policies or the data”.",
      "Inside the box: The Library - 470 policies, SOPs, guidance. M365 Copilot - agents read the Trust's own library. The Guides - published in the Trust's own system.",
      "The Data: “Everything staff enter. Every name. Every record. Stored inside the Trust. Never sent anywhere else.”",
      "Out: SystmOne, the patient record - the arrow is marked “copies out”, and back the other way, “nothing comes back”.",
      "Key: Structure - built with external tools. Guides - written inside the Trust, checked by a person. Data - never leaves the Trust.",
    ],
  },
];

export default function GdprPage() {
  const link = useV2Href();
  const [dataCleared, setDataCleared] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleClearData = () => {
    setIsClearing(true);

    // Clear all localStorage data
    if (typeof window !== "undefined") {
      localStorage.clear();
    }

    // Show confirmation
    setTimeout(() => {
      setIsClearing(false);
      setDataCleared(true);

      // Reset confirmation after 3 seconds
      setTimeout(() => {
        setDataCleared(false);
      }, 3000);
    }, 500);
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-nhs-black">GDPR & Privacy</h1>
          <p className="text-nhs-dark-grey mt-1">
            Information about data protection and privacy in wardHub
          </p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-nhs-black flex items-center gap-2">
              <Film className="w-6 h-6 text-nhs-blue" />
              Watch: where the data goes
            </h2>
            <p className="text-sm text-nhs-dark-grey mt-1">
              Under 4 minutes. No sound - every word is on screen.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <video
              controls
              playsInline
              preload="metadata"
              className="w-full rounded-lg bg-black"
              aria-label="wardHub explainer: how guides are written and where data goes"
            >
              <source src="/video/wardhub-explainer.mp4" type="video/mp4" />
              Your browser cannot play this video. Download it instead:{" "}
              <a href="/video/wardhub-explainer.mp4">wardhub-explainer.mp4</a>
            </video>
            <p className="text-sm text-nhs-dark-grey">
              Five chapters: what the problem is, what wardHub is, where the data
              goes, the ask, and the whole thing on one board. It shows the model{" "}
              <strong>at full build</strong>, not the demo running today - the
              film names Supabase as the datastore, but nothing in this demo is
              sent to it. Chapter 3 (from 1:22) and the closing board are the
              data-protection parts.
            </p>

            <details className="group border border-gray-200 rounded-lg">
              <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-nhs-blue hover:bg-nhs-pale-grey rounded-lg">
                Read what the video says
              </summary>
              <div className="px-4 pb-4 pt-1 space-y-4 border-t border-gray-200">
                <p className="text-xs text-nhs-mid-grey">
                  The film has no narration - every word is on screen. This is
                  what appears, in order.
                </p>
                {VIDEO_TRANSCRIPT.map((chapter) => (
                  <div key={chapter.time}>
                    <h3 className="text-sm font-semibold text-nhs-black">
                      <span className="text-nhs-mid-grey font-normal tabular-nums mr-2">
                        {chapter.time}
                      </span>
                      {chapter.title}
                    </h3>
                    <ul className="list-disc list-outside ml-5 mt-1 space-y-1">
                      {chapter.lines.map((line, i) => (
                        <li key={i} className="text-sm text-nhs-dark-grey">
                          {line}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </details>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-nhs-black flex items-center gap-2">
              <Shield className="w-6 h-6 text-nhs-blue" />
              Demo Version Notice
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-nhs-dark-grey">
              This is a demonstration version of wardHub. It contains:
            </p>
            <ul className="list-disc list-inside space-y-2 text-nhs-dark-grey">
              <li>
                <strong>Fictional patient data</strong> - All patient names and
                information are made up for demonstration purposes
              </li>
              <li>
                <strong>Public contact information</strong> - Publicly listed
                phone numbers and services (Samaritans, NHS 111, advocacy
                providers) are real and safe to use
              </li>
              <li>
                <strong>Internal numbers hidden</strong> - Trust-internal
                numbers and extensions show as "Hidden in demo mode"
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-nhs-black flex items-center gap-2">
              <Lock className="w-6 h-6 text-nhs-green" />
              Live Version (Future)
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-nhs-dark-grey">
              Before wardHub is used for real ward work, it will:
            </p>
            <ul className="list-disc list-inside space-y-2 text-nhs-dark-grey">
              <li>
                Move to Trust infrastructure or a Trust-approved hosting arrangement
              </li>
              <li>
                Require Trust authentication - no open access
              </li>
              <li>
                Complete a Data Protection Impact Assessment (DPIA) and clinical
                safety review (DCB0129) before any real patient data is processed
              </li>
              <li>Keep audit logs and align with NHS Data Security and Protection Toolkit requirements</li>
              <li>
                Store the minimum patient data the ward actually needs, agreed with
                the Trust's IG team
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-nhs-black flex items-center gap-2">
              <FileText className="w-6 h-6 text-nhs-purple" />
              Your Responsibilities
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-nhs-dark-grey">
              When using this tool, remember:
            </p>
            <ul className="list-disc list-inside space-y-2 text-nhs-dark-grey">
              <li>
                <strong>Do not enter real patient information</strong> in this
                demo version
              </li>
              <li>
                Delete completed referral forms from your computer when no longer
                needed
              </li>
              <li>
                Follow Trust information governance policies at all times
              </li>
              <li>
                Report any data breaches through normal Trust channels (Datix)
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-nhs-black flex items-center gap-2">
              <Database className="w-6 h-6 text-nhs-orange" />
              Data Retention (This Demo)
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-nhs-dark-grey">
              In this demo version of wardHub:
            </p>
            <ul className="list-disc list-inside space-y-2 text-nhs-dark-grey">
              <li>
                <strong>Browser storage only</strong> - What you enter (login
                choice, preferences, feedback, personal links) is stored in your
                browser's localStorage and never sent to a server
              </li>
              <li>
                <strong>Tasks are not saved at all</strong> - The demo diary
                lives in the page's memory only. Claiming a job, handing one
                back or completing one is gone the moment you refresh. Nothing
                about a patient is written to your device or to a server
              </li>
              <li>
                <strong>No clinical detail about a patient</strong> - wardHub
                holds a name, a ward and the tasks attached to them. It does not
                hold MHA legal status, clinical alerts, risks or diagnoses.
                wardHub is not the clinical record and does not try to be one:
                anything it held would have nobody keeping it up to date, and
                stale clinical information is worse than none. Anything you type
                to complete a guide stays in the page while you are on it, goes
                into the case note you copy across, and is not kept
              </li>
              <li>
                <strong>No tracking</strong> - No analytics, no external scripts
                or fonts. The one cookie in use is the site password cookie
                (`site_access`), which only records that you typed the shared
                password correctly. The only party that sees any traffic is
                Vercel, which hosts the site and keeps standard request logs (as
                any web host does)
              </li>
              <li>
                <strong>Automatic clearing</strong> - Data is removed when you
                clear your browser data/cache; logging out also clears the care
                review tracker
              </li>
              <li>
                <strong>Device-specific</strong> - Data does not sync between
                devices or browsers
              </li>
            </ul>

            <div className="bg-nhs-pale-grey p-4 rounded-lg mt-4">
              <h3 className="font-semibold text-nhs-black mb-2">
                Clear Your Data
              </h3>
              <p className="text-sm text-nhs-dark-grey mb-3">
                You can clear all app data stored in your browser at any time.
                This will remove your login session, preferences, and any local
                data.
              </p>
              <Button
                onClick={handleClearData}
                variant={dataCleared ? "primary" : "outline"}
                className={`flex items-center gap-2 ${
                  dataCleared
                    ? "bg-nhs-green hover:bg-nhs-green text-white"
                    : ""
                }`}
                disabled={isClearing}
              >
                {isClearing ? (
                  <>
                    <span className="animate-spin">...</span>
                    Clearing...
                  </>
                ) : dataCleared ? (
                  <>
                    <Check className="w-4 h-4" />
                    Data Cleared
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Clear my data
                  </>
                )}
              </Button>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="font-semibold text-nhs-black mb-2">
                Future Live Version Retention
              </h3>
              <p className="text-sm text-nhs-dark-grey">
                A live deployment would store data on Trust-approved servers with
                retention aligned to NHS records management policies, audit logs,
                and deletion requests through formal IG channels. A database
                connection (Supabase) is configured in the codebase but is not
                used by this demo - no data is sent to it.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Report a Data Concern */}
        <Card className="border-2 border-nhs-blue bg-blue-50">
          <CardHeader>
            <h2 className="text-xl font-bold text-nhs-black flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-nhs-blue" />
              Report a Data Concern
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-nhs-dark-grey">
              If you have concerns about how your data is being handled, please report it.
              We take all data protection concerns seriously and will investigate promptly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={link("/feedback")}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-nhs-blue text-white rounded-md hover:bg-nhs-dark-blue transition-colors font-medium"
              >
                <ShieldAlert className="w-4 h-4" />
                Report a Concern
              </Link>
              <p className="text-sm text-nhs-mid-grey self-center">
                Or contact your Trust's IG team directly via Datix
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-nhs-black flex items-center gap-2">
              <Mail className="w-6 h-6 text-nhs-blue" />
              Contact
            </h2>
          </CardHeader>
          <CardContent>
            <p className="text-nhs-dark-grey">
              For questions about data protection in the live version, contact
              your Trust's Information Governance team.
            </p>
            <p className="text-nhs-mid-grey text-sm mt-4">
              This demo is run by the project owner (a staff nurse at Derbyshire
              Healthcare NHS Foundation Trust) as a personal development project -
              it is not yet a Trust-approved system. Questions and concerns:
              use the Feedback page.
            </p>
            <p className="text-nhs-mid-grey text-xs mt-2">
              This page last reviewed: 4 July 2026
            </p>
          </CardContent>
        </Card>

        {/* Data Sources link - less prominent placement */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            For transparency on information sources used in this application, view the{" "}
            <Link href={link("/dev-panel?section=data-sources")} className="text-gray-500 hover:text-indigo-600 underline">
              Data Sources Audit Log
            </Link>
          </p>
        </div>

        {/* Dev Panel - prominent button for IT/IG stakeholders */}
        <div className="pt-4">
          <Link
            href={link("/dev-panel")}
            className="flex items-center justify-center gap-2 p-4 bg-white border-2 border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-400 hover:shadow-md transition-all"
          >
            <Shield className="w-5 h-5" />
            Developer & Governance Panel
          </Link>
          <p className="text-xs text-gray-400 text-center mt-2">
            Technical documentation, DPIA, clinical safety, and compliance information
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
