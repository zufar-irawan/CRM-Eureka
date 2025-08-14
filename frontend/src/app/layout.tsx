import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "../styles/globals.css";

const monstserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-monstserrat',
  display: 'swap'
})

export const metadata: Metadata = {
  title: "CRM Eureka",
  description: "Mendigitalisasi proses manajemen prospek dan pelanggan untuk tim sales logistik.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${monstserrat.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
