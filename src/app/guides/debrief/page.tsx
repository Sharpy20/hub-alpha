"use client";

import { PromptBuilder } from "@/components/guides/PromptBuilder";
import { DEBRIEF_BUILDER } from "@/lib/data/guides";

export default function DebriefPage() {
  return <PromptBuilder config={DEBRIEF_BUILDER} />;
}
