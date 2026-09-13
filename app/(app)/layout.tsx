import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import AppShell from "@/components/AppShell";

export const dynamic = "force-dynamic";

// App pages need a login, so tell crawlers to stay out.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return <AppShell user={user}>{children}</AppShell>;
}
