"use client";

import { GuidePrompts } from "@/components/guides/GuidePrompts";
import { DEBRIEF_BUILDER } from "@/lib/data/guides/debrief";

export default function DebriefPage() {
  return <GuidePrompts config={DEBRIEF_BUILDER} />;
}
