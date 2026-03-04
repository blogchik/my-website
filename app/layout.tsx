import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

// TODO: Uncomment when Gatuzo font files are added to public/fonts/
// import localFont from "next/font/local";
// const gatuzo = localFont({
//   src: [
//     { path: "../public/fonts/Gatuzo-Regular.woff2", weight: "400", style: "normal" },
//     { path: "../public/fonts/Gatuzo-SemiBold.woff2", weight: "600", style: "normal" },
//     { path: "../public/fonts/Gatuzo-Bold.woff2", weight: "700", style: "normal" },
//   ],
//   variable: "--font-gatuzo",
//   display: "swap",
//   fallback: ["Montserrat", "sans-serif"],
// });

export const metadata: Metadata = {
  title: "Reboot",
  description:
    "We're not building another platform. We're building a place where people belong.",
  openGraph: {
    title: "Reboot",
    description:
      "We're not building another platform. We're building a place where people belong.",
    type: "website",
    siteName: "Reboot",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reboot",
    description:
      "We're not building another platform. We're building a place where people belong.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} font-body antialiased`}>
        {children}
      </body>
    </html>
  );
}
