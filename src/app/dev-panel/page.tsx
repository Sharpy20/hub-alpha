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
  FileWarning
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
  { id: "technical", label: "Technical Spec", icon: Server, priority: "must" },
  { id: "data-catalogue", label: "Data Catalogue", icon: Database, priority: "should" },
  { id: "rbac", label: "RBAC Matrix", icon: Users, priority: "must" },
  { id: "user-flows", label: "User Flows", icon: Workflow, priority: "should" },
  { id: "dpia", label: "DPIA Draft", icon: Shield, priority: "must" },
  { id: "clinical-safety", label: "Clinical Safety", icon: AlertTriangle, priority: "should" },
  { id: "schemas", label: "Supabase Schemas", icon: Database, priority: "later" },
  { id: "webhooks", label: "Assurance Webhooks", icon: GitBranch, priority: "later" },
  { id: "systemon", label: "SystmOne (MAX+)", icon: ExternalLink, priority: "later" },
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
      // Log access (demo audit)
      console.log(`[DEV PANEL AUDIT] Accessed at ${new Date().toISOString()}, MODE: ${version}`);
    }
  }, [version]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === DEV_PANEL_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("devPanelAuth", "authenticated");
      // Log access (demo audit)
      console.log(`[DEV PANEL AUDIT] Login at ${new Date().toISOString()}, MODE: ${version}`);
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
          {activeSection === "technical" && <TechnicalSpecSection />}
          {activeSection === "data-catalogue" && <DataCatalogueSection />}
          {activeSection === "rbac" && <RBACSection />}
          {activeSection === "user-flows" && <UserFlowsSection />}
          {activeSection === "dpia" && <DPIASection />}
          {activeSection === "clinical-safety" && <ClinicalSafetySection />}
          {activeSection === "schemas" && <SchemasSection schemaStatus={schemaConfig.schemaStatus} />}
          {activeSection === "webhooks" && <WebhooksSection />}
          {activeSection === "systemon" && <SystmOneSection />}
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
            incremental adoption from a public demo through to full SystemOne integration.
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
                  <td>Trust SSO + S1</td>
                  <td>Full integration</td>
                  <td>+ SystemOne sync</td>
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
                <li>• Max+: SystemOne API adapter</li>
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
│  │  Supabase   │    │  Power Automate │    │  SystemOne  │  │
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
│  │  • State mgmt   │    │  • /api/systemon│                │
│  └─────────────────┘    └────────┬────────┘                │
│                                  │                          │
│                    ┌─────────────┼─────────────┐           │
│                    │             │             │           │
│                    ▼             ▼             ▼           │
│            ┌───────────┐ ┌───────────┐ ┌───────────┐       │
│            │ Supabase  │ │ Webhook   │ │ S1 Adapter│       │
│            │ Client    │ │ Worker    │ │ (Max+)    │       │
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
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-nhs-pale-grey rounded-lg">
              <h3 className="font-semibold text-nhs-black">Normal User</h3>
              <p className="text-sm text-nhs-dark-grey">View content, claim tasks, suggest bookmarks</p>
            </div>
            <div className="p-3 bg-nhs-pale-grey rounded-lg">
              <h3 className="font-semibold text-nhs-black">Ward Admin</h3>
              <p className="text-sm text-nhs-dark-grey">+ Ward settings, discharge approval, view audit logs</p>
            </div>
            <div className="p-3 bg-nhs-pale-grey rounded-lg">
              <h3 className="font-semibold text-nhs-black">Contributor</h3>
              <p className="text-sm text-nhs-dark-grey">+ Edit workflows, guides, bookmarks</p>
            </div>
            <div className="p-3 bg-nhs-pale-grey rounded-lg">
              <h3 className="font-semibold text-nhs-black">Senior Admin</h3>
              <p className="text-sm text-nhs-dark-grey">+ User management, system settings, full audit access</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Permissions Matrix</h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-nhs-pale-grey">
                <tr>
                  <th className="text-left p-2">Feature</th>
                  <th className="text-center p-2">Normal</th>
                  <th className="text-center p-2">Ward Admin</th>
                  <th className="text-center p-2">Contributor</th>
                  <th className="text-center p-2">Senior Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="p-2">View bookmarks/workflows/guides</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                </tr>
                <tr>
                  <td className="p-2">Suggest new bookmark</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                </tr>
                <tr>
                  <td className="p-2">Claim/complete tasks</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                </tr>
                <tr>
                  <td className="p-2">Edit content (workflows/guides)</td>
                  <td className="p-2 text-center text-nhs-red">✗</td>
                  <td className="p-2 text-center text-nhs-red">✗</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                </tr>
                <tr>
                  <td className="p-2">Ward settings</td>
                  <td className="p-2 text-center text-nhs-red">✗</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-red">✗</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                </tr>
                <tr>
                  <td className="p-2">Approve discharges</td>
                  <td className="p-2 text-center text-nhs-red">✗</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-red">✗</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                </tr>
                <tr>
                  <td className="p-2">View audit logs</td>
                  <td className="p-2 text-center text-nhs-red">✗</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-red">✗</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                </tr>
                <tr>
                  <td className="p-2">User management</td>
                  <td className="p-2 text-center text-nhs-red">✗</td>
                  <td className="p-2 text-center text-nhs-red">✗</td>
                  <td className="p-2 text-center text-nhs-red">✗</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                </tr>
                <tr>
                  <td className="p-2">Dev Panel access</td>
                  <td className="p-2 text-center text-nhs-orange">Password</td>
                  <td className="p-2 text-center text-nhs-orange">Password</td>
                  <td className="p-2 text-center text-nhs-orange">Password</td>
                  <td className="p-2 text-center text-nhs-orange">Password</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-nhs-mid-grey mt-3">
            Note: Dev Panel uses secondary password in demo. Production would restrict to IT/IG roles.
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
              <span>(Max+) Sync status back to SystemOne Tasks</span>
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
            <h3 className="font-semibold text-nhs-dark-grey mb-2">Max+ (SystemOne)</h3>
            <p className="text-nhs-dark-grey">User → Portal → S1 API (Trust network only). No data stored in portal; read/write via API.</p>
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
            The portal does not create new patient records; it surfaces data from SystemOne (Max+)
            or stores minimal operational data for task tracking.
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
  role TEXT NOT NULL CHECK (role IN ('normal', 'ward_admin', 'contributor', 'senior_admin')),
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

-- Ward admins can see all patients in their ward
CREATE POLICY "Ward admins full patient access"
ON patients FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('ward_admin', 'senior_admin')
    AND ward = patients.ward
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

function SystmOneSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-nhs-black">SystmOne Integration (MAX+)</h1>
        <p className="text-nhs-dark-grey mt-1">TPP API preview and mock specs</p>
      </div>

      <div className="bg-nhs-purple/10 border border-nhs-purple rounded-lg p-4">
        <p className="text-sm text-nhs-black">
          <strong>PREVIEW ONLY</strong> — This section documents the planned SystmOne integration.
          No live API calls are made. Requires TPP API approval before implementation.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Integration Points</h2>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-nhs-dark-grey">
          <div className="p-3 bg-nhs-pale-grey rounded-lg">
            <h3 className="font-semibold text-nhs-black">Patient List Sync</h3>
            <p>Pull current ward patients from S1 → display in portal</p>
          </div>
          <div className="p-3 bg-nhs-pale-grey rounded-lg">
            <h3 className="font-semibold text-nhs-black">Task Sync</h3>
            <p>Bidirectional sync between portal tasks and S1 Tasks module</p>
          </div>
          <div className="p-3 bg-nhs-pale-grey rounded-lg">
            <h3 className="font-semibold text-nhs-black">Case Notes Push</h3>
            <p>Write referral completion notes to patient record</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">TPP API Approval Checklist</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              "Application registered with TPP",
              "API access request submitted",
              "Permissions scope agreed",
              "Test environment access granted",
              "DPIA updated for S1 integration",
              "Clinical safety review completed",
              "Production approval received"
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-nhs-pale-grey rounded">
                <div className="w-4 h-4 border-2 border-nhs-mid-grey rounded" />
                <span className="text-sm text-nhs-dark-grey">{item}</span>
              </div>
            ))}
          </div>
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
            <li>• SystemOne API Research: <code>/docs/progress reviews/SystemOne-API-Guide.md</code></li>
            <li>• Project Evaluation: <code>/docs/evaluations/</code></li>
            <li>• CLAUDE.md: Project decisions and roadmap</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
