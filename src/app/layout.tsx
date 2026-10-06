import type { Metadata } from "next";
import { IBM_Plex_Mono, Newsreader, Source_Sans_3 } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin", "latin-ext"],
  variable: "--font-source",
});

const newsreader = Newsreader({
  subsets: ["latin", "latin-ext"],
  variable: "--font-newsreader",
});

const plex = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-plex",
});

export const metadata: Metadata = {
  title: {
    default: "Notowania GPW",
    template: "%s · GPW Notowania",
  },
  description:
    "Indeksy, kursy dużych spółek, wykresy i krótkie wiadomości z warszawskiego parkietu.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pl"
      className={`${sourceSans.variable} ${newsreader.variable} ${plex.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#tresc"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2"
        >
          Przejdź do treści
        </a>
        <SiteHeader />
        <div className="h-0.5 bg-[#c4a46a]" />
        <main id="tresc" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
