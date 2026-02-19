import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lamborghini Terzo Millennio | 3D Configurator",
  description:
    "Interactive 3D configurator for the Lamborghini Terzo Millennio concept car. Customize body color, wheels, neon lights, and materials in real-time.",
  keywords: [
    "Lamborghini",
    "Terzo Millennio",
    "3D configurator",
    "car configurator",
    "WebGL",
    "Three.js",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a] text-white overflow-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
