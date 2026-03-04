import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { SearchProvider } from "@/contexts/SearchContext";
import SessionProviderWrapper from "@/components/layout/SessionProviderWrapper";

const openSans = Open_Sans({
  variable: "--font-main",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AIESEC B2B Sales - Yönetim Paneli",
  description: "AIESEC B2B CRM ve Satış Yönetim Sistemi",
  icons: {
    icon: "/logo/fav.svg",
    shortcut: "/logo/fav.svg",
    apple: "/logo/fav.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${openSans.variable}`}>
        <SessionProviderWrapper>
          <SearchProvider>
            {children}
          </SearchProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}