"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [input, setInput] = useState("");
  const router = useRouter();

  return (
    <main className="space-y-8">
      <section className="card p-6 md:p-8">
        <motion.h2 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="text-xl md:text-2xl font-semibold mb-4">
          Track your Valorant performance
        </motion.h2>

        <form
          className="flex flex-col md:flex-row gap-3"
          onSubmit={(e)=>{ e.preventDefault(); if (input) router.push(`/player/${encodeURIComponent(input)}`); }}
        >
          <input
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:ring-2 focus:ring-valorant-primary"
            placeholder="Enter Riot ID (e.g., Jett#NA1)"
            value={input}
            onChange={(e)=>setInput(e.target.value)}
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-xl bg-valorant-primary text-black font-semibold hover:opacity-90"
          >
            Lookup
          </button>
          <Link href="/me" className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-center">
            My Stats (RSO)
          </Link>
        </form>

        <p className="mt-3 text-sm opacity-80">Compare with friends, see trends, and generate shareable cards.</p>
      </section>
    </main>
  );
}