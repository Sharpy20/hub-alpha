import Link from "next/link";
import { ArrowLeft, FileText, ShieldCheck, Lock } from "lucide-react";
import { MainLayout } from "@/components/layout";
import { GOVERNANCE_DOCS, type GovernanceDoc } from "@/lib/data/governance-docs";

export const metadata = { title: "Governance documents - wardHub" };

const GROUPS: { name: GovernanceDoc["group"]; icon: typeof ShieldCheck; blurb: string }[] = [
  {
    name: "Clinical safety",
    icon: ShieldCheck,
    blurb:
      "The DCB0129 set. Drafted alongside the build so the questions were written down, not because the author is qualified to close them.",
  },
  {
    name: "Data protection",
    icon: Lock,
    blurb:
      "What data the product touches, where it rests, and what has deliberately been taken out of it.",
  },
];

export default function GovernanceDocsPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/dev-panel"
          className="inline-flex items-center gap-2 text-sm font-medium text-nhs-blue hover:text-nhs-dark-blue mb-6"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to dev panel
        </Link>

        <h1 className="text-3xl font-bold text-nhs-blue mb-2">Governance documents</h1>
        <p className="text-nhs-dark-grey mb-8 max-w-2xl">
          The full documents, not summaries. Each one renders straight from the file in the
          repository, so what you read here is what is under version control.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
          <p className="text-sm text-amber-900">
            <strong>All of these are drafts written by a ward nurse.</strong> They are published
            so a reviewer can see the working and correct it, rather than start from nothing.
            None of them carries any formal standing until the appropriate professional - a
            qualified Clinical Safety Officer, a Data Protection Officer - reviews and owns it.
          </p>
        </div>

        {GROUPS.map((group) => {
          const docs = GOVERNANCE_DOCS.filter((d) => d.group === group.name);
          if (docs.length === 0) return null;
          const Icon = group.icon;
          return (
            <section key={group.name} className="mb-10">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-5 h-5 text-nhs-blue" aria-hidden="true" />
                <h2 className="text-xl font-bold text-nhs-blue">{group.name}</h2>
              </div>
              <p className="text-sm text-nhs-dark-grey mb-4">{group.blurb}</p>

              <div className="space-y-3">
                {docs.map((doc) => (
                  <Link
                    key={doc.slug}
                    href={`/dev-panel/documents/${doc.slug}`}
                    className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-nhs-blue hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <FileText
                        className="w-5 h-5 text-nhs-mid-grey flex-shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <h3 className="font-semibold text-nhs-black">{doc.title}</h3>
                        <p className="text-sm text-nhs-dark-grey mt-1">{doc.description}</p>
                        <span className="inline-block mt-2 text-xs font-medium text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                          {doc.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        <p className="text-sm text-nhs-mid-grey border-t border-gray-200 pt-6">
          The security review is deliberately not published here. It describes weaknesses and how
          to reach them, which does not belong on a site behind a single shared password. It goes
          to IM&amp;T directly.
        </p>
      </div>
    </MainLayout>
  );
}
