// Progress Reports merged into /overview (27 Jul 2026, Mike's call - see
// BACKLOG Section M item 5). The reports screen was read-only and the review
// actions were an afterthought bolted on the side; Overview is now the one
// place, and it opens on this screen with the jobs list actionable.
//
// Kept as a redirect so old links, bookmarks and the printed handouts still
// land somewhere sensible.
import { redirect } from "next/navigation";

export default function ReportsRedirect() {
  redirect("/overview");
}
