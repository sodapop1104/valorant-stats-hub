import { NextResponse } from "next/server";
import { resolveAccountCluster, resolveValorantRegion } from "@/lib/regions";

function parseRiotId(input: string): [string, string] {
  const parts = input.split("#");
  if (parts.length < 2) throw new Error("Use Riot ID like GameName#Tag");
  return [parts[0], parts[1]];
}

async function riotGet<T>(url: string, key?: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "X-Riot-Token": key ?? process.env.RIOT_API_KEY! },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`Riot API error ${res.status}: ${await res.text()}`);
  return res.json();
}

type Pt = { t: string; kd?: number; hs?: number; win?: number };

export async function POST(req: Request) {
  try {
    const { riotId } = await req.json() as { riotId?: string };
    if (!riotId) return NextResponse.json({ error: "riotId required" }, { status: 400 });

    const [gameName, tagLine] = parseRiotId(riotId);
    const cluster = resolveAccountCluster(tagLine);
    const region = resolveValorantRegion(tagLine);

    const acct = await riotGet<{ puuid: string }>(
      `https://${cluster}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
    );

    const matchlist = await riotGet<{ history: { matchId: string }[] }>(
      `https://${region}.api.riotgames.com/val/match/v1/matchlists/by-puuid/${acct.puuid}`
    );

    const ids = (matchlist.history ?? []).slice(0, 16).map(h => h.matchId);

    const kd: Pt[] = [];
    const hs: Pt[] = [];
    const win: Pt[] = [];

    // newest first → reverse so charts go left→right in time
    const idsChrono = [...ids].reverse();

    let i = 1;
    for (const id of idsChrono) {
      const match = await riotGet<any>(`https://${region}.api.riotgames.com/val/match/v1/matches/${id}`);
      const players = match.players?.allPlayers ?? match.players ?? match.players?.data ?? [];
      const me = Array.isArray(players) ? players.find((p: any) => p.puuid === acct.puuid) : undefined;
      if (!me) { i++; continue; }

      const stats = me.stats ?? me.playerStats ?? me;
      const k = stats.kills ?? 0;
      const d = stats.deaths ?? 0;
      const hsC = stats.headshots ?? stats.headShots ?? 0;
      const bsC = stats.bodyshots ?? stats.bodyShots ?? 0;
      const lsC = stats.legshots ?? stats.legShots ?? 0;
      const shots = hsC + bsC + lsC;

      const myTeam = me.teamId ?? me.team;
      const teams = match.teams ?? match.teams?.data ?? [];
      const t = Array.isArray(teams) ? teams.find((x: any) =>
        (x.teamId ?? x.team)?.toString().toUpperCase() === myTeam?.toString().toUpperCase()
      ) : undefined;

      kd.push({ t: `M${i}`, kd: d > 0 ? k / d : k });
      hs.push({ t: `M${i}`, hs: shots > 0 ? hsC / shots : 0 });
      win.push({ t: `M${i}`, win: (t?.won === true || t?.hasWon === true) ? 1 : 0 });
      i++;
    }

    return NextResponse.json({ kd, hs, win });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "unknown error" }, { status: 500 });
  }
}