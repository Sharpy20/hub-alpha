"use client";

import { PromptBuilder } from "@/components/guides/PromptBuilder";
import { FALLS_BUILDER } from "@/lib/data/guides";

export default function FallsPage() {
  return <PromptBuilder config={FALLS_BUILDER} />;
}
