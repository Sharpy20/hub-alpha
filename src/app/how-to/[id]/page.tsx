"use client";

import { useParams, redirect } from "next/navigation";

export default function HowToRedirect() {
  const params = useParams();
  redirect(`/guides/${params.id}`);
}
