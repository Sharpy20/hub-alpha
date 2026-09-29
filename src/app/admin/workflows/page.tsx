import { redirect } from "next/navigation";

// The referral editor and the how-to editor are one editor now.
export default function WorkflowsAdminRedirect() {
  redirect("/admin/guides");
}
