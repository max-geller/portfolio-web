import "./globals.css";
import type { Metadata } from "next";
import Navbar from "./_layout/Navbar";
import Footer from "./_layout/Footer";
import { Inter } from "next/font/google";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import { GoogleAnalytics } from "./lib/analytics/GoogleAnalytics";
import { NavigationProvider } from "./contexts/NavigationContext";


config.autoAddCss = false;
const font = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Max Geller - Travel & Landscape Photography",
  description: "Phoenix, Arizona based travel, landscape and aerial photographer Max Geller.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <GoogleAnalytics GA_MEASUREMENT_ID="G-9ZGCCX9B93" />
      <body className={font.className}>
        <NavigationProvider>
          <Navbar />
          <div className="pt-20 pb-4">
            {children}
          </div>
          <Footer />
        </NavigationProvider>
      </body>
    </html>
  );
}
