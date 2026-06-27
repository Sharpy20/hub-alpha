// Small reusable "Record it on SystmOne" block for the bespoke builder guide
// pages (care plan, risk, leave/discharge/transfer). Links open the SystmOne
// how-to guides on FOCUS - trust login needed, so they only resolve on the
// trust network. Mirrors the block built into the GuidePrompts + /guides/[id]
// viewers.

export function FocusLinks({ links }: { links: { label: string; url: string }[] }) {
  if (!links || links.length === 0) return null;
  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 print:hidden">
      <p className="text-sm font-bold text-indigo-900 mb-1">On FOCUS (trust login needed)</p>
      <p className="text-xs text-indigo-700 mb-2">
        SystmOne how-tos and the source trust policy - you need to be logged into FOCUS.
      </p>
      <div className="flex flex-wrap gap-2">
        {links.map((f, i) => (
          <a
            key={i}
            href={f.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 bg-white border border-indigo-200 rounded-lg text-sm font-medium text-indigo-700 hover:bg-indigo-100 no-underline"
          >
            {f.label}
          </a>
        ))}
      </div>
    </div>
  );
}
