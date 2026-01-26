"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout";
import { ChevronDown, HelpCircle, Shield, Smartphone, Users, Lock, AlertCircle, Stethoscope, Layers } from "lucide-react";
import Link from "next/link";

interface FAQItem {
  id: string;
  question: string;
  answer: React.ReactNode;
  icon: React.ReactNode;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "what-is",
    question: "What is Inpatient Hub?",
    icon: <HelpCircle className="w-5 h-5" />,
    answer: (
      <div className="space-y-3">
        <p>
          Inpatient Hub is a ward resource tool designed for inpatient mental health staff at Derbyshire Healthcare NHS Foundation Trust. It brings together:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Quick access bookmarks to frequently used services and helplines</li>
          <li>Step-by-step referral workflows with copy-to-clipboard case note prompts</li>
          <li>How-to guides for clinical procedures and ward tasks</li>
          <li>Ward diary and task management (in higher versions)</li>
          <li>Patient list and discharge tracking (in Max/Max+ versions)</li>
        </ul>
        <p>
          The goal is to reduce time spent searching for information and streamline common ward processes.
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
          <strong>In the demo version (Light):</strong> All data is stored locally in your browser. No patient information should be entered, and no data is sent to external servers.
        </p>
        <p>
          <strong>In Trust-deployed versions (Medium/Max/Max+):</strong> Data will be stored on Trust-approved infrastructure with full encryption, audit logging, and compliance with NHS Data Security and Protection Toolkit requirements.
        </p>
        <p>
          All versions are designed with privacy by default - the Light version contains no real patient data, only fictional demonstration data and publicly available contact information.
        </p>
        <p className="text-sm text-gray-500">
          See our <Link href="/gdpr" className="text-indigo-600 hover:underline">GDPR & Privacy page</Link> for more details.
        </p>
      </div>
    ),
  },
  {
    id: "versions",
    question: "What are the different versions?",
    icon: <Layers className="w-5 h-5" />,
    answer: (
      <div className="space-y-3">
        <p>Inpatient Hub has four versions with progressively more features:</p>
        <div className="space-y-2">
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="font-semibold text-green-800">Light</p>
            <p className="text-sm text-green-700">Public bookmarks, referral workflows, and how-to guides. Demo login only. No patient data.</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="font-semibold text-blue-800">Medium</p>
            <p className="text-sm text-blue-700">Adds internal SOPs, ward task diary, and Trust authentication. No patient-identifiable data.</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <p className="font-semibold text-purple-800">Max</p>
            <p className="text-sm text-purple-700">Adds patient list, discharge tracking, and patient-linked tasks. Requires Trust infrastructure and DIPA approval.</p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
            <p className="font-semibold text-orange-800">Max+</p>
            <p className="text-sm text-orange-700">Adds SystemOne API integration for task sync and case note pushing. Requires API approval.</p>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          <Link href="/versions" className="text-indigo-600 hover:underline">Compare all features</Link> to see what each version includes.
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
          <li>Visit the <Link href="/feedback" className="text-indigo-600 hover:underline">Feedback page</Link> to submit suggestions or report issues</li>
          <li>Use the "Suggest new bookmark" or "Report broken link" buttons on the Bookmarks page</li>
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
          Yes, Inpatient Hub is designed to work on mobile devices. While some features work best on larger screens (like the ward diary calendar view), core features like bookmarks, referral workflows, and how-to guides are fully mobile-friendly.
        </p>
        <p>
          For the best experience on mobile:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Use the hamburger menu to access navigation</li>
          <li>Tap the Inpatient Hub logo to return home</li>
          <li>Use the mobile-optimised task views for diary features</li>
        </ul>
        <p className="text-sm text-gray-500">
          Note: On Trust devices, you may need to use an approved browser and be connected to the Trust network for full functionality.
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
        <p>
          Content editing is role-based:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li><strong>Contributors</strong> can create and edit workflows, guides, and bookmarks</li>
          <li><strong>Senior Admins</strong> can approve content changes and manage user roles</li>
          <li><strong>Ward Admins</strong> can manage ward-specific settings and approve certain actions</li>
          <li><strong>Normal Users</strong> can view all content and suggest new bookmarks</li>
        </ul>
        <p>
          In the demo version, you can switch roles using the My Profile menu to see how different roles work.
        </p>
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
          FOCUS is the Trust intranet system. When you see a "FOCUS login needed" badge on a bookmark or link, it means:
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
          <strong>The demo version is NOT for clinical use.</strong> It contains fictional patient data and is intended for demonstration and feedback purposes only.
        </p>
        <p>
          When deployed on Trust infrastructure (Medium/Max/Max+ versions), Inpatient Hub is designed to support clinical workflows including:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Referral tracking and documentation</li>
          <li>Ward task management</li>
          <li>Patient discharge planning</li>
          <li>Quick access to clinical resources</li>
        </ul>
        <p className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800">
          <strong>Important:</strong> Clinical decisions should always be based on direct patient assessment, Trust policies, and professional judgement. This tool supports but does not replace clinical decision-making.
        </p>
      </div>
    ),
  },
];

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
                Common questions about Inpatient Hub and how to use it
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
