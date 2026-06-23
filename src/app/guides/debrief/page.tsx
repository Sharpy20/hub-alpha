"use client";

import { GuidePrompts } from "@/components/guides/GuidePrompts";
import { DEBRIEF_BUILDER } from "@/lib/data/guides";

export default function DebriefPage() {
  return <GuidePrompts config={DEBRIEF_BUILDER} />;
}
