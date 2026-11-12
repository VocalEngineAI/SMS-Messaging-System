import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { getSessionAdmin } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/login");

  return <AppShell>{children}</AppShell>;
}
