import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const pixelFont = localFont({
  src: [
    {
      path: "../../public/fonts/MS-Sans-Serif-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-pixel-local",
  display: "swap",
});

export const metadata: Metadata = {
  title: "$MATTLE WIKI",
  description: "Wiki cho game Mattle — Characters, Abilities, Items, Monsters",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${pixelFont.variable} h-full`}>
      <body className="min-h-full bg-wiki-bg text-wiki-text font-pixel">
        {children}
      </body>
    </html>
  );
}
