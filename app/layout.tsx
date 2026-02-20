import "@/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QuizView",
  description: "Gamified IT interview practice with spaced repetition.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="neon">
      <body>
        {children}
        <p className="app-version">v1.0.0</p>
      </body>
    </html>
  );
}
