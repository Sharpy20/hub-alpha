"use client";

import { useParams, redirect } from "next/navigation";

export default function ReferralRedirect() {
  const params = useParams();
  redirect(`/guides/${params.id}`);
}
