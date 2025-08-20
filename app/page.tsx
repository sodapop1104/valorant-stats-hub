"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");

  return (
    <main className="space-y-8">
      <section className="card p-6 md:p-8">
        <motion.h2 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="text-xl md:text-2xl font-semibold mb-4">
          Track your Valorant performance
        </motion.h2>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:ring-2 focus:ring-valorant-primary"
            placeholder="Enter Riot ID (e.g., Jett#NA1)"
            value={input}
            onChange={(e)=>setInput(e.target.value)}
          />
          <Link
            href={input ? `/player/${encodeURIComponent(input)}` : "#"}
            className="px-5 py-3 rounded-xl bg-valorant-primary text-black font-semibold hover:opacity-90 text-center"
          >
            Lookup
          </Link>
        </div>
        <p className="mt-3 text-sm opacity-80">Compare with friends, see trends, and generate shareable cards.</p>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        {[
          ["Trends", "K/D, HS%, Win Rate over time."],
          ["Synergy", "Best duos and comps by map."],
          ["Tilt Predictor", "Pre-game vibes. Pure fun."]
        ].map(([title, desc]) => (
          <div key={title} className="card p-5">
            <h3 className="text-lg font-semibold mb-1">{title}</h3>
            <p className="text-sm opacity-80">{desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
