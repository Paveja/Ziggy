import type { Metadata } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";
const heading = Fraunces({ subsets: ["latin"], variable: "--font-display" });
const body = Work_Sans({ subsets: ["latin"], variable: "--font-body" });
export const metadata: Metadata = {
  title: "Discover restaurants | Ziggy",
  description: "Explore fictional neighbourhood restaurants with Ziggy.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:block focus:p-4"
        >
          Skip to content
        </a>
        <header className="border-b border-border bg-card">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-6 sm:px-8">
            <Link
              href="/"
              className="font-heading text-3xl font-bold text-primary focus-visible:outline-2 focus-visible:outline-ring"
            >
              ziggy<span className="text-foreground">.</span>
            </Link>
            <span className="text-sm text-muted-foreground">
              Restaurant discovery
            </span>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
