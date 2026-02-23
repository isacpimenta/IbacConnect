import "./globals.css"; // A IMPORTAÇÃO DEVE ESTAR AQUI
import type { Metadata } from "next";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  )
}