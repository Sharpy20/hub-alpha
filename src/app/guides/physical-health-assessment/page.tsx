"use client";

import { GuidePrompts } from "@/components/guides/GuidePrompts";
import { PHYSICAL_HEALTH_BUILDER } from "@/lib/data/guides";

export default function PhysicalHealthAssessmentPage() {
  return <GuidePrompts config={PHYSICAL_HEALTH_BUILDER} />;
}
