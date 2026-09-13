import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Sign in or create your account",
    template: "%s | FocusFlow",
  },
  description:
    "Sign in or create your free FocusFlow account — track study sessions, follow DSA & WebDev roadmaps and build your streak.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
