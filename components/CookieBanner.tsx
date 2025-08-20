// components/CookieBanner.tsx
"use client";
import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("cookie-consent")) {
      setShow(true);
    }
  }, []);
  if (!show) return null;
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 card p-4 max-w-xl w-[92%] z-50">
      <div className="text-sm">
        We use necessary cookies for basic functionality and anonymous analytics to improve the site.
        <a href="/legal/privacy#cookies" className="underline ml-1">Learn more</a>.
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => { localStorage.setItem("cookie-consent","essentials-only"); setShow(false); }}
          className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20"
        >
          Essentials only
        </button>
        <button
          onClick={() => { localStorage.setItem("cookie-consent","allow-all"); setShow(false); }}
          className="px-3 py-2 rounded-xl bg-valorant-primary text-black font-semibold hover:opacity-90"
        >
          Allow all
        </button>
      </div>
    </div>
  );
}