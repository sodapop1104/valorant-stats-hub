"use client";
import { useEffect, useState } from "react";
import { getPlayerSummary, getPlayerTrends, type PlayerSummary, type PlayerTrends } from "@/lib/riot";
import StatCard from "@/components/StatCard";
import TrendChart from "@/components/TrendChart";

export default function MePage() {
  const [summary, setSummary] = useState<PlayerSummary | null>(null);
  const [trends, setTrends] = useState<PlayerTrends | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // No riotId needed; backend uses RSO_SESSION cookie
        const [s, t] = await Promise.all([getPlayerSummary(), getPlayerTrends()]);
        setSummary(s); setTrends(t);
        const note = (s as any)?.notice || (t as any)?.notice;
        if (note) setErr(note);
      } catch (e:any) {
        setErr(e?.message ?? "Failed to load");
      }
    })();
  }, []);

  return (
    <main className="space-y-8">
      <h2 className="text-2xl font-bold">My VAL Stats</h2>
      {err && <div className="card p-4 text-sm text-red-300">{err}</div>}
      {summary && (
        <section className="grid md:grid-cols-4 gap-4">
          <StatCard label="K/D" value={summary.kd?.toFixed?.(2) ?? "—"} />
          <StatCard label="Headshot %" value={summary.hs != null ? (summary.hs*100).toFixed(1)+"%" : "—"} />
          <StatCard label="Win Rate" value={summary.winRate != null ? (summary.winRate*100).toFixed(1)+"%" : "—"} />
          <StatCard label="Matches" value={String(summary.matches ?? "—")} />
        </section>
      )}
      {trends && (
        <section className="grid md:grid-cols-3 gap-4">
          <TrendChart title="K/D over time" data={trends.kd} dataKey="kd" />
          <TrendChart title="Headshot % over time" data={trends.hs} dataKey="hs" tickFormat={(v:number)=>(v*100).toFixed(0)+"%"} />
          <TrendChart title="Win Rate over time" data={trends.win} dataKey="win" tickFormat={(v:number)=>(v*100).toFixed(0)+"%"} />
        </section>
      )}
    </main>
  );
}