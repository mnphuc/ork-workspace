import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from '@/contexts/UserContext';
import { I18nProvider } from '@/components';
import '@/lib/auth-interceptor'; // Initialize auth interceptor

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OKR Management System",
  description: "Manage your Objectives and Key Results",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}>
        <I18nProvider>
          <UserProvider>
            {children}
          </UserProvider>
        </I18nProvider>
      </body>
    </html>
  );
}