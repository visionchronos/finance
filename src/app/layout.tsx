import type { Metadata } from "next";
import { Outfit, Manrope } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

import { Providers } from "@/components/Providers";
import { Navigation } from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Finance Dashboard",
  description: "Personal finance tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html
        lang="en"
        className={`${outfit.variable} ${manrope.variable} h-full antialiased suppressHydrationWarning`}
        suppressHydrationWarning
      >
      <body className="min-h-full flex flex-col bg-gray-50 dark:bg-[#02040a] text-gray-900 dark:text-white transition-colors">
        <Providers>
          <Navigation />
          <main className="flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
