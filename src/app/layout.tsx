import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Pablo — Checkup de veículos usados",
  description:
    "Descubra o que tem de errado no carro antes de pagar. IA que analisa fotos, identifica problemas e diz quanto pedir de desconto.",
  openGraph: {
    title: "Pablo — Checkup de veículos usados",
    description: "Descubra o que tem de errado no carro antes de pagar.",
    url: "https://pabloapps.net",
    siteName: "Pablo",
    type: "website",
    images: [{ url: "/logo-pablo.jpeg", width: 1024, height: 1024 }],
  },
  twitter: {
    card: "summary",
    title: "Pablo — Checkup de veículos usados",
    description: "Descubra o que tem de errado no carro antes de pagar.",
    images: ["/logo-pablo.jpeg"],
  },
  icons: {
    icon: "/icon-pablo.png",
    apple: "/icon-pablo.png",
  },
  metadataBase: new URL("https://pabloapps.net"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
