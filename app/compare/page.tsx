"use client";
import { useState } from "react";
import { getPlayerSummary } from "@/lib/riot";
import StatCard from "@/components/StatCard";

export default function ComparePage() {
  const [ids, setIds] = useState<string>("Jett#NA1, Omen#EUW");
  const [results, setResults] = useState<any[]>([]);

  const run = async () => {
    const list = ids.split(",").map(s => s.trim()).filter(Boolean);
    const data = await Promise.all(list.map((id) => getPlayerSummary(id)));
    setResults(data.map((r,i)=> ({ id: list[i], ...r })));
  };

  return (
    <main className="space-y-6">
      <h2 className="text-2xl font-bold">Compare Players</h2>
      <div className="card p-4 flex flex-col md:flex-row gap-3">
        <input className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10" value={ids} onChange={e=>setIds(e.target.value)} />
        <button onClick={run} className="px-5 py-3 rounded-xl bg-valorant-primary text-black font-semibold hover:opacity-90">Compare</button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {results.map((r) => (
          <div key={r.id} className="card p-4">
            <h3 className="font-semibold mb-2">{r.id}</h3>
            <div className="grid grid-cols-3 gap-2">
              <StatCard compact label="K/D" value={r.kd?.toFixed?.(2) ?? '—'} />
              <StatCard compact label="HS%" value={r.hs!=null ? Math.round(r.hs*100)+'%' : '—'} />
              <StatCard compact label="Win" value={r.winRate!=null ? Math.round(r.winRate*100)+'%' : '—'} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
