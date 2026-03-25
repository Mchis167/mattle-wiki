import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";

/**
 * FONT SETUP
 *
 * Hiện tại dùng "Press Start 2P" (Google Fonts) để dev trước.
 *
 * Khi có custom font file (.woff2):
 * 1. Đặt file vào /public/fonts/PixelFont-Regular.woff2
 * 2. Thay block này bằng localFont (xem comment bên dưới)
 */
const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel-local",
  display: "swap",
});

/**
 * CUSTOM FONT (dùng khi đã có file font):
 *
 * import localFont from "next/font/local";
 * const pixelFont = localFont({
 *   src: [
 *     { path: "../../public/fonts/PixelFont-Regular.woff2", weight: "400" },
 *     { path: "../../public/fonts/PixelFont-Bold.woff2",    weight: "700" },
 *   ],
 *   variable: "--font-pixel-local",
 *   display: "swap",
 * });
 */

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
