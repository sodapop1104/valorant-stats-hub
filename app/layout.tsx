import "./globals.css";
import type { Metadata } from "next";
import CookieBanner from "@/components/CookieBanner";

export const metadata: Metadata = {
  title: "Valorant Stats Hub",
  description: "Slick, modern Valorant analytics",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="logo" className="h-9" />
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Valorant Stats Hub</h1>
            </div>
            <nav className="text-sm opacity-90">
              <a className="mr-4 hover:text-valorant-accent" href="/">Home</a>
              <a className="mr-4 hover:text-valorant-accent" href="/compare">Compare</a>
              <a className="hover:text-valorant-accent" href="/leaderboards">Leaderboards</a>
            </nav>
          </header>
          <CookieBanner />
          {children}
          <footer className="mt-12 text-xs opacity-80">
            <p> Unofficial fan project. Not endorsed by Riot Games. VALORANT © Riot Games. This site uses Riot Games APIs but is not endorsed and/or certified by Riot Games.</p>
            <p className="mt-1">We fetch gameplay stats with your consent and process them server-side. We do not expose your API token or store sensitive personal data beyond what’s required to render analytics. You can request deletion of any stored data at any time.</p>
            <p className="mt-1">
              <a className="underline" href="/legal/privacy">Privacy</a> ·{" "}
              <a className="underline" href="/legal/terms">Terms</a> ·{" "}
              <a className="underline" href="/legal/privacy#ccpa">Do Not Sell/Share (CA)</a> ·{" "}
              <a className="underline" href="/legal/privacy#contact">Contact</a></p>
          </footer>
        </div>
      </body>
    </html>
  );
}
