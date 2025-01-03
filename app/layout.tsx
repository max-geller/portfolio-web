import "./globals.css";
import type { Metadata } from "next";
import { Fragment } from "react";
import Navbar from "./_layout/Navbar";
import Footer from "./_layout/Footer";
import { Inter } from "next/font/google";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import Script from "next/script";

config.autoAddCss = false;

const font = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Max Geller - Travel & LandscapePhotography",
  description:
    "Phoenix, Arizona based travel, landscape and aerial photographer Max Geller.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-X772YPHC6Q" />
      <Script id="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-X772YPHC6Q');
        `}
      </Script>
      <body className={font.className}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
