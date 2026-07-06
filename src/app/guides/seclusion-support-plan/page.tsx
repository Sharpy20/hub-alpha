"use client";

import { GuidePrompts } from "@/components/guides/GuidePrompts";
import { SECLUSION_BUILDER } from "@/lib/data/guides/seclusion";

export default function SeclusionSupportPlanPage() {
  return <GuidePrompts config={SECLUSION_BUILDER} />;
}
