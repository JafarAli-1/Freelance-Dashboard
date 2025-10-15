import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { ColorSchemeScript } from "@mantine/core";
import "./globals.css";
import { Providers } from "@/components/Providers";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    default: "Freelance Dashboard",
    template: "%s | Freelance Dashboard",
  },
  description:
    "لوحة تحكم متكاملة لإدارة العملاء والمشاريع والفواتير للمستقلين.",
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png", rel: "icon" },
      { url: "/favicon.ico", rel: "icon" },
    ],
    shortcut: ["/logo.png"],
    apple: [{ url: "/logo.png", type: "image/png" }],
  },
  openGraph: {
    title: "Freelance Dashboard",
    description:
      "لوحة تحكم متكاملة لإدارة العملاء والمشاريع والفواتير للمستقلين.",
    images: [
      {
        url: "/logo.png",
        alt: "Freelance Dashboard",
        type: "image/png",
      },
    ],
    locale: "ar",
    type: "website",
  },
  twitter: {
    card: "summary",
    images: [
      {
        url: "/logo.png",
        alt: "Freelance Dashboard",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <ColorSchemeScript />
      </head>
      <body className={cairo.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
