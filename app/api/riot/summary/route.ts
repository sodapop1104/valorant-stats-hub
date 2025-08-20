import { NextResponse } from "next/server";

const CLUSTERS = ["americas", "europe", "asia"] as const;
const VAL_SHARDS = ["na","eu","ap","kr","latam","br","jp"] as const;

function looksLikePuuid(x: string) {
  // loose UUID check; Riot PUUIDs are UUIDv4-like
  return /^[0-9a-fA-F-]{32,36}$/.test(x);
}

async function riotGet<T>(url: string) {
  const res = await fetch(url, {
    headers: { "X-Riot-Token": process.env.RIOT_API_KEY! },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`Riot ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

async function toPuuid(input: string): Promise<{ puuid: string; cluster: string }> {
  input = input.trim();
  if (looksLikePuuid(input)) {
    // we still need any cluster for active-shards; pick americas as default
    return { puuid: input, cluster: "americas" };
  }
  // Riot ID path: try all clusters until one resolves
  const [name, tag] = input.split("#");
  if (!name || !tag) throw new Error("Use Riot ID like GameName#Tag");
  for (const c of CLUSTERS) {
    try {
      const acct = await riotGet<{ puuid: string }>(
        `https://${c}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`
      );
      return { puuid: acct.puuid, cluster: c };
    } catch { /* try next cluster */ }
  }
  throw new Error("Account not found for that Riot ID");
}

async function getShard(cluster: string, puuid: string): Promise<string> {
  // Ask account-v1 for active shard of VAL
  // Example dto key is typically "activeShard"
  for (const c of [cluster, ...CLUSTERS.filter(x=>x!==cluster)]) {
    try {
      const dto = await riotGet<any>(
        `https://${c}.api.riotgames.com/riot/account/v1/active-shards/by-game/val/by-puuid/${puuid}`
      );
      const shard = dto?.activeShard ?? dto?.active_shard ?? dto?.shard;
      if (shard && (VAL_SHARDS as readonly string[]).includes(shard)) return shard;
    } catch { /* try next */ }
  }
  // Fallback: last resort probe common shards
  return "na";
}

export async function POST(req: Request) {
  try {
    const { riotId } = (await req.json()) as { riotId?: string };
    if (!riotId) return NextResponse.json({ error: "riotId required" }, { status: 400 });

    const { puuid, cluster } = await toPuuid(riotId);
    const shard = await getShard(cluster, puuid);

    // recent matches
    const matchlist = await riotGet<{ history: { matchId: string }[] }>(
      `https://${shard}.api.riotgames.com/val/match/v1/matchlists/by-puuid/${puuid}`
    );
    const ids = (matchlist.history ?? []).slice(0, 15).map(h => h.matchId);

    let kills=0,deaths=0,hs=0,body=0,leg=0,wins=0,counted=0;
    for (const id of ids) {
      try {
        const match: any = await riotGet(`https://${shard}.api.riotgames.com/val/match/v1/matches/${id}`);
        const players = match?.players?.allPlayers ?? match?.players?.data ?? match?.players ?? [];
        const me = Array.isArray(players) ? players.find((p: any) => p.puuid === puuid) : undefined;
        if (!me) continue;
        const st = me.stats ?? me.playerStats ?? me;
        kills += st.kills ?? 0;
        deaths += st.deaths ?? 0;
        hs    += st.headshots ?? st.headShots ?? 0;
        body  += st.bodyshots ?? st.bodyShots ?? 0;
        leg   += st.legshots  ?? st.legShots  ?? 0;

        const myTeam = me.teamId ?? me.team;
        const teams = match?.teams?.data ?? match?.teams ?? [];
        const t = Array.isArray(teams) ? teams.find((x:any) =>
          (x.teamId ?? x.team)?.toString().toUpperCase() === myTeam?.toString().toUpperCase()
        ) : undefined;
        if (t?.won === true || t?.hasWon === true) wins++;
        counted++;
      } catch { /* skip failed match */ }
    }

    const shots = hs+body+leg;
    const kd = deaths>0 ? kills/deaths : kills;
    const winRate = counted>0 ? wins/counted : 0;
    const hsRate = shots>0 ? hs/shots : 0;

    return NextResponse.json({ kd, hs: hsRate, winRate, matches: counted, puuid, shard });
  } catch (e:any) {
    return NextResponse.json({ error: e?.message ?? "unknown error" }, { status: 500 });
  }
}