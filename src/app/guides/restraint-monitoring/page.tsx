"use client";

import { GuidePrompts } from "@/components/guides/GuidePrompts";
import { RESTRAINT_BUILDER } from "@/lib/data/guides/restraint";

export default function RestraintMonitoringPage() {
  return <GuidePrompts config={RESTRAINT_BUILDER} />;
}
