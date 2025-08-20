export default function Leaderboards() {
  return (
    <main className="space-y-4">
      <h2 className="text-2xl font-bold">Valorant Clutch Stories 📊</h2>
      <p className="opacity-80">Community-driven leaderboard for best clutches. (Placeholder data until submissions are enabled.)</p>
      <div className="card p-4">
        <ol className="list-decimal pl-5 space-y-2">
          <li><span className="font-semibold">Raze#LATAM</span> — 1v4 on Haven C Site</li>
          <li><span className="font-semibold">Sova#EUW</span> — 1v3 shock dart finisher</li>
          <li><span className="font-semibold">Omen#NA1</span> — 1v5 smokey ninja defuse</li>
        </ol>
      </div>
    </main>
  );
}
