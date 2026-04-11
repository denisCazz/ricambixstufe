import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { LocaleProvider } from "@/lib/locale-context";
import { UserProvider } from "@/lib/user-context";
import { ThemeProvider } from "@/lib/theme-context";
import CartDrawer from "@/components/CartDrawer";
import ScrollToTop from "@/components/ScrollToTop";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const siteUrl = "https://www.ricambixstufe.it";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "RicambiXStufe | Ricambi per Stufe a Pellet",
    template: "%s | RicambiXStufe",
  },
  description:
    "Ricambi per stufe a pellet: motoriduttori, ventilatori, resistenze, schede elettroniche e molto altro. Spedizione in tutta Europa.",
  keywords:
    "ricambi stufe pellet, motoriduttori, ventilatori fumi, resistenze accensione, bracieri, schede elettroniche, stufe a pellet, pezzi di ricambio",
  authors: [{ name: "RicambiXStufe - Elettroservice snc" }],
  creator: "Bitora.it",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: siteUrl,
    siteName: "RicambiXStufe",
    title: "RicambiXStufe | Ricambi per Stufe a Pellet",
    description:
      "Ricambi per stufe a pellet: motoriduttori, ventilatori, resistenze, schede elettroniche e molto altro. Spedizione in tutta Europa.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "RicambiXStufe - Ricambi per Stufe a Pellet",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RicambiXStufe | Ricambi per Stufe a Pellet",
    description:
      "Ricambi per stufe a pellet: motoriduttori, ventilatori, resistenze, schede elettroniche e molto altro.",
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('ricambixstufe_theme');var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme:dark)').matches);if(d)document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider>
          <LocaleProvider>
            <UserProvider>
              <CartProvider>
                {children}
                <CartDrawer />
                <ScrollToTop />
              </CartProvider>
            </UserProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
