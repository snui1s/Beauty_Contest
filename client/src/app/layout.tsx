import type { Metadata } from "next";
import { Orbitron, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Balance Scale ⬥ King of Diamonds | Beauty Contest",
  description: "A high-stakes real-time multiplayer game inspired by Alice in Borderland's Beauty Contest. Test your mind, calculate the 0.8 average, and survive.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${orbitron.variable} ${jetbrainsMono.variable} dark`}>
      <body className="bg-background text-zinc-100 min-h-screen antialiased crt-overlay bg-grid-cyber selection:bg-neonCyan selection:text-background">
        {children}
      </body>
    </html>
  );
}
