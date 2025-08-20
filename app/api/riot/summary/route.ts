import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const VAL_SHARDS = ["na","eu","ap","kr","latam","br","jp"] as const;

async function riotGet<T>(url: string) {
  const res = await fetch(url, {
    headers: { "X-Riot-Token": process.env.RIOT_API_KEY! },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`Riot ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export async function POST(req: Request) {
  try {
    // ✅ use a unique name; don't reassign
    const reqBody: any = await req.json().catch(() => ({}));

    const sessionRaw = cookies().get("RSO_SESSION")?.value;
    const session = sessionRaw ? JSON.parse(sessionRaw) : null;

    // Prefer session PUUID; fall back to explicit puuid in body
    const puuid: string | undefined = session?.puuid ?? reqBody?.puuid;
    if (!puuid) {
      return NextResponse.json({ error: "Missing puuid (sign in required)" }, { status: 400 });
    }

    // Resolve shard from session or active-shards
    let shard: string | undefined = session?.shard;
    if (!shard) {
      const dto: any = await riotGet(
        `https://americas.api.riotgames.com/riot/account/v1/active-shards/by-game/val/by-puuid/${puuid}`
      );
      shard = dto?.activeShard ?? dto?.active_shard ?? dto?.shard ?? "na";
    }
    if (!VAL_SHARDS.includes(shard as any)) shard = "na";

    // Matchlist (handle 403 gracefully)
    let matchlist: any;
    try {
      matchlist = await riotGet(`https://${shard}.api.riotgames.com/val/match/v1/matchlists/by-puuid/${puuid}`);
    } catch (e: any) {
      if (String(e).includes("403")) {
        return NextResponse.json({
          kd: 0, hs: 0, winRate: 0, matches: 0,
          puuid, shard,
          notice: "This API key isn’t approved for VAL match history. Login succeeded; request production/partner access."
        });
      }
      throw e;
    }

    const ids = (matchlist.history ?? []).slice(0, 15).map((h: any) => h.matchId);

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
      } catch { /* skip */ }
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