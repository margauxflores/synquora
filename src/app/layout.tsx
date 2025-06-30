import "./globals.css";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import { Providers } from "@/lib/providers";
import { AppShell } from "@/components/AppShell";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Synquora",
  description: "A Discord community scheduling application",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <Toaster richColors />
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
