import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Roommate Compatibility Test | RentEase",
  description:
    "Take the free Roommate Compatibility Test and see how well your lifestyle preferences match before moving in together.",
  openGraph: {
    title: "Roommate Compatibility Test | RentEase",
    description:
      "Take the free Roommate Compatibility Test and see how well your lifestyle preferences match before moving in together.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Roommate Compatibility Test | RentEase",
    description:
      "Take the free Roommate Compatibility Test and see how well your lifestyle preferences match before moving in together.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1483251530712082"
          crossOrigin="anonymous"
        />
      </head>

      <body>{children}</body>
    </html>
  );
}