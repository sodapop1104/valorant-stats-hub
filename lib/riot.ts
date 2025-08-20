export type PlayerSummary = { kd:number; hs:number; winRate:number; matches:number };
export type Point = { t:string; kd?:number; hs?:number; win?:number };
export type PlayerTrends = { kd:Point[]; hs:Point[]; win:Point[] };

export async function getPlayerSummary(riotId: string): Promise<PlayerSummary> {
  const res = await fetch("/api/riot/summary", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ riotId })
  });
  if (!res.ok) throw new Error("Failed to fetch summary");
  return res.json();
}

export async function getPlayerTrends(riotId: string): Promise<PlayerTrends> {
  const res = await fetch("/api/riot/trends", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ riotId })
  });
  if (!res.ok) throw new Error("Failed to fetch trends");
  return res.json();
}
