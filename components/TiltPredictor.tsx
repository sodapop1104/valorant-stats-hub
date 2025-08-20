export default function TiltPredictor({ riotId }:{ riotId:string }) {
  const badges = ["🔥 Hard Carry Mode", "💤 Low Energy", "☠️ Danger", "🧊 Ice Cold", "🧠 Big Brain"];
  const chosen = badges[Math.floor(Math.random()*badges.length)];
  const score = Math.floor(Math.random()*100);
  return (
    <section className="card p-4">
      <div className="font-semibold mb-1">Tilt Predictor 😅</div>
      <div className="text-sm opacity-80">Based on recent matches (for fun).</div>
      <div className="mt-2 text-2xl font-bold">{score}/100 — {chosen}</div>
    </section>
  );
}
