import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, FileText, Printer } from "lucide-react";
import { MainLayout } from "@/components/layout";
import { GOVERNANCE_DOCS, getGovernanceDoc } from "@/lib/data/governance-docs";

// Read at build time. The markdown file in docs/ is the source of truth; this
// page is only a window onto it, so the two can never disagree.
export function generateStaticParams() {
  return GOVERNANCE_DOCS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getGovernanceDoc(slug);
  return { title: doc ? `${doc.title} - wardHub` : "Document not found - wardHub" };
}

export default async function GovernanceDocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getGovernanceDoc(slug);
  if (!doc) notFound();

  let markdown: string;
  try {
    markdown = fs.readFileSync(path.join(process.cwd(), doc.path), "utf8");
  } catch {
    notFound();
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/dev-panel/documents"
          className="inline-flex items-center gap-2 text-sm font-medium text-nhs-blue hover:text-nhs-dark-blue mb-6"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          All governance documents
        </Link>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold text-amber-900">{doc.status}</p>
              <p className="text-sm text-amber-800 mt-1">
                Written by a ward nurse, not by a Clinical Safety Officer or Data Protection
                Officer. Published here so reviewers can see the working rather than be sent
                files. Nothing in it is accepted until the appropriate professional owns it.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-nhs-blue">{doc.title}</h1>
          <p className="hidden sm:flex items-center gap-2 text-sm text-gray-500 flex-shrink-0 print:hidden">
            <Printer className="w-4 h-4" aria-hidden="true" />
            Ctrl+P to print or save
          </p>
        </div>

        <article className="governance-doc bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold text-nhs-blue mt-0 mb-4">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-bold text-nhs-blue mt-8 mb-3 pb-2 border-b border-gray-200">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-semibold text-nhs-black mt-6 mb-2">{children}</h3>
              ),
              h4: ({ children }) => (
                <h4 className="text-base font-semibold text-nhs-dark-grey mt-5 mb-2">{children}</h4>
              ),
              p: ({ children }) => <p className="text-nhs-black leading-relaxed my-3">{children}</p>,
              ul: ({ children }) => (
                <ul className="list-disc pl-6 my-3 space-y-1 text-nhs-black">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-6 my-3 space-y-1 text-nhs-black">{children}</ol>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-nhs-blue bg-nhs-pale-grey/50 pl-4 py-2 my-4 text-nhs-dark-grey">
                  {children}
                </blockquote>
              ),
              code: ({ children }) => (
                <code className="bg-nhs-pale-grey px-1.5 py-0.5 rounded text-sm font-mono text-nhs-purple">
                  {children}
                </code>
              ),
              a: ({ href, children }) => (
                <a href={href} className="text-nhs-blue hover:text-nhs-dark-blue font-medium">
                  {children}
                </a>
              ),
              hr: () => <hr className="my-8 border-gray-200" />,
              // Tables carry almost all the content in these documents, so they
              // scroll horizontally rather than squashing on a narrow screen.
              table: ({ children }) => (
                <div className="overflow-x-auto my-4 -mx-2 px-2">
                  <table className="min-w-full text-sm border-collapse">{children}</table>
                </div>
              ),
              thead: ({ children }) => <thead className="bg-nhs-pale-grey">{children}</thead>,
              th: ({ children }) => (
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-nhs-black align-top">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border border-gray-300 px-3 py-2 text-nhs-black align-top">
                  {children}
                </td>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-nhs-black">{children}</strong>
              ),
            }}
          >
            {markdown}
          </ReactMarkdown>
        </article>
      </div>
    </MainLayout>
  );
}
