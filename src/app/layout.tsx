import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Community Events Board",
  description: "Discover local music nights, workshops, food fairs and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased">
        <AuthProvider>
          <Header />
          <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
