"use client";

import { PromptBuilder } from "@/components/guides/PromptBuilder";
import { NUTRITION_BUILDER } from "@/lib/data/guides";

export default function NutritionScreeningPage() {
  return <PromptBuilder config={NUTRITION_BUILDER} />;
}
