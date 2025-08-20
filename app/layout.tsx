import "./globals.css";
import type { Metadata } from "next";

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
          {children}
          <footer className="mt-12 text-xs opacity-70">
            <p>Unofficial fan project. Not endorsed by Riot Games. Valorant © Riot Games.</p>
            <p><a className="underline" href="/legal/privacy">Privacy</a> · <a className="underline" href="/legal/terms">Terms</a></p>
          </footer>
        </div>
      </body>
    </html>
  );
}
