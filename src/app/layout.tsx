import type { Metadata, Viewport } from "next";
import "./globals.css";
import { brand } from "@/lib/config";

export const metadata: Metadata = {
  title: `${brand.product} | ${brand.name}`,
  description: "Emergency information available from a secure NFC tag.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#b42318" },
    { media: "(prefers-color-scheme: dark)", color: "#7a271a" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
