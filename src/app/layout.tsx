import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Pablo — Laudo de compra de veículos",
  description:
    "Gere um laudo completo antes de comprar um carro. FIPE, checklist técnico e análise de documentação em 8 minutos.",
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
