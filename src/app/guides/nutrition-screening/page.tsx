"use client";

import { GuidePrompts } from "@/components/guides/GuidePrompts";
import { NUTRITION_BUILDER } from "@/lib/data/guides";

export default function NutritionScreeningPage() {
  return <GuidePrompts config={NUTRITION_BUILDER} />;
}
