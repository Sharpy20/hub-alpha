"use client";

import { MainLayout } from "@/components/layout";
import { Badge } from "@/components/ui";
import { useApp } from "@/app/providers";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  X,
  Lock,
  Globe,
  Shield,
  Server,
  Zap,
  AlertTriangle,
  Info,
} from "lucide-react";

const VERSIONS = [
  {
    id: "light",
    name: "Light",
    tagline: "Public Access",
    color: "emerald",
    gradient: "from-emerald-500 to-emerald-700",
    icon: Globe,
    hosting: "Public (Vercel)",
    auth: "Demo login",
    dataLevel: "Public info only",
    description:
      "Open access version with publicly available information only. No Trust-sensitive data or patient information.",
    features: [
      { name: "Bookmarks", included: true },
      { name: "Referral Workflows", included: true },
      { name: "How-To Guides", included: true },
      { name: "Internal Phone Numbers", included: false },
      { name: "Internal Forms/SOPs", included: false },
      { name: "Ward Diary", included: false },
      { name: "Patient List", included: false },
      { name: "Assurance Dashboard", included: true, note: "Link only" },
      { name: "SystemOne Integration", included: false },
    ],
    security: ["No authentication required", "Public hosting acceptable", "No sensitive data stored"],
    demoNotes: [
      "All features functional",
      "Alpha testing phase",
      "Resources still being populated",
    ],
  },
  {
    id: "medium",
    name: "Medium",
    tagline: "Trust Internal",
    color: "blue",
    gradient: "from-blue-500 to-blue-700",
    icon: Lock,
    hosting: "FOCUS Firewall",
    auth: "Trust authentication",
    dataLevel: "Internal info (no PII)",
    description:
      "Behind Trust firewall with internal contact numbers and forms. No patient identifiable information.",
    features: [
      { name: "Bookmarks", included: true },
      { name: "Referral Workflows", included: true },
      { name: "How-To Guides", included: true },
      { name: "Internal Phone Numbers", included: true },
      { name: "Internal Forms/SOPs", included: true },
      { name: "Ward Diary", included: false },
      { name: "Patient List", included: false },
      { name: "Assurance Dashboard", included: true, note: "Link only" },
      { name: "SystemOne Integration", included: false },
    ],
    security: [
      "Behind FOCUS firewall",
      "Trust authentication required",
      "Internal data protected",
    ],
    demoNotes: [
      "All features functional",
      "Placeholder data shown (not behind firewall)",
      "No search engine indexing",
    ],
  },
  {
    id: "max",
    name: "Max",
    tagline: "Full Clinical",
    color: "purple",
    gradient: "from-purple-500 to-purple-700",
    icon: Shield,
    hosting: "Trust Infrastructure",
    auth: "Trust SSO + Role-based",
    dataLevel: "Patient PII included",
    description:
      "Full clinical version with patient information, ward diary, and task management. Requires strict access controls.",
    features: [
      { name: "Bookmarks", included: true },
      { name: "Referral Workflows", included: true },
      { name: "How-To Guides", included: true },
      { name: "Internal Phone Numbers", included: true },
      { name: "Internal Forms/SOPs", included: true },
      { name: "Ward Diary", included: true },
      { name: "Patient List", included: true },
      { name: "Progress Reports", included: true },
      { name: "Assurance Dashboard", included: true, note: "Link only" },
      { name: "SystemOne Integration", included: false },
    ],
    security: [
      "Behind FOCUS firewall",
      "Staff access management required",
      "Consider MS Teams groups or SharePoint permissions",
      "Approved staff only",
    ],
    demoNotes: [
      "All features functional",
      "Fictional ward/patient/staff names",
      "No search engine indexing",
    ],
  },
  {
    id: "max_plus",
    name: "Max+",
    tagline: "SystemOne Integrated",
    color: "amber",
    gradient: "from-amber-500 to-amber-700",
    icon: Zap,
    hosting: "Trust Infrastructure",
    auth: "SystemOne API Auth",
    dataLevel: "Full S1 Integration",
    description:
      "Maximum integration with SystemOne API for task sync and patient data. Requires API approval from TPP.",
    features: [
      { name: "Bookmarks", included: true },
      { name: "Referral Workflows", included: true },
      { name: "How-To Guides", included: true },
      { name: "Internal Phone Numbers", included: true },
      { name: "Internal Forms/SOPs", included: true },
      { name: "Ward Diary", included: true },
      { name: "Patient List", included: true },
      { name: "Progress Reports", included: true, note: "Auto-delivery" },
      { name: "Assurance Dashboard", included: true, note: "Auto-sync" },
      { name: "SystemOne Integration", included: true },
    ],
    security: [
      "SystemOne authentication via API",
      "Ward access based on S1 permissions",
      "If S1 says you can see a ward, you get access",
    ],
    demoNotes: [
      "S1 API prompts shown as preview",
      "API approval unlikely short-term",
      "Demonstrates future potential",
    ],
  },
];

export default function VersionsPage() {
  const { version } = useApp();

  return (
    <MainLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-2xl p-6 text-white">
          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-white/20 transition-colors mb-4 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Server className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Version Comparison</h1>
              <p className="text-white/80 mt-1">
                Understanding the different deployment options for Inpatient Hub
              </p>
            </div>
          </div>
        </div>

        {/* Current version indicator */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-3">
          <Info className="w-6 h-6 text-indigo-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-indigo-800">
              You are currently viewing the{" "}
              <span className="uppercase">{version}</span> version
            </p>
            <p className="text-indigo-600 text-sm">
              Switch versions using the profile menu in the header
            </p>
          </div>
        </div>

        {/* Version cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {VERSIONS.map((v) => {
            const Icon = v.icon;
            const isActive = version === v.id;

            return (
              <div
                key={v.id}
                className={`bg-white rounded-xl border-2 overflow-hidden ${
                  isActive ? "border-indigo-500 ring-2 ring-indigo-200" : "border-gray-200"
                }`}
              >
                {/* Card header */}
                <div className={`bg-gradient-to-r ${v.gradient} p-4 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="w-8 h-8" />
                      <div>
                        <h2 className="text-xl font-bold">{v.name}</h2>
                        <p className="text-white/80 text-sm">{v.tagline}</p>
                      </div>
                    </div>
                    {isActive && (
                      <Badge className="bg-white/20 text-white border-0">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4 space-y-4">
                  <p className="text-gray-600 text-sm">{v.description}</p>

                  {/* Quick info */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-gray-500">Hosting</p>
                      <p className="font-semibold text-gray-700">{v.hosting}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-gray-500">Auth</p>
                      <p className="font-semibold text-gray-700">{v.auth}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-gray-500">Data</p>
                      <p className="font-semibold text-gray-700">{v.dataLevel}</p>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Features
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {v.features.map((f) => (
                        <div
                          key={f.name}
                          className={`flex items-center gap-1.5 text-xs py-1 ${
                            f.included ? "text-gray-700" : "text-gray-400"
                          }`}
                        >
                          {f.included ? (
                            <Check className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-gray-300" />
                          )}
                          {f.name}
                          {"note" in f && f.note && (
                            <span className="text-[10px] text-gray-500 ml-0.5">({f.note})</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Security */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Security Requirements
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {v.security.map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Lock className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Demo notes */}
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-amber-700 flex items-center gap-1 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Demo Version Notes
                    </p>
                    <ul className="text-xs text-amber-600 space-y-0.5">
                      {v.demoNotes.map((n, i) => (
                        <li key={i}>• {n}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-bold text-gray-900">Quick Comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left p-3 font-semibold text-gray-700">Feature</th>
                  <th className="text-center p-3 font-semibold text-emerald-700">Light</th>
                  <th className="text-center p-3 font-semibold text-blue-700">Medium</th>
                  <th className="text-center p-3 font-semibold text-purple-700">Max</th>
                  <th className="text-center p-3 font-semibold text-amber-700">Max+</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Public Bookmarks", light: true, medium: true, max: true, maxPlus: true },
                  { name: "Referral Workflows", light: true, medium: true, max: true, maxPlus: true },
                  { name: "How-To Guides", light: true, medium: true, max: true, maxPlus: true },
                  { name: "Internal Contacts", light: false, medium: true, max: true, maxPlus: true },
                  { name: "Internal SOPs/Forms", light: false, medium: true, max: true, maxPlus: true },
                  { name: "Ward Diary", light: false, medium: false, max: true, maxPlus: true },
                  { name: "Patient List", light: false, medium: false, max: true, maxPlus: true },
                  { name: "Progress Reports", light: false, medium: false, max: true, maxPlus: "auto" },
                  { name: "Assurance Dashboard", light: "link", medium: "link", max: "link", maxPlus: "sync" },
                  { name: "SystemOne Sync", light: false, medium: false, max: false, maxPlus: true },
                ].map((row, i) => (
                  <tr key={row.name} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="p-3 font-medium text-gray-700">{row.name}</td>
                    <td className="p-3 text-center">
                      {row.light === "link" ? (
                        <span className="text-xs font-medium text-blue-600">Link</span>
                      ) : row.light === "sync" ? (
                        <span className="text-xs font-medium text-green-600">Sync</span>
                      ) : row.light === "auto" ? (
                        <span className="text-xs font-medium text-amber-600">Auto</span>
                      ) : row.light ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {row.medium === "link" ? (
                        <span className="text-xs font-medium text-blue-600">Link</span>
                      ) : row.medium === "sync" ? (
                        <span className="text-xs font-medium text-green-600">Sync</span>
                      ) : row.medium === "auto" ? (
                        <span className="text-xs font-medium text-amber-600">Auto</span>
                      ) : row.medium ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {row.max === "link" ? (
                        <span className="text-xs font-medium text-blue-600">Link</span>
                      ) : row.max === "sync" ? (
                        <span className="text-xs font-medium text-green-600">Sync</span>
                      ) : row.max === "auto" ? (
                        <span className="text-xs font-medium text-amber-600">Auto</span>
                      ) : row.max ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {row.maxPlus === "link" ? (
                        <span className="text-xs font-medium text-blue-600">Link</span>
                      ) : row.maxPlus === "sync" ? (
                        <span className="text-xs font-medium text-green-600">Sync</span>
                      ) : row.maxPlus === "auto" ? (
                        <span className="text-xs font-medium text-amber-600">Auto</span>
                      ) : row.maxPlus ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-300 bg-gray-100">
                  <td className="p-3 font-semibold text-gray-700">Hosting</td>
                  <td className="p-3 text-center text-xs text-gray-600">Public</td>
                  <td className="p-3 text-center text-xs text-gray-600">FOCUS</td>
                  <td className="p-3 text-center text-xs text-gray-600">Trust Infra</td>
                  <td className="p-3 text-center text-xs text-gray-600">Trust Infra</td>
                </tr>
                <tr className="bg-gray-100">
                  <td className="p-3 font-semibold text-gray-700">Authentication</td>
                  <td className="p-3 text-center text-xs text-gray-600">Demo</td>
                  <td className="p-3 text-center text-xs text-gray-600">Trust SSO</td>
                  <td className="p-3 text-center text-xs text-gray-600">Trust SSO</td>
                  <td className="p-3 text-center text-xs text-gray-600">S1 API</td>
                </tr>
                <tr className="bg-gray-100">
                  <td className="p-3 font-semibold text-gray-700">Contains PII</td>
                  <td className="p-3 text-center">
                    <X className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="p-3 text-center">
                    <X className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="p-3 text-center">
                    <Check className="w-5 h-5 text-amber-500 mx-auto" />
                  </td>
                  <td className="p-3 text-center">
                    <Check className="w-5 h-5 text-amber-500 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center text-sm text-gray-500 pb-4">
          <p>
            This demo runs in <strong>{version.toUpperCase()}</strong> mode with fictional data.
          </p>
          <p>
            Contact the project owner to discuss deployment options for your Trust.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
