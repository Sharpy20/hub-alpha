"use client";

import { PromptBuilder } from "@/components/guides/PromptBuilder";
import { HANDLING_BUILDER } from "@/lib/data/guides";

export default function PersonalHandlingPage() {
  return <PromptBuilder config={HANDLING_BUILDER} />;
}
