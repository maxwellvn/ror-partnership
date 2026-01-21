import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Rhapsody Partnership Target 2026",
  description: "Rhapsody of Realities Partnership Target 2026 - The Race For The Last Man. Submit your commitment and help impact nations globally.",
  icons: {
    icon: "/logo.webp",
    apple: "/logo.webp",
  },
  openGraph: {
    title: "Rhapsody Partnership Target 2026",
    description: "Rhapsody of Realities Partnership Target 2026 - The Race For The Last Man. Submit your commitment and help impact nations globally.",
    images: [
      {
        url: "/logo.webp",
        width: 1200,
        height: 630,
        alt: "Rhapsody of Realities",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rhapsody Partnership Target 2026",
    description: "Rhapsody of Realities Partnership Target 2026 - The Race For The Last Man. Submit your commitment and help impact nations globally.",
    images: ["/logo.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable}`}>
        {children}
      </body>
    </html>
  );
}
