import { redirect } from "next/navigation";

export default function MyDiaryRedirect() {
  redirect("/tasks?view=my-diary");
}
