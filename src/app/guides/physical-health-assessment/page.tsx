"use client";

import { PromptBuilder } from "@/components/guides/PromptBuilder";
import { PHYSICAL_HEALTH_BUILDER } from "@/lib/data/guides";

export default function PhysicalHealthAssessmentPage() {
  return <PromptBuilder config={PHYSICAL_HEALTH_BUILDER} />;
}
