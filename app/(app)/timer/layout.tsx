import type { Metadata } from "next";
import { CANONICAL_SITE_URL, SITE_NAME, AUTHOR_INFO } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Focus Timer & Pomodoro — Free Online Study Timer | FocusFlow",
  description:
    "Free online focus timer with Pomodoro, countdown, and stopwatch modes. Created by Shivansh for deep work, DSA practice, and consistent study streaks.",
  keywords: [
    "focus timer",
    "online focus timer",
    "pomodoro timer",
    "focusflow timer",
    "focus flow timer",
    "study timer online",
    "pomodoro study timer",
    "deep work timer",
    "shivansh focus timer",
    "focus timer free",
    "study timer",
    "online pomodoro timer",
  ],
  alternates: { canonical: `${CANONICAL_SITE_URL}/timer` },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "Focus Timer & Pomodoro — Free Online Study Timer | FocusFlow",
    description:
      "Free online focus timer with Pomodoro, countdown, and stopwatch modes. Built by Shivansh for deep study and coding sessions.",
    url: `${CANONICAL_SITE_URL}/timer`,
    images: [{ url: `${CANONICAL_SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: "FocusFlow Focus Timer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Focus Timer & Pomodoro — FocusFlow",
    description: "Free online focus timer with Pomodoro, countdown, and stopwatch modes.",
    images: [`${CANONICAL_SITE_URL}/opengraph-image`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function TimerLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${CANONICAL_SITE_URL}/timer#page`,
        name: "Focus Timer & Pomodoro — Free Online Study Timer",
        description:
          "Free online focus timer with Pomodoro, countdown, and stopwatch modes. Created by Shivansh for deep work and study streaks.",
        url: `${CANONICAL_SITE_URL}/timer`,
        isPartOf: { "@id": `${CANONICAL_SITE_URL}/#website` },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${CANONICAL_SITE_URL}/timer#app`,
        name: "FocusFlow Focus Timer",
        alternateName: ["Focus Timer", "Pomodoro Timer", "FocusFlow Timer", "Online Study Timer"],
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        url: `${CANONICAL_SITE_URL}/timer`,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        author: { "@type": "Person", "@id": `${CANONICAL_SITE_URL}/#author`, name: "Shivansh", url: AUTHOR_INFO.url },
        creator: { "@type": "Person", "@id": `${CANONICAL_SITE_URL}/#author`, name: "Shivansh" },
        featureList: "Pomodoro intervals, custom countdown, stopwatch with lap tracking, ambient sounds, local session storage",
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
