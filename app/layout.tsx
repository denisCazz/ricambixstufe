import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { LocaleProvider } from "@/lib/locale-context";
import CartDrawer from "@/components/CartDrawer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ricambi X Stufe | Ricambi per Stufe a Pellet",
  description:
    "Ricambi per stufe a pellet: motoriduttori, ventilatori, resistenze, schede elettroniche e molto altro. Spedizione in tutta Europa.",
  keywords:
    "ricambi stufe pellet, motoriduttori, ventilatori fumi, resistenze accensione, bracieri, schede elettroniche",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${inter.variable} antialiased`}>
        <LocaleProvider>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
