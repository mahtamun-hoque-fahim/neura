import type { Metadata } from "next";
import { Syne, DM_Sans, Caveat } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-syne",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  title: "Neura — Think Freely",
  description:
    "A clean, distraction-free collaborative whiteboard. Draw, sketch, and annotate in real-time with your team.",
  openGraph: {
    title: "Neura — Think Freely",
    description: "Real-time collaborative whiteboard. No signup required.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${syne.variable} ${dmSans.variable} ${caveat.variable} font-dm antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
