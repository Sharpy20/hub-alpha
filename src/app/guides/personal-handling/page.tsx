"use client";

import { GuidePrompts } from "@/components/guides/GuidePrompts";
import { HANDLING_BUILDER } from "@/lib/data/guides";

export default function PersonalHandlingPage() {
  return <GuidePrompts config={HANDLING_BUILDER} />;
}
