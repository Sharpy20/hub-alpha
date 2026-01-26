"use client";

import { MainLayout } from "@/components/layout";
import { Card, CardContent, CardHeader } from "@/components/ui";
import { Shield, Lock, FileText, Mail, Database } from "lucide-react";
import Link from "next/link";

export default function GdprPage() {
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
