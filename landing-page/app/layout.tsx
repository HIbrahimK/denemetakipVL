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
      <head>
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Deneme Takip" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
      </head>
      <body className="font-sans antialiased">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(reg) { console.log('SW registered:', reg.scope); })
                    .catch(function(err) { console.log('SW registration failed:', err); });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
