"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, Button } from "@/components/ui";
import { Shield, Lock, FileText, Mail, Database, Trash2, Check, ShieldAlert, Film } from "lucide-react";
import Link from "next/link";
import { useV2Href } from "@/lib/hooks/useV2";

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
              Four short scenes: how the guides get written, who checks them, and
              where anything you enter ends up. It shows the model{" "}
              <strong>at full build</strong>, not the demo running today - this
              demo stores nothing on a server and no database is connected.
            </p>
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
