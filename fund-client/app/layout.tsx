import type React from "react";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/use-auth";
import { I18nProvider } from "@/hooks/use-i18n";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeInitializer } from "@/components/theme-initializer";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Crowdfunding 3.0 - Decentralized Fundraising Platform",
  description:
    "The future of crowdfunding with blockchain technology and AI-powered features",
  generator: "Roy.app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          enableColorScheme
          disableTransitionOnChange
        >
          <ThemeInitializer />
          <I18nProvider>
            <AuthProvider>{children}</AuthProvider>
          </I18nProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
