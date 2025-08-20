export default function ClutchCard({ riotId }:{ riotId:string }) {
  return (
    <section className="card p-4">
      <div className="font-semibold mb-1">Valorant Clutch Stories 📊</div>
      <p className="opacity-80 text-sm">Highlight your 1vX wins and generate a shareable card (placeholder).</p>
      <button className="mt-3 px-4 py-2 rounded-xl bg-valorant-accent text-black font-semibold hover:opacity-90">Generate Clutch Card</button>
    </section>
  );
}
