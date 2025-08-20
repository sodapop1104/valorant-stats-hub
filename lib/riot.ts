export type PlayerSummary = { kd:number; hs:number; winRate:number; matches:number };
export type Point = { t:string; kd?:number; hs?:number; win?:number };
export type PlayerTrends = { kd:Point[]; hs:Point[]; win:Point[] };

/**
 * If you pass neither riotId nor puuid, the server will use the signed-in session (RSO_SESSION cookie).
 * If you pass puuid, it will use that directly.
 * If you pass riotId, you should already have server support to convert RiotID -> puuid (via RSO or account-v1).
 */
export async function getPlayerSummary(riotId?: string, puuid?: string): Promise<PlayerSummary & any> {
  const body = puuid ? { puuid } : (riotId ? { riotId } : {});
  const res = await fetch("/api/riot/summary", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getPlayerTrends(riotId?: string, puuid?: string): Promise<PlayerTrends & any> {
  const body = puuid ? { puuid } : (riotId ? { riotId } : {});
  const res = await fetch("/api/riot/trends", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}