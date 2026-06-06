import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const TITLE = "StarMap BA — Los mejores cielos de la Provincia de Buenos Aires";
const DESCRIPTION =
  "Encontrá el mejor lugar y la mejor noche para ver las estrellas en la Provincia de Buenos Aires. Mapa de cielos oscuros, pronóstico de observación y guía de qué mirar.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · StarMap BA",
  },
  description: DESCRIPTION,
  keywords: [
    "astronomía",
    "estrellas",
    "cielo oscuro",
    "contaminación lumínica",
    "Buenos Aires",
    "astroturismo",
    "Vía Láctea",
    "observación",
  ],
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "StarMap BA",
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-AR"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-fg">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
