import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scheduleo Desktop v2.0",
  description: "Sistema de Gestión de Personal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
