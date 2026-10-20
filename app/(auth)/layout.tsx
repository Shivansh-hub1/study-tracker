import type { Metadata } from "next";
import { CANONICAL_SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    default: "Sign in or create your account",
    template: "%s | FocusFlow",
  },
  description:
    "Sign in or create your free FocusFlow account — track study sessions, follow DSA & WebDev roadmaps and build your streak.",
  alternates: { canonical: `${CANONICAL_SITE_URL}/login` },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
