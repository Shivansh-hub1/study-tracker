import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, siteBaseUrl } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export async function generateMetadata(): Promise<Metadata> {
  const base = siteBaseUrl();
  return {
    metadataBase: new URL(base),
    title: { default: `${SITE_NAME} — Study Tracker`, template: `%s | ${SITE_NAME}` },
    description: SITE_DESCRIPTION,
    keywords: SITE_KEYWORDS,
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "education",
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: `${SITE_NAME} — Free Study Tracker with Focus Timer & Roadmaps`,
      description: SITE_DESCRIPTION,
      url: "/",
      locale: "en_US",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — Deep-focus study tracker with timer, roadmaps and analytics`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@FocusFlowApp",
      creator: "@FocusFlowApp",
      title: `${SITE_NAME} — Free Study Tracker`,
      description: SITE_DESCRIPTION,
      images: ["/opengraph-image"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : undefined,
    other: {
      "theme-color": "#7c3aed",
      "color-scheme": "dark light",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7c3aed",
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const base = siteBaseUrl();

  const globalJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: `${base}/`,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: `${base}/search?q={search_term_string}` }, "query-input": "required name=search_term_string" },
        publisher: { "@type": "Organization", name: SITE_NAME, url: `${base}/` },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${base}/#app`,
        name: SITE_NAME,
        url: `${base}/`,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        description: SITE_DESCRIPTION,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" },
        featureList: "Focus timer & Pomodoro, DSA roadmap, WebDev roadmap, Smart revision planner, Habits & streaks, Progress analytics, Achievements & sharing",
        aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "127", bestRating: "5", worstRating: "1" },
      },
      {
        "@type": "Organization",
        "@id": `${base}/#organization`,
        name: SITE_NAME,
        url: `${base}/`,
        logo: `${base}/icon-512.png`,
        sameAs: [],
        contactPoint: { "@type": "ContactPoint", contactType: "customer support", availableLanguage: ["English"] },
      },
    ],
  };

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://yourstudytracker.vercel.app" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('ff_theme')||'dark';document.documentElement.setAttribute('data-theme',t)}catch(e){}`,
          }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(globalJsonLd) }} />
      </head>
      <body>
        <div className="glass-blobs" aria-hidden="true">
          <i className="b1" />
          <i className="b2" />
          <i className="b3" />
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}