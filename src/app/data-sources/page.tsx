"use client";

import { MainLayout } from "@/components/layout";
import { Card, CardContent, CardHeader } from "@/components/ui";
import { FileText, Calendar, Shield, AlertTriangle, ExternalLink } from "lucide-react";
import Link from "next/link";

interface DataSource {
  id: string;
  name: string;
  type: "workflow" | "guide" | "bookmark" | "contact";
  description: string;
  source: string;
  sourceType: "public" | "internal" | "placeholder";
  addedDate: string;
  lastVerified: string;
  notes?: string;
}

const DATA_SOURCES: DataSource[] = [
  // Workflows
  {
    id: "imha-advocacy",
    name: "IMHA / Advocacy Referral",
    type: "workflow",
    description: "Independent Mental Health Advocate referral process",
    source: "POhWER (Derby City) and Cloverleaf (County) public websites",
    sourceType: "public",
    addedDate: "2026-01-24",
    lastVerified: "2026-01-26",
    notes: "Contact details verified via public websites: pohwer.net and cloverleaf-advocacy.co.uk",
  },
  {
    id: "picu",
    name: "PICU Referral",
    type: "workflow",
    description: "Psychiatric Intensive Care Unit transfer process",
    source: "Internal trust documentation - contact details anonymised",
    sourceType: "placeholder",
    addedDate: "2026-01-24",
    lastVerified: "2026-01-26",
    notes: "Phone/email use placeholder values (01234 567890, example@nhs.net) - real details available in Max+ version via FOCUS",
  },
  {
    id: "safeguarding",
    name: "Safeguarding Adults",
    type: "workflow",
    description: "Adult safeguarding referral process",
    source: "Derby City Council and Derbyshire County Council public websites",
    sourceType: "public",
    addedDate: "2026-01-24",
    lastVerified: "2026-01-26",
    notes: "MASH contact details from public council websites",
  },
  {
    id: "safeguarding-children",
    name: "Safeguarding Children",
    type: "workflow",
    description: "Children safeguarding referral (Starting Point)",
    source: "Derbyshire Safeguarding Children Partnership public website",
    sourceType: "public",
    addedDate: "2026-01-26",
    lastVerified: "2026-01-26",
  },
  {
    id: "homeless-discharge",
    name: "Housing / Duty to Refer",
    type: "workflow",
    description: "Homeless discharge support and Duty to Refer process",
    source: "Internal trust homeless worker documentation + public council websites",
    sourceType: "placeholder",
    addedDate: "2026-01-24",
    lastVerified: "2026-01-26",
    notes: "Some contact details use placeholders - accommodation lists from internal sources",
  },
  {
    id: "social-care",
    name: "Social Care Referral",
    type: "workflow",
    description: "Adult social care assessment referral",
    source: "Derbyshire County Council and Derby City Council public websites",
    sourceType: "public",
    addedDate: "2026-01-24",
    lastVerified: "2026-01-26",
  },
  {
    id: "dietitian",
    name: "Dietitian Referral",
    type: "workflow",
    description: "Inpatient dietitian referral",
    source: "Internal trust referral form - contact details anonymised",
    sourceType: "placeholder",
    addedDate: "2026-01-24",
    lastVerified: "2026-01-26",
    notes: "Uses placeholder email (dietitian.referrals@example.nhs.net)",
  },
  {
    id: "tissue-viability",
    name: "Tissue Viability",
    type: "workflow",
    description: "Wound care and tissue viability referral",
    source: "Internal trust tissue viability team documentation",
    sourceType: "placeholder",
    addedDate: "2026-01-26",
    lastVerified: "2026-01-26",
    notes: "Uses placeholder contact details",
  },
  {
    id: "edt",
    name: "Early Discharge Team",
    type: "workflow",
    description: "EDT referral for discharge planning support",
    source: "Internal EDT flow chart and referral prompt documents",
    sourceType: "placeholder",
    addedDate: "2026-01-26",
    lastVerified: "2026-01-26",
    notes: "Contact details use placeholders - workflow based on internal EDT documentation",
  },
  {
    id: "erp",
    name: "Emotional Regulation Programme",
    type: "workflow",
    description: "ERP/DBT pathway referral",
    source: "Internal ERP referral form and guidance v5",
    sourceType: "placeholder",
    addedDate: "2026-01-26",
    lastVerified: "2026-01-26",
    notes: "Includes DBT and SCM pathways",
  },
  {
    id: "ctr-dsp",
    name: "CTR / DSP Review",
    type: "workflow",
    description: "Care Treatment Review and Dynamic Support Plan for ASD/LD patients",
    source: "JUCD keyworking referral form and DSP consent guidance (April 2024)",
    sourceType: "public",
    addedDate: "2026-01-26",
    lastVerified: "2026-01-26",
    notes: "Required for all patients with Autism or Learning Disability",
  },
  // Guides
  {
    id: "news2",
    name: "NEWS2 Observations",
    type: "guide",
    description: "National Early Warning Score recording guide",
    source: "Royal College of Physicians NEWS2 documentation (public)",
    sourceType: "public",
    addedDate: "2026-01-24",
    lastVerified: "2026-01-26",
  },
  {
    id: "mse",
    name: "Mental State Examination",
    type: "guide",
    description: "Ten point guide to MSE",
    source: "Internal nursing tools documentation",
    sourceType: "internal",
    addedDate: "2026-01-26",
    lastVerified: "2026-01-26",
  },
  {
    id: "seclusion",
    name: "Seclusion Process",
    type: "guide",
    description: "Seclusion review timings and process",
    source: "Internal seclusion guides (nurse and medic versions)",
    sourceType: "internal",
    addedDate: "2026-01-26",
    lastVerified: "2026-01-26",
    notes: "Based on MHA Code of Practice requirements",
  },
  {
    id: "named-nurse",
    name: "Named Nurse Responsibilities",
    type: "guide",
    description: "Named nurse crib sheet and care planning guide",
    source: "Internal named nurse help documentation",
    sourceType: "internal",
    addedDate: "2026-01-26",
    lastVerified: "2026-01-26",
  },
  {
    id: "care-planning",
    name: "Care Planning",
    type: "guide",
    description: "Care planning and risk management guidance",
    source: "Internal care planning guidance and templates",
    sourceType: "internal",
    addedDate: "2026-01-26",
    lastVerified: "2026-01-26",
  },
  {
    id: "mha-sections",
    name: "MHA Section Checklist",
    type: "guide",
    description: "Mental Health Act section requirements checklist",
    source: "Internal MHA documentation",
    sourceType: "internal",
    addedDate: "2026-01-26",
    lastVerified: "2026-01-26",
    notes: "Reference to MHA Code of Practice (public)",
  },
  {
    id: "tribunal-report",
    name: "Tribunal Report Writing",
    type: "guide",
    description: "Nursing tribunal report guidance",
    source: "Internal tribunal report template",
    sourceType: "internal",
    addedDate: "2026-01-26",
    lastVerified: "2026-01-26",
  },
  // Bookmarks
  {
    id: "samaritans",
    name: "Samaritans",
    type: "bookmark",
    description: "24/7 emotional support helpline",
    source: "Samaritans public website",
    sourceType: "public",
    addedDate: "2026-01-24",
    lastVerified: "2026-01-26",
  },
  {
    id: "nhs111",
    name: "NHS 111",
    type: "bookmark",
    description: "NHS urgent care advice",
    source: "NHS public website",
    sourceType: "public",
    addedDate: "2026-01-24",
    lastVerified: "2026-01-26",
  },
];

export default function DataSourcesPage() {
  const workflows = DATA_SOURCES.filter((d) => d.type === "workflow");
  const guides = DATA_SOURCES.filter((d) => d.type === "guide");
  const bookmarks = DATA_SOURCES.filter((d) => d.type === "bookmark");

  const getSourceBadge = (sourceType: string) => {
    switch (sourceType) {
      case "public":
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Public</span>;
      case "internal":
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Internal</span>;
      case "placeholder":
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">Placeholder Data</span>;
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Sources Audit Log</h1>
          <p className="text-gray-600 mt-2">
            Transparency record of all data sources used in the Inpatient Hub application.
          </p>
        </div>

        {/* Legend */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              Source Type Legend
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Public</span>
                <span className="text-gray-600">Information from publicly accessible sources (websites, published documents)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Internal</span>
                <span className="text-gray-600">From internal trust documentation (available in Medium+ version)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">Placeholder</span>
                <span className="text-gray-600">Contact details anonymised with placeholder values</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Demo Version Notice</p>
            <p className="text-sm text-amber-700 mt-1">
              This Light version uses placeholder data for internal contact details.
              Real contact information is only available in Medium+ versions deployed on Trust infrastructure.
              Placeholder values include: 01onal 234 5678, example@nhs.net, example@email.com
            </p>
          </div>
        </div>

        {/* Workflows */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-rose-600" />
            Referral Workflows ({workflows.length})
          </h2>
          <div className="space-y-3">
            {workflows.map((source) => (
              <Card key={source.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{source.name}</h3>
                        {getSourceBadge(source.sourceType)}
                      </div>
                      <p className="text-sm text-gray-600">{source.description}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        <strong>Source:</strong> {source.source}
                      </p>
                      {source.notes && (
                        <p className="text-xs text-gray-400 mt-1 italic">{source.notes}</p>
                      )}
                    </div>
                    <div className="text-right text-xs text-gray-400">
                      <p>Added: {source.addedDate}</p>
                      <p>Verified: {source.lastVerified}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Guides */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            How-To Guides ({guides.length})
          </h2>
          <div className="space-y-3">
            {guides.map((source) => (
              <Card key={source.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{source.name}</h3>
                        {getSourceBadge(source.sourceType)}
                      </div>
                      <p className="text-sm text-gray-600">{source.description}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        <strong>Source:</strong> {source.source}
                      </p>
                      {source.notes && (
                        <p className="text-xs text-gray-400 mt-1 italic">{source.notes}</p>
                      )}
                    </div>
                    <div className="text-right text-xs text-gray-400">
                      <p>Added: {source.addedDate}</p>
                      <p>Verified: {source.lastVerified}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bookmarks Sample */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            Bookmarks (Sample - {bookmarks.length} shown)
          </h2>
          <div className="space-y-3">
            {bookmarks.map((source) => (
              <Card key={source.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{source.name}</h3>
                        {getSourceBadge(source.sourceType)}
                      </div>
                      <p className="text-sm text-gray-600">{source.description}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        <strong>Source:</strong> {source.source}
                      </p>
                    </div>
                    <div className="text-right text-xs text-gray-400">
                      <p>Verified: {source.lastVerified}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Full bookmark list available on the <Link href="/bookmarks" className="text-indigo-600 hover:underline">Bookmarks page</Link>.
          </p>
        </div>

        {/* Footer */}
        <Card>
          <CardContent className="p-4 text-center text-sm text-gray-500">
            <p>
              This audit log is maintained as part of the Inpatient Hub GDPR compliance.
              Last updated: 26 January 2026
            </p>
            <p className="mt-2">
              <Link href="/gdpr" className="text-indigo-600 hover:underline">
                Return to GDPR Information
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
