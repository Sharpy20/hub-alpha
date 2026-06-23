"use client";

import { GuidePrompts } from "@/components/guides/GuidePrompts";
import { RESTRAINT_BUILDER } from "@/lib/data/guides";

export default function RestraintMonitoringPage() {
  return <GuidePrompts config={RESTRAINT_BUILDER} />;
}
