"use client";

import { PromptBuilder } from "@/components/guides/PromptBuilder";
import { SECLUSION_BUILDER } from "@/lib/data/guides";

export default function SeclusionSupportPlanPage() {
  return <PromptBuilder config={SECLUSION_BUILDER} />;
}
