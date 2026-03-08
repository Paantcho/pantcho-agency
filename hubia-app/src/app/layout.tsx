import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";
import { HubiaToastProvider } from "@/components/ui/hubia-toast";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Hubia",
  description: "Plataforma SaaS multi-tenant da Pantcho Agency",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={urbanist.variable}>
      <body className="font-sans antialiased">
        {children}
        <HubiaToastProvider />
      </body>
    </html>
  );
}
