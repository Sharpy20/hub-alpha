"use client";

import { PromptBuilder } from "@/components/guides/PromptBuilder";
import { OBSERVATION_BUILDER } from "@/lib/data/guides";

export default function ObservationEngagementPage() {
  return <PromptBuilder config={OBSERVATION_BUILDER} />;
}
