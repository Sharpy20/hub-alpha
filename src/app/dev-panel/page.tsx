"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layout";
import { Card, CardContent, CardHeader } from "@/components/ui";
import { Roadmap } from "@/components/dev-panel/Roadmap";
import {
  X,
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
  ChevronDown,
  Map,
  Sparkles,
  Printer,
  HelpCircle,
} from "lucide-react";

// The dev panel's own password gate was removed (Session 11). The site-wide
// gate in src/proxy.ts covers this page along with everything else.

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

// Navigation sections.
// Most switch the panel's active section in place. An entry with `href` is a
// real route instead (the governance documents live at their own URL so they can
// be linked to directly and printed), and renders as a link, not a button.
const NAV_SECTIONS: {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  priority: string;
  href?: string;
}[] = [
  { id: "overview", label: "Overview & Pitch", icon: BookOpen, priority: "must" },
  { id: "business-case", label: "Business Case", icon: FileText, priority: "must" },
  { id: "technical", label: "Technical Spec", icon: Server, priority: "must" },
  { id: "data-catalogue", label: "Data Catalogue", icon: Database, priority: "should" },
  { id: "rbac", label: "RBAC Matrix", icon: Users, priority: "must" },
  { id: "user-flows", label: "User Flows", icon: Workflow, priority: "should" },
  { id: "dpia", label: "DPIA Draft", icon: Shield, priority: "must" },
  { id: "clinical-safety", label: "Clinical Safety", icon: AlertTriangle, priority: "should" },
  { id: "documents", label: "Governance Documents", icon: FileWarning, priority: "must", href: "/dev-panel/documents" },
  { id: "schemas", label: "Supabase Schemas", icon: Database, priority: "later" },
  { id: "webhooks", label: "Assurance Integration", icon: GitBranch, priority: "later" },
  { id: "nexus", label: "Nexus Assurance (planned)", icon: ExternalLink, priority: "later" },
  { id: "qa-pack", label: "Q&A Pack", icon: HelpCircle, priority: "must" },
  { id: "evaluations", label: "Role Evaluations", icon: Users, priority: "should" },
  { id: "roadmap", label: "Roadmap", icon: Map, priority: "must" },
  { id: "data-sources", label: "Data Sources", icon: FileText, priority: "must" },
  { id: "references", label: "References", icon: FileText, priority: "must" },
];

export default function DevPanelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>}>
      <DevPanelContent />
    </Suspense>
  );
}

function SchemaStatusBadge({ status }: { status: SchemaConfig["schemaStatus"] }) {
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
  const Icon = statusIcons[status];

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${statusColors[status]}`}>
      <Icon className="w-3 h-3" />
      Schema: {status}
    </div>
  );
}

function DevPanelContent() {
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get("section");
  const [activeSection, setActiveSection] = useState(sectionParam || "overview");
  const [schemaConfig] = useState<SchemaConfig>(INITIAL_SCHEMA_CONFIG);
  const [showTestNotice, setShowTestNotice] = useState(true);

  // Sync section from URL params
  useEffect(() => {
    if (sectionParam && NAV_SECTIONS.some(s => s.id === sectionParam)) {
      setActiveSection(sectionParam);
    }
  }, [sectionParam]);

  return (
    <MainLayout>
      {/* Test data notice */}
      {showTestNotice && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-amber-800 text-sm">Test data only</p>
            <p className="text-amber-700 text-xs mt-0.5">
              Everything here is demo data. No separate password for this panel -
              the shared site password covers the whole site.
            </p>
          </div>
          <button
            onClick={() => setShowTestNotice(false)}
            className="text-amber-400 hover:text-amber-600 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="flex gap-6">
        {/* Left Navigation */}
        <aside className="w-64 flex-shrink-0">
          <div className="sticky top-4 space-y-4">
            {/* Schema Status Widget */}
            <Card className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-nhs-dark-grey">Schema Status</span>
                <SchemaStatusBadge status={schemaConfig.schemaStatus} />
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
                  const priorityConfig = {
                    must: { dot: "bg-nhs-green", label: "Core" },
                    should: { dot: "bg-amber-400", label: "Planned" },
                    later: { dot: "bg-gray-300", label: "Future" },
                  }[section.priority] || { dot: "bg-gray-300", label: "" };
                  const inner = (
                    <>
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1">{section.label}</span>
                      {!isActive && (
                        <span className={`w-2 h-2 rounded-full ${priorityConfig.dot}`} title={priorityConfig.label} />
                      )}
                    </>
                  );
                  const classes = `w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors text-left ${
                    isActive ? "bg-nhs-blue text-white" : "text-nhs-dark-grey hover:bg-nhs-pale-grey"
                  }`;
                  // Entries with an href navigate to a real page rather than
                  // switching the section rendered inside this one.
                  if (section.href) {
                    return (
                      <Link key={section.id} href={section.href} className={classes}>
                        {inner}
                      </Link>
                    );
                  }
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={classes}
                    >
                      {inner}
                    </button>
                  );
                })}
              </nav>
              <div className="mt-2 pt-2 border-t border-gray-100 px-3 flex items-center gap-3 text-[10px] text-nhs-mid-grey">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-nhs-green" /> Core</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Planned</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gray-300" /> Future</span>
              </div>
            </Card>

            {/* Mode indicator */}
            <Link href="/" className="block text-xs text-center text-nhs-mid-grey hover:text-nhs-blue transition-colors no-underline mt-2">
              &larr; Back to wardHub
            </Link>
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
          {activeSection === "qa-pack" && <QAPackSection />}
          {activeSection === "evaluations" && <EvaluationsSection />}
          {activeSection === "roadmap" && <Roadmap />}
          {activeSection === "data-sources" && <DataSourcesSection />}
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
        <h1 className="text-2xl font-bold text-nhs-black">wardHub – Overview</h1>
        <p className="text-nhs-dark-grey mt-1">Technical documentation and governance pack</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">60-Second Elevator Pitch</h2>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>
            Every tool we have had for ward coordination could only do one thing: <em>watch</em> the work.
            Weekly reports, red-to-green meetings, dashboards, audits. They exist because the information
            does not surface itself, so someone has to go and collect it - which is why band 6s lose long
            stretches of the week to audit instead of the floor.
          </p>
          <p>
            <strong>wardHub flips that.</strong> Instead of adding a layer above the work, it sits where the
            work happens. Jobs from every source - admission, ward round, referral, MDT - land in one funnel.
            Staff see the job, an interactive guide shows them how to do it, and the case note writes itself.
          </p>
          <p>
            Because the work happens in the tool, <strong>the oversight falls out for free</strong>: the RAG
            picture, the MDT list, the discharge barriers, the audit trail. One view, no extra labour, nobody
            taken off the floor to compile it. <strong>Same assurance, fewer audits.</strong>
          </p>
          <p>
            No training needed &ndash; the guides are the training. Built by a ward staff nurse in his own time.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">5-Minute Deep Dive</h2>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none space-y-4">
          <div>
            <h3 className="text-base font-semibold text-nhs-dark-blue">The Gap</h3>
            <p>
              FOCUS has a depth of knowledge around Trust systems, but falls short on external workflows
              used daily on the ward. Tasks are scattered across emails, Teams, handovers, whiteboards, and
              bits of paper. New starters rely on colleagues being free to show them processes. Referrals
              that should happen on admission sometimes get missed.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-nhs-dark-blue">The Solution</h3>
            <p>
              wardHub brings together three things in one place:
            </p>
            <ul>
              <li><strong>Interactive Guides</strong> &ndash; Step-by-step walkthroughs for referrals, assessments and ward processes. Finishing one produces the case note to paste into SystmOne</li>
              <li><strong>Electronic Jobs Diary</strong> &ndash; Shared job tracking with claim and structured hand-back, replacing the paper diary. A hand-back records who it is waiting on and generates a case note even when the job is not finished</li>
              <li><strong>Assurance as a by-product</strong> &ndash; Because the jobs live here, the oversight view builds itself: discharge barriers, waiting-on, review coverage, RAG by ward. Nobody compiles it</li>
            </ul>
            <p className="text-xs text-nhs-mid-grey">
              This list used to lead its third item with &ldquo;Nexus Nudges&rdquo;, an integration that
              is planned but not built. The by-product oversight is the pillar that actually exists and
              is the one demonstrated. Nexus is still on the roadmap - see the Nexus Assurance section.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-nhs-dark-blue">Why It Could Work</h3>
            <ul>
              <li><strong>No training required</strong> &ndash; the interactive guides are the training</li>
              <li><strong>Built by ward staff</strong> &ndash; designed by people who do the job every day</li>
              <li><strong>Resources grow organically</strong> &ndash; users add links, request guides, flag gaps</li>
              <li><strong>Nothing exotic to host</strong> &ndash; a conventional web app with no external service dependencies, which is what makes Trust hosting a realistic ask rather than a project</li>
            </ul>
            <p className="text-xs text-nhs-mid-grey">
              That last point used to read &ldquo;Trust hosted &ndash; runs on Trust IT
              infrastructure&rdquo;. <strong>It does not.</strong> The demo runs on Vercel,
              outside the Trust, behind one shared password. Moving it inside is one of the
              decisions being asked for, not something already done.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-nhs-dark-blue">Governance Fit</h3>
            <p>
              Nothing in the demo needs permission, and that was deliberate: it holds no real patient
              data, stores no jobs, and every internal contact reads &ldquo;Hidden in demo mode&rdquo;.
              <strong> Everything on the roadmap does need permission</strong>, and that is the
              conversation being asked for.
            </p>
            <p>
              The ask is a <strong>two-ward pilot on the full build</strong> - not a guides-only trial -
              because every measure worth having (referral time, missed referrals, discharge barriers,
              review coverage) only means something once the whole funnel exists. That makes it a real
              project: a completed <strong>DPIA</strong>, a Trust-approved datastore, Trust
              authentication, and a <strong>DCB 0129/0160</strong> clinical safety review. The draft
              DPIA and the hazard log are already written and in this panel, so the Trust is being
              handed a starting point rather than a blank form.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BusinessCaseSection() {
  const [expanded, setExpanded] = useState<string | null>("executive-summary");
  const [printMode, setPrintMode] = useState(false);

  const handlePrint = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 300);
  };

  const sections = [
    {
      id: "executive-summary",
      title: "1. Executive Summary",
      content: (
        <div className="prose prose-sm max-w-none text-nhs-dark-grey space-y-3">
          <p>
            <strong>wardHub</strong> is a reference and task management tool built around the needs of an inpatient ward.
            Referral processes are presented as interactive step-by-step guides &ndash; pulling together official forms,
            Trust SOPs, good examples, and service admission criteria into one place.
          </p>
          <p>
            As a nice bonus, these can all link through to a simple electronic jobs diary, helping individuals stay
            organised and improving team communication between shifts.
          </p>
          <p>
            Implemented well, this tool needs no staff training &ndash; just log in and go.
          </p>
        </div>
      ),
    },
    {
      id: "background",
      title: "2. Background & Current State",
      content: (
        <div className="space-y-3 text-sm text-nhs-dark-grey">
          <p>Ward staff manage a wide range of processes daily. Some are well supported, others less so:</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-semibold text-blue-800">FOCUS</p>
              <p className="text-blue-700">A depth of knowledge, especially around Trust systems. Falls short on external workflows and processes used daily on the ward &ndash; referrals, community services, external agency contacts.</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="font-semibold text-amber-800">Jobs Everywhere</p>
              <p className="text-amber-700">Patient tasks generated in MDMs, meetings, rapid reviews, handovers, audits, 1:1s &ndash; communicated out via emails, Teams, group chats, handover, case notes, verbally, diaries, whiteboards, bits of paper.</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="font-semibold text-amber-800">Delayed Discharges</p>
              <p className="text-amber-700">Tasks are getting missed or avoided. Referrals that should happen on admission get forgotten. Discharges are being affected.</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="font-semibold text-amber-800">Local Knowledge</p>
              <p className="text-amber-700">So many processes &ndash; everyone needs to be shown at least once but no one is free to teach. A common complaint of students, preceptees, and new starters.</p>
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
          <ul className="space-y-3">
            <li className="flex gap-2">
              <span className="text-amber-500 font-bold">&bull;</span>
              <span><strong>New staff can&apos;t find forms</strong> &ndash; Referral processes rely on asking colleagues, leading to delays and inconsistency. wardHub puts every form, SOP, and example in one guided workflow.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-500 font-bold">&bull;</span>
              <span><strong>No audit trail for tasks</strong> &ndash; Paper diaries are harder to audit, and even harder when tasks are scattered between personal diaries, emails, chats, and whiteboards. A shared digital record makes everything visible.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-500 font-bold">&bull;</span>
              <span><strong>Compliance tracking</strong> &ndash; Ward audits are well provisioned through the Nexus platform with compliance tracking already in place. Wards fall down when they forget to do the task. wardHub already surfaces audit jobs on the diary when they are due, with a link straight to Nexus. <em>Planned, not built:</em> a one-way inbound link so that completing the audit on Nexus ticks the job here and stops the nudge. That needs Trust tech involvement and is on the roadmap, not in the product.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-500 font-bold">&bull;</span>
              <span><strong>Poor handovers</strong> &ndash; Critical tasks fall through the gaps between shifts without a shared digital record. wardHub carries tasks forward automatically and shows the whole team what&apos;s outstanding.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-500 font-bold">&bull;</span>
              <span><strong>Steep learning curve</strong> &ndash; Bank and agency staff take weeks to learn ward processes that could be guided digitally from day one.</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "options",
      title: "4. Options",
      content: (
        <div className="space-y-4 text-sm">
          <p className="text-nhs-dark-grey">There are really only two options here:</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-5 bg-gray-50 rounded-xl border-2 border-gray-200">
              <h4 className="font-bold text-gray-700 mb-3">Continue as we are</h4>
              <p className="text-gray-600 mb-3">Nothing changes. Staff keep using the tools they have now.</p>
              <div className="space-y-2 text-gray-500">
                <p>&bull; FOCUS for Trust information</p>
                <p>&bull; Tasks across emails, Teams, handovers, paper</p>
                <p>&bull; New starters learn by asking around</p>
                <p>&bull; Referrals rely on local knowledge</p>
              </div>
              <div className="mt-4 p-2 bg-gray-100 rounded text-center">
                <p className="text-gray-500 text-xs">This is fine &ndash; it&apos;s what we do now</p>
              </div>
            </div>
            <div className="p-5 bg-green-50 rounded-xl border-2 border-green-300">
              <h4 className="font-bold text-green-800 mb-3">Try wardHub alongside</h4>
              <p className="text-green-700 mb-3">Give it a go on two wards. See if staff find it useful. Nothing to lose.</p>
              <div className="space-y-2 text-green-600">
                <p>&bull; No budget needed</p>
                <p>&bull; No training needed</p>
                <p>&bull; Doesn&apos;t replace anything</p>
                <p>&bull; Staff can stop using it anytime</p>
                <p>&bull; Nothing exotic to host, so Trust hosting is a realistic ask</p>
              </div>
              <div className="mt-4 p-2 bg-green-200 rounded text-center">
                <p className="font-semibold text-green-800 text-xs">Low risk &ndash; easy to try, easy to stop</p>
              </div>
            </div>
          </div>
          <div className="bg-nhs-pale-grey rounded-lg p-3 mt-2">
            <p className="text-nhs-dark-grey">
              wardHub isn&apos;t a replacement for FOCUS, SystmOne, or any existing system. It sits alongside them and fills in some gaps &ndash;
              particularly around external referral workflows, task visibility between shifts, and helping new staff find their feet quickly.
              If it turns out not to be useful, we just stop. Nothing is disrupted.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "financial",
      title: "5. Financial Case",
      content: (
        <div className="space-y-4 text-sm">
          <p className="text-nhs-dark-grey">
            wardHub is designed to run on <strong>Trust IT infrastructure only</strong>. Two routes are available:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className="font-bold text-blue-800 mb-2">Route A: Trust IT Build</h4>
              <p className="text-blue-700">Trust IT team rebuild or adopt the codebase onto Trust infrastructure. Full ownership and control.</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className="font-bold text-blue-800 mb-2">Route B: Security Audit</h4>
              <p className="text-blue-700">Trust IT security-audit the existing code and approve it for deployment on Trust servers as-is.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-nhs-pale-grey">
                <tr>
                  <th className="text-left p-3">Item</th>
                  <th className="text-left p-3">Detail</th>
                  <th className="text-left p-3">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="p-3 font-semibold">Hosting</td>
                  <td className="p-3">Trust IT infrastructure (existing servers)</td>
                  <td className="p-3 font-bold text-green-700">Minimal / included</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Development</td>
                  <td className="p-3">Built by a ward staff nurse in his own time</td>
                  <td className="p-3 font-bold text-green-700">&pound;0</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Licensing</td>
                  <td className="p-3">Open source stack &ndash; no vendor fees</td>
                  <td className="p-3 font-bold text-green-700">&pound;0</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Monthly running</td>
                  <td className="p-3">Lightweight web app on Trust servers</td>
                  <td className="p-3 font-bold text-green-700">Minimal</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-nhs-pale-grey rounded-lg p-3">
            <p className="text-nhs-dark-grey">Either route keeps wardHub on Trust-managed infrastructure. No external hosting dependency. Monthly running costs are minimal for a lightweight web application.</p>
          </div>
        </div>
      ),
    },
    {
      id: "benefits",
      title: "6. Benefits",
      content: (
        <div className="space-y-4 text-sm">
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-300">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-amber-600" />
              <h4 className="font-bold text-amber-800 text-lg">Significant Win: Reduced Onboarding</h4>
            </div>
            <p className="text-amber-900">
              New starters, bank staff, and agency nurses could walk onto the ward and immediately follow
              step-by-step guides for any process. No waiting to be shown. No &ldquo;where do I find the form?&rdquo;
              questions. This alone could save hours per new starter and reduce errors from day one.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-bold text-nhs-dark-blue">Potential Clinical Benefits</h4>
              <div className="space-y-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <p className="text-blue-800">Earlier referrals &ndash; prompts at admission could reduce delayed discharges</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <p className="text-blue-800">Shared task visibility should improve handovers between shifts</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <p className="text-blue-800">Nexus nudges &ndash; measurable improvements in compliance tracking predicted, once the link is built</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-nhs-dark-blue">Potential Operational Benefits</h4>
              <div className="space-y-2">
                <div className="p-2 bg-green-50 rounded-lg">
                  <p className="text-green-800">Task claiming prevents duplicate work &ndash; a common recording issue on the ward</p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <p className="text-green-800">Shared digital diary &ndash; searchable, auditable, easier to evidence</p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <p className="text-green-800">Interactive guides are the training &ndash; no separate learning curve</p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
            <p className="text-slate-600 text-xs">wardHub is a resource and coordination tool &ndash; not a performance management tool. It supports staff, not monitors them.</p>
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
                <td className="p-2">Ward champion on each of the two pilot wards; iterative feedback; nothing is mandatory, so low use is a signal rather than a failure</td>
              </tr>
              <tr>
                <td className="p-2">Data security concerns</td>
                <td className="p-2">Low</td>
                <td className="p-2">High</td>
                <td className="p-2">The demo holds no real patient data and stores no tasks. The pilot being asked for <strong>does</strong> hold real patient data, so it is gated on a completed DPIA, Trust-approved hosting, Trust authentication and a clinical safety review - not on this table</td>
              </tr>
              <tr>
                <td className="p-2">Content is wrong or out of date at pilot</td>
                <td className="p-2">High</td>
                <td className="p-2">High</td>
                <td className="p-2">The project&apos;s largest real risk, and currently uncontrolled: of 68 guides, <strong>1</strong> is signed off green, 47 await review and 20 are still in development. Every guide carries a visible traffic-light badge so staff can see its status, and the sign-off-by-specialty model exists to clear the backlog. A pilot should not start on guides still showing red</td>
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
                <td className="p-2">Clear governance process; changes require approval before deployment</td>
              </tr>
              <tr>
                <td className="p-2">Clinical safety</td>
                <td className="p-2">Low</td>
                <td className="p-2">High</td>
                <td className="p-2">Tool is a reference and task aid only - nothing interprets patient information, nothing scores or recommends. A DCB 0129 hazard log, risk management plan and safety case are written and published in this panel. <strong>Not closed:</strong> no Clinical Safety Officer is appointed, and the medical device question raised at the sponsor session (HAZ-024) is open</td>
              </tr>
              <tr>
                <td className="p-2">Out-of-date content</td>
                <td className="p-2">Medium</td>
                <td className="p-2">Medium</td>
                <td className="p-2">Verification badges flag content age; contributors can update guides; broken link reporting built in</td>
              </tr>
              <tr>
                <td className="p-2">Ongoing maintenance</td>
                <td className="p-2">Low</td>
                <td className="p-2">Low</td>
                <td className="p-2">Content maintained by ward staff via the contributor role. Server management is real once the pilot runs on Trust infrastructure, which is part of what is being asked for</td>
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
              <h4 className="font-bold text-nhs-black">Pilot Phase – Two Wards</h4>
              <p className="text-nhs-dark-grey mt-1">Try wardHub on two wards with real use. It&apos;s up to each ward how much they use &ndash; whether that&apos;s just the links and guides, or the diary for everything. Resources build organically as staff add links, request guides, and flag gaps. Gather feedback over 4-6 weeks. Two wards rather than one because the measures worth having (referral time, missed referrals, discharge barriers, review coverage) need somewhere to compare against.</p>
              <p className="text-nhs-dark-grey mt-2 text-xs"><strong>Pilot owner:</strong> Project owner (ward staff nurse) &ndash; <strong>Success criteria:</strong> Staff find it useful, resources grow organically, no negative impact on existing workflows.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
            <div className="flex-1">
              <h4 className="font-bold text-nhs-black">Expand to All Wards</h4>
              <p className="text-nhs-dark-grey mt-1">If the pilot goes well and staff find it useful, explore rolling out to other wards on Trust IT infrastructure. Fuller use of the diary and task system with appropriate access controls. Requires ward manager buy-in and DPIA approval.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
            <div className="flex-1">
              <h4 className="font-bold text-nhs-black">Trust Integration</h4>
              <p className="text-nhs-dark-grey mt-1">If there&apos;s appetite, explore Nexus Assurance integration for automated audit nudges. Would need Trust tech team involvement for webhook setup. Clinical safety review at this stage.</p>
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
            <h4 className="font-bold text-green-800 text-lg mb-2">Come and Have a Look</h4>
            <p className="text-green-700">
              We&apos;ve built something on the ward that we think could be genuinely useful.
              We&apos;d love for you to see it, kick the tyres, and tell us what you think.
            </p>
          </div>
          <div className="bg-nhs-pale-grey rounded-lg p-4">
            <p className="text-nhs-dark-grey">
              <strong>What we&apos;re asking for:</strong> Permission to trial the tool on two wards with light, real use.
              No budget required. It sits alongside existing systems &ndash; it doesn&apos;t
              replace anything. Staff can stop using it at any time. If it&apos;s useful, great. If not, nothing lost.
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
            { role: "Ward Manager", scope: "Pilot approval for each of the two pilot wards", phase: "Pilot" },
            { role: "Matron", scope: "Awareness and support for pilot", phase: "Pilot" },
            { role: "Digital Services", scope: "Technical review and hosting approval", phase: "Rollout" },
            { role: "Information Governance", scope: "DPIA review (when PII introduced)", phase: "Trust-wide" },
            { role: "Clinical Safety Officer", scope: "DCB 0129/0160 assessment", phase: "Trust-wide" },
          ].map((item) => (
            <div key={item.role} className="flex items-center gap-3 p-3 bg-nhs-pale-grey rounded-lg">
              <div className="w-5 h-5 border-2 border-nhs-mid-grey rounded flex-shrink-0" />
              <div className="flex-1">
                <span className="font-semibold text-nhs-black">{item.role}</span>
                <span className="text-nhs-dark-grey"> – {item.scope}</span>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-nhs-black">Business Case</h1>
          <p className="text-nhs-dark-grey mt-1">Phased rollout proposal for Trust approval</p>
        </div>
        <button
          onClick={handlePrint}
          className="print:hidden inline-flex items-center gap-2 px-4 py-2 bg-nhs-blue text-white font-semibold rounded-lg hover:bg-nhs-dark-blue transition-colors text-sm"
        >
          <Printer className="w-4 h-4" />
          Print Version
        </button>
      </div>

      <div className="bg-green-50 border border-green-300 rounded-lg p-4">
        <p className="text-sm text-green-900">
          <strong>Status, 31 July 2026: the pilot was agreed.</strong> This business case was
          written to make the ask, and the ask was made at the executive sponsor session on
          30 July 2026. A two-ward pilot on the full build, content sign-off by specialty, and
          named leads for clinical safety, IG and digital impact were all agreed. It is kept
          here as written, because it is the reasoning behind a decision rather than a request
          still waiting on one. What has to happen before a pilot can actually start is in the
          Roadmap, Phase 2.
        </p>
      </div>

      <div className="bg-nhs-blue/10 border border-nhs-blue rounded-lg p-4">
        <p className="text-sm text-nhs-black">
          <strong>Purpose:</strong> This is an informal proposal to share something we&apos;ve been working on at ward level.
          We&apos;re not asking for budget or big changes &ndash; just a chance to pilot it and see if it&apos;s useful.
        </p>
      </div>

      <div className="space-y-2">
        {sections.map((section) => {
          const isOpen = expanded === section.id || printMode;
          return (
            <div key={section.id} className={`border border-gray-200 rounded-xl overflow-hidden ${printMode ? "break-inside-avoid" : ""}`}>
              <button
                onClick={() => !printMode && setExpanded(expanded === section.id ? null : section.id)}
                aria-expanded={isOpen}
                aria-controls={`bc-${section.id}`}
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left print:hover:bg-white"
              >
                <span className="font-semibold text-nhs-black">{section.title}</span>
                <ChevronDown className={`w-5 h-5 text-nhs-mid-grey transition-transform print:hidden ${isOpen ? "rotate-180" : ""}`} />
              </button>
              <div
                id={`bc-${section.id}`}
                role="region"
                className={isOpen ? "p-4 pt-0 bg-white border-t border-gray-100" : "sr-only"}
                aria-hidden={!isOpen}
              >
                {section.content}
              </div>
            </div>
          );
        })}
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
                <li>• Today: no backend. Jobs are React state, wiped by a refresh</li>
                <li>• Today: preferences in browser localStorage (<code className="text-xs">wardhub_*</code> keys)</li>
                <li>• Wired but dormant: Supabase (PostgreSQL). No feature queries it</li>
                <li>• Planned: Nexus webhook receiver (<code className="text-xs">/api/nexus/task-complete</code>)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-nhs-dark-grey mb-2">Hosting</h3>
              <ul className="text-sm space-y-1 text-nhs-dark-grey">
                <li>• Today: Vercel, behind one shared site password</li>
                <li>• Proposed: Trust infrastructure with Trust authentication</li>
                <li>• Custom domain: wardHub.live</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-nhs-dark-grey mb-2">CI/CD</h3>
              <ul className="text-sm space-y-1 text-nhs-dark-grey">
                <li>• GitHub (Sharpy20 account, private repo)</li>
                <li>• GitHub Actions on every push and PR: typecheck, lint, test, build</li>
                <li>• Vercel auto-deploy on push to main (independent of the CI gate)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">System Context (C4 Level 1)</h2>
          <p className="text-xs text-nhs-mid-grey mt-1">
            Two diagrams, because today and the proposal are genuinely different shapes. The old
            single diagram put wardHub inside the Trust boundary, which is not where it runs.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-nhs-pale-grey p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`TODAY - outside the Trust boundary

  Ward staff, any browser
    |
    |  https, one shared password
    v
  wardHub (Next.js on Vercel)  <-- NOT Trust infrastructure
    |
    +-- /api/auth/verify-password   the only API route that exists
    |     sets site_access cookie (httpOnly, 7 days)
    |
    +-- everything else is static or in-browser
          jobs      -> React state, gone on refresh
          settings  -> localStorage on that device

  Supabase project .............. wired, dormant, not queried by the app
                                  (one scheduled keep-alive SELECT per day)
  Nexus Assurance ............... link only, a button that opens its dashboard
  SystmOne ...................... no connection. Case notes are copied by hand`}</pre>
          </div>
          <div className="bg-nhs-pale-grey p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`PROPOSED - inside the Trust boundary

  Ward staff
    |
    |  Trust authentication (SSO), individual accounts
    v
  wardHub, hosted by the Trust
    |
    +-- Trust-approved datastore    jobs, patients, hand-back history, audit
    |
    +-- Nexus Assurance             ONE WAY IN: a completed audit ticks a job
    |                               wardHub never writes to Nexus
    |
    +-- SystmOne                    still no connection, still copied by hand
                                    (deliberate - wardHub is not the record)`}</pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Container Diagram (C4 Level 2)</h2>
          <p className="text-xs text-nhs-mid-grey mt-1">
            What is actually in the repository. The previous version listed
            <code className="bg-gray-100 px-1 rounded">/api/tasks</code>,
            <code className="bg-gray-100 px-1 rounded">/api/patients</code>, a webhook worker and a
            Nexus receiver. None of them exist - there is exactly one API route.
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-nhs-pale-grey p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`wardHub (one Next.js app, App Router)

  src/proxy.ts .................. the gate. No site_access cookie -> /password
                                  also resolves legacy routes and, when the
                                  root/v2 split is switched back on, blocks
                                  the patient routes at the root

  src/app/ ...................... pages
    guides/[id] ................. one viewer for all 68 guides
    guides/<static> ............. builders and checkers that override [id]
    tasks/ ...................... team diary
    my-tasks/ ................... My Jobs board (To do / Waiting / Done)
    patients/ ................... patient list, transfer, discharge
    overview/ ................... barriers, waiting-on, review coverage
    quiz/ service-map/ links/ ... the rest
    dev-panel/ .................. this page
    api/auth/verify-password .... THE ONLY API ROUTE

  src/app/providers.tsx ......... user, ward, theme (localStorage)
  tasks-provider.tsx ............ every job, in useState. NOT PERSISTED

  src/lib/data/ ................. all content, as TypeScript
    guides/ catalog.ts .......... the guide index
    approval-status.ts .......... the traffic lights. Mike's editorial sign-off
    tasks/index.ts .............. the fictional demo cast and job templates
    service-map.ts .............. ~115 services
    quiz/ ....................... 942 questions

  src/lib/supabase/client.ts .... deliberately NOT exported from the barrel,
                                  so its URL and keys never reach the bundle`}</pre>
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
                  <th className="text-left p-2">Stored today</th>
                  <th className="text-left p-2">Stored in a live build</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="p-2 font-medium">Links</td>
                  <td className="p-2"><span className="text-nhs-green">No</span></td>
                  <td className="p-2">In the code (static)</td>
                  <td className="p-2">Trust-approved datastore</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Workflows</td>
                  <td className="p-2"><span className="text-nhs-green">No</span></td>
                  <td className="p-2">In the code (static)</td>
                  <td className="p-2">Trust-approved datastore</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Guides</td>
                  <td className="p-2"><span className="text-nhs-green">No</span></td>
                  <td className="p-2">In the code (static)</td>
                  <td className="p-2">Trust-approved datastore</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Users</td>
                  <td className="p-2"><span className="text-nhs-orange">Staff names</span></td>
                  <td className="p-2">Fictional cast in the code; the chosen demo user in localStorage</td>
                  <td className="p-2">Trust authentication</td>
                </tr>
                <tr className="bg-red-50">
                  <td className="p-2 font-medium">Team Jobs</td>
                  <td className="p-2"><span className="text-nhs-green">No</span></td>
                  <td className="p-2 font-semibold">Nowhere. React state, wiped by a refresh</td>
                  <td className="p-2">Trust-approved datastore</td>
                </tr>
                <tr className="bg-red-50">
                  <td className="p-2 font-medium">Patient Jobs</td>
                  <td className="p-2"><span className="text-nhs-red">Yes (in a live build)</span></td>
                  <td className="p-2 font-semibold">Nowhere. React state, wiped by a refresh</td>
                  <td className="p-2">Trust-approved datastore</td>
                </tr>
                <tr className="bg-red-50">
                  <td className="p-2 font-medium">Patients</td>
                  <td className="p-2"><span className="text-nhs-red">Yes (in a live build)</span></td>
                  <td className="p-2 font-semibold">Nowhere. Fictional cast generated at load</td>
                  <td className="p-2">Trust-approved datastore</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Hand-back / job history</td>
                  <td className="p-2"><span className="text-nhs-orange">Staff names</span></td>
                  <td className="p-2">Nowhere. Append-only in memory only</td>
                  <td className="p-2">Trust-approved datastore. Retention to agree</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Audit Logs</td>
                  <td className="p-2"><span className="text-nhs-orange">User IDs</span></td>
                  <td className="p-2">Not implemented</td>
                  <td className="p-2">Trust-approved datastore</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="p-2 font-medium">Personal Links</td>
                  <td className="p-2"><span className="text-nhs-green">No</span></td>
                  <td className="p-2">localStorage (that browser only)</td>
                  <td className="p-2">Per-user record</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="p-2 font-medium">Link Recommendations</td>
                  <td className="p-2"><span className="text-nhs-green">No</span></td>
                  <td className="p-2">localStorage (that browser only)</td>
                  <td className="p-2">Per-user record, with approval queue</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="p-2 font-medium">Preferences (theme, guide order, diary view)</td>
                  <td className="p-2"><span className="text-nhs-green">No</span></td>
                  <td className="p-2">localStorage (<code className="text-xs">wardhub_*</code> keys)</td>
                  <td className="p-2">Per-user record</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Contact Data Classification</h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-nhs-dark-grey mb-4">
            Links, referral contacts, and guide content follow a two-tier classification to protect trust-sensitive information in the public demo while keeping real data ready for authenticated deployment.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-nhs-pale-grey">
                <tr>
                  <th className="text-left p-2">Classification</th>
                  <th className="text-left p-2">Rule</th>
                  <th className="text-left p-2">Demo Display</th>
                  <th className="text-left p-2">Examples</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr className="bg-green-50">
                  <td className="p-2 font-medium text-nhs-green">Public</td>
                  <td className="p-2">Findable on a public .gov.uk, .nhs.uk, or charity website</td>
                  <td className="p-2">Shown live</td>
                  <td className="p-2 text-xs">Samaritans (116 123), Derbyshire SAB website, Call Derbyshire (01629 533190), EMAS PTS (0300 300 3434), BNF, NICE</td>
                </tr>
                <tr className="bg-amber-50">
                  <td className="p-2 font-medium text-nhs-orange">Trust-sensitive</td>
                  <td className="p-2">Direct-dial, internal extension, named staff mobile, @nhs.net email, FOCUS URL, or internal system URL</td>
                  <td className="p-2"><code className="bg-gray-100 px-1 rounded text-xs">Hidden in demo mode</code> with FOCUS badge</td>
                  <td className="p-2 text-xs">Safeguarding advice line, MASH direct numbers, ward extensions, Datix URLs, SystmOne SOPs, named staff contacts</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">How it works:</span> trust-sensitive values are <strong>not in the codebase at all</strong>. They were stripped out on 27 July 2026 and are held in a single file outside the repository, keyed by entry id. The app ships the entry with its real value absent, so what renders is &ldquo;Hidden in demo mode&rdquo;. At go-live the values are loaded back in against their ids - a short, reviewable step rather than a flag flip.
            </p>
            <p className="text-xs text-blue-700 mt-2">
              This used to say the real values sat in code comments and a single <code className="bg-blue-100 px-1 rounded text-xs">requiresFocus</code> change would reveal them. That was true once and is worth correcting rather than quietly deleting: it meant a repository read gave up every internal number, which is exactly the risk the strip-out removed.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Patient Entity</h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-nhs-dark-grey mb-4">
            The full field list, in a live build. The demo generates a fictional cast at load and
            stores none of it. This is the whole record - there is nothing below the table.
          </p>
          <div className="mb-4 p-4 rounded-lg border-l-4 border-nhs-green bg-green-50">
            <p className="font-semibold text-nhs-black mb-1">No special category data (28 July 2026)</p>
            <p className="text-sm text-nhs-dark-grey">
              MHA legal status, clinical alerts and diagnoses were removed from the
              patient record entirely, along with room and bed, which the ward does
              not use. What is left is a name, a ward, who is looking after them and
              the jobs attached to them. Not stored, not displayed, not configurable.
              The reason is as much clinical safety as information governance: wardHub
              is not the clinical record, so any clinical field it held would have no
              owner keeping it current, and a member of staff could act on a stale MHA
              status or a stale alert. The one narrow exception is a value a user types
              to complete a guide and produce a personalised case note, which lives in
              the page&apos;s memory while that guide is open and is never written
              anywhere. A test in the suite fails if any of these fields reappear in
              the codebase.
            </p>
          </div>
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
                <tr><td className="p-2">admissionDate</td><td className="p-2">Date</td><td className="p-2">Indirect</td><td className="p-2">When admitted</td></tr>
                <tr className="bg-green-50"><td className="p-2 font-medium">admissionTime</td><td className="p-2">Time</td><td className="p-2">Indirect</td><td className="p-2">Triggers 72hr audit auto-generation</td></tr>
                <tr className="bg-green-50"><td className="p-2 font-medium">wardProfessional</td><td className="p-2">String (FK)</td><td className="p-2">Indirect</td><td className="p-2">Assigned staff/lead/manager responsible for patient</td></tr>
                <tr className="bg-gray-100"><td className="p-2 line-through text-gray-500">legalStatus</td><td className="p-2 text-gray-500">Enum</td><td className="p-2 font-medium text-gray-600">REMOVED 28 Jul 2026</td><td className="p-2 text-gray-600">MHA status. No longer held anywhere</td></tr>
                <tr className="bg-gray-100"><td className="p-2 line-through text-gray-500">alerts</td><td className="p-2 text-gray-500">Array</td><td className="p-2 font-medium text-gray-600">REMOVED 28 Jul 2026</td><td className="p-2 text-gray-600">Clinical alerts. No longer held anywhere</td></tr>
                <tr className="bg-gray-100"><td className="p-2 line-through text-gray-500">diagnoses</td><td className="p-2 text-gray-500">Array</td><td className="p-2 font-medium text-gray-600">REMOVED 28 Jul 2026</td><td className="p-2 text-gray-600">Never populated. No longer held anywhere</td></tr>
                <tr className="bg-gray-100"><td className="p-2 line-through text-gray-500">room</td><td className="p-2 text-gray-500">String</td><td className="p-2 font-medium text-gray-600">REMOVED 28 Jul 2026</td><td className="p-2 text-gray-600">Not used on the ward. Location no longer held</td></tr>
                <tr className="bg-gray-100"><td className="p-2 line-through text-gray-500">bed</td><td className="p-2 text-gray-500">String</td><td className="p-2 font-medium text-gray-600">REMOVED 28 Jul 2026</td><td className="p-2 text-gray-600">Not used on the ward. Location no longer held</td></tr>
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
          <p className="text-xs text-nhs-mid-grey mt-1">Last reviewed: 2026-07-30</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-nhs-black">Staff <span className="text-xs font-normal text-nhs-mid-grey">(base role)</span></h3>
              <p className="text-sm text-nhs-dark-grey">View content, claim tasks, suggest links. Can be assigned as ward professional for patients.</p>
            </div>
            <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
              <h3 className="font-semibold text-nhs-black">Lead</h3>
              <p className="text-sm text-nhs-dark-grey">+ Filter by staff member tasks, &quot;My Patients&quot; toggle (as ward professional), 72hr admission audit visibility</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-nhs-black">Manager <span className="text-xs font-normal text-nhs-mid-grey">(clinical)</span></h3>
              <p className="text-sm text-nhs-dark-grey">All Lead capabilities, + ward settings, discharge approval, grant the contributor flag, edit content. A ward professional can be a Manager - they are still clinical staff with patients.</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-nhs-black">Ward Admin <span className="text-xs font-normal text-nhs-mid-grey">(IT / config, not clinical)</span></h3>
              <p className="text-sm text-nhs-dark-grey">Ward settings, discharge confirmation, view audit logs, grant the contributor flag. <strong>Deliberately cannot be a ward professional and has no clinical filters</strong> - this is the configuration role, not a nursing one. That distinction is why its permissions look similar to Manager but are not the same.</p>
            </div>
            <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
              <h3 className="font-semibold text-nhs-black">Senior Admin</h3>
              <p className="text-sm text-nhs-dark-grey">+ User management, system settings, full audit access, delete content</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border-2 border-dashed border-amber-300">
              <h3 className="font-semibold text-nhs-black">Contributor <span className="text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full font-medium ml-1">FLAG</span></h3>
              <p className="text-sm text-nhs-dark-grey">Orthogonal privilege (not a role). Can be added to <strong>any</strong> role by Ward Admin or Manager. Grants: edit workflows, guides, links. <em>Proposed, not built:</em> a creator training requirement before the flag is granted.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Permissions Matrix</h2>
          <p className="text-xs text-nhs-mid-grey mt-1">Last reviewed: 2026-07-30</p>
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
                  <td className="p-2">View links/workflows/guides</td>
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
                  <td className="p-2">Approve discharges <span className="text-xs text-gray-500 block" title="Staff can initiate a discharge request; Ward Admin performs final confirmation via audit log review">(Staff initiate; Ward Admin confirm)</span></td>
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
                  <td className="p-2">Personal links (add/edit/delete own)</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center bg-amber-50">-</td>
                </tr>
                <tr>
                  <td className="p-2">Recommend link for everyone</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center bg-amber-50">-</td>
                </tr>
                <tr>
                  <td className="p-2">Approve link recommendations</td>
                  <td className="p-2 text-center text-nhs-red">✗</td>
                  <td className="p-2 text-center text-nhs-red">✗</td>
                  <td className="p-2 text-center text-nhs-red">✗</td>
                  <td className="p-2 text-center text-nhs-red">✗</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center bg-amber-50 text-nhs-green font-bold">✓</td>
                </tr>
                <tr>
                  <td className="p-2">Dev Panel access <span className="text-xs text-gray-500 block">(this page)</span></td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center text-nhs-green">✓</td>
                  <td className="p-2 text-center bg-amber-50">-</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-nhs-mid-grey mt-3">
            Note: +Contributor is a flag (isContributor) that can be added to any role.
          </p>
          <p className="text-xs text-nhs-mid-grey mt-2">
            <strong>Dev Panel access is currently open to anyone who is past the site password.</strong>{" "}
            Its own gate was removed in Session 11 and the row above used to claim an
            &ldquo;access key&rdquo;, which contradicted the notice at the top of this very page.
            There is nothing sensitive here - it is documentation about the app, not data from it -
            but a live deployment should put it behind the same role check as user management.
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
 │  8. Paste into SystmOne      │                              │
 │ ──────────────────────────────────────────────────────────► │
 │     (the nurse does this by hand - wardHub never writes     │
 │      to the clinical record)                                │
            `}</pre>
          <p className="text-xs text-nhs-mid-grey mt-2">
            Step 8 previously read &ldquo;(Max+) Push to S1&rdquo;, implying an automated write into
            the clinical record. There is no such integration and none is proposed: the guide produces
            the text, a human pastes it. That boundary is deliberate and is worth stating out loud in
            any governance conversation.
          </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Flow 2: Job Lifecycle</h2>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm text-nhs-dark-grey">
            <li className="flex gap-2">
              <span className="w-6 h-6 rounded-full bg-nhs-blue text-white flex items-center justify-center text-xs flex-shrink-0">1</span>
              <span>Staff creates task (ward task, patient task, or appointment)</span>
            </li>
            <li className="flex gap-2">
              <span className="w-6 h-6 rounded-full bg-nhs-blue text-white flex items-center justify-center text-xs flex-shrink-0">2</span>
              <span>Task appears on Team Diary for due date/shift</span>
            </li>
            <li className="flex gap-2">
              <span className="w-6 h-6 rounded-full bg-nhs-blue text-white flex items-center justify-center text-xs flex-shrink-0">3</span>
              <span>Staff claims it &rarr; appears in their <strong>My Jobs</strong> board, under <em>To do</em></span>
            </li>
            <li className="flex gap-2">
              <span className="w-6 h-6 rounded-full bg-nhs-blue text-white flex items-center justify-center text-xs flex-shrink-0">4</span>
              <span>If a guide is linked, the guide walks them through it and produces the case note</span>
            </li>
            <li className="flex gap-2">
              <span className="w-6 h-6 rounded-full bg-nhs-green text-white flex items-center justify-center text-xs flex-shrink-0">5a</span>
              <span>Marks it complete &rarr; moves to <em>Done</em>. A recurring job is completed <strong>per day</strong>, so ticking today does not close the rest of the week</span>
            </li>
            <li className="flex gap-2">
              <span className="w-6 h-6 rounded-full bg-nhs-orange text-white flex items-center justify-center text-xs flex-shrink-0">5b</span>
              <span>
                <strong>Or hands it back</strong> &rarr; three dropdowns, no free text: what state it is in,
                why it is going back, and who it is waiting on with a chase date. It moves to
                <em> Waiting</em>. <strong>A case note is generated whether or not the job is finished</strong>,
                which is the point - an unfinished job that has been chased is still a documented action
              </span>
            </li>
            <li className="flex gap-2">
              <span className="w-6 h-6 rounded-full bg-nhs-blue text-white flex items-center justify-center text-xs flex-shrink-0">6</span>
              <span>Every transition appends to the job&apos;s history, so reopening it loses nothing. A job can also be <strong>marked in error</strong> (behind Edit), which keeps it out of every count but preserves it for audit with a restore path</span>
            </li>
            <li className="flex gap-2">
              <span className="w-6 h-6 rounded-full bg-nhs-mid-grey text-white flex items-center justify-center text-xs flex-shrink-0">7</span>
              <span>Planned: a completed audit on Nexus ticks the matching job here</span>
            </li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Flow 3: Patient Discharge</h2>
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
          by the Trust's IG team before any build that handles real patient data.
        </p>
      </div>

      <Link
        href="/dev-panel/documents/dpia"
        className="flex items-center justify-between gap-4 bg-nhs-blue text-white rounded-lg p-4 hover:bg-nhs-dark-blue transition-colors"
      >
        <span>
          <span className="font-semibold block">Read the full DPIA</span>
          <span className="text-sm text-white/80">
            The complete document, including every identified risk and the measure proposed
            against it. This page is a summary
          </span>
        </span>
        <FileText className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
      </Link>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">1. Project Overview</h2>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold text-nhs-dark-grey">Project Name</h3>
            <p className="text-nhs-dark-grey">wardHub (Ward Portal)</p>
          </div>
          <div>
            <h3 className="font-semibold text-nhs-dark-grey">Purpose</h3>
            <p className="text-nhs-dark-grey">
              Clinical reference tool and task management system for inpatient ward staff.
              Provides quick access to referral workflows, how-to guides, and useful links.
              A live build adds the patient list and the team diary, which is where real personal data would enter.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-nhs-dark-grey">Data Controller</h3>
            <p className="text-nhs-dark-grey">
              Proposed: Derbyshire Healthcare NHS Foundation Trust (subject to Trust
              approval - not yet accepted). Until then the demo is run by the project
              owner and processes no real patient data.
            </p>
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
              <strong>Article 6(1)(e)</strong> – Processing necessary for performance of a task
              carried out in the public interest (provision of healthcare).
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-nhs-dark-grey">Special Category Data (Health)</h3>
            <p className="text-nhs-dark-grey">
              <strong>wardHub holds no special category data.</strong> MHA legal status, clinical
              alerts and diagnoses were removed from the patient record entirely on 28 July 2026,
              so there is nothing here that needs an Article 9 condition.
            </p>
            <p className="text-nhs-dark-grey mt-2">
              The honest caveat: a <em>task title</em> is free text, and the fact that a person is
              on a mental health inpatient ward is itself health data. So the residual Article 9
              route, if the IG team judges one is needed, would be
              <strong> Article 9(2)(h)</strong> - processing necessary for the provision of health
              treatment and the management of health systems. The control on task titles is
              wording and training, not the schema.
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
                  <th className="text-left p-2">In the demo?</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="p-2">Staff identifiers</td>
                  <td className="p-2">Name, role, ward</td>
                  <td className="p-2">Fictional only (Jane Austen cast)</td>
                </tr>
                <tr>
                  <td className="p-2">Patient identifiers</td>
                  <td className="p-2">Name, ward, status, admission date and time, named nurse, consultant, ward professional, discharge fields. Room and bed removed 28 Jul 2026</td>
                  <td className="p-2">Fictional only (classic novels), stored nowhere</td>
                </tr>
                <tr>
                  <td className="p-2">Health data</td>
                  <td className="p-2">Job titles only, and only inasmuch as a job title can imply care. MHA status, alerts and diagnoses removed 28 Jul 2026</td>
                  <td className="p-2">No special category data held</td>
                </tr>
                <tr>
                  <td className="p-2">Audit data</td>
                  <td className="p-2">Job history, hand-back reasons, who claimed what and when</td>
                  <td className="p-2">In memory only, wiped by a refresh</td>
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
            <h3 className="font-semibold text-nhs-dark-grey mb-2">Current Demo (No real PII)</h3>
            <p className="text-nhs-dark-grey">
              Three separate things, and they are worth keeping separate. <strong>The diary is not stored at all</strong> - claims, hand-backs and completions live in React state, so a refresh wipes them; nothing about a patient reaches the device or a server. <strong>Preferences are device-only</strong> - login choice, theme, guide order and personal links sit in that browser&apos;s localStorage. <strong>One thing is transmitted:</strong> the shared site password is POSTed to <code className="text-xs">/api/auth/verify-password</code>, which replies with a <code className="text-xs">site_access</code> cookie (httpOnly, 7 days) holding nothing but &ldquo;the password was right&rdquo;.
            </p>
            <p className="text-nhs-dark-grey mt-2">
              Beyond that: hosting (Vercel) sees standard request logs, fonts are self-hosted, and the Content-Security-Policy blocks connections to any other host (<code className="text-xs">connect-src &apos;self&apos;</code>).
            </p>
          </div>
          <div className="bg-nhs-pale-grey p-4 rounded-lg">
            <h3 className="font-semibold text-nhs-dark-grey mb-2">Future Live Build (Supabase)</h3>
            <p className="text-nhs-dark-grey">User → Portal → Supabase (encrypted in transit and at rest). <strong>Region still to be confirmed as UK before go-live</strong> - it cannot be read from the repository and is an open action. Configured but unused by the app today: no feature queries it and no user data is sent to it.</p>
            <p className="text-nhs-dark-grey mt-2 text-xs">
              <strong>One exception, for completeness:</strong> a scheduled GitHub Action
              (<code>supabase-keepalive.yml</code>) runs a daily <code>SELECT id LIMIT 1</code> against an
              empty <code>feedback_posts</code> table so the free-tier project is not paused for
              inactivity. It reads nothing and writes nothing, but it does mean the project is
              contacted daily by automation. It uses a service key held in GitHub secrets.
            </p>
          </div>
          <div className="bg-nhs-pale-grey p-4 rounded-lg">
            <h3 className="font-semibold text-nhs-dark-grey mb-2">Planned (Nexus Assurance)</h3>
            <p className="text-nhs-dark-grey">Nexus → Webhook → Portal (Trust network only). One-way inbound sync marks audit jobs as complete. Not built.</p>
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
                  <td className="p-2">RLS policies, encryption, access controls, and a UK region - <strong>which is still to be confirmed</strong>. It cannot be read from the repository and is an open action, so this row lists a mitigation that is not yet verified</td>
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
            for job tracking. The planned Nexus link would send audit completion events inbound via webhook.
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
          case requires Clinical Safety Officer review before any build used on a real ward.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <Link
          href="/dev-panel/documents/hazard-log"
          className="flex items-center justify-between gap-4 bg-nhs-blue text-white rounded-lg p-4 hover:bg-nhs-dark-blue transition-colors sm:col-span-2"
        >
          <span>
            <span className="font-semibold block">Read the full hazard log</span>
            <span className="text-sm text-white/80">
              wardHub-HL-003 v0.3. All 27 hazards - 26 open, 1 closed - with severity,
              likelihood, controls and residual risk. The three marked CSO DECISION are the
              ones needing a qualified opinion, and HAZ-024 is the one to read first
            </span>
          </span>
          <FileText className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
        </Link>
        <Link
          href="/dev-panel/documents/clinical-risk-management-plan"
          className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-3 hover:border-nhs-blue transition-colors text-sm font-medium text-nhs-black"
        >
          <FileText className="w-4 h-4 text-nhs-mid-grey flex-shrink-0" aria-hidden="true" />
          Clinical Risk Management Plan
        </Link>
        <Link
          href="/dev-panel/documents/clinical-safety-case-report"
          className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-3 hover:border-nhs-blue transition-colors text-sm font-medium text-nhs-black"
        >
          <FileText className="w-4 h-4 text-nhs-mid-grey flex-shrink-0" aria-hidden="true" />
          Clinical Safety Case Report
        </Link>
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
          <h2 className="text-lg font-bold text-nhs-black">Hazard Log</h2>
          <p className="text-xs text-nhs-mid-grey mt-1">
            Summary only. <strong>The authoritative log is wardHub-HL-003 v0.3</strong>
            {" "}(<code className="bg-gray-100 px-1 rounded">docs/clinical-safety/DCB0129-Hazard-Log.md</code>),
            published in full above - 27 hazards, 26 open, with scoring, controls and a review
            history. It renders straight from the file in the repository, so this summary and
            the document cannot drift apart without the drift being visible.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-red-50 border-2 border-red-300 rounded-lg text-sm">
            <p className="font-semibold text-red-900">
              HAZ-024, the medical device boundary - open, and the most important item here
            </p>
            <p className="text-red-800 mt-1">
              Raised by a Trust Clinical Safety Officer at the sponsor session on 30 July 2026,
              and independently by a digital colleague in the same meeting. The view in the room
              was that wardHub is not a medical device because it prompts rather than decides.
              <strong> That is recorded as a view reached in conversation, not as an
              assessment</strong> - the person who raised it did not close it, and a named
              individual was suggested as the right person to advise. Nobody has been asked yet.
            </p>
            <p className="text-red-800 mt-2">
              The Clinical Risk Management Plan previously stated flatly that wardHub &ldquo;is
              not classified as a medical device under MHRA guidance&rdquo;. Nobody had assessed
              that. The sentence was withdrawn on 31 July 2026 and replaced with the open
              position, plus a standing rule: any feature that would interpret patient
              information, or indicate what should be done for a particular patient, goes to the
              Clinical Safety Officer <em>before</em> it is built.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-nhs-pale-grey">
                <tr>
                  <th className="text-left p-2">Initial risk (before controls)</th>
                  <th className="text-left p-2">Count</th>
                  <th className="text-left p-2">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr><td className="p-2">Very high (20-25)</td><td className="p-2">0</td><td className="p-2">-</td></tr>
                <tr><td className="p-2">High (15-19)</td><td className="p-2">0 as deployed</td><td className="p-2">One conditional: HAZ-022 scores 16 if a build with no shared store were ever used as the operational diary. Recorded as a go-live blocker, not a current exposure</td></tr>
                <tr><td className="p-2">Significant (9-14)</td><td className="p-2">5</td><td className="p-2">HAZ-015, HAZ-018, HAZ-019, HAZ-025, HAZ-026</td></tr>
                <tr><td className="p-2">Moderate (5-8)</td><td className="p-2">7</td><td className="p-2">HAZ-008, HAZ-017, HAZ-021, HAZ-023, HAZ-024, HAZ-027, and the demo-state scoring of HAZ-022</td></tr>
                <tr><td className="p-2">Low (1-4)</td><td className="p-2">14</td><td className="p-2">All others</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-nhs-dark-grey">
            With the proposed controls in place: nothing significant or above, one moderate
            (HAZ-019 - printed copies can never be fully controlled), 23 low, and{" "}
            <strong>3 not yet scored</strong>. HAZ-013, HAZ-024 and the residual acceptability
            of HAZ-019 are marked <code className="bg-gray-100 px-1 rounded text-xs">[CSO DECISION]</code>{" "}
            in the log rather than guessed at. &ldquo;With the proposed controls in place&rdquo;
            is also a forward statement - several of those controls do not exist yet.
          </p>
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
            <p className="font-semibold text-red-900">Go-live blocker</p>
            <p className="text-red-800 mt-1">
              <strong>HAZ-022</strong> - no shared server-side job store, so the diary is not a
              reliable operational record. Resolves with trust-authenticated server-side storage
              (DPIA measure M2). It does not block the demo continuing as a demo.
            </p>
            <p className="text-red-800 mt-2">
              <strong>HAZ-020</strong> was a second blocker (referral chase log cleared at
              logout). The chase log was retired entirely in July 2026, so the hazard no longer
              has a subject. <strong>Closed in the log on 31 July 2026</strong>, with the closure
              recorded rather than the entry deleted.
            </p>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
            <p className="font-semibold">Two more open items a reviewer should see early</p>
            <p className="mt-1">
              <strong>HAZ-027</strong> - 15 points where guide content may contradict Trust
              policy, 6 rated critical, all open. They sit in guides a pilot would plausibly
              use, and they are leads to verify against the source rather than established
              findings. See Data Sources for the detail.
            </p>
            <p className="mt-2">
              <strong>HAZ-026</strong> - during the July policy audit an authoring agent produced
              a verbatim-looking quote, with a citation, that appears in no document, and used it
              to conclude a conflict was not a conflict. It was caught by manual comparison. The
              control that would catch it systematically does not exist yet, and it qualifies
              every claim on this panel about contradictions being flagged automatically.
            </p>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
            <p className="font-semibold text-amber-900">The largest current clinical risk is content, not code</p>
            <p className="text-amber-800 mt-1">
              Of 68 guides, 1 is signed off, 47 await review and 20 are still in development. Guides
              are built from Trust policy and every one carries a visible traffic-light badge, so
              nothing is presented as approved when it is not - but the honest position is that most
              of the clinical content has not yet been read by the department that owns it. That is
              what the sign-off-by-specialty model is for, and it is the single most valuable thing
              the Trust could give this project.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Safety Case Outline</h2>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-nhs-dark-grey">
          <p>
            <strong>Claim:</strong> wardHub is safe to continue as a demonstration holding no
            real patient data, and the residual clinical risk of the proposed two-ward pilot is
            capable of being reduced to an acceptable level - subject to the open items below
            being closed by a qualified Clinical Safety Officer.
          </p>
          <p className="text-xs text-nhs-mid-grey">
            This used to read &ldquo;wardHub is safe to deploy for its intended use&rdquo;. A
            safety case written by the author of the software, with no Clinical Safety Officer
            appointed, cannot make that claim, so it no longer does.
          </p>
          <p><strong>Argument:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>The system does not interpret patient information, score, threshold, alert or recommend, and holds no clinical field about a patient</li>
            <li>The system does not replace clinical decision-making or any clinical system, and never writes to the clinical record</li>
            <li>Task management supplements, and does not replace, existing ward processes - the paper diary remains as fallback</li>
            <li>Every hazard is assessed and either controlled or explicitly left open, with the open ones named rather than rounded off</li>
          </ul>
          <p><strong>What is not yet argued:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>The medical device position (HAZ-024) - open, and outside the author&apos;s competence</li>
            <li>Content currency (HAZ-001, HAZ-015) - 1 of 68 guides is signed off</li>
            <li>15 open clashes with Trust policy (HAZ-027), 6 critical</li>
            <li>Operational reliability (HAZ-022) - there is no shared store, so there is no operational record</li>
          </ul>
          <p>
            <strong>Evidence:</strong> the hazard log, the CRMP and the safety case report,
            all published in full above. Testing records, user training and audit logs are
            named as evidence a pilot would produce, not evidence that exists today.
          </p>
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
            <strong>DRAFT SCHEMA</strong> – These are proposed schemas. Replace with live Supabase
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
              <pre>{`-- Patients table (live build only - the demo stores no patients)
-- No clinical columns by design (28 Jul 2026). legal_status, alerts,
-- diagnoses, room and bed were all removed: wardHub is not the clinical
-- record, so nothing it stored would have an owner keeping it current.
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  ward TEXT NOT NULL,
  admission_date DATE,
  admission_time TIMESTAMPTZ,           -- Triggers 72hr audit auto-generation
  named_nurse UUID REFERENCES users(id),
  consultant TEXT,
  ward_professional UUID REFERENCES users(id),  -- Assigned staff/lead/manager
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`}</pre>
            </div>

            <div className="bg-nhs-pale-grey p-4 rounded-lg overflow-x-auto">
              <pre>{`-- Jobs table. Brought in line with the app on 30 Jul 2026: this was
-- missing hand-back, discharge barriers, mark-in-error and per-day
-- completion, and defaulted priority to a value the app has never used.
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('ward', 'patient', 'appointment')),
  title TEXT NOT NULL,
  description TEXT,
  ward TEXT NOT NULL,
  patient_id UUID REFERENCES patients(id),
  due_date DATE NOT NULL,                -- appointments use appointment_date
  shift TEXT CHECK (shift IN ('early', 'late', 'night')),
  priority TEXT NOT NULL DEFAULT 'routine'
    CHECK (priority IN ('routine', 'important', 'urgent')),
  status TEXT DEFAULT 'pending',
  claimed_by UUID REFERENCES users(id),
  linked_guide_id TEXT,                  -- opens the guide from the job

  -- Recurring jobs are ONE row rendered on every day they fall due, so
  -- completion cannot live in status - it would close the whole week.
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_days SMALLINT[],             -- 0 = Sunday
  completed_dates DATE[] DEFAULT '{}',   -- one entry per day completed

  -- Discharge barriers. Patient jobs and appointments only.
  blocks_discharge BOOLEAN DEFAULT FALSE,

  -- Hand-back. Structured, no free text anywhere by design.
  handback_state TEXT,                   -- what state the job is in
  handback_reason TEXT,                  -- why it is going back
  waiting_on TEXT,                       -- who we are waiting for
  chase_date DATE,

  -- Mark in error replaced delete. Excluded from every count, kept for
  -- audit, restorable from the reports page.
  in_error BOOLEAN DEFAULT FALSE,
  marked_in_error_by UUID REFERENCES users(id),
  marked_in_error_at TIMESTAMPTZ,

  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Append-only, so reopening a job loses nothing.
CREATE TABLE task_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  event TEXT NOT NULL,                   -- claimed, handed back, completed...
  event_date DATE,                       -- which day, for recurring jobs
  actor UUID REFERENCES users(id),
  detail JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
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
        <h1 className="text-2xl font-bold text-nhs-black">Assurance Integration</h1>
        <p className="text-nhs-dark-grey mt-1">Nexus sync &ndash; webhook, Power Automate, or hard-coded</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Overview</h2>
        </CardHeader>
        <CardContent className="text-sm text-nhs-dark-grey space-y-3">
          <p>
            Ward tasks marked as &quot;audit tasks&quot; (fridge temps, controlled drugs, etc.) can
            automatically sync with Nexus Assurance. wardHub provides the receiving endpoint &ndash;
            the mechanism for sending the signal is flexible:
          </p>
          <div className="grid sm:grid-cols-3 gap-3 mt-2">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-semibold text-blue-800">Webhook</p>
              <p className="text-xs text-blue-700">Nexus POSTs directly to wardHub endpoint on task completion</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="font-semibold text-purple-800">Power Automate</p>
              <p className="text-xs text-purple-700">M365 flow triggers on Nexus event and calls wardHub. Uses existing licensing.</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="font-semibold text-green-800">Hard-coded in Nexus</p>
              <p className="text-xs text-green-700">Trust IT adds the outbound call directly into Nexus. Most reliable if supported.</p>
            </div>
          </div>
          <p className="mt-2">
            <strong>Today:</strong> link-only - the job carries a button that opens the Nexus dashboard.<br />
            <strong>Planned:</strong> auto-sync, so completing the audit on Nexus ticks the job here.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Webhook Payload</h2>
        </CardHeader>
        <CardContent>
          <div className="bg-nhs-pale-grey p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`// INBOUND to wardHub. Nexus (or Power Automate on its behalf) is the
// sender; wardHub only ever receives. It never writes to Nexus - see the
// Nexus Assurance section, "Direction: One-Way Inbound".
POST /api/nexus/task-complete
Headers:
  X-Nexus-Token: [shared-secret]
  Content-Type: application/json

Body:
{
  "event": "audit_completed",
  "auditType": "fridge_temps",
  "ward": "byron",
  "completedBy": "Staff Name",
  "completedAt": "2026-07-30T08:30:00Z",
  "nexusRefId": "NX-2026-0730-001",
  "idempotencyKey": "uuid"
}`}</pre>
            <p className="text-xs text-nhs-mid-grey mt-2">
              This block previously described an <em>outbound</em> POST to
              <code className="bg-gray-100 px-1 rounded">/webhook/assurance-task-complete</code>,
              which contradicted the Nexus section on the same panel and would have been the first
              thing a technical reviewer picked up. There is one endpoint and one direction.
            </p>
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
        <h1 className="text-2xl font-bold text-nhs-black">Nexus Assurance Integration (planned)</h1>
        <p className="text-nhs-dark-grey mt-1">Automated audit compliance sync</p>
      </div>

      <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
        <p className="text-sm text-nhs-black">
          <strong>PLANNED</strong> – Nexus Assurance is the Trust&apos;s internal compliance platform.
          The integration is one-way inbound (Nexus → Hub) to auto-complete audit tasks.
          How the signal gets from Nexus to wardHub is flexible &ndash; see integration options below.
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
            the corresponding task on the Hub is automatically marked as complete – removing
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
            <h3 className="font-semibold text-nhs-black">Mechanism: Three Options</h3>
            <div className="mt-2 space-y-2">
              <div className="p-2 bg-white rounded border border-gray-200">
                <p className="font-medium text-nhs-black">Option A: Webhook</p>
                <p className="text-sm">Trust tech team configures Nexus to POST a webhook when an audit is completed. wardHub receives and processes the event.</p>
              </div>
              <div className="p-2 bg-white rounded border border-gray-200">
                <p className="font-medium text-nhs-black">Option B: Power Automate</p>
                <p className="text-sm">A Power Automate flow triggers on Nexus completion and calls the wardHub endpoint. Uses existing Trust M365 licensing.</p>
              </div>
              <div className="p-2 bg-white rounded border border-gray-200">
                <p className="font-medium text-nhs-black">Option C: Hard-coded in Nexus</p>
                <p className="text-sm">Trust IT builds the call directly into Nexus code. Most reliable, least flexible &ndash; but simplest if Nexus already supports outbound events.</p>
              </div>
            </div>
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
  "completedBy": "Anne Elliot",
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
            "Trust tech team chooses integration method (webhook, Power Automate, or hard-coded)",
            "wardHub provides the /api/nexus/task-complete endpoint regardless of method",
            "Authentication via shared secret (rotated quarterly)",
            "No PII transmitted – only audit type, ward, and staff ID",
            "Fallback: if integration fails, staff can still mark task complete manually",
            "DPIA update required before the Nexus link goes live",
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

function QAPackSection() {
  const qaItems = [
    { q: "What is wardHub?", a: "A reference and task management tool built for NHS inpatient wards. It helps staff find referral workflows, clinical guides, and manage their daily tasks in one place." },
    // "Staff nurse" is deliberate, not stale (PRESENTATION-PLAN-30JUL.md, 0:00-0:03):
    // NIC is a rotating role that would confuse half the room, and "staff nurse" is
    // the stronger framing - this came from the floor, not from a title. Do not
    // "correct" it to Ward NIC in a later review.
    { q: "Who built it?", a: "Built by Mike, a staff nurse at Derbyshire Healthcare NHS Foundation Trust, in his own time, using modern web technology (Next.js, TypeScript, Tailwind CSS)." },
    { q: "Does it store patient data?", a: "The demo uses fictional data only, and the demo diary is not stored anywhere at all - it lives in the page's memory and a refresh wipes it. A live build would hold a deliberately short list: name, ward, status, admission date and time, named nurse, consultant, ward professional, and the discharge fields. Nothing clinical. MHA legal status, alerts and diagnoses were removed entirely on 28 July 2026 and are not coming back - see the Data Catalogue for the reasoning, which is clinical safety as much as information governance." },
    { q: "How does it fit with existing systems?", a: "wardHub sits alongside existing systems, not replacing them. Referral workflows link to official forms and processes, and finishing one produces a case note you copy into SystmOne - wardHub never writes to the clinical record. The planned Nexus Assurance link would let a completed audit on Nexus tick the matching job here, so staff do not update two systems." },
    { q: "What about GDPR?", a: "The demo holds no real personal data and stores no tasks. A live build handling real patient data needs a completed DPIA before it goes anywhere near a ward. Data minimisation is the design, not an afterthought: the patient record was cut back twice, most recently on 28 July 2026. See the DPIA Draft section." },
    { q: "Is it clinically safe?", a: "wardHub is a reference and coordination tool, not a clinical decision-making system. It presents existing Trust processes in an accessible format, interprets no patient information, and holds no clinical field about a patient. A DCB 0129 hazard log (27 hazards), clinical risk management plan and safety case report are written and published in full in this panel - not as summaries, as the documents. What is honestly not closed: no Clinical Safety Officer has been appointed, three residual risks are marked as needing a CSO's judgement rather than guessed at, and the medical device question raised at the sponsor session is open. The safety case says wardHub is safe to continue as a demonstration; it deliberately does not claim the pilot is safe to start yet." },
    { q: "Is this a medical device?", a: "Nobody has assessed that, and this project does not claim an answer. The question was raised by a Trust Clinical Safety Officer at the sponsor session on 30 July 2026, and independently by a digital colleague in the same meeting who noted that guidance of this kind could bleed into decision support. The view in the room was no, because the product prompts rather than decides - but that was a view reached in conversation, not an assessment, and the person who raised it did not close it. It is recorded as HAZ-024 and remains open. Earlier versions of the clinical risk management plan stated flatly that wardHub is not a medical device under MHRA guidance; that sentence was withdrawn on 31 July 2026 because nobody had done the work to support it. What keeps the product on the safe side of the line is deliberate: no scoring, no thresholds, no alerts, no recommendations, no interpretation of patient information, and validated tools deferred to the system that owns them rather than reimplemented. The hazard is drift, so any feature that would interpret patient information now goes to the Clinical Safety Officer before it is built rather than after." },
    { q: "How much does it cost?", a: "No budget is being asked for. The software is free (open-source stack, no vendor fees) and the build was done in the project owner's own time. The real cost is Trust time: hosting and a security review, plus the IG and clinical sign-off effort." },
    { q: "Can other wards use it?", a: "Yes. The content is ward-configurable. Each ward can add their own links, guides, and task templates. The architecture is Trust-agnostic, so other Trusts could deploy it too. Scaling is a content-ownership question rather than a technical one - which is what the sign-off-by-specialty model is for." },
    { q: "What happens if the developer leaves?", a: "The codebase is documented, version-controlled, and built with standard technologies. Any web developer could maintain it. The Dev Panel itself serves as full handover documentation." },
    { q: "How do staff learn to use it?", a: "No formal training needed. The app includes an interactive demo tour, intro guide, and FAQ. The design philosophy is: if you need a manual, the UX has failed." },
    { q: "What is the pilot plan?", a: "Two wards running a light trial alongside existing processes, for 4-6 weeks. Two rather than one because a single ward cannot tell you whether a change came from the tool or from the week it had. No disruption, no budget. If it helps, expand. If it does not, it cost almost nothing to find out." },
    { q: "Who approves this going live?", a: "Trust Digital Services for hosting and security. Information Governance for DPIA approval. Clinical Safety Officer for DCB 0129 sign-off. Ward management for operational sign-off. Content is the separate question - see the next answer." },
    { q: "Who signs off the clinical content? One person cannot read 68 guides.", a: "Nobody is being asked to. The model is sign-off by specialty: each guide belongs to the department that owns the subject, and that department signs its own shelf. Safeguarding signs the safeguarding guides, the MHA office signs the MHA ones, pharmacy signs the medicines ones. Each guide was built from the relevant Trust policies and procedures at once, with contradictions between sources flagged automatically, so what a reviewer is being asked for is a quick expert eyeball rather than a rewrite. The traffic-light badge on every guide shows exactly where each one stands - and today that is honest rather than flattering: 1 green, 47 awaiting review, 20 still in development. Content is the project's biggest open risk, not the code." },
    { q: "What are the three kinds of data in here?", a: "Worth separating, because they carry completely different risk. One: the skeleton - the app itself, its structure and its code, which contains no Trust information at all. Two: Trust content - the guides, referral steps and links derived from Trust policy, which is publishable material and the thing the sign-off model governs. Three: patient data - names, wards and jobs, which the demo does not hold in any real form and which only enters when the Trust approves hosting, signs the DPIA and takes data-controller ownership. Most governance conversations get harder than they need to be because these three get discussed as one thing." },
    // The question the demo has to survive: who said you could put Trust policy
    // information in a third-party database? The answer only holds while it is
    // literally true, which is why the fictional-detail rule is load-bearing and
    // not cosmetic (BACKLOG Section K).
    { q: "Who gave you permission to put Trust policy information in Supabase?", a: "No one - and nothing in the demo needs it. Supabase holds three things: derived publishable guide content, which is the same classification already on the gated public site; fictional demo data; and nothing else. No policy documents, no patient data, no internal contacts. Policies stay on FOCUS and SharePoint, Copilot reads them inside the Trust tenant, and only publishable output crosses out. Real internal detail and real patient data only enter when the Trust approves hosting, signs the DPIA and takes data-controller ownership. Getting through that gate properly is exactly what I am here to ask for." },
    { q: "Where does the data actually live?", a: "Today: the gated demo site on Vercel, plus a Supabase project that is wired but dormant - no feature in the app queries it, and the client is deliberately kept out of the shared exports so its URL and keys never reach the browser bundle. Keys live in Vercel and GitHub environment settings, never in the repository. One honest caveat: a scheduled GitHub Action runs a daily SELECT against an empty feedback_posts table purely to stop the free-tier project being paused for inactivity, so the project is touched once a day by automation even though the app never touches it. The Supabase region still needs reading off the dashboard and confirming as UK before anything real goes near it. In production this is all the Trust's decision: their hosting, their authentication, their database, or a direct SharePoint connection once IT grants an app registration." },
    { q: "What internal Trust detail is in the demo?", a: "None. Contacts that are not publicly findable show 'Hidden in demo mode'; the real values are held outside the repository. What you can see is public and meant to be used - council duty lines, charity helplines, advocacy providers, crisis numbers. Anything published through the guide pipeline before Trust approval uses realistic but fictional internal detail, so 'no placeholders on screen' and 'nothing leaked' are both true at once." },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-nhs-black">Q&A Pack</h1>
          <p className="text-nhs-dark-grey mt-1">Common questions from stakeholders, answered</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-nhs-blue text-white rounded-lg hover:bg-nhs-dark-blue transition-colors text-sm"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
      </div>

      <Card>
        <CardContent>
          <div className="space-y-4">
            {qaItems.map((item, i) => (
              <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <h3 className="font-bold text-nhs-black text-sm mb-1">Q{i + 1}: {item.q}</h3>
                <p className="text-sm text-nhs-dark-grey">{item.a}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EvaluationsSection() {
  const roles = [
    {
      role: "Ward Staff",
      icon: "👤",
      perspective: "Day-to-day user",
      benefits: [
        "Find referral forms and processes in seconds, not minutes",
        "Jobs diary keeps tasks visible across shift changes",
        "Claim tasks so nothing falls through the cracks",
        "Repeating tasks appear automatically on the right days",
        "Safeguarding decision helper when unsure which pathway to use",
      ],
      concerns: [
        "Yet another system to check alongside FOCUS and clinical systems",
        "Need to remember to update tasks as they complete them",
      ],
      verdict: "High value for referral workflows and task visibility. Low overhead because there is no mandatory data entry.",
    },
    {
      role: "Ward Manager / Lead Nurse",
      icon: "👩‍⚕️",
      perspective: "Oversight and quality",
      benefits: [
        "See which tasks are outstanding, overdue, or unclaimed at a glance",
        "Audit tasks linked to Assurance Dashboard for compliance tracking",
        "Discharge workflow with confirmation step prevents premature discharge",
        "Cross-ward view for managing multiple wards or acting up",
        "Staff task claims reduce need to chase who is doing what",
      ],
      concerns: [
        "Need buy-in from team to actually use the diary consistently",
        "Repeating tasks need leadership approval toggle to prevent drift",
      ],
      verdict: "Strong management tool for task oversight and audit compliance. Most value comes from team adoption.",
    },
    {
      role: "Trust IT / Digital Services",
      icon: "💻",
      perspective: "Technical governance",
      benefits: [
        "Modern, maintainable stack (Next.js 16, TypeScript, Tailwind) with no exotic dependencies",
        "Gates run on every push: typecheck, lint, test and build via GitHub Actions, all currently green",
        "DPIA draft, hazard log and data catalogue already written, not left as a to-do",
        "Supabase schemas drafted, so the data model is reviewable before anything is built",
        "A dormant-by-design backend: the Supabase client is deliberately excluded from the shared exports so its URL and keys never reach the browser bundle",
      ],
      concerns: [
        "Single developer dependency. Documentation mitigates it; a bus factor of one does not go away",
        "Security audit needed before any build that handles real patient data",
        "main has no branch protection, and Vercel deploys straight from it - so CI can be red and a deploy still ships",
        "Deployment is currently on Vercel, outside Trust infrastructure, which is one of the decisions being asked for",
        "The published site sits behind a single shared password with no individual accounts and, until it is hardened, no rate limiting on the check",
      ],
      verdict: "Well-documented and conventionally built, which makes it cheap to audit. The open questions are hosting, authentication and who owns it long-term - not the code.",
    },
    {
      role: "Information Governance",
      icon: "🔒",
      perspective: "Data protection",
      benefits: [
        "The demo holds no real personal data, and the diary is stored nowhere at all - it is page memory, wiped by a refresh",
        "No special category data anywhere: MHA status, alerts and diagnoses were removed on 28 July 2026, and a test in the suite fails if they reappear",
        "Contact data classification system (public vs trust-sensitive), with trust-sensitive values held outside the repository entirely",
        "DPIA draft and hazard log already written, ready for review rather than starting from blank",
        "Data minimisation is visible in the history: the patient record has been cut back twice, never widened",
      ],
      concerns: [
        "A live build stores patient names, wards and job titles - real personal data, needing a real DPIA",
        "Need to agree data retention periods for task history and the hand-back audit trail",
        "The site currently sits behind one shared password with no individual accounts, so there is no per-user audit trail yet",
        "Task titles are free text, so a member of staff could type clinical detail into one - a training and wording control, not a technical one",
      ],
      verdict: "Unusually clean for a pre-approval demo, and the removals were volunteered rather than requested. The live build needs a standard DPIA, a decision on hosting, and individual authentication before any real patient data.",
    },
    {
      role: "Patient / Service User",
      icon: "🏥",
      perspective: "Care quality",
      benefits: [
        "Staff have quicker access to referral pathways, meaning faster referrals",
        "Discharge planning visible to whole team reduces delays",
        "Named nurse tasks less likely to be forgotten between shifts",
        "Safeguarding guides help staff respond appropriately and promptly",
      ],
      concerns: [
        "Patients do not interact with the system directly",
        "Benefit is indirect, through improved staff organisation",
      ],
      verdict: "Indirect but meaningful benefit through faster referrals, better handovers, and fewer missed tasks.",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-nhs-black">Role-Specific Evaluations</h1>
          <p className="text-nhs-dark-grey mt-1">How wardHub looks from each stakeholder perspective</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-nhs-blue text-white rounded-lg hover:bg-nhs-dark-blue transition-colors text-sm"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
      </div>

      <div className="space-y-4">
        {roles.map((r, i) => (
          <Card key={i}>
            <CardHeader>
              <h2 className="text-lg font-bold text-nhs-black flex items-center gap-2">
                <span className="text-2xl">{r.icon}</span>
                {r.role}
                <span className="text-sm font-normal text-nhs-mid-grey ml-2">{r.perspective}</span>
              </h2>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-nhs-green mb-2">Benefits</h3>
                  <ul className="space-y-1">
                    {r.benefits.map((b, j) => (
                      <li key={j} className="text-sm text-nhs-dark-grey flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-nhs-green flex-shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-nhs-orange mb-2">Concerns</h3>
                  <ul className="space-y-1">
                    {r.concerns.map((c, j) => (
                      <li key={j} className="text-sm text-nhs-dark-grey flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-nhs-orange flex-shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-sm font-semibold text-nhs-black">Verdict:</p>
                <p className="text-sm text-nhs-dark-grey">{r.verdict}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Conflicts found in the trust source material. Sourced from the 25 July 2026 full-corpus
// audit (483 documents), which superseded the 2 July pass over 20 documents and corrected
// three of its conclusions. Both are research-only - no policy or application file was
// changed by either. The register itself is held OUTSIDE this repository:
// E:\Hub\policy-audit-full\ (CONFLICT-REGISTER.md, WARDHUB-CLASHES.md).
function ConflictsCard() {
  const sev = (s: "high" | "med" | "low" | "app") => {
    const map = {
      high: ["bg-red-100 text-red-700", "High"],
      med: ["bg-amber-100 text-amber-700", "Medium"],
      low: ["bg-gray-100 text-gray-600", "Low"],
      app: ["bg-indigo-100 text-indigo-700", "App"],
    } as const;
    const [cls, label] = map[s];
    return <span className={`px-2 py-0.5 ${cls} text-[10px] font-semibold rounded-full flex-shrink-0`}>{label}</span>;
  };
  const groups: { title: string; items: { s: "high" | "med" | "low" | "app"; text: string }[] }[] = [
    {
      title: "What the full audit corrected in the earlier one",
      items: [
        { s: "high", text: "S62 Urgent Treatment was reported as expired. It is NOT. The Trust issued a replacement (issue 04, Dec 2025, review Dec 2028) exactly as the extension lapsed - sound governance, not a failure. The real finding is a document-control one: both versions remain retrievable in the library." },
        { s: "med", text: "The CTO policy was reported to exist in two conflicting versions. It does not. All 28 duplicate filename pairs are content-identical once extracted to text." },
        { s: "low", text: "Eight policies with a July 2026 review date were classified 'expiring soon' when they were due now." },
        { s: "high", text: "The lesson, recorded in the audit: auditing a fraction of a policy library produces confident, wrong conclusions. The earlier pass covered 20 documents, about 4% of the library." },
      ],
    },
    {
      title: "Policy currency across all 483 documents",
      items: [
        { s: "high", text: "38 policies are expired. A further 8 were due in July 2026, 17 fall due within three months." },
        { s: "high", text: "Worst: the Most Appropriate Agency (Right Care Right Person) document is ~3 yr 10 mo overdue, its review date falls one month AFTER its own effective date, it predates the national agreement it is named after, and a policy issued Nov 2025 still cites it as live." },
        { s: "high", text: "All seven ePMA SOPs are ~3 years overdue. The Safety Planning SOP is ~4 yr 8 mo overdue." },
        { s: "med", text: "274 documents carry no review date at all. Most are legitimately forms or process maps, but some are operative documents setting clinical rules with no version, date or ratifying committee." },
      ],
    },
    {
      title: "Conflicts that span several policies",
      items: [
        { s: "high", text: "Rapid tranquillisation: four documents give four different answers." },
        { s: "high", text: "NEWS2: the escalation ladder as written cannot operate." },
        { s: "high", text: "Unratified SOPs are overriding ratified policy in several places." },
        { s: "med", text: "Migration debt - PARIS is still instructed in live documents." },
        { s: "med", text: "Safeguarding: three different thresholds, and no referral route at all for two named abuse types." },
        { s: "med", text: "The Hartington to Derwent rename is incomplete across the library." },
        { s: "low", text: "Clinical risk assessment has no review clock, while a building's fire risk does." },
      ],
    },
    {
      title: "A policy that disagrees with itself",
      items: [
        { s: "high", text: "Observations - the Level 3 (Intermittent) review interval is stated as BOTH 24h and 72h across the body and Appendix 3. The app uses 72h; the 24h figure is the policy's own defect." },
        { s: "high", text: "S135/136 - the s135(1) escape-retake window is given as '36 hours' in one place against the correct s138(3) 24h (+12h) rule in another." },
        { s: "med", text: "Observations - the 72h escalation names two different senior-role sets." },
      ],
    },
    {
      title: "Where the app itself may be wrong - 15 open items",
      items: [
        { s: "app", text: "The audit found 15 points where wardHub content may contradict Trust policy, 6 of them rated critical. They are recorded with both quotes side by side in WARDHUB-CLASHES.md and are OPEN - identified, not yet verified or fixed." },
        { s: "app", text: "The critical ones concern MHA paperwork (Form H4 part order, whether copied section papers are acceptable, whether Section 15 rectification applies to CTO recall), post-rapid-tranquillisation monitoring duration, IMHA entitlement, and a Derby City safeguarding out-of-hours number that may be a children's line." },
        { s: "app", text: "Each is a lead requiring a human to open the policy and confirm the wording before anything is changed. None is being treated as established fact, and none of the affected guides is signed off green." },
      ],
    },
  ];
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-bold text-nhs-black flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" /> Conflicts in source material
        </h2>
        <p className="text-xs text-nhs-mid-grey mt-1">
          From a research-only audit of the Trust policy library - 483 documents, 25 July 2026, no policy or
          application file modified. It supersedes a 2 July pass that covered 20 documents and reached three
          wrong conclusions; those corrections are listed first, because they matter more than the findings.
          Most items below are defects in the source policies to raise with the Trust, not application faults.
          The register is held outside this repository and is available on request.
        </p>
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-2 mt-2">
          <strong>Read every quote back to the source before acting on it.</strong> During this audit an AI agent
          produced a verbatim-looking quote, with a citation, that appears in no document - and used it to conclude
          that a conflict was not a conflict. The fabrication ran in the direction of making two documents agree,
          which for a conflict-finding tool is the most dangerous failure available to it. A quote from an agent is
          a lead, never evidence.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {groups.map((g) => (
          <div key={g.title}>
            <h3 className="font-semibold text-nhs-black text-sm mb-2">{g.title}</h3>
            <div className="space-y-2">
              {g.items.map((it, i) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-nhs-pale-grey rounded-lg">
                  {sev(it.s)}
                  <p className="text-xs text-nhs-dark-grey">{it.text}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
        <p className="text-xs text-nhs-mid-grey italic">
          Data-safety note: the raw AWOL source contains real internal security numbers and an on-call bleep - these are
          kept out of the public demo. An earlier pass described the app as verified clean against current policy on all
          time limits and holding powers; the full-corpus audit does not support that, and the 15 open items above are
          the reason none of the affected guides is signed off.
        </p>
      </CardContent>
    </Card>
  );
}

function DataSourcesSection() {
  const DATA_SOURCES = [
    // Workflows
    { id: "imha-advocacy", name: "IMHA / Advocacy Referral", type: "workflow" as const, description: "Independent Mental Health Advocate referral process", source: "Disability Direct (Derby City) and Cloverleaf (County) public websites", sourceType: "public" as const, addedDate: "2026-01-24", lastVerified: "2026-06-27", notes: "Provider update: Derby City IMHA is now Disability Direct (was POhWER). Verified via disabilitydirect.com/dd-advocacy and cloverleaf-advocacy.co.uk/referrals." },
    { id: "picu", name: "PICU Referral", type: "workflow" as const, description: "Psychiatric Intensive Care Unit transfer process", source: "Internal trust documentation - contact details anonymised", sourceType: "placeholder" as const, addedDate: "2026-01-24", lastVerified: "2026-01-26", notes: "Phone/email use placeholder values - real details available via FOCUS" },
    { id: "safeguarding", name: "Safeguarding Adults", type: "workflow" as const, description: "Adult safeguarding referral process", source: "Derby City Council and Derbyshire County Council public websites", sourceType: "public" as const, addedDate: "2026-01-24", lastVerified: "2026-01-26", notes: "MASH contact details from public council websites" },
    { id: "safeguarding-children", name: "Safeguarding Children", type: "workflow" as const, description: "Children safeguarding referral (Starting Point)", source: "Derbyshire Safeguarding Children Partnership public website", sourceType: "public" as const, addedDate: "2026-01-26", lastVerified: "2026-01-26" },
    { id: "homeless-discharge", name: "Housing / Duty to Refer", type: "workflow" as const, description: "Homeless discharge support and Duty to Refer process", source: "Internal trust homeless worker documentation + public council websites", sourceType: "placeholder" as const, addedDate: "2026-01-24", lastVerified: "2026-01-26", notes: "Some contact details use placeholders" },
    { id: "social-care", name: "Social Care Referral", type: "workflow" as const, description: "Adult social care assessment referral", source: "Derbyshire County Council and Derby City Council public websites", sourceType: "public" as const, addedDate: "2026-01-24", lastVerified: "2026-01-26" },
    { id: "dietitian", name: "Dietitian Referral", type: "workflow" as const, description: "Inpatient dietitian referral", source: "Internal trust referral form - contact details anonymised", sourceType: "placeholder" as const, addedDate: "2026-01-24", lastVerified: "2026-01-26", notes: "Uses placeholder email" },
    { id: "tissue-viability", name: "Tissue Viability", type: "workflow" as const, description: "Wound care and tissue viability referral", source: "Internal trust tissue viability team documentation", sourceType: "placeholder" as const, addedDate: "2026-01-26", lastVerified: "2026-01-26" },
    { id: "edt", name: "Early Discharge Team", type: "workflow" as const, description: "EDT referral for discharge planning support", source: "Internal EDT flow chart and referral prompt documents", sourceType: "placeholder" as const, addedDate: "2026-01-26", lastVerified: "2026-01-26" },
    { id: "erp", name: "Emotional Regulation Programme", type: "workflow" as const, description: "ERP/DBT pathway referral", source: "Internal ERP referral form and guidance v5", sourceType: "placeholder" as const, addedDate: "2026-01-26", lastVerified: "2026-01-26", notes: "Includes DBT and SCM pathways" },
    { id: "ctr-dsp", name: "CTR / DSP Review", type: "workflow" as const, description: "Care Treatment Review and Dynamic Support Plan for ASD/LD patients", source: "JUCD keyworking referral form and DSP consent guidance (April 2024)", sourceType: "public" as const, addedDate: "2026-01-26", lastVerified: "2026-01-26" },
    // Guides
    { id: "news2", name: "NEWS2 Observations", type: "guide" as const, description: "National Early Warning Score recording guide", source: "Royal College of Physicians NEWS2 documentation (public)", sourceType: "public" as const, addedDate: "2026-01-24", lastVerified: "2026-01-26" },
    { id: "mse", name: "Mental State Examination", type: "guide" as const, description: "Ten point guide to MSE", source: "Internal nursing tools documentation", sourceType: "internal" as const, addedDate: "2026-01-26", lastVerified: "2026-01-26" },
    { id: "seclusion", name: "Seclusion Process", type: "guide" as const, description: "Seclusion review timings and process", source: "Internal seclusion guides (nurse and medic versions)", sourceType: "internal" as const, addedDate: "2026-01-26", lastVerified: "2026-01-26", notes: "Based on MHA Code of Practice requirements" },
    { id: "named-nurse", name: "Named Nurse Responsibilities", type: "guide" as const, description: "Named nurse crib sheet and care planning guide", source: "Internal named nurse help documentation", sourceType: "internal" as const, addedDate: "2026-01-26", lastVerified: "2026-01-26" },
    { id: "care-planning", name: "Care Planning", type: "guide" as const, description: "Care planning and risk management guidance", source: "Internal care planning guidance and templates", sourceType: "internal" as const, addedDate: "2026-01-26", lastVerified: "2026-01-26" },
    { id: "mha-sections", name: "MHA Section Checklist", type: "guide" as const, description: "Mental Health Act section requirements checklist", source: "Internal MHA documentation", sourceType: "internal" as const, addedDate: "2026-01-26", lastVerified: "2026-01-26", notes: "Reference to MHA Code of Practice (public)" },
    { id: "mha-statuses", name: "MHA Statuses Guide", type: "guide" as const, description: "Full guide to all MHA detention sections and patient rights", source: "MHA Code of Practice (public) and internal trust MHA documentation", sourceType: "public" as const, addedDate: "2026-04-14", lastVerified: "2026-04-14", notes: "Covers Sections 2, 3, 4, 5(2)/5(4), 17A (CTO), 37, 37/41, 47/49, and informal status" },
    { id: "tribunal-report", name: "Tribunal Report Writing", type: "guide" as const, description: "Nursing tribunal report guidance", source: "Internal tribunal report template", sourceType: "internal" as const, addedDate: "2026-01-26", lastVerified: "2026-01-26" },
    { id: "risk-assessment", name: "Risk Screen, Formulation & RMP", type: "guide" as const, description: "SystmOne-mirrored risk screen that builds the formulation and management plans", source: "SystmOne WAA Inpatient Risk Screening Tool structure + DHCFT Risk Management Plans guidance", sourceType: "internal" as const, addedDate: "2026-07-02", lastVerified: "2026-07-02", notes: "Approved S1 domains/sub-domains + clinical-indicator lists used verbatim. No PII retained from source form." },
    { id: "care-plan", name: "My Care Plan builder", type: "guide" as const, description: "Patient-voice care plan builder", source: "DHCFT 'My Care Plan' SystmOne template + patient prompt sheet", sourceType: "internal" as const, addedDate: "2026-06-18", lastVerified: "2026-07-02" },
    { id: "honos", name: "HoNOS & Clustering explained", type: "guide" as const, description: "What HoNOS is, the 12 scales, scoring and clustering", source: "RCPsych HoNOS (public) + Trust 'SystmOne - HoNOS and Clustering' guide", sourceType: "public" as const, addedDate: "2026-07-02", lastVerified: "2026-07-02" },
    { id: "dols", name: "DoLS Ward Guidance", type: "guide" as const, description: "Deprivation of Liberty Safeguards - acid test, DoLS vs MHA, authorisation", source: "DHCFT Deprivation of Liberty Policy & Procedures (2023) + MCA 2005 / Cheshire West (public)", sourceType: "internal" as const, addedDate: "2026-07-02", lastVerified: "2026-07-02" },
    { id: "blanket-restrictions", name: "Blanket Restrictions & Restrictive Practice", type: "guide" as const, description: "Restrictive practices, blanket restrictions and how to justify them", source: "DHCFT Blanket Restrictions Policy (Nov 2025) + MHA Code of Practice 2015 (public)", sourceType: "internal" as const, addedDate: "2026-07-02", lastVerified: "2026-07-02" },
    { id: "observation-engagement", name: "Observation & Engagement Plan", type: "guide" as const, description: "Observation level rationale and engagement", source: "DHCFT Inpatient Therapeutic Observations & Engagement Policy (Feb 2025 v10)", sourceType: "internal" as const, addedDate: "2026-06-22", lastVerified: "2026-07-02", notes: "Policy self-contradicts on the Level 3 review interval - app uses 72h (see Conflicts below)." },
    // Links (formerly Bookmarks)
    { id: "samaritans", name: "Samaritans", type: "link" as const, description: "24/7 emotional support helpline", source: "Samaritans public website", sourceType: "public" as const, addedDate: "2026-01-24", lastVerified: "2026-01-26" },
    { id: "nhs111", name: "NHS 111", type: "link" as const, description: "NHS urgent care advice", source: "NHS public website", sourceType: "public" as const, addedDate: "2026-01-24", lastVerified: "2026-01-26" },
  ];

  const workflows = DATA_SOURCES.filter((d) => d.type === "workflow");
  const guides = DATA_SOURCES.filter((d) => d.type === "guide");
  const links = DATA_SOURCES.filter((d) => d.type === "link");

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

  const renderSourceList = (sources: typeof DATA_SOURCES) => (
    <div className="space-y-3">
      {sources.map((source) => (
        <div key={source.id} className="p-4 bg-nhs-pale-grey rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-nhs-black text-sm">{source.name}</p>
                {getSourceBadge(source.sourceType)}
              </div>
              <p className="text-xs text-nhs-dark-grey">{source.description}</p>
              <p className="text-xs text-nhs-mid-grey mt-1"><strong>Source:</strong> {source.source}</p>
              {source.notes && <p className="text-xs text-nhs-mid-grey mt-0.5 italic">{source.notes}</p>}
            </div>
            <div className="text-right text-xs text-nhs-mid-grey ml-4 flex-shrink-0">
              <p>Added: {source.addedDate}</p>
              <p>Verified: {source.lastVerified}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-nhs-black">Data Sources Audit Log</h1>
        <p className="text-nhs-dark-grey mt-1">Transparency record of all data sources used in wardHub</p>
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-nhs-black mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            Source Type Legend
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex-shrink-0">Public</span>
              <span className="text-nhs-dark-grey">Information from publicly accessible sources</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full flex-shrink-0">Internal</span>
              <span className="text-nhs-dark-grey">From internal trust documentation</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full flex-shrink-0">Placeholder</span>
              <span className="text-nhs-dark-grey">Contact details anonymised with placeholder values</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-amber-800 text-sm">Demo Version Notice</p>
          <p className="text-xs text-amber-700 mt-1">
            This demo uses placeholder data for internal contact details. Real contact information is only available in versions deployed on Trust infrastructure.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Revision Quiz (942 questions)</h2>
          <p className="text-xs text-nhs-mid-grey mt-1">
            The largest single block of sourced content in wardHub, and it was missing from this log
            until 30 July 2026.
          </p>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-nhs-dark-grey">
          <p>
            <strong>942 questions across 43 topics.</strong> 574 of them (61%) were written from
            <strong> 117 distinct Derbyshire Healthcare documents</strong>; the rest come from
            national guidance (NICE, MHA Code of Practice, RCPsych and similar). Trust topics lead
            the topic picker, because local practice is what staff actually get asked about.
          </p>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="font-semibold text-amber-900">Two honest limitations</p>
            <p className="text-amber-800 mt-1">
              <strong>The policy library it was written from is a snapshot.</strong> Where a source
              document was near or past its stated review date, the question shows a quiet &ldquo;check
              FOCUS for the current version&rdquo; line after you answer. A question flagged that way
              is not necessarily wrong - our copy may simply be older than the live one. Nothing here
              should be used to assert that a Trust policy is out of date.
            </p>
            <p className="text-amber-800 mt-2">
              <strong>The quiz carries no sign-off status.</strong> Every guide has a traffic light;
              the quiz does not, despite marking staff right or wrong against Trust policy. Whether it
              should is an open decision.
            </p>
          </div>
          <p>
            Five questions were deliberately left out where two Trust documents give different
            answers, and one more where a system change had overtaken the policy. Those, and every
            other conflict found while reading the library, are listed below and in a separate
            write-up kept outside the repository for the Trust to action - including the finding that
            none of the five rapid tranquillisation documents describes a benzodiazepine reversal
            pathway.
          </p>
          <p className="text-xs text-nhs-mid-grey">
            Per-question sourcing: <code>docs/quiz-question-bank.md</code>. Still to be proofread.
          </p>
        </CardContent>
      </Card>

      <ConflictsCard />

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Referral Workflows ({workflows.length})</h2>
        </CardHeader>
        <CardContent>{renderSourceList(workflows)}</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">How-To Guides ({guides.length})</h2>
        </CardHeader>
        <CardContent>{renderSourceList(guides)}</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-nhs-black">Links (Sample - {links.length} shown)</h2>
          <p className="text-xs text-nhs-mid-grey mt-1">Full list available on the Links page</p>
        </CardHeader>
        <CardContent>{renderSourceList(links)}</CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center text-sm text-nhs-mid-grey">
          <p>This audit log is a representative sample - the authoritative sourcing lives in each guide (and its FOCUS links). Maintained as part of wardHub GDPR compliance. Last reviewed: 31 July 2026</p>
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
          <p className="text-xs text-nhs-mid-grey mt-1">Internal documents – requires FOCUS intranet access</p>
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
          {([
            { label: "DCB 0129 – Clinical Risk Management (Manufacture)", url: "https://digital.nhs.uk/data-and-information/information-standards/information-standards-and-data-collections-including-extractions/publications-and-notifications/standards-and-collections/dcb0129-clinical-risk-management-its-application-in-the-manufacture-of-health-it-systems" },
            { label: "DCB 0160 – Clinical Risk Management (Deployment)", url: "https://digital.nhs.uk/data-and-information/information-standards/information-standards-and-data-collections-including-extractions/publications-and-notifications/standards-and-collections/dcb0160-clinical-risk-management-its-application-in-the-deployment-and-use-of-health-it-systems" },
            { label: "Data Security and Protection Toolkit (DSPT)", url: "https://www.dsptoolkit.nhs.uk/" },
            { label: "Cyber Essentials Plus", url: undefined },
            { label: "UK GDPR / Data Protection Act 2018", url: "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/" },
          ] as { label: string; url?: string }[]).map((standard, i) => (
            standard.url ? (
              <a key={i} href={standard.url} target="_blank" rel="noopener noreferrer" className="block p-3 bg-nhs-pale-grey hover:bg-blue-50 rounded-lg transition-colors no-underline group">
                <p className="text-sm text-nhs-dark-grey group-hover:text-nhs-blue flex items-center gap-2">
                  {standard.label}
                  <ExternalLink className="w-3 h-3 text-nhs-mid-grey group-hover:text-nhs-blue flex-shrink-0" />
                </p>
              </a>
            ) : (
              <div key={i} className="p-3 bg-nhs-pale-grey rounded-lg">
                <p className="text-sm text-nhs-dark-grey">{standard.label}</p>
              </div>
            )
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