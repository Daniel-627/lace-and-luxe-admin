import "./globals.css";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/jost/400.css";
import "@fontsource/jost/500.css";
import "@fontsource/jost/600.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Lace & Luxe Admin",
  robots: { index: false, follow: false },
  // Transparent icons: claret mark in light mode, ivory mark in dark mode.
  icons: {
    icon: [
      { url: "/icons/light-32.png", sizes: "32x32", type: "image/png", media: "(prefers-color-scheme: light)" },
      { url: "/icons/light-48.png", sizes: "48x48", type: "image/png", media: "(prefers-color-scheme: light)" },
      { url: "/icons/light-192.png", sizes: "192x192", type: "image/png", media: "(prefers-color-scheme: light)" },
      { url: "/icons/dark-32.png", sizes: "32x32", type: "image/png", media: "(prefers-color-scheme: dark)" },
      { url: "/icons/dark-48.png", sizes: "48x48", type: "image/png", media: "(prefers-color-scheme: dark)" },
      { url: "/icons/dark-192.png", sizes: "192x192", type: "image/png", media: "(prefers-color-scheme: dark)" },
    ],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-ivory font-sans text-claret antialiased">{children}</body>
    </html>
  );
}
