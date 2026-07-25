import { redirect } from "next/navigation";

// This page catches the /string route and redirects to home
export default function StringPage() {
  redirect("/");
}
