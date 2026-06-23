"use client";

import { GuidePrompts } from "@/components/guides/GuidePrompts";
import { PRESSURE_BUILDER } from "@/lib/data/guides";

export default function PressureAreasPage() {
  return <GuidePrompts config={PRESSURE_BUILDER} />;
}
