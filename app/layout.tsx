import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KhoApp - Nền tảng chia sẻ ứng dụng",
  description: "Nền tảng chia sẻ và khám phá ứng dụng hiện đại với giao diện cao cấp dành cho người dùng Việt."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
