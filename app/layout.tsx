import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "FocusFlow — Study Tracker",
  description: "Deep-focus study tracker with timers, DSA/WebDev journeys and progress analytics.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
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
