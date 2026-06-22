"use client";

import { PromptBuilder } from "@/components/guides/PromptBuilder";
import { RESTRAINT_BUILDER } from "@/lib/data/guides";

export default function RestraintMonitoringPage() {
  return <PromptBuilder config={RESTRAINT_BUILDER} />;
}
