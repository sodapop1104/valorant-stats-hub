import Heatmap from "./Heatmap";

export default function EconomyBreakdown({ riotId }:{ riotId:string }) {
  const heat = Array.from({length:5}, ()=> Array.from({length:10}, ()=> Math.random()*0.9+0.1));
  return (
    <section className="space-y-3">
      <h3 className="text-xl font-bold">Economy Breakdown 💸</h3>
      <p className="opacity-80 text-sm">Force-buy %, full-save rounds, and correlation to round win % (placeholder).</p>
      <Heatmap title="Spending vs Winning (placeholder)" data={heat} />
    </section>
  );
}
