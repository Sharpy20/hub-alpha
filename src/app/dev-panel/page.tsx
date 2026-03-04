"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, Button } from "@/components/ui";
import {
  Lock,
  FileText,
  Database,
  Shield,
  Users,
  GitBranch,
  Server,
  AlertTriangle,
  BookOpen,
  Workflow,
  ExternalLink,
  CheckCircle,
  Clock,
  FileWarning,
  ChevronDown
} from "lucide-react";
import { useApp } from "@/app/providers";

// Dev panel password (demo only - production would use env/vault)
const DEV_PANEL_PASSWORD = "Eft3&d3";

// Schema status (would be managed by state in real implementation)
type SchemaStatus = "LIVE" | "DRAFT" | "UNKNOWN";

interface SchemaConfig {
  schemaStatus: SchemaStatus;
  lastUpdatedAt: string;
  source: "supabase-sql-upload" | "draft-generator" | "none";
  notes?: string;
}

const INITIAL_SCHEMA_CONFIG: SchemaConfig = {
  schemaStatus: "DRAFT",
  lastUpdatedAt: new Date().toISOString(),
  source: "draft-generator",
  notes: "Using draft schemas - replace with live Supabase export when available"
};

// Navigation sections
const NAV_SECTIONS = [
  { id: "overview", label: "Overview & Pitch", icon: BookOpen, priority: "must" },
  { id: "business-case", label: "Business Case", icon: FileText, priority: "must" },
  { id: "technical", label: "Technical Spec", icon: Server, priority: "must" },
  { id: "data-catalogue", label: "Data Catalogue", icon: Database, priority: "should" },
  { id: "rbac", label: "RBAC Matrix", icon: Users, priority: "must" },
  { id: "user-flows", label: "User Flows", icon: Workflow, priority: "should" },
  { id: "dpia", label: "DPIA Draft", icon: Shield, priority: "must" },
  { id: "clinical-safety", label: "Clinical Safety", icon: AlertTriangle, priority: "should" },
  { id: "schemas", label: "Supabase Schemas", icon: Database, priority: "later" },
  { id: "webhooks", label: "Assurance Webhooks", icon: GitBranch, priority: "later" },
  { id: "nexus", label: "Nexus Assurance (MAX+)", icon: ExternalLink, priority: "later" },
  { id: "references", label: "References", icon: FileText, priority: "must" },
];

export default function DevPanelPage() {
  const { version } = useApp();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [schemaConfig] = useState<SchemaConfig>(INITIAL_SCHEMA_CONFIG);

  // Check for existing session (in-memory only, clears on page refresh)
  useEffect(() => {
    const session = sessionStorage.getItem("devPanelAuth");
    if (session === "authenticated") {
      setIsAuthenticated(true);
      // Audit log - production would use backend logging
    }
  }, [version]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === DEV_PANEL_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("devPanelAuth", "authenticated");
      // Audit log - production would use backend logging
    } else {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 2000);
    }
  };

  // Password gate
  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto mt-20">
          <Card>
            <CardHeader>
              <h1 className="text-xl font-bold text-nhs-black flex items-center gap-2">
                <Lock className="w-5 h-5 text-nhs-blue" />
                Developer Panel Access
              </h1>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-nhs-dark-grey mb-4">
                This area contains technical documentation and governance materials.
                Enter the access code to continue.
              </p>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Access code"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-nhs-blue ${
                      passwordError ? "border-nhs-red bg-red-50" : "border-gray-300"
                    }`}
                    autoFocus
                  />
                  {passwordError && (
                    <p className="text-sm text-nhs-red mt-1">Incorrect access code</p>
                  )}
                </div>
                <Button type="submit" variant="primary" className="w-full">
                  Access Panel
                </Button>
              </form>
              <p className="text-xs text-nhs-mid-grey mt-4 text-center">
                Demo mode: hardcoded password. Production uses Trust key vault.
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  // Schema status badge
  const SchemaStatusBadge = () => {
    const statusColors = {
      LIVE: "bg-nhs-green text-white",
      DRAFT: "bg-nhs-warm-yellow text-nhs-black",
      UNKNOWN: "bg-nhs-mid-grey text-white"
    };
    const statusIcons = {
      LIVE: CheckCircle,
      DRAFT: FileWarning,
      UNKNOWN: Clock
    };
    const Icon = statusIcons[schemaConfig.schemaStatus];

    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${statusColors[schemaConfig.schemaStatus]}`}>
        <Icon className="w-3 h-3" />
        Schema: {schemaConfig.schemaStatus}
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="flex gap-6">
        {/* Left Navigation */}
        <aside className="w-64 flex-shrink-0">
          <div className="sticky top-4 space-y-4">
            {/* Schema Status Widget */}
            <Card className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-nhs-dark-grey">Schema Status</span>
                <SchemaStatusBadge />
              </div>
              <p className="text-xs text-nhs-mid-grey">
                Last updated: {new Date(schemaConfig.lastUpdatedAt).toLocaleDateString()}
              </p>
              {schemaConfig.schemaStatus === "DRAFT" && (
                <p className="text-xs text-nhs-orange mt-1">
                  Using draft schemas - awaiting live export
                </p>
              )}
            </Card>

            {/* Navigation */}
            <Card className="p-2">
              <nav className="space-y-1">
                {NAV_SECTIONS.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors text-left ${
                        isActive
                          ? "bg-nhs-blue text-white"
                          : "text-nhs-dark-grey hover:bg-nhs-pale-grey"
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1">{section.label}</span>
                      {section.priority === "must" && !isActive && (
                        <span className="w-2 h-2 rounded-full bg-nhs-green" title="Priority section" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </Card>

            {/* Mode indicator */}
            <div className="text-xs text-center text-nhs-mid-grey">
              Current Mode: <span className="font-semibold uppercase">{version}</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {activeSection === "overview" && <OverviewSection />}
          {activeSection === "business-case" && <BusinessCaseSection />}
          {activeSection === "technical" && <TechnicalSpecSection />}
          {activeSection === "data-catalogue" && <DataCatalogueSection />}
          {activeSection === "rbac" && <RBACSection />}
          {activeSection === "user-flows" && <UserFlowsSection />}
          {activeSection === "dpia" && <DPIASection />}
          {activeSection === "clinical-safety" && <ClinicalSafetySection />}
          {activeSection === "schemas" && <SchemasSection schemaStatus={schemaConfig.schemaStatus} />}
          {activeSection === "webhooks" && <WebhooksSection />}
          {activeSection === "nexus" && <NexusSection />}
          {activeSection === "references" && <ReferencesSection />}
        </main>
      </div>
    </MainLayout>
  );
}

// Section Components

function OverviewSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-nhs-black">Ward Portal — Overview</h1>
        <p className="text-nhs-dark-grey mt-1">Technical documentation and governance pack</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">60-Second Elevator Pitch</h2>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>
            <strong>Inpatient Hub</strong> is a ward-based clinical reference and task management tool
            designed to reduce time spent searching for information and improve task coordination.
          </p>
          <p>
            Staff can access referral workflows, how-to guides, and useful bookmarks from any device.
            In higher deployment tiers, it also provides ward diary functionality for task tracking
            and patient list management.
          </p>
          <p>
            The tool is designed with <strong>four deployment modes</strong> (Light → Max+) allowing
            incremental adoption from a public demo through to full Nexus Assurance integration.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">5-Minute Deep Dive</h2>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none space-y-4">
          <div>
            <h3 className="text-base font-semibold text-nhs-dark-blue">The Problem</h3>
            <p>
              Ward staff spend significant time searching for referral forms, phone numbers,
              and clinical guidance. Task handovers rely on paper diaries or memory.
              Information is scattered across SharePoint, FOCUS, and personal notes.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-nhs-dark-blue">The Solution</h3>
            <p>
              A single, mobile-friendly portal that consolidates:
            </p>
            <ul>
              <li><strong>Bookmarks</strong> — Quick links to frequently used resources</li>
              <li><strong>Referral Workflows</strong> — Step-by-step guides with forms and templates</li>
              <li><strong>How-To Guides</strong> — Clinical guidance (NEWS2, seizures, etc.)</li>
              <li><strong>Ward Diary</strong> — Task tracking with claim/handover (Max+)</li>
              <li><strong>Patient List</strong> — Discharge tracking and transfers (Max+)</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold text-nhs-dark-blue">Deployment Modes</h3>
            <table className="text-sm">
              <thead>
                <tr>
                  <th>Mode</th>
                  <th>Auth</th>
                  <th>Data</th>
                  <th>Features</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Light</strong></td>
                  <td>Demo login</td>
                  <td>Public only</td>
                  <td>Bookmarks, Referrals, Guides</td>
                </tr>
                <tr>
                  <td><strong>Medium</strong></td>
                  <td>Trust auth</td>
                  <td>Internal (no PII)</td>
                  <td>+ Internal content</td>
                </tr>
                <tr>
                  <td><strong>Max</strong></td>
                  <td>Trust SSO</td>
                  <td>PII included</td>
                  <td>+ Ward Diary, Patients</td>
                </tr>
                <tr>
                  <td><strong>Max+</strong></td>
                  <td>Trust SSO + Nexus</td>
                  <td>Nexus audit sync</td>
                  <td>+ Nexus Assurance sync</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="text-base font-semibold text-nhs-dark-blue">Governance Fit</h3>
            <p>
              Each mode has appropriate controls. Light has no PII and public hosting.
              Max+ requires DPIA, clinical safety review, and API approval before deployment.
              The tool is designed to slot into existing Trust IG frameworks.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BusinessCaseSection() {
  const [expanded, setExpanded] = useState<string | null>("executive-summary");

  const sections = [
    {
      id: "executive-summary",
      title: "1. Executive Summary",
      content: (
        <div className="prose prose-sm max-w-none text-nhs-dark-grey space-y-3">
          <p>
            <strong>Inpatient Hub</strong> is a ward-based clinical reference and task management tool designed
            to address the fragmented information landscape on mental health inpatient wards. Staff currently
            spend significant time searching for referral forms, phone numbers, and guidance across multiple
            systems (FOCUS, SharePoint, paper diaries, personal notes).
          </p>
          <p>
            The Hub consolidates this into a single, accessible platform — starting with zero-cost deployment
            and scaling through four modes as governance approvals are obtained. This business case seeks approval
            for a <strong>zero-cost pilot</strong> on one ward to demonstrate value before wider rollout.
          </p>
        </div>
      ),
    },
    {
      id: "background",
      title: "2. Background & Current State",
      content: (
        <div className="space-y-3 text-sm text-nhs-dark-grey">
          <p>Ward staff at Derbyshire Healthcare NHS Foundation Trust currently rely on:</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="font-semibold text-red-800">FOCUS Intranet</p>
              <p className="text-red-700">Information scattered across pages; hard to navigate under time pressure</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="font-semibold text-red-800">SharePoint / Shared Drives</p>
              <p className="text-red-700">Forms buried in folder structures; version control issues</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="font-semibold text-red-800">Paper Ward Diaries</p>
              <p className="text-red-700">No audit trail; tasks easily missed during handovers</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="font-semibold text-red-800">Personal Notes / Memory</p>
              <p className="text-red-700">Knowledge lost when staff leave; steep learning curve for new starters</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "case-for-change",
      title: "3. Case for Change",
      content: (
        <div className="space-y-3 text-sm text-nhs-dark-grey">
          <ul className="space-y-2">
            <li className="flex gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span><strong>New staff can&apos;t find forms</strong> — Referral processes rely on asking colleagues, leading to delays and inconsistency</span>
            </li>
            <li className="flex gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span><strong>No audit trail for tasks</strong> — Paper diaries don&apos;t provide evidence of task completion for CQC inspections</span>
            </li>
            <li className="flex gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span><strong>Manual compliance tracking</strong> — Fridge temps, drug checks, and walkarounds recorded on paper or separate systems</span>
            </li>
            <li className="flex gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span><strong>Poor handovers</strong> — Critical tasks fall through gaps between shifts without a shared digital record</span>
            </li>
            <li className="flex gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span><strong>Steep learning curve</strong> — Bank and agency staff take weeks to learn ward processes that could be guided digitally</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "options",
      title: "4. Options Appraisal",
      content: (
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
            <h4 className="font-bold text-red-800 mb-2">Option A: Do Nothing</h4>
            <p className="text-red-700 mb-3">Continue with current systems. Staff keep using paper diaries, FOCUS searches, and personal notes.</p>
            <div className="space-y-1 text-red-600">
              <p>• Ongoing inefficiency</p>
              <p>• No audit improvement</p>
              <p>• Risk remains unchanged</p>
            </div>
            <div className="mt-3 p-2 bg-red-100 rounded text-center">
              <p className="font-semibold text-red-800">Not Recommended</p>
            </div>
          </div>
          <div className="p-4 bg-amber-50 rounded-xl border-2 border-amber-200">
            <h4 className="font-bold text-amber-800 mb-2">Option B: Full Implementation</h4>
            <p className="text-amber-700 mb-3">Deploy Max version across all wards simultaneously with patient data integration.</p>
            <div className="space-y-1 text-amber-600">
              <p>• Higher risk</p>
              <p>• Longer lead time</p>
              <p>• Requires DPIA upfront</p>
            </div>
            <div className="mt-3 p-2 bg-amber-100 rounded text-center">
              <p className="font-semibold text-amber-800">Higher Risk</p>
            </div>
          </div>
          <div className="p-4 bg-green-50 rounded-xl border-2 border-green-300 ring-2 ring-green-400">
            <h4 className="font-bold text-green-800 mb-2">Option C: Phased Rollout</h4>
            <p className="text-green-700 mb-3">Start with a free pilot on one ward, expand based on results, then integrate with Trust systems.</p>
            <div className="space-y-1 text-green-600">
              <p>• Zero initial cost</p>
              <p>• Low risk start</p>
              <p>• Evidence-based scaling</p>
            </div>
            <div className="mt-3 p-2 bg-green-200 rounded text-center">
              <p className="font-bold text-green-800">✓ Recommended</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "financial",
      title: "5. Financial Case",
      content: (
        <div className="space-y-4 text-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-nhs-pale-grey">
                <tr>
                  <th className="text-left p-3">Phase</th>
                  <th className="text-left p-3">Infrastructure</th>
                  <th className="text-left p-3">Development</th>
                  <th className="text-left p-3">Monthly Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr className="bg-green-50">
                  <td className="p-3 font-semibold">Pilot (1 ward)</td>
                  <td className="p-3">Vercel free tier</td>
                  <td className="p-3">Internal (ward staff)</td>
                  <td className="p-3 font-bold text-green-700">£0</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Ward Rollout (all wards)</td>
                  <td className="p-3">Vercel free tier + Supabase free tier</td>
                  <td className="p-3">Internal (ward staff)</td>
                  <td className="p-3 font-bold text-green-700">£0</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Trust-wide</td>
                  <td className="p-3">Supabase Pro + Trust hosting</td>
                  <td className="p-3">Internal dev support</td>
                  <td className="p-3 font-semibold">~£25/month</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-800 font-medium">The pilot phase requires zero financial investment. Costs only arise if the tool proves valuable enough to scale.</p>
          </div>
        </div>
      ),
    },
    {
      id: "benefits",
      title: "6. Benefits",
      content: (
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="space-y-3">
            <h4 className="font-bold text-nhs-dark-blue">Clinical Benefits</h4>
            <div className="space-y-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <p className="text-blue-800">Standardised referral workflows reduce errors and missed steps</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <p className="text-blue-800">Digital audit trail for compliance evidence (CQC-ready)</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <p className="text-blue-800">Consistent guidance available to all staff, including bank/agency</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <p className="text-blue-800">Improved handovers with shared task visibility across shifts</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-nhs-dark-blue">Operational Benefits</h4>
            <div className="space-y-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <p className="text-green-800">Reduced onboarding time for new and temporary staff</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <p className="text-green-800">Digital ward diary replaces paper with searchable records</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <p className="text-green-800">Task claiming prevents duplicate work</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <p className="text-green-800">Nexus integration automates compliance tracking (Max+)</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "risks",
      title: "7. Risks & Mitigations",
      content: (
        <div className="overflow-x-auto text-sm">
          <table className="w-full">
            <thead className="bg-nhs-pale-grey">
              <tr>
                <th className="text-left p-2">Risk</th>
                <th className="text-left p-2">Likelihood</th>
                <th className="text-left p-2">Impact</th>
                <th className="text-left p-2">Mitigation</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-2">Low staff adoption</td>
                <td className="p-2">Medium</td>
                <td className="p-2">Medium</td>
                <td className="p-2">Ward champion model; start with most motivated ward; iterative feedback</td>
              </tr>
              <tr>
                <td className="p-2">Data security concerns</td>
                <td className="p-2">Low</td>
                <td className="p-2">High</td>
                <td className="p-2">Pilot has zero PII; phased approach aligns security controls with data sensitivity</td>
              </tr>
              <tr>
                <td className="p-2">Technical failure</td>
                <td className="p-2">Low</td>
                <td className="p-2">Low</td>
                <td className="p-2">Paper diary remains as fallback; tool supplements, not replaces existing systems</td>
              </tr>
              <tr>
                <td className="p-2">Scope creep</td>
                <td className="p-2">Medium</td>
                <td className="p-2">Medium</td>
                <td className="p-2">Fixed version tiers prevent feature creep; changes require governance approval</td>
              </tr>
              <tr>
                <td className="p-2">Clinical safety</td>
                <td className="p-2">Low</td>
                <td className="p-2">High</td>
                <td className="p-2">Tool is reference/task aid only — no clinical decisions automated; DCB 0129 review planned</td>
              </tr>
            </tbody>
          </table>
        </div>
      ),
    },
    {
      id: "implementation",
      title: "8. Implementation Plan",
      content: (
        <div className="space-y-4 text-sm">
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
            <div className="flex-1">
              <h4 className="font-bold text-nhs-black">Pilot Phase — One Ward</h4>
              <p className="text-nhs-dark-grey mt-1">Deploy Light version on Byron Ward. Staff use bookmarks, referral workflows, and how-to guides. Gather feedback over 4-6 weeks. Zero cost, zero PII, no governance approvals needed beyond ward manager.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
            <div className="flex-1">
              <h4 className="font-bold text-nhs-black">Expand to All Wards</h4>
              <p className="text-nhs-dark-grey mt-1">If pilot succeeds, roll out to remaining wards. Add ward diary functionality (Max version). Requires ward manager buy-in and basic access controls. Still no external costs with free-tier infrastructure.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
            <div className="flex-1">
              <h4 className="font-bold text-nhs-black">Trust Integration</h4>
              <p className="text-nhs-dark-grey mt-1">Integrate with Nexus Assurance for automated audit compliance. Requires Trust tech team involvement for webhook setup. DPIA and clinical safety review at this stage. Estimated £25/month infrastructure cost.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "recommendation",
      title: "9. Recommendation",
      content: (
        <div className="space-y-4 text-sm">
          <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6 text-center">
            <p className="text-2xl mb-2">✓</p>
            <h4 className="font-bold text-green-800 text-lg mb-2">Approve Pilot Phase</h4>
            <p className="text-green-700">
              Deploy the Light version of Inpatient Hub for alpha testing on Byron Ward at
              <strong> zero cost</strong>. The pilot will run for 4-6 weeks with feedback collected
              from ward staff. Results will inform the decision on wider rollout.
            </p>
          </div>
          <div className="bg-nhs-pale-grey rounded-lg p-4">
            <p className="text-nhs-dark-grey">
              <strong>What we&apos;re asking for:</strong> Permission to trial the tool on one ward.
              No budget required. No PII involved. The tool supplements existing systems — it doesn&apos;t
              replace anything. Staff can stop using it at any time.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "approvals",
      title: "10. Approvals Required",
      content: (
        <div className="space-y-2 text-sm">
          {[
            { role: "Ward Manager", scope: "Pilot approval for Byron Ward", phase: "Pilot" },
            { role: "Matron", scope: "Awareness and support for pilot", phase: "Pilot" },
            { role: "Digital Services", scope: "Technical review and hosting approval", phase: "Rollout" },
            { role: "Information Governance", scope: "DPIA review (when PII introduced)", phase: "Trust-wide" },
            { role: "Clinical Safety Officer", scope: "DCB 0129/0160 assessment", phase: "Trust-wide" },
          ].map((item) => (
            <div key={item.role} className="flex items-center gap-3 p-3 bg-nhs-pale-grey rounded-lg">
              <div className="w-5 h-5 border-2 border-nhs-mid-grey rounded flex-shrink-0" />
              <div className="flex-1">
                <span className="font-semibold text-nhs-black">{item.role}</span>
                <span className="text-nhs-dark-grey"> — {item.scope}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                item.phase === "Pilot" ? "bg-green-100 text-green-700" :
                item.phase === "Rollout" ? "bg-blue-100 text-blue-700" :
                "bg-amber-100 text-amber-700"
              }`}>{item.phase}</span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-nhs-black">Business Case</h1>
        <p className="text-nhs-dark-grey mt-1">Phased rollout proposal for Trust approval</p>
      </div>

      <div className="bg-nhs-blue/10 border border-nhs-blue rounded-lg p-4">
        <p className="text-sm text-nhs-black">
          <strong>Purpose:</strong> This business case follows the structure of approved Trust proposals
          (e.g. Temperature Monitoring system). It seeks approval for a zero-cost pilot phase
          before any investment or governance changes are required.
        </p>
      </div>

      <div className="space-y-2">
        {sections.map((section) => (
          <div key={section.id} className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === section.id ? null : section.id)}
              className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left"
            >
              <span className="font-semibold text-nhs-black">{section.title}</span>
              <ChevronDown className={`w-5 h-5 text-nhs-mid-grey transition-transform ${expanded === section.id ? "rotate-180" : ""}`} />
            </button>
            {expanded === section.id && (
              <div className="p-4 pt-0 bg-white border-t border-gray-100">
                {section.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TechnicalSpecSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-nhs-black">Technical Specification</h1>
        <p className="text-nhs-dark-grey mt-1">Stack, architecture, and deployment</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Technology Stack</h2>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-nhs-dark-grey mb-2">Frontend</h3>
              <ul className="text-sm space-y-1 text-nhs-dark-grey">
                <li>• Next.js 16 (App Router)</li>
                <li>• TypeScript</li>
                <li>• Tailwind CSS + NHS theme tokens</li>
                <li>• Lucide React icons</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-nhs-dark-grey mb-2">Backend / Data</h3>
              <ul className="text-sm space-y-1 text-nhs-dark-grey">
                <li>• Light: Browser localStorage</li>
                <li>• Medium+: Supabase (PostgreSQL)</li>
                <li>• Max+: Nexus webhook receiver</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-nhs-dark-grey mb-2">Hosting</h3>
              <ul className="text-sm space-y-1 text-nhs-dark-grey">
                <li>• Light: Vercel (public)</li>
                <li>• Medium: Behind FOCUS firewall</li>
                <li>• Max/Max+: Trust infrastructure</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-nhs-dark-grey mb-2">CI/CD</h3>
              <ul className="text-sm space-y-1 text-nhs-dark-grey">
                <li>• GitHub (Sharpy20 account)</li>
                <li>• Vercel auto-deploy on push</li>
                <li>• Branch protection on main</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">System Context (C4 Level 1)</h2>
        </CardHeader>
        <CardContent>
          <div className="bg-nhs-pale-grey p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`
┌─────────────────────────────────────────────────────────────┐
│                      TRUST BOUNDARY                          │
│  ┌──────────┐                                               │
│  │  Staff   │ ◄───────► ┌─────────────────┐                 │
│  │  (User)  │           │  Inpatient Hub  │                 │
│  └──────────┘           │    (Portal)     │                 │
│                         └────────┬────────┘                 │
│                                  │                          │
│         ┌────────────────────────┼────────────────────┐     │
│         │                        │                    │     │
│         ▼                        ▼                    ▼     │
│  ┌─────────────┐    ┌─────────────────┐    ┌─────────────┐  │
│  │  Supabase   │    │  Power Automate │    │   Nexus     │  │
│  │  (Medium+)  │    │  (Assurance)    │    │   (Max+)    │  │
│  └─────────────┘    └─────────────────┘    └─────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
            `}</pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Container Diagram (C4 Level 2)</h2>
        </CardHeader>
        <CardContent>
          <div className="bg-nhs-pale-grey p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`
┌─────────────────────────────────────────────────────────────┐
│                    INPATIENT HUB                            │
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   Web App       │    │   API Routes    │                │
│  │   (Next.js)     │◄──►│   (Next.js)     │                │
│  │                 │    │                 │                │
│  │  • Pages        │    │  • /api/tasks   │                │
│  │  • Components   │    │  • /api/patients│                │
│  │  • State mgmt   │    │  • /api/nexus   │                │
│  └─────────────────┘    └────────┬────────┘                │
│                                  │                          │
│                    ┌─────────────┼─────────────┐           │
│                    │             │             │           │
│                    ▼             ▼             ▼           │
│            ┌───────────┐ ┌───────────┐ ┌───────────┐       │
│            │ Supabase  │ │ Webhook   │ │ Nexus     │       │
│            │ Client    │ │ Worker    │ │ Receiver  │       │
│            └───────────┘ └───────────┘ └───────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
            `}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DataCatalogueSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-nhs-black">Data Catalogue</h1>
        <p className="text-nhs-dark-grey mt-1">All data types with classification</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Entity Overview</h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-nhs-pale-grey">
                <tr>
                  <th className="text-left p-2">Entity</th>
                  <th className="text-left p-2">Contains PII?</th>
                  <th className="text-left p-2">Mode Required</th>
                  <th className="text-left p-2">Storage</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="p-2 font-medium">Bookmarks</td>
                  <td className="p-2"><span className="text-nhs-green">No</span></td>
                  <td className="p-2">Light+</td>
                  <td className="p-2">Static / Supabase</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Workflows</td>
                  <td className="p-2"><span className="text-nhs-green">No</span></td>
                  <td className="p-2">Light+</td>
                  <td className="p-2">Static / Supabase</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Guides</td>
                  <td className="p-2"><span className="text-nhs-green">No</span></td>
                  <td className="p-2">Light+</td>
                  <td className="p-2">Static / Supabase</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Users</td>
                  <td className="p-2"><span className="text-nhs-orange">Staff names</span></td>
                  <td className="p-2">Medium+</td>
                  <td className="p-2">Supabase</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Ward Tasks</td>
                  <td className="p-2"><span className="text-nhs-green">No</span></td>
                  <td className="p-2">Max+</td>
                  <td className="p-2">Supabase</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Patient Tasks</td>
                  <td className="p-2"><span className="text-nhs-red">Yes</span></td>
                  <td className="p-2">Max+</td>
                  <td className="p-2">Supabase</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Patients</td>
                  <td className="p-2"><span className="text-nhs-red">Yes</span></td>
                  <td className="p-2">Max+</td>
                  <td className="p-2">Supabase / S1</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Audit Logs</td>
                  <td className="p-2"><span className="text-nhs-orange">User IDs</span></td>
                  <td className="p-2">Medium+</td>
                  <td className="p-2">Supabase</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Patient Entity (Max+)</h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-nhs-dark-grey mb-4">
            Patient data is only present in Max and Max+ deployments. Demo version uses fictional data.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-nhs-pale-grey">
                <tr>
                  <th className="text-left p-2">Field</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">PII Class</th>
                  <th className="text-left p-2">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr><td className="p-2">id</td><td className="p-2">UUID</td><td className="p-2">Indirect</td><td className="p-2">Internal reference</td></tr>
                <tr><td className="p-2">name</td><td className="p-2">String</td><td className="p-2 text-nhs-red font-medium">Direct PII</td><td className="p-2">Patient name</td></tr>
                <tr><td className="p-2">ward</td><td className="p-2">String</td><td className="p-2">Non-PII</td><td className="p-2">Current ward</td></tr>
                <tr><td className="p-2">room</td><td className="p-2">String</td><td className="p-2">Indirect</td><td className="p-2">Location</td></tr>
                <tr><td className="p-2">bed</td><td className="p-2">String</td><td className="p-2">Indirect</td><td className="p-2">Location</td></tr>
                <tr><td className="p-2">legalStatus</td><td className="p-2">Enum</td><td className="p-2 text-nhs-orange font-medium">Special Cat.</td><td className="p-2">MHA status</td></tr>
                <tr><td className="p-2">admissionDate</td><td className="p-2">Date</td><td className="p-2">Indirect</td><td className="p-2">When admitted</td></tr>
                <tr className="bg-green-50"><td className="p-2 font-medium">admissionTime</td><td className="p-2">Time</td><td className="p-2">Indirect</td><td className="p-2">Triggers 72hr audit auto-generation</td></tr>
                <tr className="bg-green-50"><td className="p-2 font-medium">wardProfessional</td><td className="p-2">String (FK)</td><td className="p-2">Indirect</td><td className="p-2">Assigned staff/lead/manager responsible for patient</td></tr>
                <tr><td className="p-2">alerts</td><td className="p-2">Array</td><td className="p-2 text-nhs-orange font-medium">Special Cat.</td><td className="p-2">Clinical alerts</td></tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RBACSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-nhs-black">RBAC & Access Control</h1>
        <p className="text-nhs-dark-grey mt-1">Role-based permissions matrix</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Role Definitions</h2>
          <p className="text-xs text-nhs-mid-grey mt-1">Last reviewed: 2026-02-27</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-nhs-black">Staff <span className="text-xs font-normal text-nhs-mid-grey">(base role)</span></h3>
              <p className="text-sm text-nhs-dark-grey">View content, claim tasks, suggest bookmarks. Can be assigned as ward professional for patients.</p>
            </div>
            <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
              <h3 className="font-semibold text-nhs-black">Lead</h3>
              <p className="text-sm text-nhs-dark-grey">+ Filter by staff member tasks, &quot;My Patients&quot; toggle (as ward professional), 72hr admission audit visibility</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-nhs-black">Manager</h3>
              <p className="text-sm text-nhs-dark-grey">+ Ward settings, discharge approval, grant contributor privileges, all Lead capabilities</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-nhs-black">Ward Admin <span className="text-xs font-normal text-nhs-mid-grey">(IT/Config)</span></h3>
              <p className="text-sm text-nhs-dark-grey">+ Ward settings, discharge approval, view audit logs, grant contributor privileges</p>
            </div>
            <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
              <h3 className="font-semibold text-nhs-black">Senior Admin</h3>
              <p className="text-sm text-nhs-dark-grey">+ User management, system settings, full audit access, delete content</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border-2 border-dashed border-amber-300">
              <h3 className="font-semibold text-nhs-black">Contributor <span className="text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full font-medium ml-1">FLAG</span></h3>
              <p className="text-sm text-nhs-dark-grey">Orthogonal privilege (not a role). Can be added to <strong>any</strong> role by Ward Admin or Manager. Grants: edit workflows, guides, bookmarks. Requires creator training completion.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Permissions Matrix</h2>
          <p className="text-xs text-nhs-mid-grey mt-1">Last reviewed: 2026-02-27</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-nhs-pale-grey">
                <tr>
                  <th className="text-left p-2">Feature</th>
                  <th className="text-center p-2">Staff</th>
                  <th className="text-center p-2">Lead</th>
                  <th className="text-center p-2">Manager</th>
                  <th className="text-center p-2">Ward Admin</th>
                  <th className="text-center p-2">Senior Admin</th>
                  <th className="text-center p-2 bg-amber-50">+Contributor</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="p-2">View bookmarks/workflows/guides</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center bg-amber-50">-</td>
                </tr>
                <tr>
                  <td className="p-2">Claim/complete tasks</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center bg-amber-50">-</td>
                </tr>
                <tr>
                  <td className="p-2">Assigned as ward professional</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-red">✗</td>
                  <td className="p-2 text-center text-nhs-red">✗</td>
                  <td className="p-2 text-center bg-amber-50">-</td>
                </tr>
                <tr>
                  <td className="p-2">&quot;My Patients&quot; filter + staff filter</td>
                  <td className="p-2 text-center text-nhs-red">✗</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-red">✗</td>
                  <td className="p-2 text-center text-nhs-red">✗</td>
                  <td className="p-2 text-center bg-amber-50">-</td>
                </tr>
                <tr>
                  <td className="p-2">72hr admission audit visibility</td>
                  <td className="p-2 text-center text-nhs-red">✗</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-red">✗</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center bg-amber-50">-</td>
                </tr>
                <tr>
                  <td className="p-2">Edit content (workflows/guides)</td>
                  <td className="p-2 text-center text-nhs-red">✗</td>
                  <td className="p-2 text-center text-nhs-red">✗</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-red">✗</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center bg-amber-50 text-nhs-green font-bold">✓</td>
                </tr>
                <tr>
                  <td className="p-2">Ward settings</td>
                  <td className="p-2 text-center text-nhs-red">✗</td>
                  <td className="p-2 text-center text-nhs-red">✗</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center bg-amber-50">-</td>
                </tr>
                <tr>
                  <td className="p-2">Approve discharges</td>
                  <td className="p-2 text-center text-nhs-red">✗</td>
                  <td className="p-2 text-center text-nhs-red">✗</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center bg-amber-50">-</td>
                </tr>
                <tr>
                  <td className="p-2">Grant contributor flag</td>
                  <td className="p-2 text-center text-nhs-red">✗</td>
                  <td className="p-2 text-center text-nhs-red">✗</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center bg-amber-50">-</td>
                </tr>
                <tr>
                  <td className="p-2">User management</td>
                  <td className="p-2 text-center text-nhs-red">✗</td>
                  <td className="p-2 text-center text-nhs-red">✗</td>
                  <td className="p-2 text-center text-nhs-red">✗</td>
                  <td className="p-2 text-center text-nhs-red">✗</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center bg-amber-50">-</td>
                </tr>
                <tr>
                  <td className="p-2">Dev Panel access</td>
                  <td className="p-2 text-center text-nhs-orange">Key</td>
                  <td className="p-2 text-center text-nhs-orange">Key</td>
                  <td className="p-2 text-center text-nhs-orange">Key</td>
                  <td className="p-2 text-center text-nhs-orange">Key</td>
                  <td className="p-2 text-center text-nhs-orange">Key</td>
                  <td className="p-2 text-center bg-amber-50">-</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-nhs-mid-grey mt-3">
            Note: +Contributor is a flag (isContributor) that can be added to any role. Dev Panel uses access key in demo; production would use Trust key vault.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function UserFlowsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-nhs-black">User Flows</h1>
        <p className="text-nhs-dark-grey mt-1">Key journeys through the application</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Flow 1: Referral Workflow</h2>
        </CardHeader>
        <CardContent>
          <div className="bg-nhs-pale-grey p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`
User                          Portal                        External
 │                              │                              │
 │  1. Select referral          │                              │
 │ ─────────────────────────►   │                              │
 │                              │                              │
 │  2. Show criteria check      │                              │
 │ ◄─────────────────────────   │                              │
 │                              │                              │
 │  3. Confirm criteria met     │                              │
 │ ─────────────────────────►   │                              │
 │                              │                              │
 │  4. Show form download       │                              │
 │ ◄─────────────────────────   │                              │
 │                              │                              │
 │  5. Download & complete      │                              │
 │ ──────────────────────────────────────────────────────────► │
 │                              │                              │
 │  6. Show submission info     │                              │
 │ ◄─────────────────────────   │                              │
 │                              │                              │
 │  7. Copy case note text      │                              │
 │ ─────────────────────────►   │                              │
 │                              │                              │
 │  8. (Max+) Push to S1        │                              │
 │ ─────────────────────────►   │ ─────────────────────────►   │
            `}</pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Flow 2: Task Lifecycle (Max+)</h2>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm text-nhs-dark-grey">
            <li className="flex gap-2">
              <span className="w-6 h-6 rounded-full bg-nhs-blue text-white flex items-center justify-center text-xs flex-shrink-0">1</span>
              <span>Staff creates task (ward task, patient task, or appointment)</span>
            </li>
            <li className="flex gap-2">
              <span className="w-6 h-6 rounded-full bg-nhs-blue text-white flex items-center justify-center text-xs flex-shrink-0">2</span>
              <span>Task appears on Ward Diary for due date/shift</span>
            </li>
            <li className="flex gap-2">
              <span className="w-6 h-6 rounded-full bg-nhs-blue text-white flex items-center justify-center text-xs flex-shrink-0">3</span>
              <span>Staff claims task → moves to "My Tasks" Kanban</span>
            </li>
            <li className="flex gap-2">
              <span className="w-6 h-6 rounded-full bg-nhs-blue text-white flex items-center justify-center text-xs flex-shrink-0">4</span>
              <span>Staff moves to "In Progress" when starting</span>
            </li>
            <li className="flex gap-2">
              <span className="w-6 h-6 rounded-full bg-nhs-blue text-white flex items-center justify-center text-xs flex-shrink-0">5</span>
              <span>Staff marks complete → task archived</span>
            </li>
            <li className="flex gap-2">
              <span className="w-6 h-6 rounded-full bg-nhs-bright-blue text-white flex items-center justify-center text-xs flex-shrink-0">6</span>
              <span>(Max+) Nexus auto-completes linked audit tasks</span>
            </li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Flow 3: Patient Discharge (Max+)</h2>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm text-nhs-dark-grey">
            <li className="flex gap-2">
              <span className="w-6 h-6 rounded-full bg-nhs-blue text-white flex items-center justify-center text-xs flex-shrink-0">1</span>
              <span>Staff initiates discharge from Patient List</span>
            </li>
            <li className="flex gap-2">
              <span className="w-6 h-6 rounded-full bg-nhs-blue text-white flex items-center justify-center text-xs flex-shrink-0">2</span>
              <span>System shows pending tasks for patient</span>
            </li>
            <li className="flex gap-2">
              <span className="w-6 h-6 rounded-full bg-nhs-blue text-white flex items-center justify-center text-xs flex-shrink-0">3</span>
              <span>Staff completes or cancels remaining tasks</span>
            </li>
            <li className="flex gap-2">
              <span className="w-6 h-6 rounded-full bg-nhs-blue text-white flex items-center justify-center text-xs flex-shrink-0">4</span>
              <span>Ward Admin reviews discharge checklist</span>
            </li>
            <li className="flex gap-2">
              <span className="w-6 h-6 rounded-full bg-nhs-blue text-white flex items-center justify-center text-xs flex-shrink-0">5</span>
              <span>Ward Admin confirms discharge</span>
            </li>
            <li className="flex gap-2">
              <span className="w-6 h-6 rounded-full bg-nhs-blue text-white flex items-center justify-center text-xs flex-shrink-0">6</span>
              <span>Patient moved to "Recent Discharges" with audit log</span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

function DPIASection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-nhs-black">DPIA Draft</h1>
        <p className="text-nhs-dark-grey mt-1">Data Protection Impact Assessment scaffold</p>
      </div>

      <div className="bg-nhs-warm-yellow/20 border border-nhs-warm-yellow rounded-lg p-4">
        <p className="text-sm text-nhs-black">
          <strong>Note:</strong> This is a draft DPIA scaffold. It requires review and completion
          by the Trust's IG team before Max/Max+ deployment.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">1. Project Overview</h2>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold text-nhs-dark-grey">Project Name</h3>
            <p className="text-nhs-dark-grey">Inpatient Hub (Ward Portal)</p>
          </div>
          <div>
            <h3 className="font-semibold text-nhs-dark-grey">Purpose</h3>
            <p className="text-nhs-dark-grey">
              Clinical reference tool and task management system for inpatient ward staff.
              Provides quick access to referral workflows, how-to guides, and useful links.
              Max+ deployment includes patient list and ward diary with PII.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-nhs-dark-grey">Data Controller</h3>
            <p className="text-nhs-dark-grey">Derbyshire Healthcare NHS Foundation Trust</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">2. Lawful Basis</h2>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold text-nhs-dark-grey">Primary Basis</h3>
            <p className="text-nhs-dark-grey">
              <strong>Article 6(1)(e)</strong> — Processing necessary for performance of a task
              carried out in the public interest (provision of healthcare).
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-nhs-dark-grey">Special Category Data (Health)</h3>
            <p className="text-nhs-dark-grey">
              <strong>Article 9(2)(h)</strong> — Processing necessary for medical diagnosis,
              provision of health treatment, and management of health systems.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">3. Data Categories</h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-nhs-pale-grey">
                <tr>
                  <th className="text-left p-2">Category</th>
                  <th className="text-left p-2">Examples</th>
                  <th className="text-left p-2">Mode Required</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="p-2">Staff identifiers</td>
                  <td className="p-2">Name, role, ward</td>
                  <td className="p-2">Medium+</td>
                </tr>
                <tr>
                  <td className="p-2">Patient identifiers</td>
                  <td className="p-2">Name, location</td>
                  <td className="p-2">Max+</td>
                </tr>
                <tr>
                  <td className="p-2">Health data</td>
                  <td className="p-2">MHA status, alerts, task notes</td>
                  <td className="p-2">Max+</td>
                </tr>
                <tr>
                  <td className="p-2">Audit data</td>
                  <td className="p-2">User actions, timestamps</td>
                  <td className="p-2">Medium+</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">4. Data Flows</h2>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="bg-nhs-pale-grey p-4 rounded-lg">
            <h3 className="font-semibold text-nhs-dark-grey mb-2">Light Mode (No PII)</h3>
            <p className="text-nhs-dark-grey">User → Browser localStorage (device only). No external transmission.</p>
          </div>
          <div className="bg-nhs-pale-grey p-4 rounded-lg">
            <h3 className="font-semibold text-nhs-dark-grey mb-2">Medium/Max (Supabase)</h3>
            <p className="text-nhs-dark-grey">User → Portal → Supabase (encrypted in transit, at rest). UK region.</p>
          </div>
          <div className="bg-nhs-pale-grey p-4 rounded-lg">
            <h3 className="font-semibold text-nhs-dark-grey mb-2">Max+ (Nexus Assurance)</h3>
            <p className="text-nhs-dark-grey">Nexus → Webhook → Portal (Trust network only). One-way inbound sync marks audit tasks as complete.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">5. Risks & Mitigations</h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-nhs-pale-grey">
                <tr>
                  <th className="text-left p-2">Risk</th>
                  <th className="text-left p-2">Likelihood</th>
                  <th className="text-left p-2">Impact</th>
                  <th className="text-left p-2">Mitigation</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="p-2">Unauthorised access to patient data</td>
                  <td className="p-2">Low</td>
                  <td className="p-2">High</td>
                  <td className="p-2">Trust SSO, RBAC, audit logs, session timeout</td>
                </tr>
                <tr>
                  <td className="p-2">Data breach via Supabase</td>
                  <td className="p-2">Low</td>
                  <td className="p-2">High</td>
                  <td className="p-2">RLS policies, encryption, UK region, access controls</td>
                </tr>
                <tr>
                  <td className="p-2">Staff misuse</td>
                  <td className="p-2">Low</td>
                  <td className="p-2">Medium</td>
                  <td className="p-2">Audit logging, manager review, IG training</td>
                </tr>
                <tr>
                  <td className="p-2">Data retained beyond necessity</td>
                  <td className="p-2">Medium</td>
                  <td className="p-2">Low</td>
                  <td className="p-2">Automated retention policies, discharge archival</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">6. Data Subject Rights</h2>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-nhs-dark-grey">
          <p>Patients can exercise rights via standard Trust IG channels:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Right of access (SAR)</li>
            <li>Right to rectification</li>
            <li>Right to erasure (where lawful basis permits)</li>
            <li>Right to restrict processing</li>
          </ul>
          <p className="mt-3">
            The portal does not create new patient records; it stores minimal operational data
            for task tracking. In Max+ mode, Nexus sends audit completion events via webhook.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">7. Sign-off (Pending)</h2>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-3 p-3 bg-nhs-pale-grey rounded-lg">
            <div className="w-4 h-4 border-2 border-nhs-mid-grey rounded" />
            <span className="text-nhs-dark-grey">Project Owner sign-off</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-nhs-pale-grey rounded-lg">
            <div className="w-4 h-4 border-2 border-nhs-mid-grey rounded" />
            <span className="text-nhs-dark-grey">IG Lead review</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-nhs-pale-grey rounded-lg">
            <div className="w-4 h-4 border-2 border-nhs-mid-grey rounded" />
            <span className="text-nhs-dark-grey">Caldicott Guardian (if required)</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-nhs-pale-grey rounded-lg">
            <div className="w-4 h-4 border-2 border-nhs-mid-grey rounded" />
            <span className="text-nhs-dark-grey">IT Security review</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ClinicalSafetySection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-nhs-black">Clinical Safety</h1>
        <p className="text-nhs-dark-grey mt-1">DCB 0129/0160 compliance notes</p>
      </div>

      <div className="bg-nhs-warm-yellow/20 border border-nhs-warm-yellow rounded-lg p-4">
        <p className="text-sm text-nhs-black">
          <strong>Note:</strong> This section provides a starter framework. Full clinical safety
          case requires Clinical Safety Officer review before Max/Max+ deployment.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Applicable Standards</h2>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-nhs-dark-grey">
          <div className="p-3 bg-nhs-pale-grey rounded-lg">
            <h3 className="font-semibold text-nhs-black">DCB 0129</h3>
            <p>Clinical Risk Management: its Application in the Manufacture of Health IT Systems</p>
          </div>
          <div className="p-3 bg-nhs-pale-grey rounded-lg">
            <h3 className="font-semibold text-nhs-black">DCB 0160</h3>
            <p>Clinical Risk Management: its Application in the Deployment and Use of Health IT Systems</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Hazard Log (Starter)</h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-nhs-pale-grey">
                <tr>
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">Hazard</th>
                  <th className="text-left p-2">Severity</th>
                  <th className="text-left p-2">Likelihood</th>
                  <th className="text-left p-2">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="p-2">H001</td>
                  <td className="p-2">Outdated clinical guidance displayed</td>
                  <td className="p-2">Medium</td>
                  <td className="p-2">Low</td>
                  <td className="p-2">Version control, review dates, source links</td>
                </tr>
                <tr>
                  <td className="p-2">H002</td>
                  <td className="p-2">Wrong patient task assigned</td>
                  <td className="p-2">Medium</td>
                  <td className="p-2">Low</td>
                  <td className="p-2">Patient confirmation, clear labelling, audit trail</td>
                </tr>
                <tr>
                  <td className="p-2">H003</td>
                  <td className="p-2">Missed task due to system unavailability</td>
                  <td className="p-2">Low</td>
                  <td className="p-2">Low</td>
                  <td className="p-2">Fallback to paper diary, uptime monitoring</td>
                </tr>
                <tr>
                  <td className="p-2">H004</td>
                  <td className="p-2">Discharge without completing safety tasks</td>
                  <td className="p-2">High</td>
                  <td className="p-2">Low</td>
                  <td className="p-2">Checklist enforcement, Ward Admin sign-off</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-nhs-mid-grey mt-3">
            This is a starter log. Full hazard identification requires clinical input.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Safety Case Outline</h2>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-nhs-dark-grey">
          <p><strong>Claim:</strong> Inpatient Hub is safe to deploy for its intended use.</p>
          <p><strong>Argument:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>All identified hazards have been assessed and controlled</li>
            <li>The system does not replace clinical decision-making</li>
            <li>Guidance content is sourced from authoritative sources with review dates</li>
            <li>Task management supplements (not replaces) existing ward processes</li>
          </ul>
          <p><strong>Evidence:</strong> Hazard log, testing records, user training, audit logs</p>
        </CardContent>
      </Card>
    </div>
  );
}

function SchemasSection({ schemaStatus }: { schemaStatus: SchemaStatus }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-nhs-black">Supabase Schemas</h1>
        <p className="text-nhs-dark-grey mt-1">Database structure and RLS policies</p>
      </div>

      {schemaStatus === "DRAFT" && (
        <div className="bg-nhs-warm-yellow/20 border border-nhs-warm-yellow rounded-lg p-4">
          <p className="text-sm text-nhs-black">
            <strong>DRAFT SCHEMA</strong> — These are proposed schemas. Replace with live Supabase
            export when available.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Core Tables</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 font-mono text-xs">
            <div className="bg-nhs-pale-grey p-4 rounded-lg overflow-x-auto">
              <pre>{`-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('staff', 'lead', 'manager', 'ward_admin', 'senior_admin')),
  is_contributor BOOLEAN DEFAULT FALSE,  -- Orthogonal flag, any role can have it
  ward TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);`}</pre>
            </div>

            <div className="bg-nhs-pale-grey p-4 rounded-lg overflow-x-auto">
              <pre>{`-- Patients table (Max+ only)
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  ward TEXT NOT NULL,
  room TEXT,
  bed TEXT,
  legal_status TEXT,
  admission_date DATE,
  admission_time TIMESTAMPTZ,           -- Triggers 72hr audit auto-generation
  ward_professional UUID REFERENCES users(id),  -- Assigned staff/lead/manager
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`}</pre>
            </div>

            <div className="bg-nhs-pale-grey p-4 rounded-lg overflow-x-auto">
              <pre>{`-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('ward', 'patient', 'appointment')),
  title TEXT NOT NULL,
  description TEXT,
  ward TEXT NOT NULL,
  patient_id UUID REFERENCES patients(id),
  due_date DATE NOT NULL,
  shift TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  claimed_by UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);`}</pre>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">RLS Policies (Draft)</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 font-mono text-xs">
            <div className="bg-nhs-pale-grey p-4 rounded-lg overflow-x-auto">
              <pre>{`-- Users can only see their own ward's patients
CREATE POLICY "Users see own ward patients"
ON patients FOR SELECT
USING (ward = (SELECT ward FROM users WHERE id = auth.uid()));

-- Managers and admins can manage patients in their ward
CREATE POLICY "Managers full patient access"
ON patients FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('manager', 'ward_admin', 'senior_admin')
    AND ward = patients.ward
  )
);

-- Contributors can edit content regardless of role
CREATE POLICY "Contributors edit content"
ON content FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND (is_contributor = TRUE OR role IN ('manager', 'senior_admin'))
  )
);`}</pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function WebhooksSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-nhs-black">Assurance Webhooks</h1>
        <p className="text-nhs-dark-grey mt-1">Power Automate integration spec</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Overview</h2>
        </CardHeader>
        <CardContent className="text-sm text-nhs-dark-grey space-y-3">
          <p>
            Ward tasks marked as "audit tasks" (fridge temps, controlled drugs, etc.) can
            automatically sync with the Trust's Assurance Dashboard via Power Automate webhooks.
          </p>
          <p>
            <strong>Light–Max:</strong> Link-only integration (button opens Assurance Dashboard)<br />
            <strong>Max+:</strong> Auto-sync via webhooks when task completed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Webhook Payload</h2>
        </CardHeader>
        <CardContent>
          <div className="bg-nhs-pale-grey p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`// Outbound: Task completion webhook
POST /webhook/assurance-task-complete
Headers:
  X-Webhook-Secret: [shared-secret]
  Content-Type: application/json

Body:
{
  "eventType": "task.completed",
  "taskId": "uuid",
  "auditType": "fridge_temps",
  "ward": "Byron",
  "completedBy": "Staff Name",
  "completedAt": "2026-01-29T08:30:00Z",
  "notes": "Optional completion notes",
  "idempotencyKey": "uuid"
}`}</pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Power Automate Example</h2>
        </CardHeader>
        <CardContent className="text-sm text-nhs-dark-grey space-y-3">
          <p>Trigger: HTTP Request (When a HTTP request is received)</p>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>Validate X-Webhook-Secret header</li>
            <li>Parse JSON body</li>
            <li>Check idempotencyKey against processed list</li>
            <li>Update Assurance Dashboard record</li>
            <li>Return 200 OK</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

function NexusSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-nhs-black">Nexus Assurance Integration (MAX+)</h1>
        <p className="text-nhs-dark-grey mt-1">Automated audit compliance sync</p>
      </div>

      <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
        <p className="text-sm text-nhs-black">
          <strong>PLANNED</strong> — Nexus Assurance is the Trust&apos;s internal compliance platform.
          The integration uses a one-way inbound webhook (Nexus → Hub) to auto-complete audit tasks.
          The Trust tech team builds and maintains the webhook on their side.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">What is Nexus?</h2>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-nhs-dark-grey">
          <p>
            Nexus Assurance is the Trust&apos;s internal compliance and audit platform. Staff currently
            log into Nexus separately to record completion of routine audit tasks such as fridge
            temperature checks, controlled drug counts, and environmental walkarounds.
          </p>
          <p>
            The Hub integration means that when a staff member completes an audit on Nexus,
            the corresponding task on the Hub is automatically marked as complete — removing
            the need to update both systems manually.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Integration Model</h2>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-nhs-dark-grey">
          <div className="p-3 bg-nhs-pale-grey rounded-lg">
            <h3 className="font-semibold text-nhs-black">Direction: One-Way Inbound</h3>
            <p>Nexus → Hub only. The Hub never writes to Nexus. This keeps the integration simple and avoids additional approval requirements.</p>
          </div>
          <div className="p-3 bg-nhs-pale-grey rounded-lg">
            <h3 className="font-semibold text-nhs-black">Mechanism: Webhook</h3>
            <p>The Trust tech team configures Nexus to POST a webhook when an audit is completed. The Hub receives and processes the event.</p>
          </div>
          <div className="p-3 bg-nhs-pale-grey rounded-lg">
            <h3 className="font-semibold text-nhs-black">Scope: Audit Tasks Only</h3>
            <p>Only applies to ward tasks flagged as audit tasks (fridge temps, controlled drugs, walkarounds, etc.). General tasks are unaffected.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Webhook Specification</h2>
        </CardHeader>
        <CardContent>
          <div className="bg-nhs-pale-grey p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`POST /api/nexus/task-complete

{
  "event": "audit_completed",
  "auditType": "fridge_temps",
  "ward": "byron",
  "completedBy": "Staff_A",
  "completedAt": "2026-03-04T08:15:00Z",
  "nexusRefId": "NX-2026-0304-001"
}

Response: 200 OK
{ "matched": true, "taskId": "wt-byron-1" }`}</pre>
          </div>
          <p className="text-xs text-nhs-mid-grey mt-2">
            The webhook is authenticated via a shared secret in the request header (X-Nexus-Token).
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Linked Task Types</h2>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              { icon: "🌡️", label: "Fridge Temperature Checks", type: "fridge_temps" },
              { icon: "💧", label: "Water Temperature Checks", type: "water_temps" },
              { icon: "💊", label: "Controlled Drugs Count", type: "controlled_drugs" },
              { icon: "🚶", label: "Shift Walkaround", type: "walkaround" },
              { icon: "❤️‍🩹", label: "Resus Equipment Check", type: "resus_check" },
              { icon: "🔥", label: "Fire Safety Check", type: "fire_safety" },
              { icon: "🔍", label: "Ligature Point Check", type: "ligature_check" },
            ].map((item) => (
              <div key={item.type} className="flex items-center gap-2 p-2 bg-nhs-pale-grey rounded text-sm">
                <span>{item.icon}</span>
                <span className="text-nhs-dark-grey">{item.label}</span>
                <code className="ml-auto text-xs text-nhs-mid-grey">{item.type}</code>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Implementation Notes</h2>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            "Trust tech team builds the webhook on the Nexus side",
            "Hub provides the /api/nexus/task-complete endpoint",
            "Authentication via shared secret (rotated quarterly)",
            "No PII transmitted — only audit type, ward, and staff ID",
            "Fallback: if webhook fails, staff can still mark task complete manually",
            "DPIA update required for Max+ deployment",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-2 bg-nhs-pale-grey rounded">
              <CheckCircle className="w-4 h-4 text-nhs-green flex-shrink-0" />
              <span className="text-sm text-nhs-dark-grey">{item}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function ReferencesSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-nhs-black">References</h1>
        <p className="text-nhs-dark-grey mt-1">Policy and standards titles</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Trust Policies</h2>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            "Data Protection Impact Assessment (DPIA)",
            "IT Change Control Policy and Procedure",
            "IT System Access Control Policy and Procedures",
            "Information Security Policy and Procedures",
            "Minimum and Accessible Information Standards for Health Records"
          ].map((policy, i) => (
            <div key={i} className="p-3 bg-nhs-pale-grey rounded-lg">
              <p className="text-sm text-nhs-dark-grey">{policy}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">External Standards</h2>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            "DCB 0129 — Clinical Risk Management (Manufacture)",
            "DCB 0160 — Clinical Risk Management (Deployment)",
            "Data Security and Protection Toolkit (DSPT)",
            "Cyber Essentials Plus",
            "UK GDPR / Data Protection Act 2018"
          ].map((standard, i) => (
            <div key={i} className="p-3 bg-nhs-pale-grey rounded-lg">
              <p className="text-sm text-nhs-dark-grey">{standard}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Documentation Links</h2>
        </CardHeader>
        <CardContent className="text-sm text-nhs-dark-grey">
          <p className="mb-3">Internal documentation (requires FOCUS access):</p>
          <ul className="space-y-1">
            <li>• Nexus Integration Spec: See Dev Panel &gt; Nexus Assurance section</li>
            <li>• Project Evaluation: <code>/docs/evaluations/</code></li>
            <li>• CLAUDE.md: Project decisions and roadmap</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
