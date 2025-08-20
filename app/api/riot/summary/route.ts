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
    // Basic caching to be nice to the API (tune as needed)
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Riot API error ${res.status}: ${body}`);
  }
  return res.json();
}

export async function POST(req: Request) {
  try {
    const { riotId } = await req.json() as { riotId?: string };
    if (!riotId) return NextResponse.json({ error: "riotId required" }, { status: 400 });

    const [gameName, tagLine] = parseRiotId(riotId);
    const cluster = resolveAccountCluster(tagLine);
    const region = resolveValorantRegion(tagLine);

    // 1) Riot ID -> PUUID
    const acct = await riotGet<{ puuid: string }>(
      `https://${cluster}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
    );

    // 2) Matchlist by PUUID (recent history)
    const matchlist = await riotGet<{ history: { matchId: string }[] }>(
      `https://${region}.api.riotgames.com/val/match/v1/matchlists/by-puuid/${acct.puuid}`
    );

    const ids = (matchlist.history ?? []).slice(0, 15).map(h => h.matchId);

    // 3) Pull match details and aggregate the player’s stats
    //    We look for the player entry by puuid in each match
    let kills = 0, deaths = 0, hs = 0, body = 0, leg = 0, wins = 0, counted = 0;

    for (const id of ids) {
      const match = await riotGet<any>(`https://${region}.api.riotgames.com/val/match/v1/matches/${id}`);

      // Find the player object (field names vary a bit across examples; we guard)
      const players = match.players?.allPlayers ?? match.players ?? match.players?.data ?? [];
      const me = Array.isArray(players) ? players.find((p: any) => p.puuid === acct.puuid) : undefined;

      if (!me) continue;

      const stats = me.stats ?? me.playerStats ?? me;
      kills += stats.kills ?? 0;
      deaths += stats.deaths ?? 0;
      hs += stats.headshots ?? stats.headShots ?? 0;
      body += stats.bodyshots ?? stats.bodyShots ?? 0;
      leg += stats.legshots ?? stats.legShots ?? 0;

      const myTeam = me.teamId ?? me.team;
      const teams = match.teams ?? match.teams?.data ?? [];
      const t = Array.isArray(teams) ? teams.find((x: any) =>
        (x.teamId ?? x.team)?.toString().toUpperCase() === myTeam?.toString().toUpperCase()
      ) : undefined;

      if (t?.won === true || t?.hasWon === true) wins++;
      counted++;
    }

    const shots = hs + body + leg;
    const kd = (deaths > 0) ? kills / deaths : kills;
    const winRate = (counted > 0) ? wins / counted : 0;
    const hsRate = (shots > 0) ? hs / shots : 0;

    return NextResponse.json({
      kd, hs: hsRate, winRate, matches: counted,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "unknown error" }, { status: 500 });
  }
}