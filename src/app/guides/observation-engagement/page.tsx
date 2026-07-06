"use client";

import { GuidePrompts } from "@/components/guides/GuidePrompts";
import { OBSERVATION_BUILDER } from "@/lib/data/guides/observation";

export default function ObservationEngagementPage() {
  return <GuidePrompts config={OBSERVATION_BUILDER} />;
}
