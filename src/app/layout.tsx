import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "WatchBags | Luxury Resale Marketplace",
  description:
    "Find underpriced luxury watches and handbags. AI-powered valuations, profit estimates, and market analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        <ThemeProvider>
          <Navbar />
          <main className="min-h-screen pt-16">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
