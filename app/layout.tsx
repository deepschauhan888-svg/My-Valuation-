import type { Metadata } from "next";
import { Sora, Inter, JetBrains_Mono } from "next/font/google";
import AppChrome from "@/components/AppChrome";
import "./globals.css";

const display = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
});
const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "ValueTrace | Transparent Property Valuation",
  description:
    "Know your property's real value and see every calculation behind it. Comparable-based, fully auditable property valuation for Indian residential real estate.",
};

const themeBootstrap = `
(function() {
  try {
    var stored = localStorage.getItem('ledger-theme');
    var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body
        className={`${display.variable} ${body.variable} ${mono.variable} font-body bg-paper text-ink dark:bg-ink dark:text-paper transition-colors duration-300`}
      >
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
