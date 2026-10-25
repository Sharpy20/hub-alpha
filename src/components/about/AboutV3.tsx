"use client";

import Link from "next/link";
import { BookOpen, Ban, BadgeCheck, Send, Lock } from "lucide-react";
import { MainLayout } from "@/components/layout";
import { useV2Href } from "@/lib/hooks/useV2";
import { ALL_GUIDES, GUIDE_TYPE } from "@/lib/data/guides/catalog";
import { guideApproval, type ApprovalStatus } from "@/lib/data/approval-status";
import { isV3ToolOut } from "@/lib/config/editions";

// The About page for 3.0, the guides-only edition. It replaces the dev panel
// and the full About page inside 3.0: one page that says what this version
// holds, what it leaves out, how a guide is checked and published, and what it
// keeps about the reader (nothing on a server). /3.0/gdpr lands on #privacy.
//
// Counts are worked out from the same data the guides list uses, never typed.

const GUIDES_3 = ALL_GUIDES.filter((g) => !isV3ToolOut(g.id) && g.viewerPath.startsWith("/guides/"));
const CHECKLISTS = GUIDES_3.filter((g) => GUIDE_TYPE[g.id] === "Checklist").length;
const LIGHTS = GUIDES_3.reduce(
  (acc, g) => {
    acc[guideApproval(g.id)] += 1;
    return acc;
  },
  { green: 0, amber: 0, red: 0 } as Record<ApprovalStatus, number>
);

const LEFT_OUT = [
  ["Team diary, My Jobs and appointments", "Needs a shared database and a login."],
  ["Patients, discharge, overview and reports", "Needs patient data, a DPIA and Trust hosting."],
  ["Staff list, sign-in, roles and wards", "Needs Trust authentication."],
  ["Risk formulation, MSE, care plan, safety plan, debrief, observation, restraint monitoring and seclusion support", "These tools assemble clinical text, which raises the medical device question. The editor cannot build them either."],
  ["Quiz and service map", "Not guides, and each would need its own sign-off."],
];

function Section({ id, icon: Icon, title, children }: { id?: string; icon: typeof BookOpen; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="bg-white rounded-xl border border-gray-200 p-6 space-y-3 scroll-mt-24">
      <h2 className="text-xl font-bold text-nhs-dark-blue flex items-center gap-2">
        <Icon className="w-5 h-5 text-nhs-blue" aria-hidden="true" />
        {title}
      </h2>
      {children}
    </section>
  );
}

export function AboutV3() {
  const link = useV2Href();

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6 text-nhs-black">
        <div>
          <p className="text-sm font-semibold text-nhs-blue uppercase tracking-wider">About</p>
          <h1 className="text-3xl font-bold text-nhs-dark-blue mt-1">wardHub 3.0, the guides edition</h1>
          <p className="text-lg text-nhs-dark-grey mt-2 max-w-prose">
            3.0 is wardHub cut down to its guides. No diary, no patient or staff records and no logins,
            so there is very little to review and nothing to hold.
          </p>
        </div>

        <Section icon={BookOpen} title="What is in it">
          <ul className="list-disc list-inside space-y-1.5">
            <li>
              <strong className="tabular-nums">{GUIDES_3.length}</strong> guides: referrals, the Mental Health Act,
              safeguarding, physical health and more, including <span className="tabular-nums">{CHECKLISTS}</span> tick-list checklists.
            </li>
            <li>The links directory: helplines, services and FOCUS pages.</li>
            <li>Printable patient leaflets.</li>
            <li>The guide editor, for writing and changing guides.</li>
          </ul>
        </Section>

        <Section icon={Ban} title="What is left out, and why">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-nhs-dark-grey border-b border-gray-200">
                  <th className="py-2 pr-4 font-semibold">Not in 3.0</th>
                  <th className="py-2 font-semibold">Why</th>
                </tr>
              </thead>
              <tbody>
                {LEFT_OUT.map(([what, why]) => (
                  <tr key={what} className="border-b border-gray-100 align-top">
                    <td className="py-2 pr-4 font-medium">{what}</td>
                    <td className="py-2 text-nhs-dark-grey">{why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-nhs-dark-grey">All of it still exists in the full wardHub. None of it is reachable from 3.0.</p>
        </Section>

        <Section icon={BadgeCheck} title="How a guide is checked">
          <p>Every guide carries a traffic light. Until a guide is green, treat it as a draft and check it against Trust policy.</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-3">
              <span className="mt-1 w-3 h-3 rounded-full bg-nhs-green flex-shrink-0" aria-hidden="true" />
              <span><strong>Green, signed off.</strong> Checked and safe to rely on. <span className="tabular-nums">{LIGHTS.green}</span> today.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-3 h-3 rounded-full bg-nhs-warm-yellow flex-shrink-0" aria-hidden="true" />
              <span><strong>Amber, awaiting sign-off.</strong> Built, not yet checked. <span className="tabular-nums">{LIGHTS.amber}</span> today.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-3 h-3 rounded-full bg-nhs-red flex-shrink-0" aria-hidden="true" />
              <span><strong>Red, in development.</strong> Do not rely on it yet. <span className="tabular-nums">{LIGHTS.red}</span> today.</span>
            </li>
          </ul>
        </Section>

        <Section icon={Send} title="How a guide gets published">
          <ol className="list-decimal list-inside space-y-1.5">
            <li>An author writes or edits the guide in the <Link href={link("/admin/guides")} className="font-semibold text-nhs-blue">editor</Link>. It saves in their browser only.</li>
            <li>They preview it the way a reader will see it.</li>
            <li>They download it and send the file to the publisher.</li>
            <li>The publisher adds it to the site. It goes live on the next update, under its traffic light.</li>
          </ol>
          <p className="text-sm text-nhs-dark-grey">
            There is no database. A change in the editor never reaches a reader until it is published, so an edit
            on a shared ward PC cannot change what the next person reads. The file that was sent is the record of
            what went live.
          </p>
        </Section>

        <Section id="privacy" icon={Lock} title="Privacy">
          <ul className="list-disc list-inside space-y-1.5">
            <li>3.0 holds no patient or staff data, and nobody signs in.</li>
            <li><strong>Do not type patient information</strong> into the editor or anywhere else on the site.</li>
            <li>
              Draft guides, saved links, the guide order and appearance are kept in your browser. Clearing the
              browser&apos;s site data removes them.
            </li>
            <li>Apart from the password, nothing you type in 3.0 is sent to the site&apos;s server.</li>
            <li>The site sets one cookie, <code className="text-sm">site_access</code>, to remember for 7 days that you entered the password.</li>
            <li>Like any website, the hosting provider keeps standard request logs.</li>
          </ul>
        </Section>

        <p className="text-sm text-nhs-dark-grey text-center">
          Something wrong, or a guide you need? <Link href={link("/feedback")} className="font-semibold text-nhs-blue">Send feedback</Link>.
        </p>
      </div>
    </MainLayout>
  );
}
