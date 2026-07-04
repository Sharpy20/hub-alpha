"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout";
import { ChevronDown, HelpCircle, Shield, Smartphone, Users, Lock, AlertCircle, Stethoscope, Search } from "lucide-react";
import Link from "next/link";
import { useIsV2, useV2Href } from "@/lib/hooks/useV2";

interface FAQItem {
  id: string;
  question: string;
  answer: React.ReactNode;
  icon: React.ReactNode;
}

function buildFAQItems(isV2: boolean, link: (h: string) => string): FAQItem[] {
  return [
  {
    id: "what-is",
    question: "What is wardHub?",
    icon: <HelpCircle className="w-5 h-5" />,
    answer: (
      <div className="space-y-3">
        <p>
          wardHub is a ward resource tool designed for inpatient mental health staff at Derbyshire Healthcare NHS Foundation Trust. It brings together:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Quick access links to frequently used services and helplines</li>
          <li>Step-by-step referral workflows with copy-to-clipboard case note prompts</li>
          <li>How-to guides for clinical procedures and ward tasks</li>
          {!isV2 && <li>Team diary and task management</li>}
          {!isV2 && <li>Patient list and discharge tracking</li>}
        </ul>
        <p>
          {isV2
            ? "This is the PII-free version: links and guides only, no patient data and no diary. The full product also includes a team diary and patient list."
            : "The goal is to reduce time spent searching for information and streamline common ward processes."}
        </p>
      </div>
    ),
  },
  {
    id: "data-security",
    question: "Is my data secure?",
    icon: <Shield className="w-5 h-5" />,
    answer: (
      <div className="space-y-3">
        <p>
          In the current demo, everything you enter is stored locally in your browser and never sent to a server. No patient information should be entered. There is no tracking or analytics; the site is hosted on Vercel, which keeps standard request logs like any web host.
        </p>
        <p>
          When deployed on Trust infrastructure, data will be stored with full encryption, audit logging, and NHS DSPT compliance.
        </p>
        <p>
          The demo is designed with privacy by default - it contains no real patient data, only fictional demonstration data and publicly available contact information.
        </p>
        <p className="text-sm text-gray-500">
          See our <Link href={link("/gdpr")} className="text-indigo-600 hover:underline">GDPR & Privacy page</Link> for more details.
        </p>
      </div>
    ),
  },
  {
    id: "search",
    question: "How do I find a guide or link quickly?",
    icon: <Search className="w-5 h-5" />,
    answer: (
      <div className="space-y-3">
        <p>
          Use the search box in the top bar, or press <strong>Ctrl+K</strong> (Cmd+K on a Mac)
          from anywhere. Start typing and it searches across every guide and link at once.
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Results are grouped into guides and links, with a badge showing each guide&apos;s type</li>
          <li>Use the up/down arrows to move and Enter to open; Esc closes it</li>
          <li>Links open in a new tab; a lock icon means the link needs FOCUS access</li>
        </ul>
        <p>
          On the Guides page you can also filter by category or by type (How-to, Step-by-step,
          Builder, Checklist, Tips).
        </p>
      </div>
    ),
  },
  {
    id: "report-bug",
    question: "How do I report a bug or suggest a feature?",
    icon: <AlertCircle className="w-5 h-5" />,
    answer: (
      <div className="space-y-3">
        <p>
          We welcome all feedback during this alpha phase. You can:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Visit the <Link href={link("/feedback")} className="text-indigo-600 hover:underline">Feedback page</Link> to submit suggestions or report issues</li>
          <li>Use the "Suggest new link" or "Report broken link" buttons on the Links page</li>
          <li>Contact the project owner directly (see the Feedback page for details)</li>
        </ul>
        <p>
          All feedback helps shape the tool and ensure it meets the needs of ward staff.
        </p>
      </div>
    ),
  },
  {
    id: "mobile",
    question: "Can I use this on my phone?",
    icon: <Smartphone className="w-5 h-5" />,
    answer: (
      <div className="space-y-3">
        <p>
          wardHub is designed for use on ward desktop computers and Trust devices. Mobile access is not currently a priority as personal phones are not permitted on the ward.
        </p>
        <p>
          If accessing from a Trust tablet or similar device, the interface will adapt to the screen size, but the best experience is on a desktop browser.
        </p>
      </div>
    ),
  },
  {
    id: "edit-content",
    question: "Who can edit workflows and guides?",
    icon: <Users className="w-5 h-5" />,
    answer: (
      <div className="space-y-3">
        {isV2 ? (
          <>
            <p>This PII-free demo has two roles:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>Staff</strong> can view all content and suggest new links</li>
              <li><strong>Senior Admin</strong> can approve content changes and manage user roles</li>
            </ul>
            <p>
              Any role can request <strong>creator privileges</strong> – a separate flag, not a role. Creators can edit workflows, guides and links.
            </p>
          </>
        ) : (
          <>
            <p>
              wardHub has five roles, and content editing depends on whether you have creator privileges:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>Staff</strong> can view all content and suggest new links</li>
              <li><strong>Lead</strong> and <strong>Manager</strong> have additional ward oversight capabilities</li>
              <li><strong>Ward Admin</strong> can manage ward-specific settings and approve certain actions</li>
              <li><strong>Senior Admin</strong> can approve content changes and manage user roles</li>
            </ul>
            <p>
              Any role can request <strong>creator privileges</strong> – this is a separate flag, not a role. Users with creator privileges can create and edit workflows, guides, and links.
            </p>
            <p>
              In the demo, you can switch roles using the My Profile menu to see how different roles work.
            </p>
          </>
        )}
      </div>
    ),
  },
  {
    id: "focus-login",
    question: "What does FOCUS login mean?",
    icon: <Lock className="w-5 h-5" />,
    answer: (
      <div className="space-y-3">
        <p>
          FOCUS is the Trust intranet system. When you see a "FOCUS login needed" badge on a link, it means:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>You need to be connected to the Trust network (on-site or via VPN)</li>
          <li>You may need to log in to FOCUS with your Trust credentials</li>
          <li>The link points to an internal Trust resource not accessible from the public internet</li>
        </ul>
        <p>
          In the demo version, these links may not work as they require Trust network access. In production, they will open the correct internal pages when accessed from Trust devices.
        </p>
      </div>
    ),
  },
  {
    id: "clinical-use",
    question: "Is this for clinical use?",
    icon: <Stethoscope className="w-5 h-5" />,
    answer: (
      <div className="space-y-3">
        <p>
          <strong>The demo version is NOT for clinical use.</strong> {isV2
            ? "This PII-free version contains only links and educational guides for demonstration."
            : "It contains fictional patient data and is intended for demonstration and feedback purposes only."}
        </p>
        <p>
          When deployed on Trust infrastructure, wardHub is designed to support clinical workflows including:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Referral tracking and documentation</li>
          {!isV2 && <li>Team task management</li>}
          {!isV2 && <li>Patient discharge planning</li>}
          <li>Quick access to clinical resources</li>
        </ul>
        <p className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800">
          <strong>Important:</strong> Clinical decisions should always be based on direct patient assessment, Trust policies, and professional judgement. This tool supports but does not replace clinical decision-making.
        </p>
      </div>
    ),
  },
  ];
}

function AccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden transition-all hover:border-gray-200">
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 flex items-center gap-4 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset"
        aria-expanded={isOpen}
      >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
          isOpen
            ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
            : "bg-gray-100 text-gray-600"
        }`}>
          {item.icon}
        </div>
        <span className={`flex-1 font-semibold text-lg transition-colors ${
          isOpen ? "text-indigo-700" : "text-gray-900"
        }`}>
          {item.question}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
          isOpen ? "rotate-180 text-indigo-500" : ""
        }`} />
      </button>
      <div className={`transition-all duration-200 ease-in-out ${
        isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
      } overflow-hidden`}>
        <div className="px-6 pb-6 pt-2 text-gray-600 leading-relaxed border-t border-gray-100">
          {item.answer}
        </div>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const isV2 = useIsV2();
  const link = useV2Href();
  const FAQ_ITEMS = buildFAQItems(isV2, link);
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(["what-is"]));

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setOpenItems(new Set(FAQ_ITEMS.map((item) => item.id)));
  };

  const collapseAll = () => {
    setOpenItems(new Set());
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <HelpCircle className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
              <p className="text-white/80 mt-1">
                Common questions about wardHub and how to use it
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-end gap-2">
          <button
            onClick={expandAll}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Expand all
          </button>
          <button
            onClick={collapseAll}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Collapse all
          </button>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {FAQ_ITEMS.map((item) => (
            <AccordionItem
              key={item.id}
              item={item}
              isOpen={openItems.has(item.id)}
              onToggle={() => toggleItem(item.id)}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl p-8 text-center">
          <p className="text-nhs-dark-grey text-lg mb-4">
            Still have questions?
          </p>
          <Link
            href="/feedback"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
          >
            Send us feedback
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
