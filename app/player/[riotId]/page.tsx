"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getPlayerSummary, getPlayerTrends, type PlayerSummary, type PlayerTrends } from "@/lib/riot";
import StatCard from "@/components/StatCard";
import TrendChart from "@/components/TrendChart";
import AgentSynergy from "@/components/AgentSynergy";
import TiltPredictor from "@/components/TiltPredictor";
import EconomyBreakdown from "@/components/EconomyBreakdown";
import ClutchCard from "@/components/ClutchCard";

export default function PlayerPage() {
  const params = useParams();
  const riotId = decodeURIComponent(params.riotId as string);
  const [summary, setSummary] = useState<PlayerSummary | null>(null);
  const [trends, setTrends] = useState<PlayerTrends | null>(null);

  useEffect(() => {
    (async () => {
      const s = await getPlayerSummary(riotId);
      const t = await getPlayerTrends(riotId);
      setSummary(s);
      setTrends(t);
    })();
  }, [riotId]);

  return (
    <main className="space-y-8">
      <h2 className="text-2xl font-bold">Player: {riotId}</h2>

      {summary && (
        <section className="grid md:grid-cols-4 gap-4">
          <StatCard label="K/D" value={summary.kd?.toFixed?.(2) ?? '—'} />
          <StatCard label="Headshot %" value={summary.hs!=null ? (summary.hs*100).toFixed(1)+'%' : '—'} />
          <StatCard label="Win Rate" value={summary.winRate!=null ? (summary.winRate*100).toFixed(1)+'%' : '—'} />
          <StatCard label="Matches" value={String(summary.matches ?? '—')} />
        </section>
      )}

      {trends && (
        <section className="grid md:grid-cols-3 gap-4">
          <TrendChart title="K/D over time" data={trends.kd} dataKey="kd" />
          <TrendChart title="Headshot % over time" data={trends.hs} dataKey="hs" tickFormat={(v:number)=> (v*100).toFixed(0)+'%'} />
          <TrendChart title="Win Rate over time" data={trends.win} dataKey="win" tickFormat={(v:number)=> (v*100).toFixed(0)+'%'} />
        </section>
      )}
    </main>
  );
}
