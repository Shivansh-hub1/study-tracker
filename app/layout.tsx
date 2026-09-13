import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, siteBaseUrl } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export async function generateMetadata(): Promise<Metadata> {
  const base = siteBaseUrl();
  const title = `${SITE_NAME} — Study Tracker`;
  return {
    metadataBase: new URL(base),
    title: { default: title, template: `%s | ${SITE_NAME}` },
    description: SITE_DESCRIPTION,
    keywords: SITE_KEYWORDS,
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "education",
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description: SITE_DESCRIPTION,
      url: "/",
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
      title,
      description: SITE_DESCRIPTION,
      images: ["/opengraph-image"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
    verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : undefined,
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7c3aed",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('ff_theme')||'dark';document.documentElement.setAttribute('data-theme',t)}catch(e){}`,
          }}
        />
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
