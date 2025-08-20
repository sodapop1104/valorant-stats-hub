import { NextResponse } from "next/server";
const CLUSTERS = ["americas", "europe", "asia"] as const;
const VAL_SHARDS = ["na","eu","ap","kr","latam","br","jp"] as const;

function looksLikePuuid(x: string) { return /^[0-9a-fA-F-]{32,36}$/.test(x); }
async function riotGet<T>(url: string) {
  const res = await fetch(url, { headers: { "X-Riot-Token": process.env.RIOT_API_KEY! }, next: { revalidate: 300 }});
  if (!res.ok) throw new Error(`Riot ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}
async function toPuuid(input: string){ /* identical to summary’s */ 
  input = input.trim();
  if (looksLikePuuid(input)) return { puuid: input, cluster: "americas" };
  const [name, tag] = input.split("#"); if (!name || !tag) throw new Error("Use Riot ID like GameName#Tag");
  for (const c of CLUSTERS) { try {
    const acct = await riotGet<{ puuid: string }>(
      `https://${c}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`
    ); return { puuid: acct.puuid, cluster: c };
  } catch {} } throw new Error("Account not found");
}
async function getShard(cluster:string, puuid:string){
  for (const c of [cluster, ...CLUSTERS.filter(x=>x!==cluster)]) {
    try {
      const dto:any = await riotGet(`https://${c}.api.riotgames.com/riot/account/v1/active-shards/by-game/val/by-puuid/${puuid}`);
      const shard = dto?.activeShard ?? dto?.active_shard ?? dto?.shard;
      if (shard && (VAL_SHARDS as readonly string[]).includes(shard)) return shard;
    } catch {}
  }
  return "na";
}

type Pt = { t: string; kd?: number; hs?: number; win?: number };

export async function POST(req: Request) {
  try {
    const { riotId } = (await req.json()) as { riotId?: string };
    if (!riotId) return NextResponse.json({ error: "riotId required" }, { status: 400 });

    const { puuid, cluster } = await toPuuid(riotId);
    const shard = await getShard(cluster, puuid);

    const matchlist = await riotGet<{ history: { matchId: string }[] }>(
      `https://${shard}.api.riotgames.com/val/match/v1/matchlists/by-puuid/${puuid}`
    );
    const ids = (matchlist.history ?? []).slice(0, 16).map(h => h.matchId).reverse();

    const kd: Pt[] = [], hs: Pt[] = [], win: Pt[] = [];
    let i = 1;
    for (const id of ids) {
      try {
        const match:any = await riotGet(`https://${shard}.api.riotgames.com/val/match/v1/matches/${id}`);
        const players = match?.players?.allPlayers ?? match?.players?.data ?? match?.players ?? [];
        const me = Array.isArray(players) ? players.find((p:any)=>p.puuid===puuid) : undefined;
        if (!me) { i++; continue; }
        const st = me.stats ?? me.playerStats ?? me;
        const k=st.kills??0, d=st.deaths??0;
        const hsC=st.headshots ?? st.headShots ?? 0;
        const bsC=st.bodyshots ?? st.bodyShots ?? 0;
        const lsC=st.legshots  ?? st.legShots  ?? 0;
        const shots = hsC+bsC+lsC;

        const myTeam = me.teamId ?? me.team;
        const teams = match?.teams?.data ?? match?.teams ?? [];
        const t = Array.isArray(teams) ? teams.find((x:any)=>
          (x.teamId ?? x.team)?.toString().toUpperCase()===myTeam?.toString().toUpperCase()
        ) : undefined;

        kd.push({ t: `M${i}`, kd: d>0 ? k/d : k });
        hs.push({ t: `M${i}`, hs: shots>0 ? hsC/shots : 0 });
        win.push({ t: `M${i}`, win: (t?.won===true || t?.hasWon===true) ? 1 : 0 });
        i++;
      } catch { i++; }
    }

    return NextResponse.json({ kd, hs, win, puuid, shard });
  } catch (e:any) {
    return NextResponse.json({ error: e?.message ?? "unknown error" }, { status: 500 });
  }
}