import Heatmap from "./Heatmap";

export default function AgentSynergy({ riotId }:{ riotId:string }) {
  const heat = Array.from({length:5}, ()=> Array.from({length:10}, ()=> Math.random()*0.9+0.1));
  return (
    <section className="space-y-3">
      <h3 className="text-xl font-bold">Agent Synergy Analyzer</h3>
      <p className="opacity-80 text-sm">Best duos & comps by map (placeholder data). Example: Omen + Reyna (+14% on Split).</p>
      <Heatmap title="Map × Duo win rate (placeholder)" data={heat} />
    </section>
  );
}
