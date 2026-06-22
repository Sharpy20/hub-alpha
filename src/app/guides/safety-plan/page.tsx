"use client";

import { PromptBuilder } from "@/components/guides/PromptBuilder";
import { SAFETY_PLAN_BUILDER } from "@/lib/data/guides";

export default function SafetyPlanPage() {
  return <PromptBuilder config={SAFETY_PLAN_BUILDER} />;
}
