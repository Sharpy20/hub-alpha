"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { useIsV2, useIsV3, useV2Href } from "@/lib/hooks/useV2";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const isV2 = useIsV2();
  const isV3 = useIsV3();
  const link = useV2Href();

  return (
    <footer className="bg-nhs-dark-blue text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-3">wardHub</h3>
            <p className="text-sm text-white/70">
              {isV3
                ? "Step-by-step guides for an inpatient ward: referrals, the Mental Health Act, safeguarding and the rest of the job."
                : isV2
                ? "A reference tool built around the needs of an inpatient ward. Interactive guides, links and resources at your fingertips."
                : "A reference and task management tool built around the needs of an inpatient ward. Interactive guides and a simple electronic jobs diary."}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href={link("/links")} className="hover:text-white transition-colors">
                  Links
                </Link>
              </li>
              <li>
                <Link href={link("/guides")} className="hover:text-white transition-colors">
                  Interactive Guides
                </Link>
              </li>
              {isV3 && (
                <li>
                  <Link href={link("/patient-guides")} className="hover:text-white transition-colors">
                    Patient leaflets
                  </Link>
                </li>
              )}
              <li>
                <Link href={link("/gdpr")} className="hover:text-white transition-colors">
                  GDPR &amp; Privacy
                </Link>
              </li>
              <li>
                <Link href={link("/about")} className="hover:text-white transition-colors">
                  {isV3 ? "About 3.0" : <>About &amp; Governance</>}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-lg mb-3">Support</h3>
            {isV3 ? (
              <>
                <p className="text-sm text-white/70 mb-2">
                  3.0 holds no patient or staff data and nobody signs in.
                </p>
                <p className="text-sm text-white/70 mb-4">
                  Every guide is a draft until it is signed off.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-white/70 mb-2">
                  This is a demo with fictional data.
                </p>
                <p className="text-sm text-white/70 mb-4">
                  For the live version, contact your ward administrator.
                </p>
              </>
            )}
            <Link
              href={link("/feedback")}
              className="inline-flex items-center gap-2 text-sm text-nhs-light-blue hover:text-white transition-colors"
            >
              <ShieldAlert className="w-4 h-4" />
              Report a data concern
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/20 text-center text-sm text-white/70 space-y-2">
          <p className="text-xs text-white/70 font-medium tracking-wider uppercase">
            Derbyshire Healthcare NHS Foundation Trust
          </p>
          <p>&copy; {currentYear} wardHub &ndash; {isV3 ? "3.0, guides edition" : "Alpha Demo"}. Not for clinical use.</p>
          <div className="flex items-center justify-center gap-4 text-xs text-white/70">
            <Link href={link("/gdpr")} className="hover:text-white transition-colors">Privacy</Link>
            {!isV2 && (
              <>
                <span>|</span>
                <Link href="/dev-panel?section=data-sources" className="hover:text-white transition-colors">Data Sources</Link>
              </>
            )}
            <span>|</span>
            <Link href={link("/feedback")} className="hover:text-white transition-colors">Feedback</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
