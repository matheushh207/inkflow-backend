import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { StoreProvider } from "@/context/StoreContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "INK FLOW - Tattoo Studio Management",
  description: "Advanced Multi-tenant SaaS for Professional Tattoo Studios",
  icons: {
    icon: [
      {
        url: "/logo.png",
        sizes: "any",
        type: "image/png",
      }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
