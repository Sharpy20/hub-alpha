import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-nhs-dark-blue text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-3">Inpatient Hub</h3>
            <p className="text-sm text-nhs-light-blue">
              A ward management tool for NHS inpatient staff. Quick access to
              resources, referral workflows, and clinical guides.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/bookmarks"
                  className="text-nhs-light-blue hover:text-white no-underline"
                >
                  Bookmarks
                </Link>
              </li>
              <li>
                <Link
                  href="/referrals"
                  className="text-nhs-light-blue hover:text-white no-underline"
                >
                  Referral Hub
                </Link>
              </li>
              <li>
                <Link
                  href="/how-to"
                  className="text-nhs-light-blue hover:text-white no-underline"
                >
                  How-To Guides
                </Link>
              </li>
              <li>
                <Link
                  href="/gdpr"
                  className="text-nhs-light-blue hover:text-white no-underline"
                >
                  GDPR & Privacy
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-lg mb-3">Support</h3>
            <p className="text-sm text-nhs-light-blue mb-2">
              This is a demo version with fictional data.
            </p>
            <p className="text-sm text-nhs-light-blue">
              For the live version, contact your ward administrator.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/20 text-center text-sm text-nhs-light-blue">
          <p>&copy; {currentYear} Inpatient Hub Demo. Not for clinical use.</p>
        </div>
      </div>
    </footer>
  );
}
