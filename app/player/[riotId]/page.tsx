"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getPlayerSummary,
  getPlayerTrends,
  type PlayerSummary,
  type PlayerTrends,
} from "@/lib/riot";
import StatCard from "@/components/StatCard";
import TrendChart from "@/components/TrendChart";
// Optional extras can be re-enabled later
// import AgentSynergy from "@/components/AgentSynergy";
// import TiltPredictor from "@/components/TiltPredictor";
// import EconomyBreakdown from "@/components/EconomyBreakdown";
// import ClutchCard from "@/components/ClutchCard";

export default function PlayerPage() {
  const params = useParams();
  const riotId = decodeURIComponent(params.riotId as string);

  const [summary, setSummary] = useState<PlayerSummary | null>(null);
  const [trends, setTrends] = useState<PlayerTrends | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr(null);
      setSummary(null);
      setTrends(null);

      try {
        const [s, t] = await Promise.all([
          getPlayerSummary(riotId),
          getPlayerTrends(riotId),
        ]);
        if (cancelled) return;
        setSummary(s);
        setTrends(t);
        const note = (s as any)?.notice || (t as any)?.notice;
        if (note) setErr(note);
      } catch (e: any) {
        if (cancelled) return;
        const msg = e?.message || "Failed to load data. Please try again.";
        setErr(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [riotId]);

  return (
    <main className="space-y-8">
      <h2 className="text-2xl font-bold">Player: {riotId}</h2>

      {err && (
        <div className="card p-4 border border-red-500/40">
          <div className="text-sm">
            <span className="font-semibold text-red-300">Notice:</span>{" "}
            <span className="opacity-90">{err}</span>
          </div>
          <ul className="mt-2 text-xs opacity-80 list-disc pl-5">
            <li>If this account is private/restricted, match data may be unavailable.</li>
            <li>VAL match history often requires approved keys + consent (RSO).</li>
            <li>Rate limits can cause temporary failures—try again later.</li>
          </ul>
        </div>
      )}

      {loading && (
        <>
          <section className="grid md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-3 w-16 bg-white/10 rounded mb-3" />
                <div className="h-6 w-20 bg-white/10 rounded" />
              </div>
            ))}
          </section>
          <section className="grid md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-4 w-40 bg-white/10 rounded mb-3" />
                <div className="h-52 bg-white/5 rounded" />
              </div>
            ))}
          </section>
        </>
      )}

      {!loading && summary && (
        <section className="grid md:grid-cols-4 gap-4">
          <StatCard label="K/D" value={summary.kd?.toFixed?.(2) ?? "—"} />
          <StatCard label="Headshot %" value={summary.hs != null ? (summary.hs*100).toFixed(1)+"%" : "—"} />
          <StatCard label="Win Rate" value={summary.winRate != null ? (summary.winRate*100).toFixed(1)+"%" : "—"} />
          <StatCard label="Matches" value={String(summary.matches ?? "—")} />
        </section>
      )}

      {!loading && trends && (
        <section className="grid md:grid-cols-3 gap-4">
          <TrendChart title="K/D over time" data={trends.kd} dataKey="kd" />
          <TrendChart title="Headshot % over time" data={trends.hs} dataKey="hs" tickFormat={(v:number)=>(v*100).toFixed(0)+"%"} />
          <TrendChart title="Win Rate over time" data={trends.win} dataKey="win" tickFormat={(v:number)=>(v*100).toFixed(0)+"%"} />
        </section>
      )}

      {/* Optional extras
      <AgentSynergy riotId={riotId} />
      <TiltPredictor riotId={riotId} />
      <EconomyBreakdown riotId={riotId} />
      <ClutchCard riotId={riotId} /> */}

      {!loading && !err && !summary && (
        <div className="card p-4 text-sm opacity-80">
          No recent match data found for this player.
        </div>
      )}
    </main>
  );
}