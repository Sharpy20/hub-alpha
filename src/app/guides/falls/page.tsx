"use client";

import { GuidePrompts } from "@/components/guides/GuidePrompts";
import { FALLS_BUILDER } from "@/lib/data/guides";

export default function FallsPage() {
  return <GuidePrompts config={FALLS_BUILDER} />;
}
