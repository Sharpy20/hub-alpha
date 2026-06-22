"use client";

import { PromptBuilder } from "@/components/guides/PromptBuilder";
import { PRESSURE_BUILDER } from "@/lib/data/guides";

export default function PressureAreasPage() {
  return <PromptBuilder config={PRESSURE_BUILDER} />;
}
