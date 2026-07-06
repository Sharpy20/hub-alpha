"use client";

import { GuidePrompts } from "@/components/guides/GuidePrompts";
import { SAFETY_PLAN_BUILDER } from "@/lib/data/guides/safety-plan";

export default function SafetyPlanPage() {
  return <GuidePrompts config={SAFETY_PLAN_BUILDER} />;
}
