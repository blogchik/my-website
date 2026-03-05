import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CustomCursor } from "@/components/custom-cursor";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "J. Abduroziq — Designing The Next Internet",
    template: "%s — J. Abduroziq",
  },
  description:
    "Personal website of Jabborov Abduroziq — developer & designer passionate about building meaningful digital experiences. Think Beyond Limits.",
  keywords: [
    "Jabborov Abduroziq",
    "web developer",
    "designer",
    "Next.js",
    "React",
    "TypeScript",
    "UI/UX",
  ],
  authors: [{ name: "Jabborov Abduroziq", url: siteUrl }],
  creator: "Jabborov Abduroziq",
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "J. Abduroziq",
    title: "J. Abduroziq — Designing The Next Internet",
    description:
      "Personal website of Jabborov Abduroziq — developer & designer passionate about building meaningful digital experiences.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "J. Abduroziq — Designing The Next Internet",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@jabborovstwit",
    creator: "@jabborovstwit",
    title: "J. Abduroziq — Designing The Next Internet",
    description:
      "Personal website of Jabborov Abduroziq — developer & designer passionate about building meaningful digital experiences.",
    images: [
      {
        url: "/twitter-image",
        width: 1200,
        height: 630,
        alt: "J. Abduroziq — Designing The Next Internet",
      },
    ],
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${ibmPlexMono.variable} font-mono antialiased`}>
        <CustomCursor />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
