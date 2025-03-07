import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Footer from "@/components/footer";
import localFont from "next/font/local";
import { Providers } from "./providers";
import Navbar from "./components/navbar";

const inter = Inter({ subsets: ["latin"] });

const montserrat = localFont({
  src: [
    {
      path: "../public/fonts/Montserrat/Montserrat-VariableFont_wght.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Montserrat/Montserrat-Italic-VariableFont_wght.ttf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-main",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Reclaim | Blockchain-Based Lost & Found",
  description: "Find your lost items with the help of AI and community",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
