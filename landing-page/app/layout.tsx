import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Deneme Takip Sistemi - Okullar İçin Akıllı Sınav Yönetimi",
  description:
    "Deneme sınavlarınızı kolayca takip edin, öğrenci performansını analiz edin ve velileri anında bilgilendirin. 50+ okulun güvendiği platform.",
  keywords: [
    "deneme takip",
    "sınav yönetimi",
    "öğrenci takip",
    "okul yönetim sistemi",
    "eğitim teknolojisi",
  ],
  authors: [{ name: "Deneme Takip Ekibi" }],
  openGraph: {
    title: "Deneme Takip Sistemi",
    description: "Okullar için akıllı sınav yönetim platformu",
    type: "website",
    locale: "tr_TR",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
