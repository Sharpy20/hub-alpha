"use client";

import { useParams, redirect } from "next/navigation";

export default function ReferralRedirect() {
  const params = useParams();
  // The chase log was retired 27 Jul (BACKLOG Section M item 6). Its old URL
  // would otherwise fall through as a guide id and render a blank default
  // guide, which reads as a broken page rather than a gone one.
  if (params.id === "log") redirect("/guides");
  redirect(`/guides/${params.id}`);
}
