import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MediControl - Control de Medicamentos",
  description: "Tu asistente personal para gestionar medicamentos de forma segura. Recordatorios, alertas de interacciones y reportes para compartir con tu médico.",
  keywords: ["medicamentos", "control", "salud", "recordatorios", "polimedicados", "interacciones", "gestión salud"],
  authors: [{ name: "MediControl" }],
  icons: {
    icon: "/logo.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "MediControl - Control de Medicamentos",
    description: "Gestiona tus medicamentos de forma segura y sencilla",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-gray-50 text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
