import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import SettingsClient from "./SettingsClient";

export default async function AdminSettingsPage() {
  const user = await getUser();
  if (!user || user.role !== "admin") redirect("/admin");

  return <SettingsClient />;
}
