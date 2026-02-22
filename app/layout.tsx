import "@/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QuizView",
  description: "Gamified IT interview practice with spaced repetition.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    other: [
      { rel: "android-chrome-192", url: "/android-chrome-192x192.png" },
      { rel: "android-chrome-512", url: "/android-chrome-512x512.png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="neon">
      <body>
        {children}
        <p className="app-version">v1.3.5</p>
      </body>
    </html>
  );
}
