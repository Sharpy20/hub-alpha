"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, Button } from "@/components/ui";
import { Shield, Lock, FileText, Mail, Database, Trash2, Check, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function GdprPage() {
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
            Information about data protection and privacy in Inpatient Hub
          </p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-nhs-black flex items-center gap-2">
              <Shield className="w-6 h-6 text-nhs-blue" />
              Demo Version Notice
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-nhs-dark-grey">
              This is a demonstration version of Inpatient Hub. It contains:
            </p>
            <ul className="list-disc list-inside space-y-2 text-nhs-dark-grey">
              <li>
                <strong>Fictional patient data</strong> - All patient names and
                information are made up for demonstration purposes
              </li>
              <li>
                <strong>Public contact information</strong> - Phone numbers and
                emails are from publicly available sources
              </li>
              <li>
                <strong>Placeholder internal data</strong> - Internal Trust
                numbers are marked as "FOCUS login needed"
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
              When deployed as a live system, Inpatient Hub will:
            </p>
            <ul className="list-disc list-inside space-y-2 text-nhs-dark-grey">
              <li>
                Be hosted on Trust infrastructure or approved cloud services
              </li>
              <li>
                Require Trust authentication (NHS OpenAthens or equivalent)
              </li>
              <li>
                Store minimal patient data (names only, no NHS numbers in Light/Medium versions)
              </li>
              <li>Maintain comprehensive audit logs for all actions</li>
              <li>
                Comply with NHS Data Security and Protection Toolkit requirements
              </li>
              <li>
                Undergo Data Protection Impact Assessment (DPIA) before processing
                any PII
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
              Data Retention (Light Version)
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-nhs-dark-grey">
              In this demo (Light) version of Inpatient Hub:
            </p>
            <ul className="list-disc list-inside space-y-2 text-nhs-dark-grey">
              <li>
                <strong>Browser storage only</strong> - All data is stored in
                your browser's localStorage
              </li>
              <li>
                <strong>No external transmission</strong> - No data is sent to
                or stored on external servers
              </li>
              <li>
                <strong>Automatic clearing</strong> - Data is removed when you
                clear your browser data/cache
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
                Medium+ Version Retention
              </h3>
              <p className="text-sm text-nhs-dark-grey">
                In future Medium, Max, and Max+ versions deployed on Trust
                infrastructure, different data retention policies will apply:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-nhs-mid-grey mt-2">
                <li>
                  Data stored on secure Trust/Supabase servers
                </li>
                <li>
                  Retention periods aligned with NHS records management policies
                </li>
                <li>
                  Audit logs maintained for compliance
                </li>
                <li>
                  Users can request data deletion through formal IG channels
                </li>
              </ul>
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
                href="/feedback"
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
              For questions about this demo, contact the project owner.
            </p>
          </CardContent>
        </Card>

        {/* Data Sources link - less prominent placement */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            For transparency on information sources used in this application, view the{" "}
            <Link href="/data-sources" className="text-gray-500 hover:text-indigo-600 underline">
              Data Sources Audit Log
            </Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
